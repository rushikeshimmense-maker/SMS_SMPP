import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api.js'
import { connectLive, disconnectLive } from './live.js'

const AuthCtx = createContext(null)

const ORIG_TOKEN_KEY = 'nexora_original_token'
const ORIG_USER_KEY  = 'nexora_original_user'

export function useAuth() {
  return useContext(AuthCtx)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [originalUser, setOriginalUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(ORIG_USER_KEY)) } catch { return null }
  })
  const signedIn = useRef(false)

  useEffect(() => {
    let alive = true
    const token = getToken()
    if (!token) {
      setBooting(false)
      return
    }

    api('/auth/me')
      .then((d) => {
        if (!alive) return
        if (d.user) {
          setUser(d.user)
          connectLive(token)
        } else {
          clearToken()
        }
      })
      .catch(() => clearToken())
      .finally(() => {
        if (alive) setBooting(false)
      })

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

  // Called when admin clicks "Login as user" — stores original admin token in sessionStorage
  const impersonate = useCallback((token, user) => {
    // Save original admin session
    sessionStorage.setItem(ORIG_TOKEN_KEY, getToken())
    sessionStorage.setItem(ORIG_USER_KEY, JSON.stringify(user))
    setOriginalUser(user)
    // Switch to impersonated session
    setToken(token, false)
    setUser(user)
    connectLive(token)
  }, [])

  // Called when admin clicks "Return to Admin"
  const returnToAdmin = useCallback(() => {
    const origToken = sessionStorage.getItem(ORIG_TOKEN_KEY)
    const origUser  = JSON.parse(sessionStorage.getItem(ORIG_USER_KEY) || 'null')
    if (!origToken || !origUser) return
    sessionStorage.removeItem(ORIG_TOKEN_KEY)
    sessionStorage.removeItem(ORIG_USER_KEY)
    setOriginalUser(null)
    setToken(origToken, false)
    setUser(origUser)
    connectLive(origToken)
    window.location.href = '/admin'
  }, [])

  const logout = useCallback(() => {
    signedIn.current = false
    disconnectLive()
    clearToken()
    sessionStorage.removeItem(ORIG_TOKEN_KEY)
    sessionStorage.removeItem(ORIG_USER_KEY)
    setOriginalUser(null)
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, booting, login, logout, impersonate, returnToAdmin, originalUser }}>
      {children}
    </AuthCtx.Provider>
  )
}
