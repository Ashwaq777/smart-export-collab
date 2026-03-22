import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
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

const containerService = {

  // Ports
  searchPorts: (query) =>
    api.get(`/v1/containers/ports/search?q=${query}`),

  searchPortsByCountry: (code) =>
    api.get(`/v1/containers/ports/country?code=${code}`),

  // Offers
  createOffer: (data) =>
    api.post('/v1/containers/offers', data),

  getAvailableOffers: () =>
    api.get('/v1/containers/offers'),

  getMyOffers: () =>
    api.get('/v1/containers/offers/my'),

  deleteOffer: (id) =>
    api.delete(`/v1/containers/offers/${id}`),

  updateOffer: (id, data) =>
    api.put(`/v1/containers/offers/${id}`, data),

  // Requests
  createRequest: (data) =>
    api.post('/v1/containers/requests', data),

  getMyRequests: () =>
    api.get('/v1/containers/requests/my'),

  deleteRequest: (id) =>
    api.delete(`/v1/containers/requests/${id}`),

  updateRequest: (id, data) =>
    api.put(`/v1/containers/requests/${id}`, data),

  triggerMatchmaking: (id) =>
    api.post(`/v1/containers/requests/${id}/match`),

  // Matches
  getMyMatches: () =>
    api.get('/v1/containers/matches/my'),

  confirmMatch: (id) =>
    api.post(`/v1/containers/matches/${id}/confirm`),

  rejectMatch: (id) =>
    api.post(`/v1/containers/matches/${id}/reject`),

  // Transactions
  getMyTransactions: () =>
    api.get('/v1/containers/transactions/my'),

  updateWorkflow: (id, status) =>
    api.patch(`/v1/containers/transactions/${id}/workflow?status=${status}`),

  // EIR Document Upload
  uploadEir: (transactionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(
      `/api/v1/containers/transactions/${transactionId}/eir`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // Dashboard
  getDashboard: () =>
    api.get('/v1/containers/dashboard'),

  // Vessel Tracking
  getVesselPosition: (imo) =>
    axios.get(`/api/v1/vessels/${imo}`),

  getVesselDistance: (imo, port) =>
    axios.get(`/api/v1/vessels/${imo}/distance?port=${port}`),

  trackVessel: (imo, place, email) =>
    axios.post('/api/v1/vessels/track', { imo, place, email }),
};

export default containerService;
