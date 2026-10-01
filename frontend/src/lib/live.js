/** SSE live feed — instant notifications, balance and PDU updates. */
let es = null
const listeners = new Map()

function emit(type, data) {
  for (const cb of listeners.get(type) || []) {
    try {
      cb(data)
    } catch {
      /* listener error shouldn't break the feed */
    }
  }
}

export function connectLive(token) {
  if (es || !token) return
  try {
    es = new EventSource(`/api/live?token=${encodeURIComponent(token)}`)
  } catch {
    return
  }
  for (const type of ['notification', 'balance', 'pdu', 'binds', 'hello']) {
    es.addEventListener(type, (e) => {
      let data = null
      try {
        data = JSON.parse(e.data)
      } catch {
        return
      }
      emit(type, data)
    })
  }
  es.onerror = () => {
    /* EventSource retries automatically (retry: 3000 from the server) */
  }
}

export function disconnectLive() {
  es?.close()
  es = null
}

export function onLive(type, cb) {
  if (!listeners.has(type)) listeners.set(type, new Set())
  listeners.get(type).add(cb)
  return () => listeners.get(type)?.delete(cb)
}
