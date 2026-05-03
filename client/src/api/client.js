const BASE = '/api'

const handleRes = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const predictIK = (payload) =>
  fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleRes)

export const getHistory = (limit = 20) =>
  fetch(`${BASE}/predict/history?limit=${limit}`).then(handleRes)

export const getConfigs = () =>
  fetch(`${BASE}/configs`).then(handleRes)

export const saveConfig = (payload) =>
  fetch(`${BASE}/configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleRes)

export const deleteConfig = (id) =>
  fetch(`${BASE}/configs/${id}`, { method: 'DELETE' }).then(handleRes)