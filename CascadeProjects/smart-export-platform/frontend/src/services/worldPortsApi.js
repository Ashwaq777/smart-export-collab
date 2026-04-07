import axios from 'axios'
import { REAL_PORTS_DATABASE, calculateTotalPortFees } from '../data/realPortsDatabase'

/**
 * Service pour les ports maritimes mondiaux avec couverture 100%
 * Utilise des données UNCTAD officielles (United Nations Conference on Trade and Development)
 */

const worldBankApi = axios.create({
  baseURL: 'https://api.worldbank.org/v2',
  timeout: 15000,
})

/**
 * Retry logic pour les appels API
 */
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

// Ports maritimes majeurs par pays (données open data World Port Index)
// 100+ pays avec ports réels pour l'export mondial
const MAJOR_WORLD_PORTS = {
  // Europe Occidentale
  'France': [
    { name: 'Port du Havre', city: 'Le Havre', capacity: 2900000, lat: 49.4833, lon: 0.1000 },
    { name: 'Port de Marseille-Fos', city: 'Marseille', capacity: 1500000, lat: 43.3500, lon: 5.0500 },
    { name: 'Port de Dunkerque', city: 'Dunkerque', capacity: 500000, lat: 51.0500, lon: 2.3667 },
    { name: 'Port de Nantes-Saint-Nazaire', city: 'Nantes', capacity: 300000, lat: 47.2167, lon: -1.5500 }
  ],
  'Allemagne': [
    { name: 'Port de Hambourg', city: 'Hamburg', capacity: 8700000, lat: 53.5333, lon: 9.9833 },
    { name: 'Port de Brême', city: 'Bremen', capacity: 4800000, lat: 53.0833, lon: 8.8000 },
    { name: 'Port de Wilhelmshaven', city: 'Wilhelmshaven', capacity: 500000, lat: 53.5167, lon: 8.1333 }
  ],
  'Pays-Bas': [
    { name: 'Port de Rotterdam', city: 'Rotterdam', capacity: 14800000, lat: 51.9167, lon: 4.5000 },
    { name: 'Port d\'Amsterdam', city: 'Amsterdam', capacity: 500000, lat: 52.3833, lon: 4.9000 }
  ],
  'Belgique': [
    { name: 'Port d\'Anvers', city: 'Antwerp', capacity: 12000000, lat: 51.2333, lon: 4.4000 },
    { name: 'Port de Zeebruges', city: 'Zeebrugge', capacity: 1500000, lat: 51.3333, lon: 3.2000 }
  ],
  'Espagne': [
    { name: 'Port de Valence', city: 'Valencia', capacity: 5400000, lat: 39.4500, lon: -0.3333 },
    { name: 'Port de Barcelone', city: 'Barcelona', capacity: 3500000, lat: 41.3500, lon: 2.1667 },
    { name: 'Port d\'Algésiras', city: 'Algeciras', capacity: 5000000, lat: 36.1333, lon: -5.4500 }
  ],
  'Italie': [
    { name: 'Port de Gênes', city: 'Genoa', capacity: 2600000, lat: 44.4167, lon: 8.9333 },
    { name: 'Port de Naples', city: 'Naples', capacity: 500000, lat: 40.8333, lon: 14.2500 },
    { name: 'Port de Venise', city: 'Venice', capacity: 600000, lat: 45.4333, lon: 12.3333 }
  ],
  'Royaume-Uni': [
    { name: 'Port de Felixstowe', city: 'Felixstowe', capacity: 4000000, lat: 51.9500, lon: 1.3500 },
    { name: 'Port de Southampton', city: 'Southampton', capacity: 2000000, lat: 50.9000, lon: -1.4000 },
    { name: 'Port de Londres', city: 'London', capacity: 2500000, lat: 51.5000, lon: 0.0500 }
  ],
  'Grèce': [
    { name: 'Port du Pirée', city: 'Piraeus', capacity: 5600000, lat: 37.9500, lon: 23.6333 },
    { name: 'Port de Thessalonique', city: 'Thessaloniki', capacity: 400000, lat: 40.6333, lon: 22.9333 }
  ],
  'Portugal': [
    { name: 'Port de Lisbonne', city: 'Lisbon', capacity: 1200000, lat: 38.7167, lon: -9.1333 },
    { name: 'Port de Sines', city: 'Sines', capacity: 1500000, lat: 37.9500, lon: -8.8667 }
  ],
  'Pologne': [
    { name: 'Port de Gdansk', city: 'Gdansk', capacity: 2000000, lat: 54.3667, lon: 18.6500 },
    { name: 'Port de Gdynia', city: 'Gdynia', capacity: 1000000, lat: 54.5167, lon: 18.5500 }
  ],
  'Danemark': [
    { name: 'Port d\'Aarhus', city: 'Aarhus', capacity: 800000, lat: 56.1500, lon: 10.2167 },
    { name: 'Port de Copenhague', city: 'Copenhagen', capacity: 600000, lat: 55.6833, lon: 12.5833 }
  ],
  'Suède': [
    { name: 'Port de Göteborg', city: 'Gothenburg', capacity: 900000, lat: 57.7000, lon: 11.9667 },
    { name: 'Port de Stockholm', city: 'Stockholm', capacity: 400000, lat: 59.3333, lon: 18.0667 }
  ],
  'Norvège': [
    { name: 'Port d\'Oslo', city: 'Oslo', capacity: 600000, lat: 59.9000, lon: 10.7500 },
    { name: 'Port de Bergen', city: 'Bergen', capacity: 300000, lat: 60.3833, lon: 5.3333 }
  ],
  'Finlande': [
    { name: 'Port de Helsinki', city: 'Helsinki', capacity: 1200000, lat: 60.1667, lon: 24.9667 },
    { name: 'Port de Turku', city: 'Turku', capacity: 300000, lat: 60.4333, lon: 22.2667 }
  ],
  'Irlande': [
    { name: 'Port de Dublin', city: 'Dublin', capacity: 900000, lat: 53.3500, lon: -6.2500 },
    { name: 'Port de Cork', city: 'Cork', capacity: 400000, lat: 51.9000, lon: -8.4667 }
  ],
  
  // Afrique
  'Maroc': [
    { name: 'Port de Tanger Med', city: 'Tanger', capacity: 9000000, lat: 35.8833, lon: -5.4167 },
    { name: 'Port de Casablanca', city: 'Casablanca', capacity: 1200000, lat: 33.6000, lon: -7.6167 },
    { name: 'Port d\'Agadir', city: 'Agadir', capacity: 400000, lat: 30.4167, lon: -9.6000 }
  ],
  'Égypte': [
    { name: 'Port Said', city: 'Port Said', capacity: 3500000, lat: 31.2667, lon: 32.3000 },
    { name: 'Port d\'Alexandrie', city: 'Alexandria', capacity: 2000000, lat: 31.2000, lon: 29.9167 },
    { name: 'Port de Damiette', city: 'Damietta', capacity: 1500000, lat: 31.4167, lon: 31.8167 }
  ],
  'Afrique du Sud': [
    { name: 'Port de Durban', city: 'Durban', capacity: 2700000, lat: -29.8667, lon: 31.0333 },
    { name: 'Port du Cap', city: 'Cape Town', capacity: 900000, lat: -33.9167, lon: 18.4333 },
    { name: 'Port Elizabeth', city: 'Port Elizabeth', capacity: 800000, lat: -33.9667, lon: 25.6167 }
  ],
  'Nigeria': [
    { name: 'Port de Lagos', city: 'Lagos', capacity: 1500000, lat: 6.4333, lon: 3.3833 },
    { name: 'Port Harcourt', city: 'Port Harcourt', capacity: 500000, lat: 4.7667, lon: 7.0167 }
  ],
  'Kenya': [
    { name: 'Port de Mombasa', city: 'Mombasa', capacity: 1300000, lat: -4.0500, lon: 39.6667 }
  ],
  'Tunisie': [
    { name: 'Port de Radès', city: 'Tunis', capacity: 500000, lat: 36.7667, lon: 10.2833 },
    { name: 'Port de Bizerte', city: 'Bizerte', capacity: 300000, lat: 37.2667, lon: 9.8667 }
  ],
  'Algérie': [
    { name: 'Port d\'Alger', city: 'Algiers', capacity: 800000, lat: 36.7667, lon: 3.0500 },
    { name: 'Port d\'Oran', city: 'Oran', capacity: 500000, lat: 35.7167, lon: -0.6333 }
  ],
  
  // Asie
  'Chine': [
    { name: 'Port of Shanghai', city: 'Shanghai', capacity: 47030000, lat: 31.2333, lon: 121.4667 },
    { name: 'Port of Shenzhen', city: 'Shenzhen', capacity: 30000000, lat: 22.5333, lon: 114.1333 },
    { name: 'Port of Ningbo-Zhoushan', city: 'Ningbo', capacity: 31070000, lat: 29.8667, lon: 121.5500 },
    { name: 'Port of Guangzhou', city: 'Guangzhou', capacity: 23000000, lat: 23.1167, lon: 113.2500 },
    { name: 'Port of Qingdao', city: 'Qingdao', capacity: 21000000, lat: 36.0667, lon: 120.3833 }
  ],
  'Singapour': [
    { name: 'Port of Singapore', city: 'Singapore', capacity: 37200000, lat: 1.2667, lon: 103.8000 }
  ],
  'Japon': [
    { name: 'Port of Tokyo', city: 'Tokyo', capacity: 5200000, lat: 35.6500, lon: 139.7667 },
    { name: 'Port of Yokohama', city: 'Yokohama', capacity: 3000000, lat: 35.4500, lon: 139.6500 },
    { name: 'Port of Nagoya', city: 'Nagoya', capacity: 2800000, lat: 35.0833, lon: 136.9000 }
  ],
  'Corée du Sud': [
    { name: 'Port of Busan', city: 'Busan', capacity: 22000000, lat: 35.1000, lon: 129.0333 },
    { name: 'Port of Incheon', city: 'Incheon', capacity: 3000000, lat: 37.4667, lon: 126.6167 }
  ],
  'Inde': [
    { name: 'Port of Mumbai (JNPT)', city: 'Mumbai', capacity: 5400000, lat: 18.9500, lon: 72.9500 },
    { name: 'Port of Chennai', city: 'Chennai', capacity: 2000000, lat: 13.0833, lon: 80.2833 },
    { name: 'Port of Kolkata', city: 'Kolkata', capacity: 700000, lat: 22.5667, lon: 88.3667 }
  ],
  'Thaïlande': [
    { name: 'Port of Bangkok', city: 'Bangkok', capacity: 1500000, lat: 13.7500, lon: 100.5167 },
    { name: 'Port of Laem Chabang', city: 'Chonburi', capacity: 8000000, lat: 13.0833, lon: 100.8833 }
  ],
  'Malaisie': [
    { name: 'Port Klang', city: 'Klang', capacity: 13200000, lat: 3.0000, lon: 101.3833 },
    { name: 'Port of Tanjung Pelepas', city: 'Johor', capacity: 9100000, lat: 1.3667, lon: 103.5500 }
  ],
  'Indonésie': [
    { name: 'Port of Jakarta (Tanjung Priok)', city: 'Jakarta', capacity: 7600000, lat: -6.1000, lon: 106.8833 },
    { name: 'Port of Surabaya', city: 'Surabaya', capacity: 3000000, lat: -7.2000, lon: 112.7333 }
  ],
  'Vietnam': [
    { name: 'Port of Ho Chi Minh', city: 'Ho Chi Minh City', capacity: 6200000, lat: 10.7667, lon: 106.7000 },
    { name: 'Port of Haiphong', city: 'Haiphong', capacity: 1500000, lat: 20.8667, lon: 106.6833 }
  ],
  'Philippines': [
    { name: 'Port of Manila', city: 'Manila', capacity: 4000000, lat: 14.6000, lon: 120.9667 },
    { name: 'Port of Cebu', city: 'Cebu', capacity: 800000, lat: 10.3000, lon: 123.9000 }
  ],
  'Émirats arabes unis': [
    { name: 'Port of Jebel Ali', city: 'Dubai', capacity: 15500000, lat: 25.0000, lon: 55.0833 },
    { name: 'Port of Khalifa', city: 'Abu Dhabi', capacity: 2500000, lat: 24.8333, lon: 54.6167 }
  ],
  'Arabie saoudite': [
    { name: 'Port of Jeddah', city: 'Jeddah', capacity: 4000000, lat: 21.5000, lon: 39.1667 },
    { name: 'Port of King Abdullah', city: 'Rabigh', capacity: 2500000, lat: 22.6833, lon: 39.0333 }
  ],
  'Israël': [
    { name: 'Port of Haifa', city: 'Haifa', capacity: 1800000, lat: 32.8167, lon: 34.9833 },
    { name: 'Port of Ashdod', city: 'Ashdod', capacity: 1500000, lat: 31.8000, lon: 34.6500 }
  ],
  'Turquie': [
    { name: 'Port of Istanbul (Ambarli)', city: 'Istanbul', capacity: 3000000, lat: 40.9833, lon: 28.6833 },
    { name: 'Port of Mersin', city: 'Mersin', capacity: 1700000, lat: 36.8000, lon: 34.6333 }
  ],
  
  // Amériques
  'États-Unis': [
    { name: 'Port of Los Angeles', city: 'Los Angeles', capacity: 10700000, lat: 33.7333, lon: -118.2667 },
    { name: 'Port of Long Beach', city: 'Long Beach', capacity: 8100000, lat: 33.7667, lon: -118.1833 },
    { name: 'Port of New York/New Jersey', city: 'New York', capacity: 7800000, lat: 40.6667, lon: -74.0500 },
    { name: 'Port of Savannah', city: 'Savannah', capacity: 4500000, lat: 32.0833, lon: -81.0833 },
    { name: 'Port of Houston', city: 'Houston', capacity: 2900000, lat: 29.7333, lon: -95.2667 }
  ],
  'Canada': [
    { name: 'Port of Vancouver', city: 'Vancouver', capacity: 3500000, lat: 49.2833, lon: -123.1167 },
    { name: 'Port of Montreal', city: 'Montreal', capacity: 1700000, lat: 45.5000, lon: -73.5667 },
    { name: 'Port of Halifax', city: 'Halifax', capacity: 500000, lat: 44.6500, lon: -63.5667 }
  ],
  'Mexique': [
    { name: 'Port of Manzanillo', city: 'Manzanillo', capacity: 3000000, lat: 19.0500, lon: -104.3167 },
    { name: 'Port of Veracruz', city: 'Veracruz', capacity: 1000000, lat: 19.2000, lon: -96.1333 },
    { name: 'Port of Lázaro Cárdenas', city: 'Lázaro Cárdenas', capacity: 1300000, lat: 17.9500, lon: -102.2000 }
  ],
  'Brésil': [
    { name: 'Port of Santos', city: 'Santos', capacity: 4300000, lat: -23.9500, lon: -46.3333 },
    { name: 'Port of Rio de Janeiro', city: 'Rio de Janeiro', capacity: 1200000, lat: -22.9000, lon: -43.1667 },
    { name: 'Port of Paranaguá', city: 'Paranaguá', capacity: 800000, lat: -25.5167, lon: -48.5167 }
  ],
  'Argentine': [
    { name: 'Port of Buenos Aires', city: 'Buenos Aires', capacity: 1500000, lat: -34.6000, lon: -58.3667 },
    { name: 'Port of Rosario', city: 'Rosario', capacity: 500000, lat: -32.9500, lon: -60.6333 }
  ],
  'Chili': [
    { name: 'Port of San Antonio', city: 'San Antonio', capacity: 1500000, lat: -33.5833, lon: -71.6167 },
    { name: 'Port of Valparaíso', city: 'Valparaíso', capacity: 1000000, lat: -33.0333, lon: -71.6333 }
  ],
  'Colombie': [
    { name: 'Port of Cartagena', city: 'Cartagena', capacity: 3000000, lat: 10.4000, lon: -75.5167 },
    { name: 'Port of Buenaventura', city: 'Buenaventura', capacity: 1200000, lat: 3.8833, lon: -77.0333 }
  ],
  'Pérou': [
    { name: 'Port of Callao', city: 'Callao', capacity: 2300000, lat: -12.0500, lon: -77.1500 }
  ],
  
  // Océanie
  'Australie': [
    { name: 'Port of Melbourne', city: 'Melbourne', capacity: 2900000, lat: -37.8167, lon: 144.9667 },
    { name: 'Port of Sydney', city: 'Sydney', capacity: 2500000, lat: -33.8667, lon: 151.2000 },
    { name: 'Port of Brisbane', city: 'Brisbane', capacity: 1400000, lat: -27.4667, lon: 153.0333 }
  ],
  'Nouvelle-Zélande': [
    { name: 'Port of Auckland', city: 'Auckland', capacity: 1000000, lat: -36.8500, lon: 174.7667 },
    { name: 'Port of Tauranga', city: 'Tauranga', capacity: 1200000, lat: -37.6833, lon: 176.1667 }
  ],
  
  // Afrique (suite)
  'Sénégal': [
    { name: 'Port de Dakar', city: 'Dakar', capacity: 700000, lat: 14.6667, lon: -17.4333 }
  ],
  'Côte d\'Ivoire': [
    { name: 'Port d\'Abidjan', city: 'Abidjan', capacity: 900000, lat: 5.3167, lon: -4.0333 }
  ],
  'Ghana': [
    { name: 'Port of Tema', city: 'Tema', capacity: 1000000, lat: 5.6667, lon: 0.0167 }
  ],
  'Cameroun': [
    { name: 'Port de Douala', city: 'Douala', capacity: 600000, lat: 4.0500, lon: 9.7000 }
  ],
  'Tanzanie': [
    { name: 'Port of Dar es Salaam', city: 'Dar es Salaam', capacity: 800000, lat: -6.8167, lon: 39.2833 }
  ],
  'Mozambique': [
    { name: 'Port of Maputo', city: 'Maputo', capacity: 500000, lat: -25.9667, lon: 32.5833 }
  ],
  'Angola': [
    { name: 'Port of Luanda', city: 'Luanda', capacity: 700000, lat: -8.8000, lon: 13.2333 }
  ],
  'Namibie': [
    { name: 'Port of Walvis Bay', city: 'Walvis Bay', capacity: 400000, lat: -22.9500, lon: 14.5000 }
  ],
  'Madagascar': [
    { name: 'Port of Toamasina', city: 'Toamasina', capacity: 400000, lat: -18.1500, lon: 49.4000 }
  ],
  'Libye': [
    { name: 'Port of Tripoli', city: 'Tripoli', capacity: 500000, lat: 32.9000, lon: 13.1833 }
  ],
  
  // Asie (suite)
  'Pakistan': [
    { name: 'Port of Karachi', city: 'Karachi', capacity: 2500000, lat: 24.8500, lon: 67.0167 }
  ],
  'Bangladesh': [
    { name: 'Port of Chittagong', city: 'Chittagong', capacity: 2800000, lat: 22.3333, lon: 91.8167 }
  ],
  'Sri Lanka': [
    { name: 'Port of Colombo', city: 'Colombo', capacity: 7200000, lat: 6.9333, lon: 79.8500 }
  ],
  'Myanmar': [
    { name: 'Port of Yangon', city: 'Yangon', capacity: 500000, lat: 16.7667, lon: 96.1667 }
  ],
  'Cambodge': [
    { name: 'Port of Sihanoukville', city: 'Sihanoukville', capacity: 600000, lat: 10.6167, lon: 103.5000 }
  ],
  'Taïwan': [
    { name: 'Port of Kaohsiung', city: 'Kaohsiung', capacity: 10600000, lat: 22.6167, lon: 120.2833 }
  ],
  'Hong Kong': [
    { name: 'Port of Hong Kong', city: 'Hong Kong', capacity: 18100000, lat: 22.2833, lon: 114.1500 }
  ],
  'Oman': [
    { name: 'Port of Salalah', city: 'Salalah', capacity: 5000000, lat: 17.0167, lon: 54.0833 }
  ],
  'Qatar': [
    { name: 'Port of Doha', city: 'Doha', capacity: 1500000, lat: 25.2833, lon: 51.5333 }
  ],
  'Koweït': [
    { name: 'Port of Kuwait', city: 'Kuwait City', capacity: 1200000, lat: 29.3667, lon: 47.9667 }
  ],
  'Bahreïn': [
    { name: 'Port of Khalifa Bin Salman', city: 'Manama', capacity: 1500000, lat: 26.1333, lon: 50.6000 }
  ],
  'Jordanie': [
    { name: 'Port of Aqaba', city: 'Aqaba', capacity: 800000, lat: 29.5333, lon: 35.0000 }
  ],
  'Liban': [
    { name: 'Port of Beirut', city: 'Beirut', capacity: 1000000, lat: 33.9000, lon: 35.5000 }
  ],
  'Yémen': [
    { name: 'Port of Aden', city: 'Aden', capacity: 800000, lat: 12.7833, lon: 45.0167 }
  ],
  'Iran': [
    { name: 'Port of Bandar Abbas', city: 'Bandar Abbas', capacity: 3000000, lat: 27.1833, lon: 56.2667 }
  ],
  
  // Amériques (suite)
  'Uruguay': [
    { name: 'Port of Montevideo', city: 'Montevideo', capacity: 1100000, lat: -34.9000, lon: -56.2167 }
  ],
  'Venezuela': [
    { name: 'Port of Puerto Cabello', city: 'Puerto Cabello', capacity: 800000, lat: 10.4667, lon: -68.0167 }
  ],
  'Équateur': [
    { name: 'Port of Guayaquil', city: 'Guayaquil', capacity: 2000000, lat: -2.1667, lon: -79.9000 }
  ],
  'Panama': [
    { name: 'Port of Balboa', city: 'Panama City', capacity: 3500000, lat: 8.9500, lon: -79.5667 },
    { name: 'Port of Colon', city: 'Colon', capacity: 4500000, lat: 9.3500, lon: -79.9000 }
  ],
  'Costa Rica': [
    { name: 'Port of Limon', city: 'Limon', capacity: 1200000, lat: 10.0000, lon: -83.0333 }
  ],
  'Guatemala': [
    { name: 'Port of Santo Tomas de Castilla', city: 'Puerto Barrios', capacity: 800000, lat: 15.7000, lon: -88.6000 }
  ],
  'Honduras': [
    { name: 'Port of Puerto Cortes', city: 'Puerto Cortes', capacity: 1000000, lat: 15.8333, lon: -87.9500 }
  ],
  'Nicaragua': [
    { name: 'Port of Corinto', city: 'Corinto', capacity: 400000, lat: 12.4833, lon: -87.1667 }
  ],
  'El Salvador': [
    { name: 'Port of Acajutla', city: 'Acajutla', capacity: 500000, lat: 13.5833, lon: -89.8333 }
  ],
  'République dominicaine': [
    { name: 'Port of Caucedo', city: 'Santo Domingo', capacity: 1500000, lat: 18.4167, lon: -69.6667 }
  ],
  'Jamaïque': [
    { name: 'Port of Kingston', city: 'Kingston', capacity: 1800000, lat: 17.9667, lon: -76.8000 }
  ],
  'Trinité-et-Tobago': [
    { name: 'Port of Port of Spain', city: 'Port of Spain', capacity: 600000, lat: 10.6500, lon: -61.5167 }
  ],
  
  // Europe (suite)
  'Croatie': [
    { name: 'Port of Rijeka', city: 'Rijeka', capacity: 600000, lat: 45.3333, lon: 14.4500 }
  ],
  'Slovénie': [
    { name: 'Port of Koper', city: 'Koper', capacity: 1000000, lat: 45.5500, lon: 13.7333 }
  ],
  'Roumanie': [
    { name: 'Port of Constanta', city: 'Constanta', capacity: 1500000, lat: 44.1667, lon: 28.6500 }
  ],
  'Bulgarie': [
    { name: 'Port of Varna', city: 'Varna', capacity: 800000, lat: 43.2000, lon: 27.9167 },
    { name: 'Port of Burgas', city: 'Burgas', capacity: 600000, lat: 42.5000, lon: 27.4667 }
  ],
  'Ukraine': [
    { name: 'Port of Odessa', city: 'Odessa', capacity: 1200000, lat: 46.4833, lon: 30.7333 }
  ],
  'Russie': [
    { name: 'Port of Saint Petersburg', city: 'Saint Petersburg', capacity: 2100000, lat: 59.9333, lon: 30.3000 },
    { name: 'Port of Novorossiysk', city: 'Novorossiysk', capacity: 1500000, lat: 44.7167, lon: 37.7667 },
    { name: 'Port of Vladivostok', city: 'Vladivostok', capacity: 1000000, lat: 43.1167, lon: 131.9000 }
  ],
  'Estonie': [
    { name: 'Port of Tallinn', city: 'Tallinn', capacity: 500000, lat: 59.4333, lon: 24.7500 }
  ],
  'Lettonie': [
    { name: 'Port of Riga', city: 'Riga', capacity: 600000, lat: 56.9500, lon: 24.1000 }
  ],
  'Lituanie': [
    { name: 'Port of Klaipeda', city: 'Klaipeda', capacity: 700000, lat: 55.7167, lon: 21.1333 }
  ],
  'Islande': [
    { name: 'Port of Reykjavik', city: 'Reykjavik', capacity: 200000, lat: 64.1500, lon: -21.9500 }
  ],
  'Malte': [
    { name: 'Port of Valletta', city: 'Valletta', capacity: 3500000, lat: 35.8978, lon: 14.5125 }
  ],
  'Chypre': [
    { name: 'Port of Limassol', city: 'Limassol', capacity: 800000, lat: 34.6667, lon: 33.0333 }
  ]
}

// Cache pour les PIB
let gdpCache = {}

export const worldPortsService = {
  /**
   * Récupère les ports pour un pays donné
   * UNIQUEMENT ports réels - pas de fallback générique
   * Utilise la base de données UNCTAD officielle
   */
  getPortsByCountry: async (countryName, countryData = null) => {
    // Vérifier si le pays a des ports dans la base UNCTAD
    if (REAL_PORTS_DATABASE[countryName]) {
      const ports = REAL_PORTS_DATABASE[countryName]
      
      // Calculer les frais totaux pour chaque port
      const portsWithFees = ports.map(port => ({
        ...port,
        totalFees: calculateTotalPortFees(port, 1, 10000) // 1 TEU, 10000 GRT par défaut
      }))
      
      return {
        hasPorts: true,
        ports: portsWithFees,
        message: null
      }
    }
    
    // Vérifier si le pays est enclavé
    if (countryData && countryData.landlocked) {
      return {
        hasPorts: false,
        ports: [],
        message: `${countryName} est un pays enclavé sans accès maritime direct`
      }
    }
    
    // Pour les pays côtiers sans ports dans la base: PAS DE PORT GÉNÉRIQUE
    // Le pays sera filtré de la liste
    return {
      hasPorts: false,
      ports: [],
      message: `Aucun port disponible dans la base de données pour ${countryName}`
    }
  },

  /**
   * Calcule les frais portuaires dynamiquement
   * Basé sur PIB du pays (World Bank API)
   */
  calculatePortFees: async (portName, countryCode, productType = 'agricultural') => {
    try {
      // Récupérer le PIB depuis le cache ou l'API
      let gdpPerCapita = gdpCache[countryCode]
      
      if (!gdpPerCapita) {
        try {
          const gdpResponse = await retryRequest(() =>
            worldBankApi.get(`/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json&date=2023:2022`)
          )
          
          if (gdpResponse.data && gdpResponse.data[1] && gdpResponse.data[1].length > 0) {
            // Prendre la première valeur disponible
            for (const entry of gdpResponse.data[1]) {
              if (entry.value) {
                gdpPerCapita = entry.value
                break
              }
            }
          }
          
          // Mettre en cache
          if (gdpPerCapita) {
            gdpCache[countryCode] = gdpPerCapita
          }
        } catch (apiError) {
          console.log(`Could not fetch GDP for ${countryCode}, using default`)
        }
      }
      
      // Valeur par défaut si pas de PIB disponible
      if (!gdpPerCapita) {
        gdpPerCapita = 10000
      }
      
      // Trouver la capacité du port depuis la base UNCTAD
      let portCapacity = 1000000
      for (const ports of Object.values(REAL_PORTS_DATABASE)) {
        const port = ports.find(p => p.name === portName)
        if (port) {
          portCapacity = port.capacity
          break
        }
      }
      
      // Calcul dynamique des frais
      const baseFee = 200
      const gdpFactor = Math.min(Math.max(gdpPerCapita / 20000, 0.5), 3)
      const capacityFactor = Math.min(Math.max(portCapacity / 5000000, 0.5), 2)
      const productFactor = productType === 'agricultural' ? 0.8 : 1.0
      
      const calculatedFee = Math.round(baseFee * gdpFactor * capacityFactor * productFactor)
      
      return {
        fee: calculatedFee,
        currency: 'USD',
        basedOn: {
          gdpPerCapita: Math.round(gdpPerCapita),
          portCapacity,
          productType,
          formula: `${baseFee} × ${gdpFactor.toFixed(2)} × ${capacityFactor.toFixed(2)} × ${productFactor}`
        }
      }
    } catch (error) {
      console.error('Error calculating port fees:', error)
      return {
        fee: 500,
        currency: 'USD',
        basedOn: {
          gdpPerCapita: 'N/A',
          portCapacity: 'N/A',
          productType,
          formula: 'Default fallback'
        }
      }
    }
  },

  /**
   * Récupère tous les ports disponibles
   */
  getAllPorts: () => {
    const allPorts = []
    Object.entries(REAL_PORTS_DATABASE).forEach(([country, ports]) => {
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
   * Statistiques de couverture
   */
  getCoverageStats: () => {
    const totalCountries = Object.keys(REAL_PORTS_DATABASE).length
    const totalPorts = worldPortsService.getAllPorts().length
    
    return {
      totalCountries,
      totalPorts,
      averagePortsPerCountry: (totalPorts / totalCountries).toFixed(1)
    }
  }
}

export default worldPortsService
