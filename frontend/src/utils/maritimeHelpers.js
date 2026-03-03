/**
 * Maritime Transport Helper Functions
 * Handles loading ports by country and calculating fees dynamically
 */

import { worldPortsService } from '../services/worldPortsApi'

/**
 * Load ports for a specific country
 * @param {string} country - Country name
 * @param {Array} countriesData - Full countries data with currency info
 * @returns {Promise<Object>} Ports with calculated fees
 */
export const loadPortsForCountry = async (country, countriesData) => {
  if (!country) {
    return { hasPorts: false, ports: [], message: 'No country selected' }
  }

  try {
    const matchedIso2 = (countriesData || []).find((c) => c?.name === country)?.cca2

    // Get ports from world ports service (déjà avec frais UNCTAD)
    const portsResult = matchedIso2
      ? await worldPortsService.getPortsByCountryIso2(matchedIso2)
      : await worldPortsService.getPortsByCountry(country, null)

    if (!portsResult.hasPorts || portsResult.ports.length === 0) {
      return {
        hasPorts: false,
        ports: [],
        message: portsResult.message || `No ports available for ${country}`,
      }
    }

    return {
      hasPorts: true,
      ports: portsResult.ports,
      message: null,
    }
  } catch (error) {
    console.error('❌ [maritimeHelpers] Error loading ports:', error)
    return {
      hasPorts: false,
      ports: [],
      message: 'Error loading ports',
    }
  }
}

export const loadPortsForCountryIso2 = async (iso2) => {
  if (!iso2) {
    return { hasPorts: false, ports: [], message: 'No country selected' }
  }

  try {
    const portsResult = await worldPortsService.getPortsByCountryIso2(iso2)
    if (!portsResult.hasPorts || portsResult.ports.length === 0) {
      return {
        hasPorts: false,
        ports: [],
        message: portsResult.message || `No ports available for ${iso2}`,
      }
    }

    return {
      hasPorts: true,
      ports: portsResult.ports,
      message: null,
    }
  } catch (error) {
    console.error('❌ [maritimeHelpers] Error loading ports:', error)
    return {
      hasPorts: false,
      ports: [],
      message: 'Error loading ports',
    }
  }
}

/**
 * Get all maritime countries (countries with at least one port)
 * @param {Array} allCountries - All countries from backend
 * @param {Array} countriesData - Countries with currency data
 * @returns {Promise<Array>} Maritime countries only
 */
export const getMaritimeCountries = async (allCountries, countriesData) => {
  const maritimeCountries = []
  const excludedCountries = []
  
  for (const country of allCountries) {
    const countryData = countriesData.find(c => c.name === country)
    
    if (!countryData) {
      excludedCountries.push({ name: country, reason: 'No currency data' })
      continue
    }
    
    // Check if country has ports
    const portsResult = await worldPortsService.getPortsByCountry(country, countryData)
    
    if (portsResult.hasPorts && portsResult.ports.length > 0) {
      // Verify no generic ports
      const hasGenericPort = portsResult.ports.some(p => p.isGeneric)
      
      if (!hasGenericPort) {
        maritimeCountries.push(country)
      } else {
        excludedCountries.push({ name: country, reason: 'Has generic ports' })
      }
    } else {
      excludedCountries.push({ 
        name: country, 
        reason: portsResult.message || 'No ports available' 
      })
    }
  }
  
  return maritimeCountries
}

export default {
  loadPortsForCountry,
  loadPortsForCountryIso2,
  getMaritimeCountries
}
