import { useState, useEffect } from 'react'

const GAMMA_API = 'https://gamma-api.polymarket.com/markets'

export function usePolymarkets(limit = 10) {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchMarkets() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${GAMMA_API}?limit=${limit}&active=true&closed=false&order=volume24hr&ascending=false`,
          { headers: { Accept: 'application/json' } }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          // Gamma API returns an array directly or { data: [...] }
          const list = Array.isArray(data) ? data : (data.data ?? [])
          setMarkets(list)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMarkets()
    const interval = setInterval(fetchMarkets, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [limit])

  return { markets, loading, error }
}
