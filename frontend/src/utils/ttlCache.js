export const ttlCache = {
  get: (key) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return null
      const { value, expiresAt } = parsed
      if (!expiresAt || Date.now() > expiresAt) {
        localStorage.removeItem(key)
        return null
      }
      return value
    } catch {
      return null
    }
  },

  set: (key, value, ttlMs) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          value,
          expiresAt: Date.now() + ttlMs,
        })
      )
    } catch {
      // ignore
    }
  },
}
