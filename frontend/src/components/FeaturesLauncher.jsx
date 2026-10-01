import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { MiniIcon } from './Icons.jsx'
import { NAV_BY_ROLE } from '../lib/nav.js'

const DESCS = {
  '/dashboard': 'Live stats, traffic charts and per-client activity',
  '/send': 'Send SMS now — recipients, templates and flash',
  '/campaigns': 'Create, schedule and monitor campaigns',
  '/contacts': 'Contact lists, groups and imports',
  '/reports': 'Message logs, delivery details and exports',
  '/users': 'Clients, credits, rates and account settings',
  '/admin': 'Manage Users — admin console',
  '/smpp': 'SMPP binds, gateways and live traffic',
  '/billing': 'Wallet, credit history and transactions',
  '/packages': 'Buy credit packages',
  '/docs': 'API and SMPP integration docs',
  '/settings': 'Profile, password and preferences',
}

const GROUPS = [
  ['Messaging', ['/send', '/campaigns', '/contacts']],
  ['Insights', ['/dashboard', '/reports']],
  ['SMPP', ['/smpp']],
  ['Billing', ['/billing', '/packages']],
  ['Account & Docs', ['/users', '/admin', '/settings', '/docs']],
]

export default function FeaturesLauncher() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const roleNav = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.user
  const items = GROUPS.map(([name, routes]) => ({
    name,
    items: [
      ...roleNav.filter((n) => routes.includes(n.to)),
      ...(user?.role === 'superadmin' && !roleNav.some((n) => n.to === '/admin')
        ? [{ to: '/admin', icon: 'campaigns', label: 'Admin' }]
        : []),
    ],
  })).filter((g) => g.items.length > 0)

  const needle = q.trim().toLowerCase()
  const filtered = items
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => !needle || it.label.toLowerCase().includes(needle) || (DESCS[it.to] || '').toLowerCase().includes(needle)),
    }))
    .filter((g) => g.items.length > 0)
  const total = filtered.reduce((n, g) => n + g.items.length, 0)

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => { setOpen(true); setQ('') }}
        aria-label="Quick features"
        title="Quick features"
        className="fixed bottom-5 right-5 z-[70] flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-brand-700"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="8" height="8" rx="2.2" />
          <rect x="13" y="3" width="8" height="8" rx="2.2" />
          <rect x="3" y="13" width="8" height="8" rx="2.2" />
          <rect x="13" y="13" width="8" height="8" rx="2.2" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/55 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="flex h-[86vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[80vh] sm:max-w-2xl sm:rounded-3xl">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-extrabold tracking-tight text-ink">Quick features</h2>
                  <p className="text-[12px] text-gray-400">Jump to any part of the panel</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="relative mt-3.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MiniIcon name="search" className="h-[18px] w-[18px]" />
                </span>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search features…"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#fafbfc] pl-10 pr-3 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {filtered.map((g) => (
                <section key={g.name} className="mb-5">
                  <div className="mb-2 text-[10.5px] font-extrabold uppercase tracking-wider text-gray-400">{g.name}</div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {g.items.map((it) => (
                      <button
                        key={it.to}
                        type="button"
                        onClick={() => { setOpen(false); navigate(it.to) }}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-sm"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <MiniIcon name={it.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-bold text-ink">{it.label}</span>
                          <span className="block truncate text-[11px] text-gray-400">{DESCS[it.to] || ''}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
              {total === 0 && (
                <div className="py-16 text-center">
                  <div className="text-[14px] font-bold text-ink">No features match “{q}”</div>
                  <div className="mt-1 text-[12px] text-gray-400">Try “send”, “smpp”, “billing” or “reports”.</div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-5 py-3 text-[11.5px] text-gray-400">
              {total} features · {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'reseller' ? 'Reseller' : 'User'} view
            </div>
          </div>
        </div>
      )}
    </>
  )
}
