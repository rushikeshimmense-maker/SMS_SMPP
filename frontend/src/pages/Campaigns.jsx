import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate, fmtNum } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PauseIcon, PlayIcon, PlusIcon } from '../components/Icons.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

export default function Campaigns() {
  const toast = useToast()
  const { user: me } = useAuth()
  const isStaff = me.role !== 'user'
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', text: '', audience: 'All Contacts', total: 1000, scheduleAt: '' })
  const [saving, setSaving] = useState(false)

  const load = () => api('/campaigns').then((d) => setItems(d.items || []))
  useEffect(() => {
    load()
    const iv = setInterval(load, 3000)
    return () => clearInterval(iv)
  }, [])

  async function toggle(c) {
    try {
      await api(`/campaigns/${c.id}/toggle`, { method: 'POST' })
      toast(`“${c.name}” ${c.status === 'running' ? 'paused' : 'resumed'}.`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function create() {
    setSaving(true)
    try {
      await api('/campaigns', {
        method: 'POST',
        body: {
          ...form,
          total: +form.total || 1000,
          scheduleAt: form.scheduleAt || null,
        },
      })
      toast(`Campaign “${form.name}” created.`, 'success')
      setOpen(false)
      setForm({ name: '', text: '', audience: 'All Contacts', total: 1000, scheduleAt: '' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const counts = items.reduce((a, c) => ({ ...a, [c.status]: (a[c.status] || 0) + 1 }), {})

  return (
    <div>
      <PageHeader title="Campaigns" sub="Bulk messaging campaigns with live throughput">
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="h-[18px] w-[18px]" /> New Campaign
        </Button>
      </PageHeader>

      <div className="mb-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-4">
        {[
          ['Total', items.length, 'text-ink'],
          ['Running', counts.running || 0, 'text-sky-600'],
          ['Scheduled', counts.scheduled || 0, 'text-violet-600'],
          ['Completed', counts.completed || 0, 'text-emerald-600'],
        ].map(([l, v, c]) => (
          <Card key={l}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{l}</div>
            <div className={`mt-1 text-[24px] font-extrabold ${c}`}>{v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <Table headers={isStaff ? ['Campaign', 'Owner', 'Audience', 'Progress', 'Status', 'Schedule', 'Actions'] : ['Campaign', 'Audience', 'Progress', 'Status', 'Schedule', 'Actions']}>
          {items.map((c) => {
            const pct = c.total ? Math.round((c.sent / c.total) * 100) : 0
            return (
              <tr key={c.id} className="transition hover:bg-gray-50/60">
                <Td>
                  <div className="font-bold text-ink">{c.name}</div>
                  <div className="mt-0.5 max-w-[280px] truncate text-[12px] text-gray-400">{c.text}</div>
                </Td>
                {isStaff && <Td className="font-semibold">{c.ownerName}</Td>}
                <Td>{c.audience} <span className="text-gray-400">({fmtNum(c.total)})</span></Td>
                <Td className="w-[220px]">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-9 text-right text-[12px] font-bold text-gray-500">{pct}%</span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-gray-400">
                    {fmtNum(c.sent)} sent · <span className="text-emerald-600">{fmtNum(c.delivered)} dlr</span> ·{' '}
                    <span className="text-rose-500">{fmtNum(c.failed)} fail</span>
                  </div>
                </Td>
                <Td><Chip status={c.status} /></Td>
                <Td>{fmtDate(c.scheduledAt)}</Td>
                <Td>
                  {(c.status === 'running' || c.status === 'paused' || c.status === 'scheduled') && (
                    <Button variant="secondary" onClick={() => toggle(c)} className="h-8 px-3 text-[12.5px]">
                      {c.status === 'running' ? (
                        <><PauseIcon className="h-3.5 w-3.5" /> Pause</>
                      ) : (
                        <><PlayIcon className="h-3.5 w-3.5" /> Start</>
                      )}
                    </Button>
                  )}
                </Td>
              </tr>
            )
          })}
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New campaign">
        <div className="space-y-4">
          <Field label="Campaign name">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diwali Dhamaka" />
          </Field>
          <Field label="Message" hint="1–2 segments recommended for best delivery">
            <textarea rows={4} className={`${inputCls} resize-none`} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Campaign message…" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Audience">
              <select className={inputCls} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                {['All Contacts', 'VIP Customers', 'Retail Offers', 'Product Updates', 'DND Safe'].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Audience size">
              <input type="number" min="10" className={inputCls} value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
            </Field>
          </div>
          <Field label="Schedule (optional — leave empty to start now)">
            <input type="datetime-local" className={inputCls} value={form.scheduleAt} onChange={(e) => setForm({ ...form, scheduleAt: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving || !form.name || !form.text}>
              {saving ? 'Creating…' : 'Create campaign'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
