import axios from 'axios'

import { API_URLS } from '../config/apiConfig'

const API_BASE_URL = API_URLS.BACKEND

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}` 
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const tarifService = {
  getAll: () => api.get('/tarifs-douaniers'),
  getById: (id) => api.get(`/tarifs-douaniers/${id}`),
  getByCountry: (country) => api.get(`/tarifs-douaniers/pays/${country}`),
  getCategories: () => api.get('/tarifs-douaniers/categories'),
  getCountries: () => api.get('/tarifs-douaniers/pays'),
  getProductsByCategory: (category) => api.get(`/tarifs-douaniers/categorie/${category}`),
  create: (data) => api.post('/tarifs-douaniers', data),
  update: (id, data) => api.put(`/tarifs-douaniers/${id}`, data),
  delete: (id) => api.delete(`/tarifs-douaniers/${id}`),
}

export const portService = {
  getAll: (params) => api.get('/ports', { params }),
  getById: (id) => api.get(`/ports/${id}`),
  getByCountry: (country) => api.get('/ports', { params: { pays: country } }),
  create: (data) => api.post('/ports', data),
  update: (id, data) => api.put(`/ports/${id}`, data),
  delete: (id) => api.delete(`/ports/${id}`),
}

export const calculationService = {
  calculateLandedCost: (data) => api.post('/calculation/landed-cost', data),
  calculateImportLandedCost: (data) => api.post('/calculation/landed-cost-import', data),
  checkThreshold: (codeHs, value) => 
    api.get('/calculation/alerte-seuil', { params: { codeHs, valeurSaisie: value } }),
  calculateExchangeRisk: (data) => api.post('/calculation/risque-change', data),
}

export const forexService = {
  getRates: (base) => api.get('/forex/rates', { params: { base } }),
  convert: (amount, from, to) => 
    api.get('/forex/convert', { params: { amount, from, to } }),
}

export const pdfService = {
  generateLandedCostPdf: async (data) => {
    const response = await api.post('/pdf/landed-cost', data, {
      responseType: 'blob',
    })
    return response.data
  },
  generateImportLandedCostPdf: async (data) => {
    const response = await api.post('/pdf/import-landed-cost', data, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default api
