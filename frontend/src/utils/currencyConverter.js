// Currency conversion utility
// Exchange rates are fetched in real-time from ExchangeRate-API via countriesApi
// These are fallback rates if API fails
const FALLBACK_EXCHANGE_RATES = {
  USD: 1,         // Base currency
  MAD: 10.0,      // 1 USD = 10 MAD
  EUR: 0.93,      // 1 USD = 0.93 EUR
  GBP: 0.79,      // 1 USD = 0.79 GBP
  CNY: 7.2,       // 1 USD = 7.2 CNY
  JPY: 152,       // 1 USD = 152 JPY
  CAD: 1.4,       // 1 USD = 1.4 CAD
  AUD: 1.6,       // 1 USD = 1.6 AUD
  CHF: 0.89,      // 1 USD = 0.89 CHF
  AED: 3.67,      // 1 USD = 3.67 AED
  SAR: 3.75,      // 1 USD = 3.75 SAR
  INR: 83.5,      // 1 USD = 83.5 INR
  BRL: 5.8,       // 1 USD = 5.8 BRL
}

// Store real-time exchange rates (updated from API)
let EXCHANGE_RATES = { ...FALLBACK_EXCHANGE_RATES }

/**
 * Update exchange rates from countriesData
 * @param {Array} countriesData - Countries with currency exchange rates
 */
export const updateExchangeRates = (countriesData) => {
  if (!countriesData || countriesData.length === 0) return
  
  const rates = { USD: 1 } // USD as base
  
  countriesData.forEach(country => {
    if (country.currency && country.currency.code && country.currency.exchangeRate) {
      rates[country.currency.code] = country.currency.exchangeRate
    }
  })
  
  EXCHANGE_RATES = { ...FALLBACK_EXCHANGE_RATES, ...rates }
  console.log('💱 [currencyConverter] Updated exchange rates:', Object.keys(EXCHANGE_RATES).length, 'currencies')
}

export const CURRENCIES = [
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
]

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || !fromCurrency || !toCurrency) return 0
  if (fromCurrency === toCurrency) return amount

  // Convert to MAD first, then to target currency
  const amountInMAD = amount / EXCHANGE_RATES[fromCurrency]
  const convertedAmount = amountInMAD * EXCHANGE_RATES[toCurrency]
  
  return convertedAmount
}

/**
 * Format currency with proper symbol and decimals
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'MAD') => {
  if (!amount && amount !== 0) return '-'
  
  const currency = CURRENCIES.find(c => c.code === currencyCode)
  const symbol = currency ? currency.symbol : currencyCode
  
  // Format with 2 decimal places
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  
  return `${formatted} ${symbol}`
}

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Exchange rate
 */
export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1
  const toRate = EXCHANGE_RATES[toCurrency] || 1
  
  return toRate / fromRate
}
