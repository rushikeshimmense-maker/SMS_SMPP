import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { onLive } from '../lib/live.js'
import { creditStr, fmtMoney, fmtTime } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PageHeader } from '../components/AppLayout.jsx'
import { useAuth } from '../lib/auth.jsx'

const TX_STYLE = { funding: 'bg-emerald-50 text-emerald-600', usage: 'bg-rose-50 text-rose-600', adjust: 'bg-amber-50 text-amber-600' }

export default function Billing() {
  const toast = useToast()
  const { user: me } = useAuth()
  const isStaff = me.role !== 'user'
  const [data, setData] = useState(null)
  const [request, setRequest] = useState(null) // { amount, note }
  const [busy, setBusy] = useState(false)

  const load = () => api('/billing/overview').then(setData)
  useEffect(() => {
    load()
    const iv = setInterval(load, 8000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => onLive('balance', load), [load])

  async function submitRequest() {
    setBusy(true)
    try {
      await api('/billing/topups', { method: 'POST', body: { amount: +request.amount, note: request.note } })
      toast('Top-up request sent to your provider.', 'success')
      setRequest(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function resolve(id, approve) {
    try {
      await api(`/billing/topups/${id}/${approve ? 'approve' : 'reject'}`, { method: 'POST' })
      toast(`Request ${approve ? 'approved' : 'rejected'}.`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const nameOf = (id) => {
    if (!id) return 'Platform'
    return id === me.id ? me.companyName : data?.topups?.find((t) => t.userId === id)?.companyName || 'Account'
  }

  return (
    <div>
      <PageHeader
        title="Billing & Credits"
        sub={isStaff ? 'Fund accounts, approve top-ups and track margin' : 'Wallet, top-up requests and spend history'}
      >
        {!isStaff && (
          <Button onClick={() => setRequest({ amount: '', note: '' })}>Request top-up</Button>
        )}
      </PageHeader>

      {/* cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Wallet balance</div>
          {me.role === 'superadmin' ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-5 py-1.5 text-[26px] font-extrabold leading-[1.2] text-emerald-600">∞</span>
            </div>
          ) : (
            <div className="mt-1 text-[30px] font-extrabold tracking-tight text-ink">{fmtMoney(data?.balance ?? me.balance)}</div>
          )}
          <div className="text-[12px] text-gray-400">Rate ${me.pricePerSms?.toFixed?.(3)}/SMS</div>
        </Card>
        <Card>
          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Usage (30 days)</div>
          <div className="mt-1 text-[30px] font-extrabold tracking-tight text-rose-500">{fmtMoney(data?.usage30d)}</div>
          <div className="text-[12px] text-gray-400">SMS charges across your scope</div>
        </Card>
        {isStaff ? (
          <>
            <Card>
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Margin (30 days)</div>
              <div className="mt-1 text-[30px] font-extrabold tracking-tight text-emerald-600">{fmtMoney(data?.margin30d)}</div>
              <div className="text-[12px] text-gray-400">Spread between your cost and client rates</div>
            </Card>
            <Card>
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Pending top-ups</div>
              <div className="mt-1 text-[30px] font-extrabold tracking-tight text-ink">{data?.pendingCount ?? 0}</div>
              <div className="text-[12px] text-gray-400">Worth {fmtMoney(data?.pendingSum)}</div>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Pending requests</div>
              <div className="mt-1 text-[30px] font-extrabold tracking-tight text-ink">{data?.pendingCount ?? 0}</div>
              <div className="text-[12px] text-gray-400">Awaiting provider approval</div>
            </Card>
            <Card>
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Your provider</div>
              <div className="mt-2 text-[17px] font-extrabold text-ink">{me.parentName || 'SMSBridge'}</div>
              <div className="text-[12px] text-gray-400">Contact them for credit-line increases</div>
            </Card>
          </>
        )}
      </div>

      {/* top-up requests */}
      {data?.topups?.length > 0 && (
        <Card className="mt-5">
          <h2 className="mb-3 text-[16px] font-extrabold tracking-tight text-ink">Top-up requests</h2>
          <Table headers={['Requested by', 'Amount', 'Note', 'Status', 'Requested', 'Actions']}>
            {data.topups.map((t) => (
              <tr key={t.id} className="transition hover:bg-gray-50/60">
                <Td className="font-bold text-ink">{t.userName || t.userId}</Td>
                <Td className="font-bold">{fmtMoney(t.amount)}</Td>
                <Td className="max-w-[220px] truncate">{t.note || '—'}</Td>
                <Td>
                  <Chip status={t.status === 'approved' ? 'completed' : t.status === 'rejected' ? 'failed' : 'pending'}>{t.status}</Chip>
                </Td>
                <Td>{fmtTime(t.createdAt)}</Td>
                <Td>
                  {t.status === 'pending' && isStaff && t.userId !== me.id && (
                    <div className="flex gap-1.5">
                      <Button className="h-8 px-3 text-[12px]" onClick={() => resolve(t.id, true)}>Approve</Button>
                      <Button variant="danger" className="h-8 px-3 text-[12px]" onClick={() => resolve(t.id, false)}>Reject</Button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* ledger */}
      <Card className="mt-5">
        <h2 className="mb-3 text-[16px] font-extrabold tracking-tight text-ink">Credit ledger</h2>
        <Table headers={['Time', 'Type', 'Description', 'Amount', 'Balance after']}>
          {(data?.transactions || []).map((t) => (
            <tr key={t.id} className="transition hover:bg-gray-50/60">
              <Td className="whitespace-nowrap text-[12.5px]">{fmtTime(t.ts)}</Td>
              <Td><span className={`inline-flex rounded-full px-2.5 py-[3px] text-[11.5px] font-bold capitalize ${TX_STYLE[t.type] || 'bg-gray-100 text-gray-500'}`}>{t.type}</span></Td>
              <Td>{t.note}</Td>
              <Td className={`font-bold ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {t.amount >= 0 ? '+' : ''}{fmtMoney(t.amount)}
              </Td>
              <Td>{fmtMoney(t.balanceAfter)}</Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* request modal */}
      <Modal open={!!request} onClose={() => setRequest(null)} title="Request top-up" width="max-w-md">
        {request && (
          <div className="space-y-4">
            <Field label="Amount (Credits)" hint="Minimum $5 — sent to your provider for approval">
              <input type="number" min="5" step="1" className={inputCls} value={request.amount}
                onChange={(e) => setRequest({ ...request, amount: e.target.value })} placeholder="100" />
            </Field>
            <Field label="Note">
              <input className={inputCls} value={request.note} onChange={(e) => setRequest({ ...request, note: e.target.value })}
                placeholder="e.g. Festive campaign budget" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRequest(null)}>Cancel</Button>
              <Button onClick={submitRequest} disabled={busy || +request.amount < 5}>Send request</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
