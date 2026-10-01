import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { calcLocal } from '../lib/segments.js'
import { fmtMoney } from '../lib/format.js'
import { useToast } from '../components/Toast.jsx'
import { PageHeader } from '../components/AppLayout.jsx'
import { MiniIcon, PlusIcon, CheckIcon, UserIcon, EyeIcon } from '../components/Icons.jsx'
import { Modal } from '../components/ui.jsx'

/* Phone preview (Native SMS Style) */
function PhonePreview({ senderId, text }) {
  return (
    <div className="mx-auto w-[180px] rounded-[30px] border-[6px] border-gray-900 bg-gray-50 overflow-hidden shadow-2xl relative">
      {/* Top Notch */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gray-900 rounded-b-xl w-[50%] mx-auto z-10" />

      {/* Header */}
      <div className="bg-white/95 pt-7 pb-2 border-b border-gray-200 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-1 text-gray-500 shadow-sm">
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="text-[11px] font-bold text-gray-900 truncate w-full text-center px-2">
          {senderId || 'SENDER-ID'}
        </div>
        <div className="text-[8px] text-gray-400 mt-0.5 tracking-wide">Text Message</div>
      </div>

      {/* Message Body */}
      <div className="bg-gray-50 min-h-[220px] p-3 flex flex-col justify-end">
        {text ? (
          <div className="flex flex-col gap-1 mb-2 mt-auto">
            <div className="text-[8px] text-gray-400 text-center mb-1">Today 11:00 AM</div>
            <div className="bg-[#E5E5EA] text-black rounded-2xl rounded-tl-sm px-3 py-2 text-[10.5px] leading-relaxed max-w-[92%] break-words self-start whitespace-pre-wrap">
              {text}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full mb-4">
            <p className="text-[10px] text-gray-400 text-center italic">SMS preview<br/>appears here</p>
          </div>
        )}
      </div>
    </div>
  )
}

const MODES = ['Normal SMS', 'Dynamic SMS', 'Smart SMS']

export default function SendSms() {
  const toast = useToast()
  const { user } = useAuth()
  const fileRef        = useRef(null)
  const fileRefDynamic = useRef(null)

  const [senderIds, setSenderIds] = useState([])
  const [templates,  setTemplates]  = useState([])
  const [contacts,   setContacts]   = useState([])

  const [mode, setMode] = useState(0) // 0=Normal, 1=Dynamic, 2=Smart
  const isDynamic = mode === 1
  const isSmart   = mode === 2

  const [senderId,      setSenderId]      = useState('')
  const [route,         setRoute]         = useState('Transactional')
  const [campaignName,  setCampaignName]  = useState(() => `Camp_${new Date().toLocaleDateString('en-IN').replace(/\//g, '')}`)
  const [dltTemplateId, setDltTemplateId] = useState('')
  const [language,      setLanguage]      = useState('English')
  const [selectedTpl,   setSelectedTpl]   = useState(null)
  const [text,          setText]          = useState('')
  const [variables,     setVariables]     = useState({})
  const [recipientsText,setRecipientsText]= useState('')
  const [recTab,        setRecTab]        = useState('paste')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [dynFile,       setDynFile]       = useState(null)
  const [dynCols,       setDynCols]       = useState([])
  const [phoneCol,      setPhoneCol]      = useState('')
  const [dynMappings,   setDynMappings]   = useState({})
  const [smartUrl,      setSmartUrl]      = useState('')
  const [smartDomain,   setSmartDomain]   = useState('nx.la')
  const [flash,         setFlash]         = useState(false)
  const [dedupe,        setDedupe]        = useState(true)
  const [blacklist,     setBlacklist]     = useState(true)
  const [isScheduled,   setIsScheduled]   = useState(false)
  const [scheduleAt,    setScheduleAt]    = useState('')
  const [sending,       setSending]       = useState(false)
  const [showPreview,   setShowPreview]   = useState(false)
  const [showTpl,       setShowTpl]       = useState(false)

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

  const groups          = useMemo(() => [...new Set(contacts.map(c => c.group).filter(Boolean))], [contacts])
  const varPlaceholders = useMemo(() => [...new Set([...(text.matchAll(/\{([^}#]+)\}/g) || [])].map(m => m[1]))], [text])

  const renderedText = useMemo(() => {
    let t = text
    if (isSmart && smartUrl) t += ` ${smartDomain}/xxxxx`
    if (isDynamic) {
      for (const v of varPlaceholders) { const col = dynMappings[v]; if (col) t = t.replaceAll(`{${v}}`, `[${col}]`) }
    } else {
      for (const [k, v] of Object.entries(variables)) { t = t.replaceAll(`{${k}}`, v || `{${k}}`) }
    }
    return t
  }, [text, variables, isSmart, smartUrl, smartDomain, isDynamic, dynMappings, varPlaceholders])

  const recipients = useMemo(() => {
    if (isDynamic) return []
    if (recTab === 'paste') return [...new Set(recipientsText.split(/[\n,;]+/).map(x => x.trim()).filter(Boolean))]
    if (recTab === 'group' && selectedGroup) return contacts.filter(c => c.group === selectedGroup).map(c => c.number).filter(Boolean)
    return []
  }, [recipientsText, recTab, selectedGroup, contacts, isDynamic])

  const seg     = calcLocal(text)
  const rate    = user?.pricePerSms ?? 0.02
  const estCost = (isDynamic ? 1 : recipients.length) * seg.segments * rate

  async function send() {
    if (!senderId)    return toast('Select a Sender ID first', 'error')
    if (!text.trim()) return toast('Enter a message', 'error')
    setSending(true)
    setTimeout(() => { toast(isScheduled ? '✅ Scheduled!' : '✅ Sent!', 'success'); setSending(false) }, 1500)
  }

  function applyTpl(t) { setText(t.body || ''); if (t.dltId) setDltTemplateId(t.dltId); setSelectedTpl(t); setShowTpl(false); setVariables({}) }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader()
    r.onload = () => { setRecipientsText(o => [o, String(r.result).replace(/\n/g, ', ')].filter(Boolean).join(', ')); toast(`${file.name} imported`) }
    r.readAsText(file); setRecTab('paste')
  }

  function handleDynFile(e) {
    const file = e.target.files?.[0]; if (!file) return
    setDynFile(file.name)
    setDynCols(['Mobile', 'Name', 'Amount', 'DueDate', 'PromoCode'])
    setPhoneCol('Mobile'); setDynMappings({})
    toast(`${file.name} uploaded`)
  }

  const inp = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition placeholder:text-gray-400'
  const lbl = 'block text-[11px] font-semibold text-gray-600 mb-1'

  return (
    <div>
      <PageHeader title="Send SMS" sub="Create and dispatch your campaign" />

      <div className="px-5 pb-10 max-w-[1240px] mx-auto">

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-5">
          {MODES.map((m, i) => (
            <button key={i} onClick={() => setMode(i)}
              className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all ${mode === i ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {i === 0 ? '💬' : i === 1 ? '⚡' : '🔗'} {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

          {/* ── Main Form ── */}
          <div className="space-y-4">


            {/* Campaign settings */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="font-bold text-[13px] text-gray-800">Campaign Settings</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>Sender ID *</label>
                  <select className={inp} value={senderId} onChange={e => setSenderId(e.target.value)}>
                    <option value="">Select...</option>
                    {senderIds.map(x => <option key={x.id} value={x.senderId}>{x.senderId}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Route</label>
                  <select className={inp} value={route} onChange={e => setRoute(e.target.value)}>
                    <option>Transactional</option><option>Promotional</option><option>OTP</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Campaign Name</label>
                  <input className={inp} value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>DLT Template</label>
                  <select className={inp} value={selectedTpl?.id || ''} onChange={e => { const t = templates.find(x => x.id === e.target.value); if (t) applyTpl(t) }}>
                    <option value="">Select...</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>DLT Template ID</label>
                  <input className={inp} placeholder="1234567890123" value={dltTemplateId} onChange={e => setDltTemplateId(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Language</label>
                  <select className={inp} value={language} onChange={e => setLanguage(e.target.value)}>
                    <option>English</option><option>Unicode</option><option>Hindi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="font-bold text-[13px] text-gray-800">
                  {isDynamic ? 'Upload Excel File' : 'Recipients'}
                </span>
              </div>
              <div className="p-4">
                {isDynamic ? (
                  <div>
                    {!dynFile ? (
                      <div onClick={() => fileRefDynamic.current?.click()}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100 transition py-10 gap-2 text-center">
                        <span className="text-3xl">📊</span>
                        <span className="text-[13px] font-bold text-amber-700">Click to upload Excel / CSV</span>
                        <span className="text-[11px] text-amber-500">Each row = one SMS</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-green-700">
                            <CheckIcon className="h-4 w-4 text-green-500" /> {dynFile}
                          </div>
                          <button onClick={() => { setDynFile(null); setDynCols([]); setDynMappings({}) }} className="text-[11px] text-rose-500 font-bold">Remove</button>
                        </div>
                        <div>
                          <label className={lbl}>Phone Number Column *</label>
                          <select className={inp} value={phoneCol} onChange={e => setPhoneCol(e.target.value)}>
                            <option value="">Select column...</option>
                            {dynCols.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {varPlaceholders.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Map Variables to Excel Columns</p>
                            <div className="space-y-2">
                              {varPlaceholders.map(v => (
                                <div key={v} className="flex items-center gap-2">
                                  <span className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg w-[110px] shrink-0 text-center">{`{${v}}`}</span>
                                  <span className="text-gray-400 text-[12px]">→</span>
                                  <select className={`${inp} flex-1`} value={dynMappings[v] || ''} onChange={e => setDynMappings(p => ({ ...p, [v]: e.target.value }))}>
                                    <option value="">Select column...</option>
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
                  <div>
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-3 w-fit">
                      {[['paste', '📋 Paste'], ['upload', '📁 File'], ['group', '👥 Group']].map(([tab, label]) => (
                        <button key={tab} onClick={() => { setRecTab(tab); if (tab === 'upload') fileRef.current?.click() }}
                          className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition ${recTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {recTab === 'paste' && (
                      <textarea rows={5} className={`${inp} font-mono text-[12px] resize-none`}
                        placeholder={'919876543210, 919876543211\nOr one per line'}
                        value={recipientsText} onChange={e => setRecipientsText(e.target.value)} />
                    )}
                    {recTab === 'upload' && (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition"
                        onClick={() => fileRef.current?.click()}>
                        <span className="text-3xl mb-2">📁</span>
                        <span className="text-[13px] font-bold text-gray-600">Click to upload .csv or .txt</span>
                        <span className="text-[11px] text-gray-400 mt-1">Numbers will be added to paste</span>
                      </div>
                    )}
                    {recTab === 'group' && (
                      <div>
                        <select className={inp} value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                          <option value="">-- Select Group --</option>
                          {groups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        {selectedGroup && (
                          <div className="mt-2 text-[12px] text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                            ✅ {recipients.length} contacts
                          </div>
                        )}
                      </div>
                    )}
                    {recTab === 'paste' && (
                      <div className="mt-2 flex justify-between text-[11.5px] text-gray-400">
                        <span>Comma, newline or semicolon separated</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full ${recipients.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{recipients.length} numbers</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-[13px] text-gray-800">Message</span>
                <button onClick={() => setShowTpl(true)}
                  className="text-[12px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-lg transition flex items-center gap-1">
                  <PlusIcon className="h-3.5 w-3.5" /> Use Template
                </button>
              </div>
              <div className="p-4">
                <textarea rows={6} className={`${inp} resize-none leading-relaxed`}
                  placeholder={isDynamic ? 'e.g. Dear {Name}, your balance is {Amount}. Use variable names from your Excel columns.' : 'Type your message here...'}
                  value={text} onChange={e => setText(e.target.value)} />
                <div className="mt-2 flex items-center justify-between text-[11.5px] text-gray-400">
                  <span>{seg.chars} characters · {seg.segments} segment{seg.segments !== 1 ? 's' : ''}</span>
                  {selectedTpl && <span className="text-brand-500 font-semibold">📄 {selectedTpl.name}</span>}
                </div>

                {/* Smart Link — below textarea */}
                {isSmart && (
                  <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
                    <span className="text-blue-700 font-bold text-[12px]">🔗 Smart Link Tracking</span>
                    <input className={`${inp} border-blue-200`} placeholder="https://destination-url.com" value={smartUrl} onChange={e => setSmartUrl(e.target.value)} />
                    <div className="flex gap-2">
                      <select className={`${inp} flex-1 border-blue-200`} value={smartDomain} onChange={e => setSmartDomain(e.target.value)}>
                        <option>nx.la</option><option>sms.ly</option>
                      </select>
                      <button onClick={() => setText(t => t + ' {smart_link}')}
                        className="px-4 py-2 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                        + Insert Link
                      </button>
                    </div>
                  </div>
                )}

                {varPlaceholders.length > 0 && !isDynamic && (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <p className="col-span-2 text-[11px] font-bold text-gray-400 uppercase mb-1">Variable Values</p>
                    {varPlaceholders.map(v => (
                      <div key={v}>
                        <label className="text-[11px] text-gray-500 font-semibold mb-0.5 block">{`{${v}}`}</label>
                        <input className={`${inp} py-1.5 text-[12px]`} placeholder={v} value={variables[v] || ''} onChange={e => setVariables(p => ({ ...p, [v]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Options + Send */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="flex flex-wrap gap-5 mb-4">
                {[
                  [flash,       setFlash,       'Flash SMS'],
                  [dedupe,      setDedupe,      'Remove Duplicates'],
                  [blacklist,   setBlacklist,   'Remove Blacklist'],
                  [isScheduled, setIsScheduled, 'Schedule'],
                ].map(([val, setter, label]) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setter(!val)}
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${val ? 'bg-brand-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${val ? 'left-[18px]' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[12.5px] font-semibold text-gray-700">{label}</span>
                  </label>
                ))}
                {isScheduled && (
                  <input type="datetime-local" className={`${inp} w-auto text-[12px] py-1`}
                    value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Estimated Cost</div>
                  <div className="text-[24px] font-extrabold text-brand-600 leading-tight">{fmtMoney(estCost)}</div>
                  <div className="text-[11px] text-gray-400">{isDynamic ? 'per batch' : `${recipients.length} nos × ${seg.segments} seg`}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPreview(true)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition">
                    <EyeIcon className="h-4 w-4" /> Preview
                  </button>
                  <button onClick={send} disabled={sending}
                    className="px-7 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-bold shadow-md shadow-brand-600/25 flex items-center gap-2 transition active:scale-95 disabled:opacity-50">
                    <MiniIcon name="send" className="h-4 w-4" />
                    {sending ? 'Sending...' : isScheduled ? '📅 Schedule' : 'Send Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="hidden xl:flex flex-col gap-4">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">Preview</p>
              <PhonePreview senderId={senderId} text={renderedText} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-3">Summary</p>
              {[
                ['Mode',       MODES[mode]],
                ['Route',      route],
                ['Recipients', isDynamic ? (dynFile ? 'From file' : '—') : recipients.length],
                ['Segments',   seg.segments],
                ['Chars',      seg.chars],
                ['Cost',       fmtMoney(estCost)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12px] py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-bold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden inputs */}
      <input ref={fileRef}        type="file" accept=".csv,.txt"       className="hidden" onChange={handleFileUpload} />
      <input ref={fileRefDynamic} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleDynFile} />

      {/* Preview Modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Campaign Summary" width="max-w-md">
        <div className="space-y-1 text-[13px] mb-4">
          {[
            ['Mode',       MODES[mode]],
            ['Campaign',   campaignName],
            ['Sender ID',  senderId || '—'],
            ['Route',      route],
            ['Language',   language],
            ['DLT ID',     dltTemplateId || '—'],
            ['Recipients', isDynamic ? (dynFile || 'No file') : recipients.length],
            ['Segments',   seg.segments],
            ['Flash',      flash ? 'Yes' : 'No'],
            ['Scheduled',  isScheduled ? scheduleAt || 'Not set' : 'No'],
            ['Est. Cost',  fmtMoney(estCost)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-gray-100 py-1.5 last:border-0">
              <span className="text-gray-500">{k}</span>
              <b className="text-gray-800">{v}</b>
            </div>
          ))}
        </div>
        {text && <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-[12px] text-gray-600 italic leading-relaxed mb-4">"{renderedText}"</div>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { setShowPreview(false); send() }} disabled={sending}
            className="px-5 py-2 rounded-lg bg-brand-600 text-[13px] font-bold text-white hover:bg-brand-500 flex items-center gap-2 disabled:opacity-50">
            <MiniIcon name="send" className="h-3.5 w-3.5" />
            {isScheduled ? 'Confirm Schedule' : 'Confirm & Send'}
          </button>
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal open={showTpl} onClose={() => setShowTpl(false)} title="Select Template">
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {templates.length === 0 && <div className="text-center text-[13px] text-gray-400 py-10">No templates available</div>}
          {templates.map(t => (
            <button key={t.id} onClick={() => applyTpl(t)}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-brand-50 hover:border-brand-300 p-4 text-left transition group">
              <div className="text-[13px] font-bold text-gray-800 group-hover:text-brand-700">{t.name}</div>
              <div className="text-[11.5px] text-gray-500 mt-1 line-clamp-2">{t.body}</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
