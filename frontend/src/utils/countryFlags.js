export const COUNTRY_NAME_TO_ISO2 = {
  // French names
  France: 'FR',
  Allemagne: 'DE',
  Espagne: 'ES',
  Italie: 'IT',
  'Pays-Bas': 'NL',
  Belgique: 'BE',
  Portugal: 'PT',
  Grèce: 'GR',
  Turquie: 'TR',
  Maroc: 'MA',
  Algérie: 'DZ',
  Tunisie: 'TN',
  'Égypte': 'EG',
  Senegal: 'SN',
  Sénégal: 'SN',
  "Côte d'Ivoire": 'CI',
  Nigeria: 'NG',
  Ghana: 'GH',
  'Afrique du Sud': 'ZA',
  Kenya: 'KE',
  Tanzanie: 'TZ',
  Mozambique: 'MZ',
  Angola: 'AO',
  Cameroun: 'CM',
  Gabon: 'GA',
  'Arabie Saoudite': 'SA',
  'Arabie saoudite': 'SA',
  'Émirats Arabes Unis': 'AE',
  'Émirats arabes unis': 'AE',
  Qatar: 'QA',
  'Koweït': 'KW',
  Oman: 'OM',
  'Bahreïn': 'BH',
  Inde: 'IN',
  Pakistan: 'PK',
  Bangladesh: 'BD',
  'Sri Lanka': 'LK',
  Chine: 'CN',
  Japon: 'JP',
  'Corée du Sud': 'KR',
  'Taïwan': 'TW',
  Vietnam: 'VN',
  Thaïlande: 'TH',
  Malaisie: 'MY',
  Singapour: 'SG',
  Indonésie: 'ID',
  Philippines: 'PH',
  Australie: 'AU',
  'Nouvelle-Zélande': 'NZ',
  'États-Unis': 'US',
  Canada: 'CA',
  Mexique: 'MX',
  Brésil: 'BR',
  Argentine: 'AR',
  Chili: 'CL',
  Pérou: 'PE',
  Colombie: 'CO',
  Panama: 'PA',
  Cuba: 'CU',
  Jamaïque: 'JM',
  'Royaume-Uni': 'GB',
  Irlande: 'IE',
  Danemark: 'DK',
  Norvège: 'NO',
  Suède: 'SE',
  Finlande: 'FI',
  Pologne: 'PL',
  Russie: 'RU',
  Ukraine: 'UA',
  Roumanie: 'RO',
  Bulgarie: 'BG',
  Croatie: 'HR',
  Slovénie: 'SI',
  Monténégro: 'ME',
  Albanie: 'AL',
  Chypre: 'CY',
  Malte: 'MT',
  Israël: 'IL',
  Liban: 'LB',
  Iran: 'IR',
  Irak: 'IQ',
  'Yémen': 'YE',
  Djibouti: 'DJ',
  Somalie: 'SO',
  'Érythrée': 'ER',
  Libye: 'LY',
  Mauritanie: 'MR',

  // English names (fallback)
  Germany: 'DE',
  Spain: 'ES',
  Italy: 'IT',
  Netherlands: 'NL',
  Belgium: 'BE',
  Morocco: 'MA',
  Egypt: 'EG',
  China: 'CN',
  Japan: 'JP',
  Australia: 'AU',
  Brazil: 'BR',
  'United States': 'US',
  'United Kingdom': 'GB',
  'South Africa': 'ZA',
  Singapore: 'SG',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
}

export const getCountryISO2 = (countryName) => {
  if (!countryName) return null
  const raw = String(countryName)
  return (
    COUNTRY_NAME_TO_ISO2[raw] ||
    COUNTRY_NAME_TO_ISO2[raw.trim()] ||
    COUNTRY_NAME_TO_ISO2[raw.trim().replace(/\s+/g, ' ')] ||
    null
  )
}

export const getFlagEmojiFromIso2 = (iso2) => {
  if (!iso2 || String(iso2).length !== 2) return '🌐'
  return String(iso2)
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}

export const getFlagEmoji = (countryName) => {
  const iso2 = getCountryISO2(countryName)
  if (!iso2) return '🌐'
  return getFlagEmojiFromIso2(iso2)
}
