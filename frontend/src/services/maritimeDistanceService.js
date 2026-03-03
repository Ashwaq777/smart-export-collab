import axios from 'axios'
import { ttlCache } from '../utils/ttlCache'

import { API_URLS } from '../config/apiConfig'

const API_BASE_URL = API_URLS.MARITIME_BACKEND
const TTL_MS = 5 * 60 * 1000

export const maritimeDistanceService = {
  getDistanceMeta: async ({ originPortId, destinationPortId }) => {
    if (!originPortId || !destinationPortId) return null

    const cacheKey = `maritime:distanceMeta:${String(originPortId)}:${String(destinationPortId)}`
    const cached = ttlCache.get(cacheKey)
    if (cached !== null && cached !== undefined) return cached

    try {
      const res = await axios.get(`${API_BASE_URL}/distance/${originPortId}/${destinationPortId}`)
      const nm = Number(res?.data?.distanceNm ?? res?.data?.distance_nm ?? res?.data?.nm ?? res?.data)
      if (!Number.isFinite(nm) || nm <= 0) throw new Error('Distance invalide')
      const rounded = Math.round(nm)
      const meta = {
        nm: rounded,
        dataSource: res?.data?.message ?? res?.data?.dataSource ?? null,
      }
      ttlCache.set(cacheKey, meta, TTL_MS)
      return meta
    } catch {
      return null
    }
  },

  getDistanceNm: async ({ originPortId, destinationPortId }) => {
    if (!originPortId || !destinationPortId) return null

    const cacheKey = `maritime:distanceNm:${String(originPortId)}:${String(destinationPortId)}`
    const cached = ttlCache.get(cacheKey)
    if (cached !== null && cached !== undefined) return cached

    try {
      const meta = await maritimeDistanceService.getDistanceMeta({ originPortId, destinationPortId })
      if (!meta?.nm) return null
      ttlCache.set(cacheKey, meta.nm, TTL_MS)
      return meta.nm
    } catch {
      return null
    }
  },
}

export default maritimeDistanceService
