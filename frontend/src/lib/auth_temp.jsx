import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api.js'
import { connectLive, disconnectLive } from './live.js'

const AuthCtx = createContext(null)

export function useAuth() {
  return useContext(AuthCtx)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  // guards against a stale /auth/me response wiping a fresh login
  const signedIn = useRef(false)

  useEffect(() => {
    let alive = true
    
    setUser({ id: 'mock', userId: 'admin', role: 'superadmin', name: 'Mock Admin', companyName: 'Mock Company' });
    setBooting(false);

    return () => {
      alive = false
    }
  }, [])

  const login = useCallback((token, remember, user) => {
    signedIn.current = true
    setToken(token, remember)
    setUser(user)
    connectLive(token)
  }, [])

  const logout = useCallback(() => {
    signedIn.current = false
    disconnectLive()
    clearToken()
    setUser(null)
  }, [])

  return <AuthCtx.Provider value={{ user, booting, login, logout }}>{children}</AuthCtx.Provider>
}
