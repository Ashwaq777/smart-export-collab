import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
}

export default api
