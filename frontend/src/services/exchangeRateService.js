import axios from 'axios'

/**
 * Service pour récupérer les taux de change en temps réel
 * Utilise l'API gratuite open.er-api.com (pas de clé requise)
 */

const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD'
const CACHE_KEY = 'exchange_rates_cache'
const CACHE_DURATION = 3600000 // 1 heure en millisecondes

/**
 * Récupère les taux de change depuis le cache ou l'API
 */
export const getExchangeRates = async () => {
  try {
    // Vérifier le cache
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached)
      const now = Date.now()
      
      // Si le cache est encore valide (moins d'1 heure)
      if (now - timestamp < CACHE_DURATION) {
        console.log('✅ Using cached exchange rates')
        return rates
      }
    }

    // Récupérer depuis l'API
    console.log('🔄 Fetching fresh exchange rates from API...')
    const response = await axios.get(EXCHANGE_RATE_API, { timeout: 10000 })
    
    if (response.data && response.data.rates) {
      const rates = response.data.rates
      
      // Mettre en cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        rates,
        timestamp: Date.now()
      }))
      
      console.log(`✅ Loaded ${Object.keys(rates).length} exchange rates`)
      return rates
    }
    
    throw new Error('Invalid API response')
  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error)
    
    // Fallback: utiliser le cache même expiré si disponible
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      console.warn('⚠️ Using expired cache as fallback')
      const { rates } = JSON.parse(cached)
      return rates
    }
    
    // Fallback ultime: taux de base
    console.warn('⚠️ Using fallback exchange rates')
    return {
      MAD: 10.0,
      EUR: 0.92,
      GBP: 0.79,
      CNY: 7.24,
      JPY: 149.50,
      INR: 83.12,
      BRL: 4.97,
      CAD: 1.36,
      AUD: 1.52,
      CHF: 0.88,
      AED: 3.67,
      SAR: 3.75
    }
  }
}

/**
 * Convertit un montant d'une devise à une autre
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await getExchangeRates()
  
  // Convertir en USD d'abord si nécessaire
  let amountInUSD = amount
  if (fromCurrency !== 'USD') {
    amountInUSD = amount / rates[fromCurrency]
  }
  
  // Puis convertir vers la devise cible
  if (toCurrency === 'USD') {
    return amountInUSD
  }
  
  return amountInUSD * rates[toCurrency]
}

/**
 * Formate un montant avec sa devise
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    MAD: 'MAD',
    CNY: '¥',
    JPY: '¥',
    INR: '₹',
    BRL: 'R$',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    AED: 'AED',
    SAR: 'SAR'
  }
  
  const symbol = symbols[currency] || currency
  const formatted = Math.round(amount).toLocaleString()
  
  return `${symbol}${formatted}`
}

export default {
  getExchangeRates,
  convertCurrency,
  formatCurrency
}
