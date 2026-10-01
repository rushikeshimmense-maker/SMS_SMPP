import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { creditStr, fmtMoney } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

const ROLE_TITLE = { superadmin: 'Admin', reseller: 'Reseller', user: 'User' }

export default function Profile() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [balance, setBalance] = useState(user?.balance ?? 0)
  const [platform, setPlatform] = useState(null)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/billing/overview').then((d) => setBalance(d.balance)).catch(() => {})
    if (user?.role === 'superadmin') {
      api('/stats/platform').then(setPlatform).catch(() => {})
    }
  }, [user?.role])

  const initials = (user?.name || 'N').split(' ').map((w) => w[0]).slice(0, 2).join('')
  const title = ROLE_TITLE[user?.role] || 'Account'

  async function changePassword() {
    if (pw.next !== pw.confirm) return toast('New passwords do not match.', 'error')
    setBusy(true)
    try {
      await api('/auth/change-password', { method: 'POST', body: { current: pw.current, next: pw.next } })
      toast('Password updated successfully.', 'success')
      setPw({ current: '', next: '', confirm: '' })
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title={title} sub="Account overview, security and quick controls" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        {/* Identity card */}
        <Card className="flex flex-col items-center p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-[26px] font-extrabold text-white">
            {initials}
          </div>
          <h2 className="mt-4 text-[20px] font-extrabold tracking-tight text-ink">{user?.name}</h2>
          <span className="mt-2 inline-flex rounded-full bg-brand-600 px-3.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-white">
            {title}
          </span>
          <p className="mt-3 text-[13.5px] text-gray-400">{user?.companyName || '—'}</p>
          <p className="text-[13px] text-gray-400">{user?.email || '—'}</p>
          <div className="mt-4 flex items-center gap-2">
            <Chip status={user?.status === 'active' ? 'delivered' : 'failed'}>{user?.status || 'active'}</Chip>
            <span className="text-[12px] text-gray-400">
              since {String(user?.createdAt || '').slice(0, 10) || '—'}
            </span>
          </div>
          <div className="mt-5 w-full rounded-xl bg-[#fafbfc] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Wallet balance</div>
            {user?.role === 'superadmin' ? (
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1 text-[20px] font-extrabold leading-[1.2] text-emerald-600">∞</span>
              </div>
            ) : (
              <div className="mt-1 text-[24px] font-extrabold text-ink">{fmtMoney(balance)}</div>
            )}
          </div>
          <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate('/settings')}>
            Edit profile &amp; settings
          </Button>
        </Card>

        <div className="space-y-5">
          {/* Account details */}
          <Card>
            <h2 className="mb-4 text-[16px] font-extrabold tracking-tight text-ink">Account details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ['Login ID', user?.userId || '—'],
                ['Role', title],
                ['Company', user?.companyName || '—'],
                ['Email', user?.email || '—'],
                ['Rate / SMS', `$${(user?.pricePerSms ?? 0).toFixed(3)}`],
                ['Currency', 'USD'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-gray-100 bg-[#fafbfc] px-4 py-3">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k}</div>
                  <div className="mt-1 truncate text-[14px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Platform snapshot — superadmin only */}
          {user?.role === 'superadmin' && platform?.cards && (
            <Card>
              <h2 className="mb-4 text-[16px] font-extrabold tracking-tight text-ink">Platform snapshot</h2>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {platform.cards.map((c) => (
                  <div key={c.label} className="rounded-xl border border-gray-100 bg-[#fafbfc] px-4 py-3">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{c.label}</div>
                    <div className="mt-1 text-[22px] font-extrabold text-ink">{c.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security */}
          <Card>
            <h2 className="mb-1 text-[16px] font-extrabold tracking-tight text-ink">Security</h2>
            <p className="mb-4 text-[12.5px] text-gray-400">
              {user?.securityQuestion
                ? `Recovery question on file: “${user.securityQuestion}”`
                : 'Change your account password below.'}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Current password">
                <input type="password" className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </Field>
              <Field label="New password" hint="6+ characters">
                <input type="password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </Field>
              <Field label="Confirm new password">
                <input type="password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={changePassword} disabled={busy || !pw.current || pw.next.length < 6 || !pw.confirm}>
                Update password
              </Button>
            </div>
          </Card>

          
        </div>
      </div>
    </div>
  )
}
