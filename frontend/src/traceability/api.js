const BASE = 'http://localhost:8080/api/traceability'
const tok = () => localStorage.getItem('token') || ''

const API = {
  post: async (path, data) => {
    const r = await fetch(BASE + (path||''), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tok()
      },
      body: JSON.stringify(data)
    })
    const text = await r.text()
    if (!r.ok) throw new Error(text)
    return JSON.parse(text)
  },
  get: async (path) => {
    const r = await fetch(BASE + (path||''), {
      headers: { 'Authorization': 'Bearer ' + tok() }
    })
    const text = await r.text()
    if (!r.ok) throw new Error(text)
    return JSON.parse(text)
  },
  getBlob: async (path) => {
    const r = await fetch(BASE + (path||''), {
      headers: { 'Authorization': 'Bearer ' + tok() }
    })
    if (!r.ok) throw new Error('Export failed')
    return r.blob()
  }
}

export default API