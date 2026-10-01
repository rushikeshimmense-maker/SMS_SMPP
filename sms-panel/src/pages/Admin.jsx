import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate, fmtMoney } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { MiniIcon } from '../components/Icons.jsx'
import UserEditor from '../components/UserEditor.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

const ROLE_STYLES = {
  superadmin: 'bg-rose-50 text-rose-600',
  reseller: 'bg-violet-50 text-violet-600',
  user: 'bg-emerald-50 text-emerald-600',
}

export default function Admin() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [fund, setFund] = useState(null)
  const [editor, setEditor] = useState(null)
  const [create, setCreate] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () =>
    api(`/users?role=${roleFilter}&search=${search}`).then((d) => setItems(d.items || []))

  useEffect(() => {
    if (me?.role !== 'superadmin') return
    load()
    const iv = setInterval(load, 8000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, search])

  if (me?.role !== 'superadmin') return <Navigate to="/profile" replace />

  async function submitFund() {
    setBusy(true)
    try {
      const endpoint = fund.mode === 'credit' ? 'fund' : 'deduct'
      await api(`/users/${fund.user.id}/${endpoint}`, {
        method: 'POST',
        body: { amount: +fund.amount, note: fund.note },
      })
      toast(`${fund.mode === 'credit' ? 'Credited' : 'Debited'} ${fmtMoney(fund.amount)} ${fund.mode === 'credit' ? 'to' : 'from'} ${fund.user.companyName}.`, 'success')
      setFund(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitCreate() {
    setBusy(true)
    try {
      const r = await api('/users', {
        method: 'POST',
        body: { ...create, pricePerSms: +create.pricePerSms, initialFund: +create.initialFund || 0 },
      })
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
    role: 'reseller', pricePerSms: '0.016', initialFund: '0',
  }

  return (
    <div>
      <PageHeader title="Manage Users" sub="Create, fund, edit and manage every account on the platform" />

      {/* Search & controls */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-1 text-[15px] font-extrabold tracking-tight text-ink">Manage Users</h2>
          <div className="ml-auto flex flex-wrap items-center gap-2">
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
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative sm:max-w-[380px] sm:flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MiniIcon name="search" className="h-[18px] w-[18px]" />
            </span>
            <input
              className={`${inputCls} pl-10`}
              placeholder="Search by Username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={load}>
            <MiniIcon name="search" className="h-[16px] w-[16px]" /> Search
          </Button>
          <Button variant="secondary" onClick={() => setCreate({ ...blankCreate })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20c1.4-3.2 4-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
              <path d="M18 8v6M15 11h6" />
            </svg>
            Add New User
          </Button>
        </div>
      </Card>

      {/* User list */}
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
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="secondary" className="h-8 px-2.5 text-[12px]" onClick={() => setFund({ user: u, mode: 'credit', amount: '', note: '' })}>
                    Credit
                  </Button>
                  <Button variant="ghost" className="h-8 px-2.5 text-[12px]" onClick={() => setEditor(u)}>
                    Edit
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* fund / deduct */}
      <Modal open={!!fund} onClose={() => setFund(null)} title={fund ? `Balance — ${fund.user.companyName}` : ''} width="max-w-md">
        {fund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[['credit', 'Credit'], ['debit', 'Debit']].map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFund({ ...fund, mode: k })}
                  className={`rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition ${
                    fund.mode === k ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[#fafbfc] p-3.5 text-[13px] text-gray-500">
              Current balance: <b className="text-ink">{fmtMoney(fund.user.balance)}</b>
            </div>
            <Field label="Amount (USD)">
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

      {/* full account editor */}
      {editor && (
        <UserEditor
          user={editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null)
            load()
          }}
        />
      )}

      {/* create */}
      <Modal open={!!create} onClose={() => setCreate(null)} title="Add New User" width="max-w-lg">
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
    </div>
  )
}
