import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { fmtDate, fmtMoney } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PlusIcon } from '../components/Icons.jsx'
import { PageHeader } from '../components/AppLayout.jsx'
import { useAuth } from '../lib/auth.jsx'

const ROLE_STYLES = {
  superadmin: 'bg-rose-50 text-rose-600',
  reseller: 'bg-violet-50 text-violet-600',
  user: 'bg-emerald-50 text-emerald-600',
}

export default function Users() {
  const toast = useToast()
  const { user: me, impersonate } = useAuth()
  const [items, setItems] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [fund, setFund] = useState(null) // { user, mode: 'fund'|'deduct', amount, note }
  const [resetPassUser, setResetPassUser] = useState(null)
  const [edit, setEdit] = useState(null); const [dlt, setDlt] = useState(null);
  const [create, setCreate] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () =>
    api(`/users?role=${roleFilter}&search=${search}`).then((d) => setItems(d.items || []))
  useEffect(() => {
    load()
    const iv = setInterval(load, 8000)
    return () => clearInterval(iv)
  }, [roleFilter, search])

  
  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'suspended' : 'active'
    try {
      await api('/users/' + u.id, { method: 'PATCH', body: { status: newStatus } })
      toast(`User @${u.userId} marked as ${newStatus}.`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function loginAsUser(u) {
    if (!confirm(`Are you sure you want to login as @${u.userId}?`)) return
    try {
      const res = await api('/users/' + u.id + '/impersonate', { method: 'POST' })
      impersonate(res.token, res.user)
      window.location.href = '/'
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function submitResetPassword() {
    if (!resetPassUser.password) return toast('Enter a new password.', 'error')
    setBusy(true)
    try {
      await api('/users/' + resetPassUser.user.id, { method: 'PATCH', body: { password: resetPassUser.password } })
      toast(`Password for @${resetPassUser.user.userId} updated.`, 'success')
      setResetPassUser(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitFund() {
    setBusy(true)
    try {
      await api(`/users/${fund.user.id}/${fund.mode}`, {
        method: 'POST',
        body: { amount: +fund.amount, note: fund.note },
      })
      toast(`${fund.mode === 'fund' ? 'Funded' : 'Deducted'} ${fmtMoney(fund.amount)} ${fund.mode === 'fund' ? 'to' : 'from'} ${fund.user.companyName}.`, 'success')
      setFund(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitEdit() {
    setBusy(true)
    try {
      await api(`/users/${edit.user.id}`, {
        method: 'PATCH',
        body: {
          name: edit.name, companyName: edit.companyName,
          pricePerSms: +edit.pricePerSms, status: edit.status,
        },
      })
      toast('Account updated.', 'success')
      setEdit(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitDlt() { setBusy(true); setTimeout(() => { toast('DLT Configuration assigned', 'success'); setDlt(null); setBusy(false); }, 800); } async function submitCreate() {
    setBusy(true)
    try {
      const r = await api('/users', { method: 'POST', body: { ...create, pricePerSms: +create.pricePerSms, initialFund: +create.initialFund || 0 } })
      toast(`Account “${r.user.userId}” created.`, 'success')
      setCreate(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const blankCreate = {
    userId: '', name: '', companyName: '', email: '', password: 'welcome@123',
    role: me.role === 'superadmin' ? 'reseller' : 'user',
    pricePerSms: me.role === 'superadmin' ? '0.016' : '0.022', initialFund: '0',
  }

  return (
    <div>
      <PageHeader
        title={me.role === 'superadmin' ? 'Users & Resellers' : 'My Clients'}
        sub={me.role === 'superadmin' ? 'Manage resellers and client accounts across the platform' : 'Manage your client accounts, rates and credits'}
      >
        <Button onClick={() => setCreate({ ...blankCreate })}>
          <PlusIcon className="h-[18px] w-[18px]" /> New account
        </Button>
      </PageHeader>

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {[['all', 'All'], ['reseller', 'Resellers'], ['user', 'Users']].map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setRoleFilter(k)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                roleFilter === k ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
          <input
            className={`${inputCls} ml-auto max-w-[260px]`}
            placeholder="Search name, user ID, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <Table headers={['Account', 'Role', 'Under', 'Balance', 'Rate / SMS', 'Status', 'Created', 'Actions']}>
          {items.map((u) => (
            <tr key={u.id} className="transition hover:bg-gray-50/60">
              <Td>
                <div className="font-bold text-ink">{u.companyName}</div>
                <div className="text-[12px] text-gray-400">{u.name} · @{u.userId}</div>
              </Td>
              <Td>
                <span className={`inline-flex rounded-full px-2.5 py-[3px] text-[11.5px] font-bold capitalize ${ROLE_STYLES[u.role]}`}>
                  {u.role}
                </span>
              </Td>
              <Td>{u.parentName}</Td>
              <Td className="font-bold text-ink">{fmtMoney(u.balance)}</Td>
              <Td>${u.pricePerSms.toFixed(3)}</Td>
              <Td><Chip status={u.status === 'active' ? 'Active' : 'Pending'}>{u.status}</Chip></Td>
              <Td>{fmtDate(u.createdAt)}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
<button title="Fund Credits" onClick={() => setFund({ user: u, mode: 'fund', amount: '', note: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg></button>
                  <button title="Manage Settings" onClick={() => setEdit({ user: u, pricePerSms: String(u.pricePerSms), name: u.name, companyName: u.companyName, status: u.status })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
                  <button title={u.status === "active" ? "Deactivate User" : "Activate User"} onClick={() => toggleStatus(u)} className={"flex items-center justify-center h-8 w-8 rounded-lg transition shadow-sm border " + (u.status === "active" ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50" : "bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50")}><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg></button>
                  <button title="Reset Password" onClick={() => setResetPassUser({ user: u, password: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></button>
                  <button title="Login as User" onClick={() => loginAsUser(u)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition shadow-sm border border-orange-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg></button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* fund / deduct */}
            <Modal open={!!fund} onClose={() => setFund(null)} title={fund ? `Credits - ${fund.user.companyName}` : ''} width="max-w-md">
        {fund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['fund', 'deduct'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFund({ ...fund, mode: k })}
                  className={`rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition ${
                    fund.mode === k ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {k === 'fund' ? 'Credit Wallet' : 'Deduct Credits'}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[#fafbfc] p-3.5 text-[13px] text-gray-500">
              Current balance: <b className="text-ink">{fmtMoney(fund.user.balance)}</b>
              {me.role !== 'superadmin' && <> &mdash; Your balance: <b className="text-ink">{fmtMoney(me.balance)}</b></>}
            </div>
            <Field label="Amount (Credits)">
              <input type="number" min="0" step="0.01" className={inputCls} value={fund.amount}
                onChange={(e) => setFund({ ...fund, amount: e.target.value })} placeholder="0.00" />
            </Field>
            <Field label="Note">
              <input className={inputCls} value={fund.note} onChange={(e) => setFund({ ...fund, note: e.target.value })} placeholder="e.g. Wallet top-up" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setFund(null)}>Cancel</Button>
              <Button onClick={submitFund} disabled={busy || !+fund.amount}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>

            <Modal open={!!resetPassUser} onClose={() => setResetPassUser(null)} title={resetPassUser ? `Reset password - ${resetPassUser.user.userId}` : ''} width="max-w-md">
        {resetPassUser && (
          <div className="space-y-4">
            <div className="text-[13px] text-gray-500 mb-2">Assign a new password for <b className="text-ink">{resetPassUser.user.companyName}</b>.</div>
            <Field label="New password">
              <input className={inputCls} value={resetPassUser.password} onChange={(e) => setResetPassUser({ ...resetPassUser, password: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setResetPassUser(null)}>Cancel</Button>
              <Button onClick={submitResetPassword} disabled={busy || !resetPassUser.password}>Update</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* edit */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `Edit — ${edit.user.userId}` : ''} width="max-w-md">
        {edit && (
          <div className="space-y-4">
            <Field label="Contact name">
              <input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </Field>
            <Field label="Company">
              <input className={inputCls} value={edit.companyName} onChange={(e) => setEdit({ ...edit, companyName: e.target.value })} />
            </Field>
            <Field label="Price per SMS (USD)" hint={me.role === 'reseller' ? `Cannot be below your cost ($${me.pricePerSms})` : undefined}>
              <input type="number" step="0.001" min="0" className={inputCls} value={edit.pricePerSms}
                onChange={(e) => setEdit({ ...edit, pricePerSms: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={submitEdit} disabled={busy}>Save</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* create */}
      <Modal open={!!create} onClose={() => setCreate(null)} title="New account" width="max-w-lg">
        {create && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="User ID (login)">
                <input className={inputCls} value={create.userId} onChange={(e) => setCreate({ ...create, userId: e.target.value.toLowerCase() })} placeholder="e.g. acme01" />
              </Field>
              <Field label="Account type">
                <select className={inputCls} value={create.role} onChange={(e) => setCreate({ ...create, role: e.target.value })}>
                  <option value="user">User (SMS client)</option>
                  <option value="reseller">Reseller</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Contact name">
                <input className={inputCls} value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} placeholder="Jane Doe" />
              </Field>
              <Field label="Company">
                <input className={inputCls} value={create.companyName} onChange={(e) => setCreate({ ...create, companyName: e.target.value })} placeholder="Acme Pvt Ltd" />
              </Field>
            </div>
            <Field label="Email">
              <input className={inputCls} type="email" value={create.email} onChange={(e) => setCreate({ ...create, email: e.target.value })} placeholder="ops@acme.com" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Password">
                <input className={inputCls} value={create.password} onChange={(e) => setCreate({ ...create, password: e.target.value })} />
              </Field>
              <Field label="Rate / SMS">
                <input className={inputCls} type="number" step="0.001" value={create.pricePerSms} onChange={(e) => setCreate({ ...create, pricePerSms: e.target.value })} />
              </Field>
              <Field label="Initial funding">
                <input className={inputCls} type="number" min="0" value={create.initialFund} onChange={(e) => setCreate({ ...create, initialFund: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCreate(null)}>Cancel</Button>
              <Button onClick={submitCreate} disabled={busy || !create.userId || !create.name || !create.password}>Create account</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!dlt} onClose={() => setDlt(null)} title={dlt ? `DLT Config - ${dlt.user.userId}` : ''} width="max-w-xl">
        {dlt && (
          <div className="space-y-4">
            <div className="text-[13px] text-gray-500">
              Assign specific Sender IDs and Templates for <b className="text-ink">{dlt.user.companyName}</b>.
            </div>
            <Field label="Sender IDs (comma separated)">
              <input className={inputCls} value={dlt.senders} onChange={(e) => setDlt({...dlt, senders: e.target.value})} placeholder="e.g. NEXORA, ALERTS" />
            </Field>
            <Field label="Templates (comma separated IDs)">
              <textarea className={inputCls} rows={4} value={dlt.templates} onChange={(e) => setDlt({...dlt, templates: e.target.value})} placeholder="e.g. TPL01, TPL02" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDlt(null)}>Cancel</Button>
              <Button onClick={submitDlt} disabled={busy}>Save Configuration</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
