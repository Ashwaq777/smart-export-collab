/**
 * Maritime Transport Functions for Calculator
 * Handles bidirectional maritime transport (origin and destination)
 */

import { loadPortsForCountry } from '../utils/maritimeHelpers'
import { calculatePortFees, calculateShippingCost } from '../utils/portFeesCalculator'
import vesselService from '../services/vesselService'

/**
 * Load ports for origin country
 */
export const handleOriginCountryChange = async (country, countriesData, setOriginPorts, setOriginPort, setOriginPortFees) => {
  console.log('🌍 [Maritime] Origin country changed:', country)
  
  if (!country) {
    setOriginPorts([])
    setOriginPort(null)
    setOriginPortFees(0)
    return
  }
  
  try {
    const result = await loadPortsForCountry(country, countriesData)
    
    if (result.hasPorts) {
      setOriginPorts(result.ports)
      console.log(`✅ [Maritime] Loaded ${result.ports.length} origin ports for ${country}`)
    } else {
      setOriginPorts([])
      console.log(`❌ [Maritime] No origin ports for ${country}`)
    }
    
    // Reset selected port
    setOriginPort(null)
    setOriginPortFees(0)
  } catch (error) {
    console.error('❌ [Maritime] Error loading origin ports:', error)
    setOriginPorts([])
  }
}

/**
 * Load ports for destination country
 */
export const handleDestinationCountryChange = async (country, countriesData, setDestinationPorts, setDestinationPort, setDestinationPortFees) => {
  console.log('🌍 [Maritime] Destination country changed:', country)
  
  if (!country) {
    setDestinationPorts([])
    setDestinationPort(null)
    setDestinationPortFees(0)
    return
  }
  
  try {
    const result = await loadPortsForCountry(country, countriesData)
    
    if (result.hasPorts) {
      setDestinationPorts(result.ports)
      console.log(`✅ [Maritime] Loaded ${result.ports.length} destination ports for ${country}`)
    } else {
      setDestinationPorts([])
      console.log(`❌ [Maritime] No destination ports for ${country}`)
    }
    
    // Reset selected port
    setDestinationPort(null)
    setDestinationPortFees(0)
  } catch (error) {
    console.error('❌ [Maritime] Error loading destination ports:', error)
    setDestinationPorts([])
  }
}

/**
 * Handle origin port selection
 */
export const handleOriginPortSelect = (port, setOriginPort, setOriginPortFees) => {
  console.log('🚢 [Maritime] Origin port selected:', port)
  
  setOriginPort(port)
  setOriginPortFees(port.fraisPortuaires || 0)
  
  console.log(`💰 [Maritime] Origin port fees: ${port.fraisPortuaires} USD`)
}

/**
 * Handle destination port selection
 */
export const handleDestinationPortSelect = (port, setDestinationPort, setDestinationPortFees) => {
  console.log('🚢 [Maritime] Destination port selected:', port)
  
  setDestinationPort(port)
  setDestinationPortFees(port.fraisPortuaires || 0)
  
  console.log(`💰 [Maritime] Destination port fees: ${port.fraisPortuaires} USD`)
}

/**
 * Calculate maritime distance and shipping cost
 */
export const calculateMaritimeShipping = async (
  originPort,
  destinationPort,
  weight,
  originPortFees,
  destPortFees,
  setMaritimeDistance,
  setShippingCost
) => {
  console.log('🚢 [Maritime] Calculating shipping cost...')
  console.log('  Origin:', originPort?.nomPort || originPort?.name)
  console.log('  Destination:', destinationPort?.nomPort || destinationPort?.name)
  console.log('  Weight:', weight, 'tonnes')
  
  if (!originPort || !destinationPort || !weight || weight <= 0) {
    console.warn('⚠️ [Maritime] Missing data for shipping calculation')
    setMaritimeDistance(null)
    setShippingCost(null)
    return null
  }
  
  try {
    // Get distance from API
    console.log('📏 [Maritime] Calling vesselService.getDistance...')
    const distanceData = await vesselService.getDistance(originPort.id, destinationPort.id)
    
    const distanceNM = distanceData.distanceNm || distanceData.distance || 0
    
    console.log(`✅ [Maritime] Distance: ${distanceNM} NM`)
    setMaritimeDistance(distanceNM)
    
    // Calculate shipping cost
    const shippingResult = calculateShippingCost(
      distanceNM,
      parseFloat(weight),
      originPortFees,
      destPortFees
    )
    
    console.log('✅ [Maritime] Shipping cost calculated:', shippingResult)
    setShippingCost(shippingResult)
    
    return shippingResult
  } catch (error) {
    console.error('❌ [Maritime] Error calculating shipping:', error)
    setMaritimeDistance(null)
    setShippingCost(null)
    return null
  }
}

/**
 * Convert amount to selected currency
 */
export const convertCurrency = async (amountUSD, targetCurrency, exchangeRates) => {
  if (targetCurrency === 'USD') {
    return amountUSD
  }
  
  const rate = exchangeRates[targetCurrency]
  if (!rate) {
    console.warn(`⚠️ [Maritime] No exchange rate for ${targetCurrency}, using USD`)
    return amountUSD
  }
  
  return amountUSD * rate
}

export default {
  handleOriginCountryChange,
  handleDestinationCountryChange,
  handleOriginPortSelect,
  handleDestinationPortSelect,
  calculateMaritimeShipping,
  convertCurrency
}
