import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { onLive } from '../lib/live.js'
import { fmtTime } from '../lib/format.js'
import { BellIcon } from './Icons.jsx'

const TYPE_DOT = {
  topup: 'bg-violet-500',
  billing: 'bg-emerald-500',
  package: 'bg-brand-600',
  sender: 'bg-sky-500',
  campaign: 'bg-amber-500',
  smpp: 'bg-rose-500',
  balance: 'bg-rose-500',
  account: 'bg-emerald-500',
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const boxRef = useRef(null)

  const load = () =>
    api('/notifications')
      .then((d) => {
        setItems(d.items || [])
        setUnread(d.unread || 0)
      })
      .catch(() => {})

  useEffect(() => {
    load()
    const off = onLive('notification', (n) => {
      setItems((prev) => [n, ...prev].slice(0, 25))
      setUnread((u) => u + 1)
    })
    const iv = setInterval(load, 25000)
    return () => {
      off()
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      setUnread(0)
      api('/notifications/read', { method: 'POST' }).catch(() => {})
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        title="Notifications"
      >
        <BellIcon className="h-[20px] w-[20px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 z-40 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:w-[340px]">
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
            <span className="text-[14px] font-extrabold text-ink">Notifications</span>
            <span className="rounded-full bg-brand-50 px-2.5 py-[2px] text-[11px] font-bold text-brand-600">● Live</span>
          </div>
          <ul className="max-h-[360px] overflow-y-auto">
            {items.map((n) => (
              <li key={n.id} className={`flex gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gray-50 ${n.read ? 'opacity-60' : ''}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[n.type] || 'bg-gray-300'}`} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-ink">{n.title}</div>
                  <div className="mt-0.5 text-[12.5px] leading-snug text-gray-500">{n.body}</div>
                  <div className="mt-1 text-[11px] text-gray-400">{fmtTime(n.ts)}</div>
                </div>
              </li>
            ))}
            {!items.length && (
              <li className="px-4 py-10 text-center text-[13px] text-gray-400">No notifications yet</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
