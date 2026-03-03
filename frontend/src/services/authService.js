const STORAGE_KEY = 'smartexport:auth'

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.role !== 'user' && parsed.role !== 'admin') return null
    return parsed
  } catch {
    return null
  }
}

const write = (value) => {
  if (!value) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export const authService = {
  getAuth: () => read(),

  isAuthenticated: () => Boolean(read()),

  isAdmin: () => {
    const a = read()
    return Boolean(a && a.role === 'admin')
  },

  login: ({ role, pin }) => {
    const normalizedRole = role === 'admin' ? 'admin' : 'user'

    const userPin = String(import.meta.env?.VITE_USER_PIN || '1234')
    const adminPin = String(import.meta.env?.VITE_ADMIN_PIN || '0000')

    const expected = normalizedRole === 'admin' ? adminPin : userPin
    if (String(pin || '') !== expected) {
      const err = new Error('PIN incorrect')
      err.code = 'INVALID_PIN'
      throw err
    }

    const auth = {
      role: normalizedRole,
      loginAt: Date.now(),
    }
    write(auth)
    return auth
  },

  logout: () => {
    write(null)
  },
}

export default authService
