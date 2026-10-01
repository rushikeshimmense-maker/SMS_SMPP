import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { fmtMoney, fmtTime } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { useAuth } from '../lib/auth.jsx'
import { PlusIcon } from '../components/Icons.jsx'
import { PageHeader } from '../components/AppLayout.jsx'
import { onLive } from '../lib/live.js'

export default function Packages() {
  const toast = useToast()
  const { user: me } = useAuth()
  const isAdmin = me.role === 'superadmin'
  const canBuy = me.role !== 'superadmin'
  const [items, setItems] = useState([])
  const [purchases, setPurchases] = useState([])
  const [balance, setBalance] = useState(me.balance)
  const [create, setCreate] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () =>
    api('/packages').then((d) => {
      setItems(d.items || [])
      setPurchases(d.purchases || [])
    })
  useEffect(() => {
    load()
    api('/billing/overview').then((d) => setBalance(d.balance)).catch(() => {})
    const off = onLive('balance', (b) => setBalance(b.balance))
    return off
  }, [])

  async function buy(p) {
    setBusy(true)
    try {
      const r = await api(`/packages/${p.id}/buy`, { method: 'POST' })
      setBalance(r.balance)
      toast(`${p.name} activated — $${p.credits} added to your wallet.`, 'success')
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
      await api('/packages', { method: 'POST', body: { ...create, price: +create.price, credits: +create.credits, validityDays: +create.validityDays } })
      toast('Package created.', 'success')
      setCreate(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function toggle(p) {
    try {
      await api(`/packages/${p.id}`, { method: 'PATCH', body: { status: p.status === 'active' ? 'hidden' : 'active' } })
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div>
      <PageHeader
        title="Packages"
        sub={isAdmin ? 'Create and manage prepaid credit bundles' : 'Buy discounted credit bundles for your wallet'}
      >
        <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-[12.5px] font-bold text-emerald-600">
          Wallet: {fmtMoney(balance)}
        </span>
        {isAdmin && (
          <Button onClick={() => setCreate({ name: '', price: '', credits: '', validityDays: '90', description: '' })}>
            <PlusIcon className="h-[18px] w-[18px]" /> New package
          </Button>
        )}
      </PageHeader>

      {/* bundles */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((p) => {
          const bonus = Math.round(((p.credits - p.price) / p.price) * 100)
          return (
            <Card key={p.id} className={`flex flex-col ${p.status !== 'active' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <h3 className="text-[17px] font-extrabold tracking-tight text-ink">{p.name}</h3>
                {bonus > 0 && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-[3px] text-[11px] font-bold text-brand-600">+{bonus}% bonus</span>
                )}
              </div>
              <p className="mt-1.5 min-h-[36px] text-[12.5px] leading-snug text-gray-400">{p.description}</p>
              <div className="mt-3 rounded-xl bg-[#fafbfc] p-3.5">
                <div className="text-[26px] font-extrabold tracking-tight text-ink">{fmtMoney(p.price)}</div>
                <div className="mt-0.5 text-[12.5px] font-semibold text-emerald-600">→ {fmtMoney(p.credits)} wallet credit</div>
                <div className="mt-1 text-[11.5px] text-gray-400">Valid {p.validityDays} days</div>
              </div>
              {canBuy ? (
                <Button className="mt-4 w-full" disabled={busy || balance < p.price || p.status !== 'active'} onClick={() => buy(p)}>
                  {balance < p.price ? 'Insufficient balance' : 'Buy now'}
                </Button>
              ) : (
                <div className="mt-4 flex gap-1.5">
                  <Button variant="secondary" className="flex-1" onClick={() => toggle(p)}>
                    {p.status === 'active' ? 'Hide' : 'Show'}
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* purchase history */}
      <Card className="mt-5">
        <h2 className="mb-3 text-[16px] font-extrabold tracking-tight text-ink">
          {isAdmin ? 'All purchases' : 'My purchases'}
        </h2>
        <Table headers={['Package', ...(isAdmin ? ['Buyer'] : []), 'Paid', 'Credited', 'When', 'Status']}>
          {purchases.map((p) => (
            <tr key={p.id} className="transition hover:bg-gray-50/60">
              <Td className="font-bold text-ink">{p.packageName}</Td>
              {isAdmin && <Td>{p.userName}</Td>}
              <Td>{fmtMoney(p.price)}</Td>
              <Td className="font-bold text-emerald-600">{fmtMoney(p.credits)}</Td>
              <Td>{fmtTime(p.ts)}</Td>
              <Td><Chip status="completed">{p.status}</Chip></Td>
            </tr>
          ))}
          {!purchases.length && (
            <tr><td colSpan={6} className="py-10 text-center text-[13.5px] text-gray-400">No purchases yet</td></tr>
          )}
        </Table>
      </Card>

      {/* create */}
      <Modal open={!!create} onClose={() => setCreate(null)} title="New package" width="max-w-lg">
        {create && (
          <div className="space-y-4">
            <Field label="Package name">
              <input className={inputCls} value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} placeholder="Festive Mega Bundle" />
            </Field>
            <Field label="Description">
              <input className={inputCls} value={create.description} onChange={(e) => setCreate({ ...create, description: e.target.value })} placeholder="Short marketing blurb" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Price (INR)">
                <input type="number" min="1" className={inputCls} value={create.price} onChange={(e) => setCreate({ ...create, price: e.target.value })} />
              </Field>
              <Field label="Wallet credit">
                <input type="number" min="1" className={inputCls} value={create.credits} onChange={(e) => setCreate({ ...create, credits: e.target.value })} />
              </Field>
              <Field label="Validity (days)">
                <input type="number" min="1" className={inputCls} value={create.validityDays} onChange={(e) => setCreate({ ...create, validityDays: e.target.value })} />
              </Field>
            </div>
            <div className="rounded-xl bg-[#fafbfc] p-3 text-[12.5px] text-gray-500">
              Buyers pay <b className="text-ink">{fmtMoney(+create.price || 0)}</b> and receive{' '}
              <b className="text-emerald-600">{fmtMoney(+create.credits || 0)}</b> in wallet credit
              {+create.price > 0 && +create.credits > +create.price && (
                <> ({Math.round(((create.credits - create.price) / create.price) * 100)}% bonus)</>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCreate(null)}>Cancel</Button>
              <Button onClick={submitCreate} disabled={busy || !create.name || +create.price < 1 || +create.credits < 1}>Create package</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
