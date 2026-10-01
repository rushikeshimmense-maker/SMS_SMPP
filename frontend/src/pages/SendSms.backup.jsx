import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { calcLocal } from '../lib/segments.js'
import { fmtMoney } from '../lib/format.js'
import { useToast } from '../components/Toast.jsx'
import { UsersIcon, MiniIcon, UserIcon, EyeIcon, BoltIcon, ChartTrendIcon, PlusIcon, CheckIcon, CopyIcon } from '../components/Icons.jsx'
import { Modal } from '../components/ui.jsx'

/* ── Pill Toggle ── */
function PillToggle({ checked, onChange, icon, label, color = 'brand' }) {
  const colors = {
    brand: checked ? 'bg-brand-600 text-white border-brand-600 shadow-brand-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
    amber: checked ? 'bg-amber-500 text-white border-amber-500 shadow-amber-200' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-600',
    blue:  checked ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600',
  }
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-bold transition-all shadow-sm ${colors[color]}`}>
      <span>{icon}</span> {label}
      <div className={`w-7 h-4 rounded-full flex items-center transition-colors ml-1 ${checked ? 'bg-white/30' : 'bg-gray-200'}`}>
        <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-all ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}

/* ── Phone ── */
function PhonePreview({ senderId, text }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 shadow-sm">
      <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">DLT Preview</p>
      <div className="mx-auto w-[185px] rounded-[28px] border-[4px] border-gray-800 bg-gray-900 overflow-hidden shadow-xl">
        <div className="bg-gray-900 h-4 flex justify-center items-end pb-0.5">
          <div className="w-10 h-[5px] bg-gray-700 rounded-full" />
        </div>
        <div className="bg-[#075E54] px-2.5 py-2 flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center shrink-0">
            <UserIcon className="h-3 w-3 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-white truncate">{senderId || 'VM-XXXX'}</div>
            <div className="text-[8px] text-emerald-300">Online</div>
          </div>
        </div>
        <div className="bg-[#ECE5DD] min-h-[260px] p-2.5 space-y-2">
          {text ? (
            <div className="bg-white rounded-xl rounded-tl-none px-2.5 py-2 shadow-sm text-[9.5px] text-gray-800 leading-relaxed max-w-[90%] break-words">
              {text}
              <div className="text-[7px] text-right text-gray-400 mt-1">11:00 AM ✓✓</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-[9px] text-gray-400 text-center">Your message preview<br/>will appear here</p>
            </div>
          )}
        </div>
        <div className="bg-white px-2 py-1.5 flex items-center gap-1.5">
          <div className="flex-1 bg-gray-100 rounded-full px-2 py-1 text-[8.5px] text-gray-400">Message</div>
          <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
            <MiniIcon name="send" className="h-2.5 w-2.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SendSms() {
  const toast = useToast()
  const { user } = useAuth()
  const fileRef = useRef(null)
  const fileRefDynamic = useRef(null)

  const [senderIds, setSenderIds] = useState([])
  const [templates, setTemplates] = useState([])
  const [contacts, setContacts] = useState([])

  // Feature toggles
  const [isDynamic, setIsDynamic] = useState(false)
  const [isSmart, setIsSmart] = useState(false)

  // Config
  const [senderId, setSenderId] = useState('')
  const [route, setRoute] = useState('Transactional')
  const [campaignName, setCampaignName] = useState(() => `Camp_${new Date().toLocaleDateString('en-IN').replace(/\//g, '')}`)
  const [dltTemplateId, setDltTemplateId] = useState('')
  const [language, setLanguage] = useState('English')
  const [selectedTpl, setSelectedTpl] = useState(null)

  // Message
  const [text, setText] = useState('')
  const [variables, setVariables] = useState({})

  // Recipients (Normal/Smart)
  const [recipientsText, setRecipientsText] = useState('')
  const [recTab, setRecTab] = useState('paste')
  const [selectedGroup, setSelectedGroup] = useState('')

  // Dynamic Excel (Customized)
  const [dynFile, setDynFile] = useState(null)
  const [dynCols, setDynCols] = useState([])
  const [phoneCol, setPhoneCol] = useState('')
  const [dynMappings, setDynMappings] = useState({})

  // Smart SMS
  const [smartUrl, setSmartUrl] = useState('')
  const [smartDomain, setSmartDomain] = useState('nx.la')

  // Options
  const [flash, setFlash] = useState(false)
  const [dedupe, setDedupe] = useState(true)
  const [blacklist, setBlacklist] = useState(true)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleAt, setScheduleAt] = useState('')

  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTpl, setShowTpl] = useState(false)

  useEffect(() => {
    Promise.all([
      api('/sender-ids').catch(() => api('/settings')),
      api('/templates'),
      api('/contacts'),
    ]).then(([snd, tpl, cts]) => {
      const list = snd.senderIds || snd.items || []
      setSenderIds(list.filter(s => s.status === 'Approved'))
      setTemplates(tpl.items || [])
      setContacts(cts.items || [])
      const def = list.find(s => s.status === 'Approved')
      if (def) setSenderId(def.senderId)
    })
  }, [])

  const groups = useMemo(() => [...new Set(contacts.map(c => c.group).filter(Boolean))], [contacts])
  const varPlaceholders = useMemo(() => [...new Set([...(text.matchAll(/\{([^}#]+)\}/g) || [])].map(m => m[1]))], [text])

  const renderedText = useMemo(() => {
    let t = text
    if (isSmart && smartUrl) t += ` ${smartDomain}/xxxxx`
    
    if (isDynamic) {
      for (const v of varPlaceholders) {
        const mappedCol = dynMappings[v]
        if (mappedCol) t = t.replaceAll(`{${v}}`, `[${mappedCol}]`)
      }
    } else {
      for (const [k, v] of Object.entries(variables)) {
        t = t.replaceAll(`{${k}}`, v || `{${k}}`)
      }
    }
    return t
  }, [text, variables, isSmart, smartUrl, smartDomain, isDynamic, dynMappings, varPlaceholders])

  const recipients = useMemo(() => {
    if (isDynamic) return []
    if (recTab === 'paste') return [...new Set(recipientsText.split(/[\n,;]+/).map(x => x.trim()).filter(Boolean))]
    if (recTab === 'group' && selectedGroup) return contacts.filter(c => c.group === selectedGroup).map(c => c.number).filter(Boolean)
    return []
  }, [recipientsText, recTab, selectedGroup, contacts, isDynamic])

  const seg = calcLocal(text)
  const rate = user?.pricePerSms ?? 0.02
  const estCost = (isDynamic ? 1 : recipients.length) * seg.segments * rate

  function handleToggleDynamic(v) { setIsDynamic(v); if (v) setIsSmart(false) }
  function handleToggleSmart(v) { setIsSmart(v); if (v) setIsDynamic(false) }

  async function send() {
    if (!senderId) return toast('Please select a Sender ID', 'error')
    if (!text.trim()) return toast('Please enter message text', 'error')
    setSending(true)
    setTimeout(() => { toast(isScheduled ? 'Scheduled successfully!' : 'Campaign queued!', 'success'); setSending(false) }, 1500)
  }

  function applyTpl(t) {
    setText(t.body || '')
    if (t.dltId) setDltTemplateId(t.dltId)
    setSelectedTpl(t)
    setShowTpl(false)
    setVariables({})
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setRecipientsText(o => [o, String(reader.result).replace(/\n/g, ', ')].filter(Boolean).join(', ')); toast(`${file.name} imported`) }
    reader.readAsText(file)
    setRecTab('paste')
  }

  function handleDynFile(e) {
    const file = e.target.files?.[0]; if (!file) return
    setDynFile(file.name)
    // Mock columns derived from an uploaded file
    const mockColumns = ['Mobile', 'Name', 'Amount', 'DueDate', 'PromoCode']
    setDynCols(mockColumns)
    setPhoneCol('Mobile') // auto select phone column if found
    setDynMappings({})
    toast(`${file.name} uploaded for Customized SMS`)
  }

  const F = 'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition placeholder:text-gray-400'
  const lbl = 'block text-[10.5px] font-bold uppercase tracking-wide text-gray-400 mb-1.5'

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="mx-auto max-w-[1240px] px-5 py-6 space-y-5">

        {/* ── Top Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">New SMS Campaign</h1>
            <p className="text-[12.5px] text-gray-400 mt-0.5">Compose and dispatch your campaign below</p>
          </div>
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2">
            <PillToggle checked={isDynamic} onChange={handleToggleDynamic} icon="⚡" label="Dynamic SMS" color="amber" />
            <PillToggle checked={isSmart}   onChange={handleToggleSmart}   icon="🔗" label="Smart SMS"   color="blue" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_230px] gap-5">
          <div className="space-y-4">

            {/* ── Config Card ── */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-[12px] font-extrabold">1</div>
                <span className="font-bold text-[14px] text-gray-800">Campaign Details</span>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className={lbl}>Channel</label><select className={F} value={route} onChange={e => setRoute(e.target.value)}><option>Transactional</option><option>Promotional</option><option>OTP</option></select></div>
                <div><label className={lbl}>Sender ID</label><select className={F} value={senderId} onChange={e => setSenderId(e.target.value)}><option value="">Select Sender ID...</option>{senderIds.map(x => <option key={x.id} value={x.senderId}>{x.senderId}</option>)}</select></div>
                <div><label className={lbl}>Campaign Name</label><input className={F} value={campaignName} onChange={e => setCampaignName(e.target.value)} /></div>
                <div><label className={lbl}>DLT Template</label><select className={F} value={selectedTpl?.id || ''} onChange={e => { const t = templates.find(x => x.id === e.target.value); if (t) applyTpl(t) }}><option value="">Select Template...</option>{templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className={lbl}>DLT Template ID</label><input className={F} placeholder="DLT-XXXXXXXXXXXXX" value={dltTemplateId} onChange={e => setDltTemplateId(e.target.value)} /></div>
                <div><label className={lbl}>Language</label><select className={F} value={language} onChange={e => setLanguage(e.target.value)}><option>English</option><option>Unicode</option><option>Hindi</option></select></div>
              </div>
            </div>

            {/* ── Smart SMS Banner ── */}
            {isSmart && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-blue-100 bg-blue-100/50">
                  <span className="text-blue-600 text-[16px]">🔗</span>
                  <span className="font-bold text-[13px] text-blue-700">Smart Link Configuration</span>
                  <span className="ml-auto text-[11px] text-blue-500 bg-white/70 px-2 py-0.5 rounded-full font-semibold">Tracking Active</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-3 items-end">
                  <div>
                    <label className="block text-[10.5px] font-bold text-blue-600 uppercase tracking-wide mb-1.5">Destination URL</label>
                    <input className={`${F} border-blue-200 focus:border-blue-500`} placeholder="https://yoursite.com/offer" value={smartUrl} onChange={e => setSmartUrl(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-blue-600 uppercase tracking-wide mb-1.5">Short Domain</label>
                    <select className={`${F} border-blue-200`} value={smartDomain} onChange={e => setSmartDomain(e.target.value)}>
                      <option>nx.la</option><option>sms.ly</option>
                    </select>
                  </div>
                  <button onClick={() => setText(t => t + ' {smart_link}')} className="rounded-lg bg-blue-600 text-white text-[12px] font-bold px-4 py-2.5 hover:bg-blue-700 transition whitespace-nowrap shadow-sm">
                    + Insert Link
                  </button>
                </div>
              </div>
            )}

            {/* ── Message + Recipients ── */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-[12px] font-extrabold">2</div>
                <span className="font-bold text-[14px] text-gray-800">Message & Recipients</span>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left: Message */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Message Text</label>
                    <button onClick={() => setShowTpl(true)} className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                      <PlusIcon className="h-3 w-3" /> Select Template
                    </button>
                  </div>
                  <textarea rows={8} className={`${F} resize-none leading-relaxed`}
                    placeholder="Type your message here or select a template..."
                    value={text} onChange={e => setText(e.target.value)} />
                  
                  <div className="mt-2 flex justify-between text-[11px]">
                    <span className="text-gray-400">{seg.chars} characters · {seg.segments} segment{seg.segments !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Variable Default Values (Only for Normal / Smart SMS) */}
                  {varPlaceholders.length > 0 && !isDynamic && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                      <p className="text-[10.5px] font-bold uppercase text-gray-400">Variable Default Values</p>
                      <div className="grid grid-cols-2 gap-3">
                        {varPlaceholders.map(v => (
                          <div key={v}>
                            <label className="text-[10px] text-gray-500 font-semibold mb-1 block">{`{${v}}`}</label>
                            <input className={`${F} py-1.5 text-[12px]`} placeholder={`Value for ${v}`}
                              value={variables[v] || ''} onChange={e => setVariables(p => ({ ...p, [v]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Recipients */}
                <div>
                  {isDynamic ? (
                    /* Dynamic SMS: Excel File Upload & Column Mapping */
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-amber-600 text-lg">⚡</span>
                        <span className="font-bold text-[13px] text-amber-800">Customized SMS (Excel)</span>
                      </div>

                      {!dynFile ? (
                        <div onClick={() => fileRefDynamic.current?.click()}
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-white cursor-pointer hover:bg-amber-100 transition py-10 gap-2">
                          <span className="text-[30px]">📊</span>
                          <span className="text-[13px] font-bold text-amber-700">Upload Excel / CSV file</span>
                          <span className="text-[11px] text-amber-500">Each row = one personalized SMS</span>
                        </div>
                      ) : (
                        <div className="space-y-4 bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2 text-[12px] font-bold text-green-600 truncate">
                              <CheckIcon className="h-4 w-4 shrink-0" /> <span className="truncate">{dynFile}</span>
                            </div>
                            <button onClick={() => { setDynFile(null); setDynCols([]); setDynMappings({}) }} className="text-[11px] text-rose-500 font-bold hover:underline shrink-0 ml-2">Remove</button>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Phone Number Column *</label>
                            <select className={`${F} border-gray-200`} value={phoneCol} onChange={e => setPhoneCol(e.target.value)}>
                              <option value="">Select Column...</option>
                              {dynCols.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>

                          {varPlaceholders.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">Map Template Variables</label>
                              <div className="space-y-2">
                                {varPlaceholders.map(v => (
                                  <div key={v} className="grid grid-cols-[80px_1fr] items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-700 text-right">{`{${v}}`} = </span>
                                    <select className={`${F} border-gray-200 py-1.5 text-[12px]`} value={dynMappings[v] || ''} onChange={e => setDynMappings(p => ({ ...p, [v]: e.target.value }))}>
                                      <option value="">Select Excel Column...</option>
                                      {dynCols.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Normal + Smart: Paste, Upload, Group */
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-1 mb-3 p-1 bg-gray-100 rounded-xl">
                        {[['paste', '📋 Paste Numbers'], ['upload', '📁 Upload File'], ['group', '📁 Group']].map(([tab, label]) => (
                          <button key={tab} onClick={() => { setRecTab(tab); if (tab === 'upload') fileRef.current?.click() }}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition ${recTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                      
                      {recTab === 'paste' && (
                        <textarea rows={8} className={`${F} flex-1 resize-none font-mono text-[11.5px] leading-relaxed`}
                          placeholder={'Enter numbers separated by comma or newline:\n919876543210\n919876543211\n919876543212'}
                          value={recipientsText} onChange={e => setRecipientsText(e.target.value)} />
                      )}
                      
                      {recTab === 'upload' && (
                        <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-5 text-center">
                          <div className="text-3xl mb-2">📁</div>
                          <div className="text-[12px] font-bold text-gray-600">File contents added to list.</div>
                          <div className="text-[11px] text-gray-400 mt-1">Switch to Paste Numbers tab to view.</div>
                        </div>
                      )}
                      
                      {recTab === 'group' && (
                        <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <label className="text-[10px] font-bold uppercase text-gray-500 mb-1.5 block">Select Contact Group</label>
                          <select className={F} value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                            <option value="">-- Select Group --</option>
                            {groups.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          {selectedGroup && <div className="mt-2 text-[11px] text-brand-600 font-bold">{recipients.length} contacts found in this group</div>}
                        </div>
                      )}

                      {/* Count badge */}
                      {recTab !== 'upload' && (
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-[10.5px] text-gray-400">Comma, newline or semicolon</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${recipients.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {recipients.length} numbers
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex flex-wrap items-center gap-x-6 gap-y-3">
                {[
                  [flash, setFlash, 'Flash SMS'],
                  [dedupe, setDedupe, 'Remove Duplicate'],
                  [blacklist, setBlacklist, 'Remove BlackList'],
                  [isScheduled, setIsScheduled, 'Schedule SMS'],
                ].map(([val, setter, label]) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setter(!val)}
                      className={`relative w-8 h-[18px] rounded-full cursor-pointer transition-colors ${val ? 'bg-brand-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${val ? 'left-[18px]' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[12px] text-gray-600 font-bold">{label}</span>
                  </label>
                ))}
                {isScheduled && (
                  <input type="datetime-local" className={`${F} w-auto text-[12px] py-1.5`}
                    value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
                )}
              </div>
            </div>

            {/* ── Action Bar ── */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Estimated Cost</p>
                <p className="text-[22px] font-extrabold text-brand-600 leading-none">{fmtMoney(estCost)}</p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setShowPreview(true)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" /> Preview
                </button>
                <button onClick={() => setShowPreview(true)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                  📊 Summary
                </button>
                <button onClick={send} disabled={sending}
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 px-7 py-2.5 text-[13px] font-bold text-white shadow-md transition disabled:opacity-50 flex items-center gap-2">
                  <MiniIcon name="send" className="h-4 w-4" />
                  {sending ? 'Sending...' : isScheduled ? 'Schedule Campaign' : 'Send Now'}
                </button>
              </div>
            </div>

          </div>

          {/* ── Right Preview ── */}
          <div className="hidden xl:block">
            <div className="sticky top-6 space-y-4">
              <PhonePreview senderId={senderId} text={renderedText} />
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Campaign Stats</p>
                {[
                  ['Mode', isDynamic ? '⚡ Dynamic' : isSmart ? '🔗 Smart' : '💬 Standard'],
                  ['Route', route],
                  ['Recipients', isDynamic ? (dynFile ? 'From file' : '—') : recipients.length],
                  ['Segments', seg.segments],
                  ['Est. Cost', fmtMoney(estCost)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-bold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden inputs */}
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
        <input ref={fileRefDynamic} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleDynFile} />
      </div>

      {/* Preview Modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Campaign Summary" width="max-w-xl">
        <div className="space-y-2 text-[13px] mb-4">
          {[
            ['Campaign', campaignName], ['Sender ID', senderId || '—'], ['Route', route],
            ['Language', language], ['DLT ID', dltTemplateId || '—'],
            ['Mode', isDynamic ? 'Dynamic SMS' : isSmart ? 'Smart SMS' : 'Standard SMS'],
            ['Recipients', isDynamic ? (dynFile || 'No file') : recipients.length],
            ['Segments', seg.segments], ['Flash', flash ? 'Yes' : 'No'],
            ['Scheduled', isScheduled ? scheduleAt : 'No'], ['Est. Cost', fmtMoney(estCost)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
              <span className="text-gray-500 font-medium">{k}</span><b className="text-gray-800">{v}</b>
            </div>
          ))}
        </div>
        {text && <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-[12px] text-gray-700 italic leading-relaxed">"{renderedText}"</div>}
        <div className="mt-5 flex gap-2.5 justify-end">
          <button onClick={() => setShowPreview(false)} className="rounded-xl border border-gray-200 px-5 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { setShowPreview(false); send() }} disabled={sending}
            className="rounded-xl bg-brand-600 px-6 py-2 text-[13px] font-bold text-white hover:bg-brand-500 shadow disabled:opacity-50 flex items-center gap-2">
            <MiniIcon name="send" className="h-3.5 w-3.5" /> Confirm & Send
          </button>
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal open={showTpl} onClose={() => setShowTpl(false)} title="Select DLT Template">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {templates.length === 0 && <div className="text-center text-[13px] text-gray-400 py-8">No templates yet</div>}
          {templates.map(t => (
            <button key={t.id} onClick={() => applyTpl(t)}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-brand-50 hover:border-brand-300 p-4 text-left transition shadow-sm group">
              <div className="text-[13px] font-extrabold text-gray-800 group-hover:text-brand-700">{t.name}</div>
              <div className="text-[11.5px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.body}</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

