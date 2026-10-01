import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { fmtDate, fmtMoney } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td, EmptyRow } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { useAuth } from '../lib/auth.jsx'
import { PlusIcon } from '../components/Icons.jsx'
import { PageHeader } from '../components/AppLayout.jsx'
import { useSearchParams } from 'react-router-dom'

export default function MyDlt() {
  const toast = useToast()
  const { user: me } = useAuth()
  const isAdmin = false
  const tabs = ['Sender IDs', 'Templates']
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'templates' ? 'Templates' : 'Sender IDs')
  const [data, setData] = useState(null)
  
  // Modals
  const [addSender, setAddSender] = useState({ open: false, senderId: '', entity: '', tmid: '', forUser: '' })
  const [addTemplate, setAddTemplate] = useState({ open: false, name: '', text: '', entity: '', forUser: '', senderId: '' })

  const load = () =>
    Promise.all([
      api('/settings'),
      api('/templates')
    ]).then(([d, tRes]) => {
      d.templates = tRes.items || []
      setData(d)
    })
    
  useEffect(() => { load() }, [])

  async function addSenderId() {
    try {
      await api('/sender-ids', {
        method: 'POST',
        body: {
          senderId: addSender.senderId,
          entityId: addSender.entity,
          tmid: addSender.tmid,
          userId: me.id
        }
      })
      toast('Sender ID submitted for approval.', 'success')
      setAddSender({ open: false, senderId: '', entity: '', tmid: '', forUser: '' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function toggleSender(s) {
    setData(prev => ({
      ...prev,
      senderIds: prev.senderIds.map(item => 
        item.id === s.id ? { ...item, status: item.status === 'Approved' ? 'Revoked' : 'Approved' } : item
      )
    }))
    toast(`Sender ID ${s.status === 'Approved' ? 'Revoked' : 'Approved'}.`, 'success')
  }

  async function submitTemplate() {
    try {
      await api('/templates', {
        method: 'POST',
        body: {
          name: addTemplate.name,
          body: addTemplate.text,
          entity: addTemplate.entity,
          senderId: addTemplate.senderId,
          userId: me.id
        }
      })
      toast('Template submitted for approval.', 'success')
      setAddTemplate({ open: false, name: '', text: '', entity: '', forUser: '', senderId: '' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function toggleTemplate(t) {
    setData(prev => ({
      ...prev,
      templates: prev.templates.map(item => 
        item.id === t.id ? { ...item, status: item.status === 'Approved' ? 'Revoked' : 'Approved' } : item
      )
    }))
    toast(`Template ${t.status === 'Approved' ? 'Revoked' : 'Approved'}.`, 'success')
  }

  if (!data) return <div className="animate-pulse text-[14px] text-gray-400">Loading configuration...</div>

  const availableSenderIds = data?.senderIds?.filter(s => s.userId === (addTemplate.forUser || me.id)) || []

  const USERS_LIST = [
    { id: 'user1', label: 'Acme Corp (@acmecorp)' },
    { id: 'user2', label: 'Global Reseller (@globalres)' },
    { id: 'user3', label: 'Nexus Tech (@nexustech)' }
  ]

  return (
    <div>
      <PageHeader
        title="DLT Management"
        sub="Manage and configure Sender IDs and Templates for users"
      />

      <div className="mb-5 flex flex-wrap gap-1.5 border-b border-gray-100 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
              tab === t ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Sender IDs' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">Sender IDs</h2>
            <Button onClick={() => setAddSender({ ...addSender, open: true })}>
              <PlusIcon className="h-[18px] w-[18px]" /> {isAdmin ? 'Add Configuration' : 'Request Sender ID'}
            </Button>
          </div>
          <Table headers={['Sender ID', ...(me.role !== 'user' ? ['Owner'] : []), 'Entity ID', 'TMID', 'Status', 'Registered', 'Actions']}>
            {data.senderIds.map((s) => (
              <tr key={s.id} className="transition hover:bg-gray-50/60">
                <Td className="font-mono font-bold text-ink">{s.senderId}</Td>
                {me.role !== 'user' && <Td className="font-bold text-gray-500">{s.userId}</Td>}
                <Td className="font-mono text-[12.5px]">{s.entity || '-'}</Td>
                <Td className="font-mono text-[12.5px] text-gray-500">{s.tmid || '-'}</Td>
                <Td><Chip status={s.status} /></Td>
                <Td>{fmtDate(s.created)}</Td>
                <Td>
                  {isAdmin && (
                    <Button variant="secondary" className="h-8 px-2.5 text-[12px]" onClick={() => toggleSender(s)}>
                      {s.status === 'Approved' ? 'Revoke' : 'Approve'}
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
            {data.senderIds.length === 0 && <EmptyRow colSpan={7} text="No Sender IDs found." />}
          </Table>
        </Card>
      )}

      {tab === 'Templates' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">Message Templates</h2>
            <Button onClick={() => setAddTemplate({ ...addTemplate, open: true })}>
              <PlusIcon className="h-[18px] w-[18px]" /> {isAdmin ? 'Add Configuration' : 'Request Template'}
            </Button>
          </div>
          <Table headers={['Template Name', 'Content Preview', ...(me.role !== 'user' ? ['Owner'] : []), 'Entity ID', 'Sender IDs', 'Status', 'Actions']}>
            {data.templates.map((t) => (
              <tr key={t.id} className="transition hover:bg-gray-50/60">
                <Td className="font-bold text-ink whitespace-nowrap">{t.name}</Td>
                <Td>
                  <div className="text-[12px] text-gray-500 max-w-sm truncate" title={t.text}>{t.text}</div>
                </Td>
                {me.role !== 'user' && <Td className="font-bold text-gray-500">{t.userId}</Td>}
                <Td className="font-mono text-[12.5px]">{t.entity || '-'}</Td>
                <Td className="text-[12.5px] font-bold text-gray-500">{t.senderId || '-'}</Td>
                <Td><Chip status={t.status} /></Td>
                <Td>
                  {isAdmin && (
                    <Button variant="secondary" className="h-8 px-2.5 text-[12px]" onClick={() => toggleTemplate(t)}>
                      {t.status === 'Approved' ? 'Revoke' : 'Approve'}
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
            {data.templates.length === 0 && <EmptyRow colSpan={6} text="No templates found." />}
          </Table>
        </Card>
      )}

      {/* MODALS */}
      <Modal open={addSender.open} onClose={() => setAddSender({ ...addSender, open: false })} title={isAdmin ? "Configure Sender ID" : "Request Sender ID"}>
        <div className="space-y-4">
          {isAdmin && (
            <Field label="Assign to User">
              <select className={inputCls} value={addSender.forUser} onChange={e => setAddSender({...addSender, forUser: e.target.value})}>
                <option value="">-- Select User --</option>
                {USERS_LIST.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </Field>
          )}
          <Field label="Sender ID" hint="Up to 6 characters, uppercase">
            <input className={inputCls} maxLength={6} value={addSender.senderId}
              onChange={(e) => setAddSender({ ...addSender, senderId: e.target.value.toUpperCase() })} placeholder="MYBRAND" />
          </Field>
          <Field label="Entity ID (DLT)">
            <input className={inputCls} value={addSender.entity}
              onChange={(e) => setAddSender({ ...addSender, entity: e.target.value })} placeholder="NEX0001234" />
          </Field>
          <Field label="TMID (Telemarketer ID)" hint="Separate multiple TMIDs with commas">
            <input className={inputCls} value={addSender.tmid}
              onChange={(e) => setAddSender({ ...addSender, tmid: e.target.value })} placeholder="e.g. TM12345, TM98765" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddSender({ ...addSender, open: false })}>Cancel</Button>
            <Button onClick={addSenderId} disabled={!addSender.senderId || (isAdmin && !addSender.forUser)}>{isAdmin ? 'Save Configuration' : 'Submit for approval'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={addTemplate.open} onClose={() => setAddTemplate({ ...addTemplate, open: false })} title={isAdmin ? "Configure Template" : "Request Template"}>
        <div className="space-y-4">
          {isAdmin && (
            <Field label="Assign to User">
              <select className={inputCls} value={addTemplate.forUser} onChange={e => setAddTemplate({...addTemplate, forUser: e.target.value})}>
                <option value="">-- Select User --</option>
                {USERS_LIST.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </Field>
          )}
          <Field label="Template Name" hint="e.g. OTP Login">
            <input className={inputCls} value={addTemplate.name}
              onChange={(e) => setAddTemplate({ ...addTemplate, name: e.target.value })} placeholder="OTP_Login" />
          </Field>
          <Field label="Entity ID (DLT)">
            <input className={inputCls} value={addTemplate.entity}
              onChange={(e) => setAddTemplate({ ...addTemplate, entity: e.target.value })} placeholder="NEX0001234" />
          </Field>
          <Field label="Associated Sender ID" hint="Select a Sender ID assigned to this user">
            <select className={inputCls} value={addTemplate.senderId} onChange={(e) => setAddTemplate({ ...addTemplate, senderId: e.target.value })}>
              <option value="">-- Select Sender ID --</option>
              {availableSenderIds.map(s => <option key={s.id} value={s.senderId}>{s.senderId}</option>)}
            </select>
          </Field>
          <Field label="Template Content" hint="Use {#var#} for variables">
            <textarea className={inputCls + ' min-h-[100px]'} value={addTemplate.text}
              onChange={(e) => setAddTemplate({ ...addTemplate, text: e.target.value })} placeholder="Your OTP is {#var#}." />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddTemplate({ ...addTemplate, open: false })}>Cancel</Button>
            <Button onClick={submitTemplate} disabled={!addTemplate.name || !addTemplate.text || (isAdmin && !addTemplate.forUser)}>{isAdmin ? 'Save Configuration' : 'Submit for approval'}</Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

