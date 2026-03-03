import { useEffect, useState } from 'react'

import { fetchMaritimeCountries } from '../data/maritimeCountries'

let cachedCountries = null

export const useMaritimeCountries = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)

        if (cachedCountries && Array.isArray(cachedCountries) && cachedCountries.length) {
          setCountries(cachedCountries)
          return
        }

        const data = await fetchMaritimeCountries()
        cachedCountries = data
        setCountries(data)
      } catch {
        setError('Impossible de charger les pays')
        setCountries([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { countries, loading, error }
}
