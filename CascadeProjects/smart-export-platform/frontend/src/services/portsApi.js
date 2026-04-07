import axios from 'axios'

/**
 * Service pour les ports maritimes mondiaux
 * Utilise des données open data de ports majeurs
 * Les frais portuaires sont calculés dynamiquement basés sur le PIB
 */

const worldBankApi = axios.create({
  baseURL: 'https://api.worldbank.org/v2',
  timeout: 15000,
})

// Ports maritimes majeurs par pays (données open data)
const MAJOR_WORLD_PORTS = {
  'France': [
    { name: 'Port du Havre', city: 'Le Havre', capacity: 2900000 },
    { name: 'Port de Marseille', city: 'Marseille', capacity: 1500000 },
    { name: 'Port de Dunkerque', city: 'Dunkerque', capacity: 500000 }
  ],
  'Maroc': [
    { name: 'Port de Tanger Med', city: 'Tanger', capacity: 9000000 },
    { name: 'Port de Casablanca', city: 'Casablanca', capacity: 1200000 },
    { name: 'Port d\'Agadir', city: 'Agadir', capacity: 400000 }
  ],
  'États-Unis': [
    { name: 'Port of Los Angeles', city: 'Los Angeles', capacity: 10700000 },
    { name: 'Port of Long Beach', city: 'Long Beach', capacity: 8100000 },
    { name: 'Port of New York/New Jersey', city: 'New York', capacity: 7800000 }
  ],
  'Espagne': [
    { name: 'Port de Valence', city: 'Valencia', capacity: 5400000 },
    { name: 'Port de Barcelone', city: 'Barcelona', capacity: 3500000 },
    { name: 'Port d\'Algésiras', city: 'Algeciras', capacity: 5000000 }
  ],
  'Italie': [
    { name: 'Port de Gênes', city: 'Genoa', capacity: 2600000 },
    { name: 'Port de Naples', city: 'Naples', capacity: 500000 },
    { name: 'Port de Venise', city: 'Venice', capacity: 600000 }
  ],
  'Allemagne': [
    { name: 'Port de Hambourg', city: 'Hamburg', capacity: 8700000 },
    { name: 'Port de Brême', city: 'Bremen', capacity: 4800000 }
  ],
  'Belgique': [
    { name: 'Port d\'Anvers', city: 'Antwerp', capacity: 12000000 },
    { name: 'Port de Zeebruges', city: 'Zeebrugge', capacity: 1500000 }
  ],
  'Pays-Bas': [
    { name: 'Port de Rotterdam', city: 'Rotterdam', capacity: 14800000 },
    { name: 'Port d\'Amsterdam', city: 'Amsterdam', capacity: 500000 }
  ],
  'Royaume-Uni': [
    { name: 'Port de Felixstowe', city: 'Felixstowe', capacity: 4000000 },
    { name: 'Port de Southampton', city: 'Southampton', capacity: 2000000 }
  ],
  'Chine': [
    { name: 'Port of Shanghai', city: 'Shanghai', capacity: 47030000 },
    { name: 'Port of Shenzhen', city: 'Shenzhen', capacity: 30000000 },
    { name: 'Port of Ningbo', city: 'Ningbo', capacity: 31070000 }
  ],
  'Singapour': [
    { name: 'Port of Singapore', city: 'Singapore', capacity: 37200000 }
  ],
  'Japon': [
    { name: 'Port of Tokyo', city: 'Tokyo', capacity: 5200000 },
    { name: 'Port of Yokohama', city: 'Yokohama', capacity: 3000000 }
  ],
  'Corée du Sud': [
    { name: 'Port of Busan', city: 'Busan', capacity: 22000000 }
  ],
  'Inde': [
    { name: 'Port of Mumbai (JNPT)', city: 'Mumbai', capacity: 5400000 },
    { name: 'Port of Chennai', city: 'Chennai', capacity: 2000000 }
  ],
  'Brésil': [
    { name: 'Port of Santos', city: 'Santos', capacity: 4300000 }
  ],
  'Canada': [
    { name: 'Port of Vancouver', city: 'Vancouver', capacity: 3500000 }
  ],
  'Australie': [
    { name: 'Port of Melbourne', city: 'Melbourne', capacity: 2900000 },
    { name: 'Port of Sydney', city: 'Sydney', capacity: 2500000 }
  ]
}

export const portsService = {
  /**
   * Récupère les ports par pays avec capacités
   * UNIQUEMENT pour afficher les ports - Les frais sont calculés dynamiquement
   */
  getPortsByCountry: (countryName) => {
    return MAJOR_WORLD_PORTS[countryName] || []
  },

  /**
   * Récupère tous les ports disponibles
   */
  getAllPorts: () => {
    const allPorts = []
    Object.entries(MAJOR_WORLD_PORTS).forEach(([country, ports]) => {
      ports.forEach(port => {
        allPorts.push({
          ...port,
          country
        })
      })
    })
    return allPorts
  },

  /**
   * Calcule les frais portuaires dynamiquement basés sur:
   * - PIB du pays (World Bank API)
   * - Capacité du port
   * - Type de produit
   */
  calculatePortFees: async (portName, countryCode, productType = 'agricultural') => {
    try {
      // Récupérer le PIB par habitant du pays
      const gdpResponse = await worldBankApi.get(
        `/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json&date=2023`
      )
      
      let gdpPerCapita = 10000 // Valeur par défaut
      if (gdpResponse.data && gdpResponse.data[1] && gdpResponse.data[1][0]) {
        gdpPerCapita = gdpResponse.data[1][0].value || 10000
      }

      // Trouver le port pour obtenir sa capacité
      let portCapacity = 1000000 // Capacité par défaut
      for (const ports of Object.values(MAJOR_WORLD_PORTS)) {
        const port = ports.find(p => p.name === portName)
        if (port) {
          portCapacity = port.capacity
          break
        }
      }

      // Calcul dynamique des frais basé sur PIB et capacité
      // Formule: Base fee × (GDP factor) × (Capacity factor) × (Product type factor)
      const baseFee = 200
      const gdpFactor = Math.min(gdpPerCapita / 20000, 3) // Max 3x pour pays riches
      const capacityFactor = Math.min(portCapacity / 5000000, 2) // Max 2x pour grands ports
      const productFactor = productType === 'agricultural' ? 0.8 : 1.0 // Réduction pour agricole

      const calculatedFee = Math.round(baseFee * gdpFactor * capacityFactor * productFactor)

      return {
        fee: calculatedFee,
        currency: 'USD',
        basedOn: {
          gdpPerCapita,
          portCapacity,
          productType
        }
      }
    } catch (error) {
      console.error('Error calculating port fees:', error)
      // Frais par défaut en cas d'erreur
      return {
        fee: 500,
        currency: 'USD',
        basedOn: {
          gdpPerCapita: 'N/A',
          portCapacity: 'N/A',
          productType
        }
      }
    }
  }
}

export default portsService
