// Currency conversion utility
// Exchange rates relative to MAD (Moroccan Dirham)
const EXCHANGE_RATES = {
  MAD: 1,
  USD: 0.10,      // 1 MAD = 0.10 USD
  EUR: 0.093,     // 1 MAD = 0.093 EUR
  GBP: 0.079,     // 1 MAD = 0.079 GBP
  CNY: 0.72,      // 1 MAD = 0.72 CNY
  JPY: 15.2,      // 1 MAD = 15.2 JPY
  CAD: 0.14,      // 1 MAD = 0.14 CAD
  AUD: 0.16,      // 1 MAD = 0.16 AUD
  CHF: 0.089,     // 1 MAD = 0.089 CHF
  AED: 0.37,      // 1 MAD = 0.37 AED
  SAR: 0.38,      // 1 MAD = 0.38 SAR
  INR: 8.5,       // 1 MAD = 8.5 INR
  BRL: 0.58,      // 1 MAD = 0.58 BRL
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
