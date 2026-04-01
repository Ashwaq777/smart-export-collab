export const API_URLS = {
  BACKEND: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  MARITIME_BACKEND: import.meta.env?.VITE_MARITIME_API_BASE_URL || 'http://localhost:8080/api/maritime',
  REST_COUNTRIES: import.meta.env?.VITE_REST_COUNTRIES_URL || 'https://restcountries.com/v3.1',
  EXCHANGE_RATE_HOST: import.meta.env?.VITE_EXCHANGE_RATE_URL || 'https://api.exchangerate.host',
}
