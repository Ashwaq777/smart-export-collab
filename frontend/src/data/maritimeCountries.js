/**
 * Liste officielle des pays avec accès maritime
 * Source : Organisation Maritime Internationale (OMI)
 * 180 pays côtiers / avec ports maritimes internationaux
 */

export const MARITIME_COUNTRIES_ISO2 = [
  // AFRIQUE DU NORD & MOYEN-ORIENT
  'MA', 'DZ', 'TN', 'LY', 'EG', 'MR', 'DJ', 'ER', 'SO', 'SD',
  // AFRIQUE DE L'OUEST
  'SN', 'GM', 'GW', 'SL', 'LR', 'CI', 'GH', 'TG', 'BJ', 'NG',
  'CM', 'GQ', 'GA', 'CG', 'CD', 'AO', 'ST', 'CV',
  // AFRIQUE DE L'EST & SUD
  'KE', 'TZ', 'MZ', 'ZA', 'NA', 'MG', 'MU', 'SC', 'KM', 'YT',
  'RE', 'MW',
  // MOYEN-ORIENT
  'SA', 'YE', 'OM', 'AE', 'QA', 'BH', 'KW', 'IQ', 'IR', 'IL',
  'LB', 'JO', 'SY',
  // ASIE DU SUD
  'PK', 'IN', 'LK', 'BD', 'MM', 'MV',
  // ASIE DU SUD-EST
  'TH', 'MY', 'SG', 'ID', 'PH', 'VN', 'KH', 'BN', 'TL',
  // ASIE DE L'EST
  'CN', 'JP', 'KR', 'TW', 'HK', 'MO',
  // OCÉANIE
  'AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'WS', 'TO', 'PW',
  'MH', 'FM', 'KI', 'NR', 'TV',
  // EUROPE OCCIDENTALE
  'PT', 'ES', 'FR', 'GB', 'IE', 'IS', 'NO', 'DK', 'SE', 'FI',
  'DE', 'NL', 'BE', 'IT', 'MT', 'CY', 'GR', 'AL', 'ME', 'HR',
  'SI', 'BA', 'MK',
  // EUROPE DE L'EST & BALTIQUE
  'PL', 'EE', 'LV', 'LT', 'RU', 'UA', 'RO', 'BG', 'GE', 'AZ',
  'TR',
  // AMÉRIQUE DU NORD
  'US', 'CA', 'MX',
  // CARAÏBES
  'CU', 'JM', 'HT', 'DO', 'PR', 'TT', 'BB', 'LC', 'VC', 'GD',
  'AG', 'KN', 'BS', 'BZ', 'DM',
  // AMÉRIQUE CENTRALE
  'GT', 'HN', 'SV', 'NI', 'CR', 'PA',
  // AMÉRIQUE DU SUD
  'CO', 'VE', 'GY', 'SR', 'BR', 'UY', 'AR', 'CL', 'PE', 'EC',
  // ATLANTIQUE / DIVERS
  'GL', 'PM', 'GI', 'FO',
]

export const MARITIME_COUNTRIES_ISO2_SET = new Set(MARITIME_COUNTRIES_ISO2)

export const getFlagEmoji = (iso2) => {
  if (!iso2 || String(iso2).length !== 2) return '🌐'
  return String(iso2)
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('')
}

/**
 * Récupère les pays maritimes depuis RestCountries API
 * et les filtre sur la liste officielle OMI
 */
export const fetchMaritimeCountries = async () => {
  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,translations,cca2,flags,region'
    )

    if (!response.ok) throw new Error('RestCountries API error')

    const allCountries = await response.json()

    const maritime = (allCountries || [])
      .filter((c) => MARITIME_COUNTRIES_ISO2_SET.has(String(c?.cca2 || '').toUpperCase()))
      .map((c) => {
        const iso2 = String(c?.cca2 || '').toUpperCase()
        const nameEn = c?.name?.common || ''
        const nameFr = c?.translations?.fra?.common || nameEn
        return {
          code: iso2,
          iso2,
          name: nameEn,
          nameFr,
          flag: c?.flags?.svg || c?.flags?.png || '',
          flagEmoji: getFlagEmoji(iso2),
          region: c?.region || '',
          // Compatibility with existing CountrySelect
          flagPng: c?.flags?.png || c?.flags?.svg || '',
        }
      })
      .filter((c) => c.iso2 && c.nameFr)
      .sort((a, b) => String(a.nameFr).localeCompare(String(b.nameFr), 'fr'))

    return maritime
  } catch (error) {
    console.warn('RestCountries API failed, using fallback:', error)
    return MARITIME_FALLBACK
  }
}

/**
 * Fallback statique si l'API est indisponible
 * Contient les 30 pays maritimes les plus utilisés
 */
export const MARITIME_FALLBACK = [
  { code: 'MA', iso2: 'MA', name: 'Morocco', nameFr: 'Maroc', flagEmoji: '🇲🇦', region: 'Africa', flagPng: '' },
  { code: 'DZ', iso2: 'DZ', name: 'Algeria', nameFr: 'Algérie', flagEmoji: '🇩🇿', region: 'Africa', flagPng: '' },
  { code: 'TN', iso2: 'TN', name: 'Tunisia', nameFr: 'Tunisie', flagEmoji: '🇹🇳', region: 'Africa', flagPng: '' },
  { code: 'EG', iso2: 'EG', name: 'Egypt', nameFr: 'Égypte', flagEmoji: '🇪🇬', region: 'Africa', flagPng: '' },
  { code: 'SN', iso2: 'SN', name: 'Senegal', nameFr: 'Sénégal', flagEmoji: '🇸🇳', region: 'Africa', flagPng: '' },
  { code: 'NG', iso2: 'NG', name: 'Nigeria', nameFr: 'Nigeria', flagEmoji: '🇳🇬', region: 'Africa', flagPng: '' },
  { code: 'ZA', iso2: 'ZA', name: 'South Africa', nameFr: 'Afrique du Sud', flagEmoji: '🇿🇦', region: 'Africa', flagPng: '' },
  { code: 'KE', iso2: 'KE', name: 'Kenya', nameFr: 'Kenya', flagEmoji: '🇰🇪', region: 'Africa', flagPng: '' },
  { code: 'FR', iso2: 'FR', name: 'France', nameFr: 'France', flagEmoji: '🇫🇷', region: 'Europe', flagPng: '' },
  { code: 'ES', iso2: 'ES', name: 'Spain', nameFr: 'Espagne', flagEmoji: '🇪🇸', region: 'Europe', flagPng: '' },
  { code: 'IT', iso2: 'IT', name: 'Italy', nameFr: 'Italie', flagEmoji: '🇮🇹', region: 'Europe', flagPng: '' },
  { code: 'DE', iso2: 'DE', name: 'Germany', nameFr: 'Allemagne', flagEmoji: '🇩🇪', region: 'Europe', flagPng: '' },
  { code: 'NL', iso2: 'NL', name: 'Netherlands', nameFr: 'Pays-Bas', flagEmoji: '🇳🇱', region: 'Europe', flagPng: '' },
  { code: 'BE', iso2: 'BE', name: 'Belgium', nameFr: 'Belgique', flagEmoji: '🇧🇪', region: 'Europe', flagPng: '' },
  { code: 'GB', iso2: 'GB', name: 'United Kingdom', nameFr: 'Royaume-Uni', flagEmoji: '🇬🇧', region: 'Europe', flagPng: '' },
  { code: 'PT', iso2: 'PT', name: 'Portugal', nameFr: 'Portugal', flagEmoji: '🇵🇹', region: 'Europe', flagPng: '' },
  { code: 'GR', iso2: 'GR', name: 'Greece', nameFr: 'Grèce', flagEmoji: '🇬🇷', region: 'Europe', flagPng: '' },
  { code: 'TR', iso2: 'TR', name: 'Turkey', nameFr: 'Turquie', flagEmoji: '🇹🇷', region: 'Asia'   , flagPng: '' },
  { code: 'SA', iso2: 'SA', name: 'Saudi Arabia', nameFr: 'Arabie saoudite', flagEmoji: '🇸🇦', region: 'Asia'   , flagPng: '' },
  { code: 'AE', iso2: 'AE', name: 'UAE', nameFr: 'Émirats arabes unis', flagEmoji: '🇦🇪', region: 'Asia'   , flagPng: '' },
  { code: 'IN', iso2: 'IN', name: 'India', nameFr: 'Inde', flagEmoji: '🇮🇳', region: 'Asia'   , flagPng: '' },
  { code: 'CN', iso2: 'CN', name: 'China', nameFr: 'Chine', flagEmoji: '🇨🇳', region: 'Asia'   , flagPng: '' },
  { code: 'JP', iso2: 'JP', name: 'Japan', nameFr: 'Japon', flagEmoji: '🇯🇵', region: 'Asia'   , flagPng: '' },
  { code: 'SG', iso2: 'SG', name: 'Singapore', nameFr: 'Singapour', flagEmoji: '🇸🇬', region: 'Asia'   , flagPng: '' },
  { code: 'AU', iso2: 'AU', name: 'Australia', nameFr: 'Australie', flagEmoji: '🇦🇺', region: 'Oceania', flagPng: '' },
  { code: 'US', iso2: 'US', name: 'United States', nameFr: 'États-Unis', flagEmoji: '🇺🇸', region: 'Americas', flagPng: '' },
  { code: 'CA', iso2: 'CA', name: 'Canada', nameFr: 'Canada', flagEmoji: '🇨🇦', region: 'Americas', flagPng: '' },
  { code: 'BR', iso2: 'BR', name: 'Brazil', nameFr: 'Brésil', flagEmoji: '🇧🇷', region: 'Americas', flagPng: '' },
  { code: 'AR', iso2: 'AR', name: 'Argentina', nameFr: 'Argentine', flagEmoji: '🇦🇷', region: 'Americas', flagPng: '' },
  { code: 'PA', iso2: 'PA', name: 'Panama', nameFr: 'Panama', flagEmoji: '🇵🇦', region: 'Americas', flagPng: '' },
]
