/** Same-origin API client — Vite proxies /api to the Express server. */

import { demoApi } from './demo-api.js'

const safe = (fn) => {
  try {
    return fn()
  } catch {
    return null
  }
}

function readCookie(name) {
  return safe(() => {
    const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(document.cookie || '')
    return m ? decodeURIComponent(m[1]) : null
  })
}

function writeCookie(name, value, maxAge) {
  safe(() => {
    document.cookie =
      value == null
        ? `${name}=; path=/; max-age=0`
        : `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
  })
}

/** Token from storage first, cookie as fallback (survives blocked storage). */
export function getToken() {
  return (
    safe(() => window.localStorage.getItem('nexora_token')) ||
    safe(() => window.sessionStorage.getItem('nexora_token')) ||
    readCookie('nx_tok')
  )
}

export function setToken(token, remember) {
  safe(() => window.localStorage.removeItem('nexora_token'))
  safe(() => window.sessionStorage.removeItem('nexora_token'))
  writeCookie('nx_tok', null)
  if (!token) return
  const maxAge = remember ? 30 * 24 * 3600 : 12 * 3600
  writeCookie('nx_tok', token, maxAge)
  // storage can throw in sandboxed frames — the cookie alone keeps the session
  safe(() => (remember ? window.localStorage : window.sessionStorage).setItem('nexora_token', token))
}

export function clearToken() {
  setToken(null)
  safe(() => window.localStorage.removeItem('nexora_user'))
  safe(() => window.sessionStorage.removeItem('nexora_user'))
}

export async function api(path, { method = 'GET', body } = {}) {
  const demoPreview =
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('.chatgpt.site') ||
      new URLSearchParams(window.location.search).has('demo') ||
      getToken()?.startsWith('nexora-preview-'))

  // ChatGPT Sites serves static assets and intentionally has no Node/Express
  // process. Use the sanitized in-browser demo API there; local/production
  // deployments continue to use the real same-origin backend below.
  if (demoPreview) return demoApi(path, { method, body, token: getToken() })

  for (let attempt = 0; attempt < 2; attempt++) {
    const token = getToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
      // some reverse proxies strip Authorization — send a custom header too
      headers['x-nx-token'] = token
    }
    let res
    try {
      res = await fetch(`/api${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
      })
    } catch {
      throw new Error('Cannot reach the messaging server — check your connection or try again in a moment.')
    }

    if (res.status === 401 && !path.startsWith('/auth')) {
      if (attempt === 0) {
        // transient/proxy hiccup — retry once before giving up
        await new Promise((r) => setTimeout(r, 350))
        continue
      }
      clearToken()
      window.location.replace('/?session=expired')
      throw new Error('Session expired')
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if ([502, 503, 504, 521, 522, 524, 530].includes(res.status)) {
        throw new Error('Server is restarting or unreachable — please retry in a few seconds.')
      }
      throw new Error(data.error || `Request failed (${res.status})`)
    }
    return data
  }
  throw new Error('Request failed')
}

