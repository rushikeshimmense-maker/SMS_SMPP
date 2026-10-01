import { useState } from 'react'
import { api } from '../lib/api.js'
import { Button, Field, inputCls } from './ui.jsx'
import { useToast } from './Toast.jsx'

const TABS = [
  ['details', 'Details'],
  ['settings', 'Settings'],
  ['routes', 'Routes'],
  ['senderIds', 'Sender IDs'],
  ['smpp', 'SMPP'],
  ['optionX', 'Option X'],
]

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Jammu & Kashmir', 'Karnataka', 'Kerala',
  'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const ROUTE_OPTIONS = ['Primary (Gupshup)', 'Secondary (MSG91)', 'Tertiary (Clickatell)']

const PRESETS = {
  'brand-red': {
    label: 'Brand red',
    colors: { primary: '#E30613', background: '#F9FAFB', muted: '#6B7280', destructive: '#F43F5E', ring: '#E30613', primary_lg: '#FEE2E4', accent: '#38BDF8', border: '#E5E7EB', card: '#FFFFFF' },
  },
  midnight: {
    label: 'Midnight',
    colors: { primary: '#6366F1', background: '#0B0B16', muted: '#9CA3AF', destructive: '#F43F5E', ring: '#6366F1', primary_lg: '#312E81', accent: '#22D3EE', border: '#1F2937', card: '#111120' },
  },
  ocean: {
    label: 'Ocean',
    colors: { primary: '#2563EB', background: '#F8FAFC', muted: '#64748B', destructive: '#EF4444', ring: '#2563EB', primary_lg: '#DBEAFE', accent: '#F59E0B', border: '#E2E8F0', card: '#FFFFFF' },
  },
  forest: {
    label: 'Forest',
    colors: { primary: '#16A34A', background: '#F7FDF9', muted: '#57706B', destructive: '#F43F5E', ring: '#16A34A', primary_lg: '#DCFCE7', accent: '#0EA5E9', border: '#E3EAE7', card: '#FFFFFF' },
  },
}

const SWATCHES = ['primary', 'background', 'muted', 'destructive', 'ring', 'primary_lg', 'accent', 'border', 'card']

function Toggle({ on, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3 text-left transition hover:bg-gray-50"
    >
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-400">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand-600' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

function Sub({ children }) {
  return <h3 className="mt-6 mb-2 text-[12px] font-extrabold uppercase tracking-wider text-gray-400">{children}</h3>
}

const textareaCls = `${inputCls} h-24 py-2 resize-y`

function SectionTable({ headers, rows, onRemove, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full min-w-[520px] text-left">
        <thead className="bg-[#fafbfc] text-[10.5px] font-extrabold uppercase tracking-wider text-gray-400">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3.5 py-2.5">{h}</th>
            ))}
            <th className="px-3.5 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[13px] text-ink">
          {rows.map((r, i) => (
            <tr key={i} className="transition hover:bg-gray-50/60">
              {r.map((cell, j) => (
                <td key={j} className="px-3.5 py-2.5">{cell}</td>
              ))}
              <td className="px-3.5 py-2.5 text-right">
                <button type="button" onClick={() => onRemove(i)} className="text-[12px] font-bold text-brand-600 transition hover:text-brand-700">
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length + 1} className="px-3.5 py-6 text-center text-[12.5px] text-gray-400">{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function UserEditor({ user, onClose, onSaved, inline, lockedTab }) {
  const toast = useToast()
  const P = user.profile || {}
  const [tab, setTab] = useState(lockedTab || 'details')
  const [busy, setBusy] = useState(false)

  const [d, setD] = useState({
    userId: user.userId, name: user.name, companyName: user.companyName,
    email: user.email || '', pricePerSms: String(user.pricePerSms), role: user.role,
  })
  const [details, setDetails] = useState({
    mobile: P.details?.mobile || '', pan: P.details?.pan || '', trnid: P.details?.trnid || '',
    website: P.details?.website || '', accountExpiry: P.details?.accountExpiry || '',
    legalName: P.details?.legalName || '', gstin: P.details?.gstin || '',
    billingState: P.details?.billingState || '', billingAddress: P.details?.billingAddress || '',
    suppressMoveEmails: !!P.details?.suppressMoveEmails,
  })
  const [settings, setSettings] = useState({
    validateExam: !!P.settings?.validateExam, autoTemplates: !!P.settings?.autoTemplates,
    autoSenderIds: !!P.settings?.autoSenderIds, secureReporting: !!P.settings?.secureReporting,
    autoDlz: !!P.settings?.autoDlz, creditPolicy: P.settings?.creditPolicy || 'on-submit', refundPolicy: P.settings?.refundPolicy || 'auto',
    allowedCids: P.settings?.allowedCids || '',
  })
  const [notif, setNotif] = useState({
    onFailed: P.notifications?.onFailed !== false, weekly: !!P.notifications?.weekly,
    bulkReceipt: !!P.notifications?.bulkReceipt, lowCredit: !!P.notifications?.lowCredit,
    lowThreshold: P.notifications?.lowThreshold ?? '100',
  })
  const [white, setWhite] = useState({
    brandName: P.whitelist?.brandName || '', address: P.whitelist?.address || '',
    website: P.whitelist?.website || '', footer: P.whitelist?.footer || '', logo: P.whitelist?.logo || '',
    legalName: P.whitelist?.legalName || '', gstin: P.whitelist?.gstin || '', pan: P.whitelist?.pan || '',
    registeredState: P.whitelist?.registeredState || '', invoicePrefix: P.whitelist?.invoicePrefix || '',
    signatory: P.whitelist?.signatory || '', preset: P.whitelist?.preset || 'brand-red',
    colors: { ...PRESETS['brand-red'].colors, ...(P.whitelist?.colors || {}) },
  })
  const [routes, setRoutes] = useState({
    transactional: P.routes?.transactional || [], promotional: P.routes?.promotional || [],
  })
  const [addRoute, setAddRoute] = useState({ channel: 'transactional', route: ROUTE_OPTIONS[0], countries: '', priority: '' })
  const [senders, setSenders] = useState(P.senderIds || [])
  const [addSender, setAddSender] = useState({ id: '', type: 'Transactional' })
  const [smpp, setSmpp] = useState({ binds: P.smpp?.binds || [] })
  const [bindForm, setBindForm] = useState(null)
  const [config, setConfig] = useState({
    securityQuestion: P.config?.securityQuestion || user.securityQuestion || 'What is your pet\'s name?',
    securityAnswer: P.config?.securityAnswer || user.securityAnswer || 'Fluffy',
    _revealAnswer: false
  })
  const [optionX, setOptionX] = useState({
    bulk: { on: !!P.optionX?.bulk?.on, n: P.optionX?.bulk?.n || '', y: P.optionX?.bulk?.y || '' },
    smpp: { on: !!P.optionX?.smpp?.on, n: P.optionX?.smpp?.n || '', y: P.optionX?.smpp?.y || '' },
    api: { on: !!P.optionX?.api?.on, n: P.optionX?.api?.n || '', y: P.optionX?.api?.y || '' },
  })

  async function save() {
    setBusy(true)
    try {
      let body
      if (tab === 'details') body = { userId: d.userId, name: d.name, companyName: d.companyName, email: d.email, pricePerSms: +d.pricePerSms, role: d.role, profile: { details } }
      else if (tab === 'settings') body = { profile: { settings, config: { securityQuestion: config.securityQuestion, securityAnswer: config.securityAnswer } } }
      else if (tab === 'notifications') body = { profile: { notifications: notif } }
            else if (tab === 'routes') body = { profile: { routes } }
      else if (tab === 'senderIds') body = { profile: { senderIds: senders } }
      else if (tab === 'smpp') body = { profile: { smpp } }
      else if (tab === 'optionX') body = { profile: { optionX } }
      await api(`/users/${user.id}`, { method: 'PATCH', body })
      toast('Saved.', 'success')
      onSaved()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  function readImage(key, field) {
    return (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      if (file.size > 300 * 1024) return toast('Image too large (max 300 KB).', 'error')
      const r = new FileReader()
      r.onload = () => setWhite((w) => ({ ...w, [field]: String(r.result) }))
      r.readAsDataURL(file)
      void key
    }
  }

  function addRouteRow() {
    if (!addRoute.route) return toast('Select a route.', 'error')
    const row = {
      priority: addRoute.priority === '' ? 10 : +addRoute.priority,
      route: addRoute.route,
      countries: (addRoute.countries || '').trim() || 'any',
    }
    setRoutes((r) => ({ ...r, [addRoute.channel]: [...r[addRoute.channel], row] }))
    setAddRoute((a) => ({ ...a, countries: '', priority: '' }))
  }

  function createBind() {
    const uname = 'xan' + Math.random().toString(36).slice(2, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10)
    setSmpp((s) => ({
      binds: [...s.binds, { username: uname, systemId: bindForm.systemId.trim() || '—', channel: bindForm.channel, status: 'active', tpr: +bindForm.tpr || 500, sessions: +bindForm.sessions || 10 }],
    }))
    setBindForm(null)
    toast(`Bind @${uname} created.`, 'success')
  }

  const taxIncomplete = !white.legalName || !white.gstin || !white.pan || !white.registeredState

  const content = (
    <>
        {/* Header */}
        {!inline && (
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
              {lockedTab === 'settings' ? 'Global Settings' : 'Basic Profile'}
            </h2>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">
              {user.companyName} <span className="mx-1.5 text-gray-300">|</span> @{user.userId}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          </div>
          )}
          {/* Tabs */}
          {!lockedTab && (
            <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-[#f9fafb] px-5 py-3 no-scrollbar shadow-inner">
            {TABS.map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-extrabold transition-all duration-200 ${
                  tab === k 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-2 ring-brand-600/20' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-ink shadow-sm'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
            {tab === 'details' && (
              <div className="max-w-3xl mx-auto mb-6">
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                    <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Basic Profile</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="User ID">
                        <input className={inputCls} value={d.userId || ''} onChange={e => setD({...d, userId: e.target.value})} disabled />
                      </Field>
                      <Field label="Full Name">
                        <input className={inputCls} value={d.name || ''} onChange={e => setD({...d, name: e.target.value})} />
                      </Field>
                      <Field label="Company Name">
                        <input className={inputCls} value={d.companyName || ''} onChange={e => setD({...d, companyName: e.target.value})} />
                      </Field>
                      <Field label="Email Address">
                        <input type="email" className={inputCls} value={d.email || ''} onChange={e => setD({...d, email: e.target.value})} />
                      </Field>
                      <Field label="Base Price (paise/sms)">
                          <input type="number" step="0.01" className={inputCls} value={d.pricePerSms || ''} onChange={e => setD({...d, pricePerSms: e.target.value})} />
                        </Field>
                        <Field label="Account Role">
                          <select className={inputCls} value={d.role || 'user'} onChange={e => setD({...d, role: e.target.value})} disabled={user.role === 'reseller'}>
                            {user.role === 'reseller' ? (
                              <option value="reseller">Reseller</option>
                            ) : (
                              <>
                                <option value="user">User</option>
                                <option value="reseller">Reseller (Upgrade)</option>
                              </>
                            )}
                          </select>
                        </Field>
                        <Field label="Assigned Routes">
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {(settings.assignedRoutes && settings.assignedRoutes.length > 0) ? settings.assignedRoutes.map(r => (
                              <span key={r} className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-100">
                                {r}
                              </span>
                            )) : (
                              <span className="text-[12px] text-gray-400">No routes assigned yet</span>
                            )}
                          </div>
                        </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="space-y-5 mb-6">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Global Account Settings</h3>
                  </div>
                  <div className="space-y-3">
                    <Toggle on={settings.validateSpam} onChange={(v) => setSettings({ ...settings, validateSpam: v })} label="Validate Spam" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3.5 transition hover:bg-gray-50">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">IP Validation</div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-[360px]">
                        <input 
                          type="text" 
                          placeholder="e.g. 192.168.1.1, 10.0.0.1" 
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                          value={settings.ipValidation || ''} 
                          onChange={(e) => setSettings({ ...settings, ipValidation: e.target.value })} 
                        />
                        <button type="button" onClick={() => toast('Click Save at the bottom to apply changes.', 'success')} className="rounded-lg bg-gray-800 px-4 py-2 text-[13px] font-bold text-white hover:bg-black transition-colors shrink-0">
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3.5 transition hover:bg-gray-50">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">Webhook</div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-[360px]">
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                          value={settings.webhookUrl || ''} 
                          onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })} 
                        />
                        <button type="button" onClick={() => toast('Click Save at the bottom to apply changes.', 'success')} className="rounded-lg bg-gray-800 px-4 py-2 text-[13px] font-bold text-white hover:bg-black transition-colors shrink-0">
                          Save
                        </button>
                      </div>
                    </div>

                    <Toggle on={settings.openSenderId} onChange={(v) => setSettings({ ...settings, openSenderId: v })} label="Open Sender Id" />
                    <Toggle on={settings.openTemplate} onChange={(v) => setSettings({ ...settings, openTemplate: v })} label="Open Template" />
                    <Toggle on={settings.secureReporting} onChange={(v) => setSettings({ ...settings, secureReporting: v })} label="Secure Reporting (Mask Mobile Numbers)" />
                    
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4 transition hover:bg-gray-50">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">Route Assignment</div>
                        <div className="text-[11.5px] text-gray-400 mt-0.5">Select one or more routes to assign to this account</div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {ROUTE_OPTIONS.map(route => {
                          const isSelected = (settings.assignedRoutes || []).includes(route);
                          return (
                            <label key={route} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 cursor-pointer transition ${isSelected ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                              <input type="checkbox" className="hidden" checked={!!isSelected} onChange={(e) => {
                                const arr = settings.assignedRoutes || [];
                                if (e.target.checked) setSettings({ ...settings, assignedRoutes: [...arr, route] });
                                else setSettings({ ...settings, assignedRoutes: arr.filter(r => r !== route) });
                              }} />
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                                {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="text-[12.5px] font-bold">{route}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

                                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mt-6">
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Security Configuration</h3>
                      </div>
                      {(config.securityQuestion || config.securityAnswer) && (
                        <button type="button" onClick={() => {
                          if (window.confirm('Are you sure you want to reset the security credentials? The user will be asked to set them up again on next login.')) {
                            setConfig({ ...config, securityQuestion: '', securityAnswer: '', _revealAnswer: false });
                          }
                        }} className="rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100">
                          Reset Credentials
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[13px] text-gray-500">As an admin, you can reveal the client's answer if they forgot it, or reset it completely so they can set a new one on their next login. You cannot set an answer on their behalf.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Current Security Question">
                          <input className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2.5 text-[13px] text-gray-500 outline-none cursor-not-allowed font-medium" value={config.securityQuestion || 'Not set up yet.'} disabled />
                        </Field>
                        <Field label="Current Answer">
                          <div className="relative">
                            <input type={config._revealAnswer ? 'text' : 'password'} className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2.5 text-[13px] text-gray-500 outline-none cursor-not-allowed pr-10 font-medium" value={config.securityAnswer || ''} disabled placeholder={config.securityQuestion ? "Hidden..." : "N/A"} />
                            {config.securityAnswer && (
                              <button type="button" onClick={() => setConfig({ ...config, _revealAnswer: !config._revealAnswer })} className="absolute inset-y-0 right-3 flex items-center text-[12px] font-bold text-brand-600 hover:text-brand-700">
                                {config._revealAnswer ? 'Hide' : 'Reveal'}
                              </button>
                            )}
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>


              {tab === 'routes' && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-[14px] font-extrabold text-ink">Transactional Routes</div>
                <SectionTable
                  headers={['Priority', 'Route', 'Countries']}
                  rows={routes.transactional.map((r) => [r.priority, r.route, r.countries])}
                  onRemove={(i) => setRoutes((s) => ({ ...s, transactional: s.transactional.filter((_, j) => j !== i) }))}
                  empty="No transactional routes assigned."
                />
              </div>
              <div>
                <div className="mb-2 text-[14px] font-extrabold text-ink">Promotional Routes</div>
                <SectionTable
                  headers={['Priority', 'Route', 'Countries']}
                  rows={routes.promotional.map((r) => [r.priority, r.route, r.countries])}
                  onRemove={(i) => setRoutes((s) => ({ ...s, promotional: s.promotional.filter((_, j) => j !== i) }))}
                  empty="No promotional routes assigned."
                />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3 text-[13.5px] font-extrabold text-ink">+ Add route assignment</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Channel">
                    <select className={inputCls} value={addRoute.channel} onChange={(e) => setAddRoute({ ...addRoute, channel: e.target.value })}>
                      <option value="transactional">transactional</option>
                      <option value="promotional">promotional</option>
                    </select>
                  </Field>
                  <Field label="Route">
                    <select className={inputCls} value={addRoute.route} onChange={(e) => setAddRoute({ ...addRoute, route: e.target.value })}>
                      {ROUTE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Countries" hint="ISO-2 codes (e.g. 92, 91) · leave empty to apply to all countries">
                    <input className={inputCls} value={addRoute.countries} onChange={(e) => setAddRoute({ ...addRoute, countries: e.target.value })} placeholder="92, 91" />
                  </Field>
                  <Field label="Priority" hint="Lower number = higher priority · blank defaults to 10">
                    <input type="number" min="1" className={inputCls} value={addRoute.priority} onChange={(e) => setAddRoute({ ...addRoute, priority: e.target.value })} placeholder="1" />
                  </Field>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="secondary" onClick={addRouteRow}>Add assignment</Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'senderIds' && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-[14px] font-extrabold text-ink">Sender IDs</div>
                <SectionTable
                  headers={['Sender ID', 'Type', 'Status']}
                  rows={senders.map((s) => [
                    <span className="font-bold">{s.id}</span>,
                    s.type,
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-[3px] text-[11.5px] font-bold text-emerald-600">active</span>,
                  ])}
                  onRemove={(i) => setSenders((l) => l.filter((_, j) => j !== i))}
                  empty="No sender IDs registered."
                />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3 text-[13.5px] font-extrabold text-ink">+ Add sender ID</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Sender ID" hint="3–11 chars, alphanumeric">
                    <input className={inputCls} value={addSender.id} onChange={(e) => setAddSender({ ...addSender, id: e.target.value.toUpperCase() })} placeholder="NEXORA" />
                  </Field>
                  <Field label="Type">
                    <select className={inputCls} value={addSender.type} onChange={(e) => setAddSender({ ...addSender, type: e.target.value })}>
                      <option>Transactional</option>
                      <option>Promotional</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!addSender.id) return toast('Enter a sender ID.', 'error')
                      setSenders((l) => [...l, { id: addSender.id, type: addSender.type }])
                      setAddSender({ id: '', type: 'Transactional' })
                    }}
                  >
                    Add sender ID
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'smpp' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-extrabold text-ink">SMPP Connections</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-gray-400">
                    Use SMPP credentials for this user. Each app will bind to the portal without user view.
                  </p>
                </div>
                <Button onClick={() => setBindForm({ systemId: '', channel: 'Transactional', tpr: '500', sessions: '10' })}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Create bind
                </Button>
              </div>
              {bindForm && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="System ID" hint="Optional">
                      <input className={inputCls} value={bindForm.systemId} onChange={(e) => setBindForm({ ...bindForm, systemId: e.target.value })} />
                    </Field>
                    <Field label="Channel">
                      <select className={inputCls} value={bindForm.channel} onChange={(e) => setBindForm({ ...bindForm, channel: e.target.value })}>
                        <option>Transactional</option>
                        <option>Promotional</option>
                      </select>
                    </Field>
                    <Field label="TPR">
                      <input type="number" min="1" className={inputCls} value={bindForm.tpr} onChange={(e) => setBindForm({ ...bindForm, tpr: e.target.value })} />
                    </Field>
                    <Field label="Sessions">
                      <input type="number" min="1" className={inputCls} value={bindForm.sessions} onChange={(e) => setBindForm({ ...bindForm, sessions: e.target.value })} />
                    </Field>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setBindForm(null)}>Cancel</Button>
                    <Button onClick={createBind}>Create</Button>
                  </div>
                </div>
              )}
              <SectionTable
                headers={['Username', 'System ID', 'Channel', 'Status', 'TPR', 'Sessions']}
                rows={smpp.binds.map((b) => [
                  <span className="font-bold">{b.username}</span>,
                  b.systemId,
                  b.channel,
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-[3px] text-[11.5px] font-bold text-emerald-600">{b.status}</span>,
                  b.tpr,
                  b.sessions,
                ])}
                onRemove={(i) => setSmpp((s) => ({ binds: s.binds.filter((_, j) => j !== i) }))}
                empty="No SMPP binds yet."
              />
            </div>
          )}

          {tab === 'optionX' && (
            <div className="space-y-4">
              <p className="text-[12.5px] leading-relaxed text-gray-500">
                Bulk consumption (load-add). After the first n sends, exactly y% of the autoswap sends are shunted —
                recorded as degraded, not delivered and not charged. Applies to all SMPP traffic regardless of channel.
              </p>
              {[
                ['bulk', 'Bulk'],
                ['smpp', 'SMPP (live)'],
                ['api', 'API Band'],
              ].map(([k, label]) => (
                <div key={k} className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-extrabold text-ink">{label}</span>
                    <button
                      type="button"
                      onClick={() => setOptionX((o) => ({ ...o, [k]: { ...o[k], on: !o[k].on } }))}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${optionX[k].on ? 'bg-brand-600' : 'bg-gray-200'}`}
                      aria-label={`Toggle ${label}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${optionX[k].on ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className={`mt-3 grid grid-cols-2 gap-4 ${optionX[k].on ? '' : 'pointer-events-none opacity-40'}`}>
                    <Field label="Min sends (n)">
                      <input type="number" min="0" className={inputCls} value={optionX[k].n} onChange={(e) => setOptionX((o) => ({ ...o, [k]: { ...o[k], n: e.target.value } }))} placeholder="0" />
                    </Field>
                    <Field label="Drop % (y)">
                      <input type="number" min="0" max="100" className={inputCls} value={optionX[k].y} onChange={(e) => setOptionX((o) => ({ ...o, [k]: { ...o[k], y: e.target.value } }))} placeholder="0" />
                    </Field>
                  </div>
                </div>
              ))}
              <p className="text-[11.5px] leading-relaxed text-gray-400">
                API send covers single/ANY/API call, all integrations (webhooks, WhatsApp/IG and scheduled sends). Same
                min-sends(n) → Drop y% rule as above; applied independently of Bulk and SMPP.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-5 py-3.5">
          <span className="text-[12px] text-gray-400">{user.companyName} • saved per tab</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={busy}>Save</Button>
          </div>
        </div>
      </>
    )

    if (inline) {
      return (
        <div className="flex w-full flex-col bg-gray-50 border-t border-gray-100">
          {content}
        </div>
      )
    }

    return (
      <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 backdrop-blur-[2px] sm:items-center sm:p-6">
        <div className={`flex w-full flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl max-h-[95vh] ${lockedTab ? 'sm:max-w-2xl h-auto' : 'sm:h-[88vh] sm:max-w-4xl'}`}>
          {content}
        </div>
      </div>
    )
}