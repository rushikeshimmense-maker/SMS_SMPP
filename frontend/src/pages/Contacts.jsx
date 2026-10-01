import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Card, Field, inputCls, Modal, Table, Td, EmptyRow } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PlusIcon } from '../components/Icons.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

const TABS = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'templates', label: 'Templates' },
  { key: 'dnd', label: 'DND & Opt-outs' },
]

export default function Contacts() {
  const toast = useToast()
  const [tab, setTab] = useState('contacts')
  const [contacts, setContacts] = useState([])
  const [templates, setTemplates] = useState([])
  const [dnd, setDnd] = useState([])
  const [groupFilter, setGroupFilter] = useState('All')

  const [showContact, setShowContact] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [showDnd, setShowDnd] = useState(false)
  const [form, setForm] = useState({ name: '', number: '', group: 'General' })
  const [bulkText, setBulkText] = useState('')
  const [tpl, setTpl] = useState({ name: '', body: '' })
  const [dndForm, setDndForm] = useState({ numbers: '', reason: 'User opt-out (STOP)' })
  const [busy, setBusy] = useState(false)

  const load = () => {
    api('/contacts').then((d) => setContacts(d.items || [])).catch(() => {})
    api('/templates').then((d) => setTemplates(d.items || [])).catch(() => {})
    api('/dnd').then((d) => setDnd(d.items || [])).catch(() => {})
  }
  useEffect(load, [])

  const groups = useMemo(() => ['All', ...new Set(contacts.map((c) => c.group))], [contacts])
  const visible = contacts.filter((c) => groupFilter === 'All' || c.group === groupFilter)

  async function addContact() {
    setBusy(true)
    try {
      await api('/contacts', { method: 'POST', body: form })
      toast('Contact saved.', 'success')
      setShowContact(false)
      setForm({ name: '', number: '', group: 'General' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function bulkContacts() {
    setBusy(true)
    try {
      const items = bulkText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [name, number, group] = l.split(',').map((x) => (x || '').trim())
          return { name: name || '', number: number || name, group: group || 'General' }
        })
      const res = await api('/contacts', { method: 'POST', body: { items } })
      toast(`Imported ${res.count} contact(s).`, 'success')
      setShowBulk(false)
      setBulkText('')
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function delContact(id) {
    await api(`/contacts/${id}`, { method: 'DELETE' }).catch((e) => toast(e.message, 'error'))
    load()
  }

  async function saveTpl() {
    setBusy(true)
    try {
      await api('/templates', { method: 'POST', body: tpl })
      toast('Template saved.', 'success')
      setShowTpl(false)
      setTpl({ name: '', body: '' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function delTpl(id) {
    await api(`/templates/${id}`, { method: 'DELETE' }).catch((e) => toast(e.message, 'error'))
    load()
  }

  async function addDnd() {
    setBusy(true)
    try {
      const numbers = dndForm.numbers.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)
      const res = await api('/dnd', { method: 'POST', body: { numbers, reason: dndForm.reason } })
      toast(`Added ${res.count} number(s) to DND.`, 'success')
      setShowDnd(false)
      setDndForm({ numbers: '', reason: 'User opt-out (STOP)' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function delDnd(id) {
    await api(`/dnd/${id}`, { method: 'DELETE' }).catch((e) => toast(e.message, 'error'))
    load()
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        sub="Phone book, reusable templates and DND / opt-out compliance"
      >
        {tab === 'contacts' && (
          <>
            <Button variant="secondary" onClick={() => setShowBulk(true)}>Bulk import</Button>
            <Button onClick={() => setShowContact(true)}><PlusIcon className="h-[18px] w-[18px]" /> Add contact</Button>
          </>
        )}
        {tab === 'templates' && (
          <Button onClick={() => setShowTpl(true)}><PlusIcon className="h-[18px] w-[18px]" /> New template</Button>
        )}
        {tab === 'dnd' && (
          <Button onClick={() => setShowDnd(true)}><PlusIcon className="h-[18px] w-[18px]" /> Add numbers</Button>
        )}
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-[13.5px] font-semibold transition ${
              tab === t.key ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'contacts' && (
        <>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupFilter(g)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                  groupFilter === g ? 'bg-ink text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <Card className="p-4 sm:p-5">
            <Table headers={['Name', 'Number', 'Group', '']}>
              {visible.map((c) => (
                <tr key={c.id}>
                  <Td className="font-bold text-ink">{c.name || '—'}</Td>
                  <Td className="font-mono text-[12.5px]">{c.number}</Td>
                  <Td>{c.group}</Td>
                  <Td className="text-right">
                    <button type="button" onClick={() => delContact(c.id)} className="text-[12.5px] font-semibold text-rose-500 hover:underline">
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
              {!visible.length && <EmptyRow colSpan={4} text="No contacts yet — add one or bulk import" />}
            </Table>
          </Card>
        </>
      )}

      {tab === 'templates' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-extrabold text-ink">{t.name}</h3>
                <button type="button" onClick={() => delTpl(t.id)} className="text-[12px] font-semibold text-rose-500 hover:underline">Delete</button>
              </div>
              <p className="mt-2 flex-1 whitespace-pre-wrap text-[13px] leading-relaxed text-gray-500">{t.body}</p>
            </Card>
          ))}
          {!templates.length && (
            <Card className="sm:col-span-2 xl:col-span-3 py-10 text-center text-[13.5px] text-gray-400">No templates yet</Card>
          )}
        </div>
      )}

      {tab === 'dnd' && (
        <>
          <Card className="mb-4 border-amber-100 bg-amber-50/60 p-4 text-[13px] leading-relaxed text-amber-800">
            Numbers on this list are <b>never charged or messaged</b>. Sends automatically skip them and report
            how many were skipped. Add anyone who replies STOP, or any number flagged for consent violations.
          </Card>
          <Card className="p-4 sm:p-5">
            <Table headers={['Number', 'Reason', 'Added', '']}>
              {dnd.map((d) => (
                <tr key={d.id}>
                  <Td className="font-mono text-[12.5px] font-bold text-ink">{d.number}</Td>
                  <Td>{d.reason || '—'}</Td>
                  <Td>{(d.createdAt || '').slice(0, 10)}</Td>
                  <Td className="text-right">
                    <button type="button" onClick={() => delDnd(d.id)} className="text-[12.5px] font-semibold text-emerald-600 hover:underline">
                      Remove
                    </button>
                  </Td>
                </tr>
              ))}
              {!dnd.length && <EmptyRow colSpan={4} text="DND list is empty" />}
            </Table>
          </Card>
        </>
      )}

      {/* Add contact */}
      <Modal open={showContact} onClose={() => setShowContact(false)} title="Add contact">
        <div className="space-y-4">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Number" hint="Include country code, e.g. +91 98765 43210">
            <input className={inputCls} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
          </Field>
          <Field label="Group"><input className={inputCls} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} /></Field>
          <Button onClick={addContact} disabled={busy || !form.number.trim()} className="w-full">Save contact</Button>
        </div>
      </Modal>

      {/* Bulk import */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk import contacts" width="max-w-xl">
        <Field label="One contact per line — Name, Number, Group (group optional)">
          <textarea rows={9} className={`${inputCls} resize-none font-mono text-[12.5px]`} value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'Priya Nair, +91 98765 43210, VIP Customers\n+91 90000 11111\nRahul Verma, +91 92222 33333, Retail Offers'} />
        </Field>
        <Button onClick={bulkContacts} disabled={busy || !bulkText.trim()} className="mt-4 w-full">Import</Button>
      </Modal>

      {/* Template */}
      <Modal open={showTpl} onClose={() => setShowTpl(false)} title="New template">
        <div className="space-y-4">
          <Field label="Template name"><input className={inputCls} value={tpl.name} onChange={(e) => setTpl({ ...tpl, name: e.target.value })} /></Field>
          <Field label="Message body"><textarea rows={5} className={`${inputCls} resize-none`} value={tpl.body} onChange={(e) => setTpl({ ...tpl, body: e.target.value })} /></Field>
          <Button onClick={saveTpl} disabled={busy || !tpl.name.trim() || !tpl.body.trim()} className="w-full">Save template</Button>
        </div>
      </Modal>

      {/* DND */}
      <Modal open={showDnd} onClose={() => setShowDnd(false)} title="Add to DND / opt-out" width="max-w-xl">
        <div className="space-y-4">
          <Field label="Numbers" hint="One per line or comma separated">
            <textarea rows={6} className={`${inputCls} resize-none font-mono text-[12.5px]`} value={dndForm.numbers}
              onChange={(e) => setDndForm({ ...dndForm, numbers: e.target.value })}
              placeholder={'+91 98765 43210\n+1 415 555 0132'} />
          </Field>
          <Field label="Reason">
            <select className={inputCls} value={dndForm.reason} onChange={(e) => setDndForm({ ...dndForm, reason: e.target.value })}>
              <option>User opt-out (STOP)</option>
              <option>Consent violation</option>
              <option>Regulatory (DND registry)</option>
              <option>Hard bounce / invalid</option>
            </select>
          </Field>
          <Button onClick={addDnd} disabled={busy || !dndForm.numbers.trim()} className="w-full">Add to DND</Button>
        </div>
      </Modal>
    </div>
  )
}
