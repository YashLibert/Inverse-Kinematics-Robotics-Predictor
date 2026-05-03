import { useState, useEffect } from 'react'
import { getConfigs, saveConfig, deleteConfig } from '../api/client.js'

export const useConfigs = () => {
  const [configs,  setConfigs]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const res = await getConfigs()
      setConfigs(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const save = async (payload) => {
    const res = await saveConfig(payload)
    setConfigs(prev => [res.data, ...prev])
    return res.data
  }

  const remove = async (id) => {
    await deleteConfig(id)
    setConfigs(prev => prev.filter(c => c._id !== id))
  }

  useEffect(() => { fetchConfigs() }, [])

  return { configs, loading, error, save, remove, refetch: fetchConfigs }
}