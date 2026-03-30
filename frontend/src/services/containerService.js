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

  getAllOffers: () => 
    api.get('/v1/containers/offers'),

  getOfferById: (id) => 
    api.get(`/v1/containers/offers/${id}`),

  getAvailableOffers: () =>
    api.get('/v1/containers/offers'),

  getMyOffers: () =>
    api.get('/v1/containers/offers/my'),

  deleteOffer: (id) =>
    api.delete(`/v1/containers/offers/${id}`),

  updateOffer: (id, data) =>
    api.put(`/v1/containers/offers/${id}`, data),

  uploadOfferImages: async (offerId, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/v1/containers/offers/${offerId}/images`,
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      }
    );
    return response.json();
  },

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

  advanceTransactionStatus: (id) =>
    api.put(`/v1/containers/transactions/${id}/advance-status`),

  // EIR Document Upload
  uploadEir: (transactionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/v1/containers/transactions/${transactionId}/eir`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // EIR Documents
  getMyEirDocuments: () => api.get('/v1/eir/my-documents'),
  downloadEir: (transactionId) => `/api/v1/eir/download/${transactionId}`,
  uploadEirDocument: (transactionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/v1/eir/upload/${transactionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteEirDocument: (transactionId) => api.delete(`/v1/eir/${transactionId}`),

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
