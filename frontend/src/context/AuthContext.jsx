import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('wf_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthContext: starting auth init, token?', !!authToken)
    async function initAuth() {
      if (authToken) {
        localStorage.setItem('wf_token', authToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
        try {
          const res = await api.get('/api/auth/me')
          console.log('AuthContext: /me result', res.data)
          setUser(res.data)
        } catch (e) {
          console.warn('me fetch failed', e?.message)
        } finally {
          setLoading(false)
        }
      } else {
        delete api.defaults.headers.common['Authorization']
        localStorage.removeItem('wf_token')
        setUser(null)
        setLoading(false)
      }
    }
    initAuth()
  }, [authToken])

  const login = async ({ email, password }) => {
    const res = await api.post('/api/auth/login', { email, password })
    const t = res.data.token
    setAuthToken(t)
    setUser(res.data.user)
    toast.success('Logged in')
    return res.data
  }

  const register = async ({ name, email, password }) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    toast.success('Registered — please login')
    return res.data
  }

  const logout = () => {
    setAuthToken(null)
    setUser(null)
    toast('Logged out')
  }

  return (
    <AuthContext.Provider value={{ user, token: authToken, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
