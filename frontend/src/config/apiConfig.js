export const API_URLS = {
  BACKEND: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  MARITIME_BACKEND: import.meta.env?.VITE_MARITIME_API_BASE_URL || 'http://localhost:8080/api/maritime',
}
