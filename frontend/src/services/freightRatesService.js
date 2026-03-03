import axios from 'axios'
import { ttlCache } from '../utils/ttlCache'

import { API_URLS } from '../config/apiConfig'

const API_BASE_URL = API_URLS.MARITIME_BACKEND
const TTL_MS = 5 * 60 * 1000

export const freightRatesService = {
  /**
   * Retourne un taux unitaire estimatif (USD/tonne/1000NM) si le backend sait le calculer.
   * En cas d'indisponibilité, retourne null pour laisser le fallback local.
   */
  getUnitRateUsdPerTonnePer1000Nm: async ({
    originPortId,
    destinationPortId,
    containerType,
    cargoCategory,
    incoterm,
  }) => {
    if (!originPortId || !destinationPortId) return null

    const cacheKey = `maritime:unitRate:${String(originPortId)}:${String(destinationPortId)}:${String(
      containerType
    )}:${String(cargoCategory)}:${String(incoterm)}`

    const cached = ttlCache.get(cacheKey)
    if (cached !== null && cached !== undefined) return cached

    try {
      const res = await axios.get(`${API_BASE_URL}/freight-rate`, {
        params: {
          originPortId,
          destinationPortId,
          containerType,
          cargoCategory,
          incoterm,
        },
      })

      const rate = Number(res?.data?.unitRate ?? res?.data?.rate ?? res?.data)
      if (!Number.isFinite(rate) || rate <= 0) throw new Error('Taux invalide')

      ttlCache.set(cacheKey, rate, TTL_MS)
      return rate
    } catch {
      return null
    }
  },
}

export default freightRatesService
