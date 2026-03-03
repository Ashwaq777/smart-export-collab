/**
 * Complete World Currencies List (ISO 4217)
 * ~170 currencies covering all countries
 * Used for currency dropdown in Calculator
 */

export const WORLD_CURRENCIES = [
  // Major Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  
  // Africa
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: 'SS£' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF' },
  
  // Middle East
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD' },
  { code: 'YER', name: 'Yemeni Rial', symbol: 'YER' },
  { code: 'SYP', name: 'Syrian Pound', symbol: 'S£' },
  
  // Asia
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'KPW', name: 'North Korean Won', symbol: '₩' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  
  // Europe
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'din' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
  
  // Americas
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CL$' },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'VEF', name: 'Venezuelan Bolívar', symbol: 'Bs' },
  { code: 'VES', name: 'Venezuelan Bolívar Soberano', symbol: 'Bs.S' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
  { code: 'CUP', name: 'Cuban Peso', symbol: '₱' },
  { code: 'CUC', name: 'Cuban Convertible Peso', symbol: 'CUC$' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$' },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$' },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ' },
  { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
  
  // Oceania
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
  { code: 'PGK', name: 'Papua New Guinea Kina', symbol: 'K' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣' },
  
  // Special & Other
  { code: 'XAU', name: 'Gold (troy ounce)', symbol: 'XAU' },
  { code: 'XAG', name: 'Silver (troy ounce)', symbol: 'XAG' },
  { code: 'XPT', name: 'Platinum (troy ounce)', symbol: 'XPT' },
  { code: 'XPD', name: 'Palladium (troy ounce)', symbol: 'XPD' }
]

/**
 * Get currency by code
 */
export const getCurrencyByCode = (code) => {
  return WORLD_CURRENCIES.find(c => c.code === code)
}

/**
 * Get all currency codes
 */
export const getAllCurrencyCodes = () => {
  return WORLD_CURRENCIES.map(c => c.code)
}

/**
 * Format currency with symbol
 */
export const formatWithSymbol = (amount, currencyCode) => {
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) return `${amount} ${currencyCode}`
  
  return `${currency.symbol}${amount.toLocaleString()}`
}

export default {
  WORLD_CURRENCIES,
  getCurrencyByCode,
  getAllCurrencyCodes,
  formatWithSymbol
}
