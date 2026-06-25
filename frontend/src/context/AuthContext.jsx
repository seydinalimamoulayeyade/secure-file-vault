import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { tokens } from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Au montage : si un token existe, on récupère le profil
  useEffect(() => {
    const init = async () => {
      if (!tokens.access) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/api/auth/me')
        setUser(data.data)
      } catch {
        tokens.clear()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    tokens.set({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    setUser(data.data)
    return data.data
  }, [])

  const register = useCallback(async (username, email, password) => {
    await api.post('/api/auth/register', { username, email, password })
    return login(username, password)
  }, [login])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', { refreshToken: tokens.refresh })
    } catch {
      // on ignore : on nettoie quand même côté client
    }
    tokens.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
