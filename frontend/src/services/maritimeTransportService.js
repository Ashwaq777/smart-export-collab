import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/maritime';

/**
 * Maritime Transport Service
 * Handles API calls for maritime transport functionality
 */
const maritimeTransportService = {
  
  /**
   * Get available ships for a route
   * @param {number} originPortId - Origin port ID
   * @param {number} destPortId - Destination port ID
   * @returns {Promise} List of available ships
   */
  getAvailableShips: async (originPortId, destPortId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ships/available`, {
        params: { originPortId, destPortId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available ships:', error);
      throw error;
    }
  },

  /**
   * Get route details between two ports
   * @param {number} originPortId - Origin port ID
   * @param {number} destPortId - Destination port ID
   * @returns {Promise} Route details with distance, duration, etc.
   */
  getRoute: async (originPortId, destPortId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/${originPortId}/${destPortId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw error;
    }
  },

  /**
   * Calculate maritime transport cost
   * @param {object} data - Cost calculation request data
   * @returns {Promise} Maritime transport cost breakdown
   */
  calculateCost: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calculate-cost`, data);
      return response.data;
    } catch (error) {
      console.error('Error calculating maritime transport cost:', error);
      throw error;
    }
  }
};

export default maritimeTransportService;
