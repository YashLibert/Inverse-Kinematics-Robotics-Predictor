import { useState, useEffect } from 'react'
import { getHistory } from '../api/client.js'

export const useHistory = (limit = 20) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch_ = async () => {
    setLoading(true)
    try {
      const res = await getHistory(limit)
      setHistory(res.data)
    } finally {
      setLoading(false)
    }
  }

  const append = (entry) => setHistory(prev => [entry, ...prev].slice(0, limit))

  useEffect(() => { fetch_() }, [])

  return { history, loading, append, refetch: fetch_ }
}