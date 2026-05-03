import { useState } from 'react'
import { predictIK } from '../api/client.js'

export const usePredict = () => {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const predict = async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const res = await predictIK(payload)
      setResult(res.data)
      return res.data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { predict, result, loading, error }
}