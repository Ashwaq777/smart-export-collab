import axios from 'axios'

import { ttlCache } from '../utils/ttlCache'
import { MARITIME_COUNTRIES_ISO2 } from '../constants/maritimeCountriesIso2'

const FALLBACK_MARITIME_COUNTRIES = [
  { iso2: 'MA', name: 'Maroc' },
  { iso2: 'FR', name: 'France' },
  { iso2: 'ES', name: 'Espagne' },
  { iso2: 'PT', name: 'Portugal' },
  { iso2: 'IT', name: 'Italie' },
  { iso2: 'GB', name: 'Royaume-Uni' },
  { iso2: 'NL', name: 'Pays-Bas' },
  { iso2: 'BE', name: 'Belgique' },
  { iso2: 'DE', name: 'Allemagne' },
  { iso2: 'US', name: 'États-Unis' },
  { iso2: 'CA', name: 'Canada' },
  { iso2: 'BR', name: 'Brésil' },
  { iso2: 'AR', name: 'Argentine' },
  { iso2: 'TR', name: 'Turquie' },
  { iso2: 'EG', name: 'Égypte' },
  { iso2: 'ZA', name: 'Afrique du Sud' },
  { iso2: 'NG', name: 'Nigeria' },
  { iso2: 'IN', name: 'Inde' },
  { iso2: 'CN', name: 'Chine' },
  { iso2: 'JP', name: 'Japon' },
]

const countriesApi = axios.create({
  baseURL: 'https://restcountries.com/v3.1',
  timeout: 15000,
})

const exchangeRateApi = axios.create({
  baseURL: 'https://api.exchangerate.host',
  timeout: 15000,
})

// Cache pour les taux de change (éviter trop de requêtes)
let exchangeRatesCache = null
let exchangeRatesCacheTime = null
const CACHE_DURATION = 3600000 // 1 heure

const MARITIME_COUNTRIES_CACHE_KEY = 'maritime:countries:v1'
const MARITIME_COUNTRIES_CACHE_TTL = 5 * 60 * 1000

/**
 * Retry logic pour les appels API
 */
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

export const countriesService = {
  getMaritimeCountries: async () => {
    const cached = ttlCache.get(MARITIME_COUNTRIES_CACHE_KEY)
    if (cached && Array.isArray(cached)) return cached

    // API: REST Countries
    let response
    try {
      response = await retryRequest(() =>
        countriesApi.get('/all?fields=name,translations,cca2,flags,region,subregion')
      )
    } catch {
      const fallback = FALLBACK_MARITIME_COUNTRIES.map((c) => ({
        name: c.name,
        iso2: c.iso2,
        flagPng: '',
        region: '',
        subregion: '',
      }))
      ttlCache.set(MARITIME_COUNTRIES_CACHE_KEY, fallback, MARITIME_COUNTRIES_CACHE_TTL)
      return fallback
    }

    const maritimeCountries = (response.data || [])
      .map((c) => ({
        name: c?.translations?.fra?.common || c?.name?.common || '',
        iso2: c?.cca2 || '',
        flagPng: c?.flags?.png || c?.flags?.svg || '',
        region: c?.region || '',
        subregion: c?.subregion || '',
      }))
      .filter((c) => c.name && c.iso2)
      .filter((c) => MARITIME_COUNTRIES_ISO2.has(String(c.iso2).toUpperCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

    ttlCache.set(MARITIME_COUNTRIES_CACHE_KEY, maritimeCountries, MARITIME_COUNTRIES_CACHE_TTL)

    return maritimeCountries
  },

  /**
   * Récupère TOUS les pays avec devises et taux de change
   * 100% de couverture obligatoire
   */
  getAll: async () => {
    try {
      // Récupérer tous les pays avec retry
      const response = await retryRequest(() => 
        countriesApi.get('/all?fields=name,translations,cca2,currencies,cca3,landlocked')
      )
      
      // Récupérer les taux de change une seule fois
      const exchangeRates = await countriesService.getExchangeRates()
      
      const countriesWithCurrencies = response.data.map(country => {
        // Extraire la devise principale
        let currencyCode = null
        let currencyName = null
        let currencySymbol = null
        
        if (country.currencies) {
          const currencies = Object.entries(country.currencies)
          if (currencies.length > 0) {
            const [code, data] = currencies[0]
            currencyCode = code
            currencyName = data?.name || code
            currencySymbol = data?.symbol || code
          }
        }
        
        // Fallback intelligent si pas de devise
        if (!currencyCode) {
          currencyCode = 'USD'
          currencyName = 'US Dollar'
          currencySymbol = '$'
        }
        
        // Récupérer le taux de change
        const exchangeRate = exchangeRates[currencyCode] || 1
        
        return {
          name: country?.translations?.fra?.common || country?.name?.common,
          code: country.cca2,
          cca2: country.cca2,
          code3: country.cca3,
          landlocked: country.landlocked || false,
          currency: {
            code: currencyCode,
            name: currencyName,
            symbol: currencySymbol,
            exchangeRate: exchangeRate
          }
        }
      })
      
      // Vérifier que tous les pays ont une devise
      const countriesWithoutCurrency = countriesWithCurrencies.filter(c => !c.currency.code)
      if (countriesWithoutCurrency.length > 0) {
        console.error(`❌ [countriesApi] ${countriesWithoutCurrency.length} countries without currency:`, 
          countriesWithoutCurrency.map(c => c.name))
      }
      
      return countriesWithCurrencies
    } catch (error) {
      console.error('❌ [countriesApi] Error fetching countries:', error)
      throw error
    }
  },

  /**
   * Récupère les taux de change pour toutes les devises
   * Utilise un cache pour éviter trop de requêtes
   */
  getExchangeRates: async () => {
    try {
      // Vérifier le cache
      const now = Date.now()
      if (exchangeRatesCache && exchangeRatesCacheTime && (now - exchangeRatesCacheTime < CACHE_DURATION)) {
        return exchangeRatesCache
      }
      
      // Récupérer les taux avec retry
      const response = await retryRequest(() => 
        exchangeRateApi.get('/latest?base=USD')
      )
      
      if (response.data && response.data.rates) {
        exchangeRatesCache = response.data.rates
        exchangeRatesCacheTime = now
        return response.data.rates
      }
      
      return {}
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      // Retourner un objet vide en cas d'erreur (fallback à 1)
      return {}
    }
  },

  /**
   * Récupère les informations d'un pays spécifique avec devise et taux
   */
  getByName: async (countryName) => {
    try {
      const response = await retryRequest(() =>
        countriesApi.get(`/name/${countryName}?fields=name,cca2,currencies,cca3,landlocked`)
      )
      
      if (response.data && response.data.length > 0) {
        const country = response.data[0]
        
        // Extraire la devise
        let currencyCode = null
        let currencyName = null
        let currencySymbol = null
        
        if (country.currencies) {
          const currencies = Object.entries(country.currencies)
          if (currencies.length > 0) {
            const [code, data] = currencies[0]
            currencyCode = code
            currencyName = data.name
            currencySymbol = data.symbol
          }
        }
        
        // Fallback si pas de devise
        if (!currencyCode) {
          currencyCode = 'USD'
          currencyName = 'US Dollar'
          currencySymbol = '$'
        }
        
        // Récupérer le taux de change
        const exchangeRates = await countriesService.getExchangeRates()
        const exchangeRate = exchangeRates[currencyCode] || 1
        
        return {
          name: country.name.common,
          code: country.cca2,
          code3: country.cca3,
          landlocked: country.landlocked || false,
          currency: {
            code: currencyCode,
            name: currencyName,
            symbol: currencySymbol,
            exchangeRate: exchangeRate
          }
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching country by name:', error)
      return null
    }
  }
}

export default countriesService
