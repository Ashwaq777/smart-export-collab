export const API_URLS = {
  BACKEND: import.meta.env?.VITE_API_BASE_URL || '/api',
  MARITIME_BACKEND: import.meta.env?.VITE_MARITIME_API_BASE_URL || '/api/maritime',

  // Public APIs (no key required)
  REST_COUNTRIES: 'https://restcountries.com/v3.1',
  FLAG_CDN: 'https://flagcdn.com',
  EXCHANGE_RATE_HOST: 'https://api.exchangerate.host',
  OPEN_ER_API: 'https://open.er-api.com',
  WORLD_BANK: 'https://api.worldbank.org/v2',
}
