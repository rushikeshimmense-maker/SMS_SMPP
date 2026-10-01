import { Fragment, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { api } from '../lib/api.js'
import { onLive } from '../lib/live.js'
import { creditStr, fmtMoney } from '../lib/format.js'
import { BrandMark } from './BrandLogo.jsx'
import { LogOutIcon, MiniIcon } from './Icons.jsx'
import { NAV_BY_ROLE } from '../lib/nav.js'
import NotificationsBell from './NotificationsBell.jsx'
import FeaturesLauncher from './FeaturesLauncher.jsx'
import { PageHeader as Header } from './PageHeader.jsx'

const ROLE_BADGE = {
  superadmin: 'bg-rose-50 text-rose-600',
  reseller: 'bg-violet-50 text-violet-600',
  user: 'bg-emerald-50 text-emerald-600',
}

const ROLE_LABEL = {
  superadmin: 'Super Admin',
  reseller: 'Reseller',
  user: 'User',
}

export default function AppLayout() {
  const { user, logout, returnToAdmin, originalUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [balance, setBalance] = useState(user?.balance ?? 0)
  const [acctOpen, setAcctOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(() => ['/admin', '/users', '/traffic-routing', '/approvals'].includes(location.pathname))
  const [reportsOpen, setReportsOpen] = useState(() => location.pathname === '/reports')
  const [generalOpen, setGeneralOpen] = useState(true)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const nav = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.user
  const roleLabel = ROLE_LABEL[user?.role] || user?.role || ''

  useEffect(() => {
    const load = () => api('/billing/overview').then((d) => setBalance(d.balance)).catch(() => {})
    load()
    const off = onLive('balance', (b) => setBalance(b.balance))
    const iv = setInterval(load, 15000)
    return () => {
      off()
      clearInterval(iv)
    }
  }, [])

  // close the drawer and admin dropdown whenever the route changes
  useEffect(() => {
    setMenuOpen(false)
    if (!['/admin', '/users', '/traffic-routing', '/approvals'].includes(location.pathname)) {
      setAdminOpen(false)
    }
  }, [location.pathname])

  const navItems = (extra = '') =>
    nav.flatMap((n) => {
      if (n.to === '/reports') {
        const isGeneral = ['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS'].includes(searchParams.get('tab') || 'Summary');
        
        return [
          <Fragment key={n.to}>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setReportsOpen((open) => !open)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition ${extra} ${
                  location.pathname === '/reports'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <MiniIcon name="reports" className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">Reports</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${reportsOpen ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {reportsOpen && (
                <div className="ml-5 space-y-1 border-l border-gray-200 pl-3">
                  <Link to="/reports?tab=Summary" className={`block rounded-lg px-3 py-2 text-[13px] font-semibold transition ${isGeneral && location.pathname === '/reports' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>General Report</Link>
                  {user?.role === 'superadmin' && <Link to="/reports?tab=Route Reports" className={`block rounded-lg px-3 py-2 text-[13px] font-semibold transition ${searchParams.get('tab') === 'Route Reports' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>Route Report</Link>}
                  <Link to="/reports?tab=Credit Report" className={`block rounded-lg px-3 py-2 text-[13px] font-semibold transition ${searchParams.get('tab') === 'Credit Report' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>Credit Report</Link>
                  </div>
              )}
            </div>
          </Fragment>
        ]
      }

      return [
        <Fragment key={n.to}>
          <NavLink
            to={n.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition ${extra} ${
                isActive && n.to !== '/reports'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <MiniIcon name={n.icon} className="h-[18px] w-[18px]" />
            {n.label}
          </NavLink>
          {n.to === '/dashboard' && (user?.role === 'superadmin' || user?.role === 'reseller') && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAdminOpen((open) => !open)}
                aria-expanded={adminOpen}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition ${extra} ${
                  ['/admin', '/users', '/traffic-routing', '/approvals'].includes(location.pathname)
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <path d="M12 2l8 3.5v5.2c0 5-3.4 8.7-8 11.3-4.6-2.6-8-6.3-8-11.3V5.5L12 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.8 12l2.2 2.2 4.2-4.4" />
                </svg>
                <span className="flex-1 text-left">Admin</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {adminOpen && (
                <div className="ml-5 space-y-1 border-l border-gray-200 pl-3">
                  {[
  [user?.role === 'superadmin' ? '/admin' : '/users', 'Manage User'],
  ['/traffic-routing', 'Traffic Routing'], ['/approvals', 'Configuration'],
  
].map(([to, label]) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                          isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </Fragment>,
      ]
    })

  const balanceCard = (
    <div className="rounded-xl bg-[#fafbfc] p-3.5">
      {user?.role !== 'superadmin' && (
        <>
          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Balance</div>
          <div className="mt-1 text-[18px] font-extrabold text-ink">{fmtMoney(balance)}</div>
        </>
      )}
      <button
        type="button"
        onClick={() => navigate('/billing')}
        className="mt-2 text-[12px] font-semibold text-brand-600 hover:underline"
      >
        Manage credits →
      </button>
    </div>
  )

  return (
    <>
      <div className="flex min-h-screen bg-[#f4f5f8]">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-gray-100 bg-white lg:flex">
          <div className="flex items-center gap-2.5 px-6 pb-5 pt-6">
            <BrandMark size={36} variant="on-light" />
            <div className="leading-none">
              <div className="text-[19px] font-extrabold tracking-tight text-ink">SMSBridge</div>
            </div>
          </div>
          <nav className="mt-3 flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 pb-4">{navItems()}</nav>
          <div className="m-4">{balanceCard}</div>
        </aside>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-[272px] max-w-[82vw] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between px-5 pb-4 pt-5">
                <div className="flex items-center gap-2.5">
                  <BrandMark size={32} variant="on-light" />
                  <div className="leading-none">
                    <div className="text-[17px] font-extrabold tracking-tight text-ink">SMSBridge</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="px-4 pb-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${ROLE_BADGE[user?.role]}`}>
                  {roleLabel}
                </span>
              </div>
              <nav className="no-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 pb-4">{navItems()}</nav>
              <div className="p-4">{balanceCard}</div>
              <button
                type="button"
                onClick={() => { logout(); navigate('/') }}
                className="flex items-center gap-3 border-t border-gray-100 px-8 py-4 text-[14px] font-semibold text-gray-500 transition hover:text-rose-600"
              >
                <LogOutIcon className="h-[18px] w-[18px]" /> Log out
              </button>
            </aside>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[236px]">
          {/* Impersonation banner */}
          {originalUser && (
            <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 sm:px-6 lg:px-8 text-white text-[13px] font-semibold">
              <span>
                👁️ You are viewing as <b>@{user?.userId}</b> ({user?.companyName}) — logged in as {originalUser.role}
              </span>
              <button
                onClick={returnToAdmin}
                className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 text-[12px] font-bold transition"
              >
                ↩ Return to Admin
              </button>
            </div>
          )}

          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="rounded-xl p-2 -ml-1 text-gray-500 transition hover:bg-gray-100 lg:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-[22px] w-[22px]">
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <BrandMark size={30} variant="on-light" className="lg:hidden" />
              <span className="truncate text-[16px] font-extrabold text-ink lg:hidden">SMSBridge</span>
              <div className="relative hidden lg:block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MiniIcon name="search" className="h-[18px] w-[18px]" />
                </span>
                <input
                  placeholder="Search messages, campaigns…"
                  className="h-10 w-[300px] rounded-xl border border-gray-200 bg-[#fafbfc] pl-10 pr-3 text-[13.5px] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationsBell />
              <div className="flex items-center gap-2.5 border-l border-gray-100 pl-2 sm:pl-3">
                {/* Account menu (reference style): My profile → profile page */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAcctOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={acctOpen}
                    className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-gray-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[13px] font-bold text-white">
                      {(user?.name || 'N').split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                    <span className="hidden text-left leading-tight sm:block">
                      <span className="block text-[13px] font-bold text-ink">{roleLabel}</span>
                      <span className="block text-[11px] text-gray-400">{user?.companyName || user?.role}</span>
                    </span>
                  </button>
                  {acctOpen && (
                    <>
                      <div className="fixed inset-0 z-[75]" onClick={() => setAcctOpen(false)} />
                      <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[230px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl" role="menu">
                        <div className="truncate px-4 pb-2 pt-1 text-[13.5px] font-extrabold text-ink">{user?.userId || user?.name || 'Account'}</div>
                        <div className="mx-3 mb-1 border-t border-gray-50" />
                        <button
                          type="button"
                          onClick={() => { setAcctOpen(false); navigate('/profile') }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13.5px] font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-ink"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                            <circle cx="12" cy="8" r="4" />
                            <path strokeLinecap="round" d="M4 20c1.6-3.4 4.6-5 8-5s6.4 1.6 8 5" />
                          </svg>
                          My profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { logout(); navigate('/') }}
                  title="Log out"
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-rose-600"
                >
                  <LogOutIcon className="h-[19px] w-[19px]" />
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 max-w-full flex-1 overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

export function PageHeader(props) {
  return <Header {...props} />
}
