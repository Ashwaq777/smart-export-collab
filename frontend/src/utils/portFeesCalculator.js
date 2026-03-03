/**
 * Dynamic Port Fees Calculator
 * Calculates port fees based on country GDP, currency, and maritime index
 */

const GDP_PER_CAPITA_RANGES = {
  VERY_HIGH: 50000, // USD
  HIGH: 20000,
  MEDIUM: 10000,
  LOW: 5000
}

const BASE_PORT_FEES = {
  VERY_HIGH: 800, // USD
  HIGH: 600,
  MEDIUM: 400,
  LOW: 250
}

/**
 * Calculate dynamic port fees based on country economic indicators
 * @param {Object} countryData - Country data with currency info
 * @param {string} portName - Port name
 * @param {number} gdpPerCapita - GDP per capita (optional, will estimate if not provided)
 * @returns {number} Port fees in USD
 */
export const calculatePortFees = (countryData, portName, gdpPerCapita = null) => {
  console.log('💰 [portFeesCalculator] Calculating fees for:', portName, countryData?.name)
  
  // Estimate GDP per capita if not provided (based on currency strength)
  let estimatedGDP = gdpPerCapita
  
  if (!estimatedGDP && countryData?.currency?.code) {
    estimatedGDP = estimateGDPFromCurrency(countryData.currency.code)
  }
  
  // Determine fee tier
  let baseFee = BASE_PORT_FEES.MEDIUM
  
  if (estimatedGDP >= GDP_PER_CAPITA_RANGES.VERY_HIGH) {
    baseFee = BASE_PORT_FEES.VERY_HIGH
  } else if (estimatedGDP >= GDP_PER_CAPITA_RANGES.HIGH) {
    baseFee = BASE_PORT_FEES.HIGH
  } else if (estimatedGDP >= GDP_PER_CAPITA_RANGES.MEDIUM) {
    baseFee = BASE_PORT_FEES.MEDIUM
  } else {
    baseFee = BASE_PORT_FEES.LOW
  }
  
  // Add maritime index multiplier (major ports cost more)
  const maritimeMultiplier = getMaritimeIndexMultiplier(portName, countryData?.name)
  
  const totalFees = Math.round(baseFee * maritimeMultiplier)
  
  console.log('✅ [portFeesCalculator] Calculated fees:', totalFees, 'USD')
  
  return totalFees
}

/**
 * Estimate GDP per capita from currency code
 */
const estimateGDPFromCurrency = (currencyCode) => {
  const HIGH_GDP_CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'DKK', 'AUD', 'CAD', 'SGD', 'JPY']
  const MEDIUM_GDP_CURRENCIES = ['CNY', 'KRW', 'BRL', 'MXN', 'ARS', 'CLP', 'ZAR', 'TRY', 'RUB', 'PLN']
  
  if (HIGH_GDP_CURRENCIES.includes(currencyCode)) {
    return 35000
  } else if (MEDIUM_GDP_CURRENCIES.includes(currencyCode)) {
    return 12000
  } else {
    return 6000
  }
}

/**
 * Get maritime index multiplier based on port importance
 */
const getMaritimeIndexMultiplier = (portName, countryName) => {
  const portLower = portName?.toLowerCase() || ''
  const countryLower = countryName?.toLowerCase() || ''
  
  // Major global ports
  const MAJOR_PORTS = [
    'shanghai', 'singapore', 'rotterdam', 'antwerp', 'hamburg',
    'los angeles', 'long beach', 'hong kong', 'busan', 'dubai',
    'tokyo', 'yokohama', 'port said', 'jebel ali', 'tanjung pelepas'
  ]
  
  // Regional hub ports
  const HUB_PORTS = [
    'le havre', 'marseille', 'barcelona', 'valencia', 'genoa',
    'piraeus', 'istanbul', 'santos', 'buenos aires', 'valparaiso',
    'vancouver', 'seattle', 'savannah', 'new york', 'miami'
  ]
  
  for (const major of MAJOR_PORTS) {
    if (portLower.includes(major)) {
      return 1.5 // 50% premium for major ports
    }
  }
  
  for (const hub of HUB_PORTS) {
    if (portLower.includes(hub)) {
      return 1.25 // 25% premium for hub ports
    }
  }
  
  return 1.0 // Standard rate
}

/**
 * Calculate shipping cost between two ports
 * Formula: (distance × weight × unit_rate) + origin_fees + dest_fees
 */
export const calculateShippingCost = (
  distanceNM,
  weightTonnes,
  originPortFees,
  destPortFees,
  unitRate = 20 // USD per tonne per 1000 NM
) => {
  console.log('🚢 [portFeesCalculator] Calculating shipping cost:')
  console.log('  Distance:', distanceNM, 'NM')
  console.log('  Weight:', weightTonnes, 'tonnes')
  console.log('  Origin fees:', originPortFees, 'USD')
  console.log('  Dest fees:', destPortFees, 'USD')
  console.log('  Unit rate:', unitRate, 'USD/tonne/1000NM')
  
  // Base shipping cost: distance × weight × rate per 1000 NM
  const baseShippingCost = (distanceNM / 1000) * weightTonnes * unitRate
  
  // Total cost including port fees
  const totalCost = baseShippingCost + originPortFees + destPortFees
  
  console.log('  Base shipping:', Math.round(baseShippingCost), 'USD')
  console.log('  Total cost:', Math.round(totalCost), 'USD')
  
  return {
    baseShippingCost: Math.round(baseShippingCost),
    originPortFees: originPortFees,
    destPortFees: destPortFees,
    totalCost: Math.round(totalCost),
    breakdown: {
      distanceNM,
      weightTonnes,
      unitRate,
      costPerNM: Math.round((baseShippingCost / distanceNM) * 100) / 100
    }
  }
}

export default {
  calculatePortFees,
  calculateShippingCost
}
