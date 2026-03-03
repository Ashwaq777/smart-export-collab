import axios from 'axios'

const API_BASE_URL = import.meta.env?.VITE_MARITIME_API_BASE_URL || '/api/maritime'

/**
 * Service pour récupérer les navires en temps réel via API AIS
 */
export const vesselService = {
  /**
   * Récupère les navires disponibles dans un port via API AIS
   */
  getVesselsByPort: async (portId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vessels/port/${portId}`)
      return response.data
    } catch (error) {
      console.error('❌ [vesselService] Error fetching vessels for port:', error)
      console.error('❌ [vesselService] Error details:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Récupère la distance entre deux ports via Datalastic API
   */
  getDistance: async (originPortId, destPortId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/distance/${originPortId}/${destPortId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching distance:', error)
      throw error
    }
  },

  /**
   * Calcule le coût du transport maritime avec poids
   */
  calculateTransportCost: async (costRequest) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calculate-cost`, costRequest)
      return response.data
    } catch (error) {
      console.error('Error calculating transport cost:', error)
      throw error
    }
  }
}

export default vesselService
