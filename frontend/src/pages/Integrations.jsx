import { useState } from 'react'
import { Card, Button, Modal, Table, Td } from '../components/ui.jsx'
import { CopyIcon, CalendarIcon, UsersIcon, MiniIcon } from '../components/Icons.jsx'
import { fmtDate } from '../lib/format.js'

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('API Keys')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [verifyLang, setVerifyLang] = useState('Node.js')
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Default App', prefix: '...8f86', status: 'approved', created: '2026-09-26', lastUsed: '—' }
  ])

  const apiTabs = [
    { id: 'single', label: 'Single SMS', icon: <MiniIcon name="send" /> },
    { id: 'multiple', label: 'Multiple SMS', icon: <MiniIcon name="reports" /> },
    { id: 'schedule', label: 'Schedule SMS', icon: <CalendarIcon className="h-3.5 w-3.5" /> },
    { id: 'group', label: 'Group SMS', icon: <UsersIcon className="h-3.5 w-3.5" /> },
    { id: 'tiny', label: 'Tiny URL SMS', icon: <MiniIcon name="integrations" /> },
    { id: 'delivery', label: 'Check Delivery', icon: <MiniIcon name="dashboard" /> },
    { id: 'balance', label: 'Check Balance', icon: <MiniIcon name="smpp" /> },
  ]

  const [activeApi, setActiveApi] = useState('single')
  const [customList, setCustomList] = useState([]) // Mock list of custom integrations

  const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
  const labelCls = "mb-1.5 block text-[13px] font-semibold text-gray-700"
  const hintCls = "mt-1.5 text-[11px] text-gray-400 leading-relaxed"

  const handleCreateApiKey = () => {
    const newPrefix = '...' + Math.random().toString(16).substr(2, 4);
    setApiKeys([...apiKeys, {
      id: Date.now(),
      name: 'New API Key',
      prefix: newPrefix,
      status: 'approved',
      created: new Date().toISOString().split('T')[0],
      lastUsed: '—'
    }])
  }

  const apiPaths = {
    single: 'SendSMS?APIKey=YOUR_API_KEY&senderid=ABCBNK&channel=Promo&DCS=0&flashsms=0&number=91989XXXXXXX&text=test%20message&DLTTemplateId=approved-dlt-templateid&PEID=sender-entity-id&TMID=numeric-tmid',
    multiple: 'SendSMS?APIKey=YOUR_API_KEY&senderid=ABCBNK&channel=Promo&DCS=0&flashsms=0&number=91989XXXXXXX,91989XXXXXXY&text=test%20message&DLTTemplateId=approved-dlt-templateid&PEID=sender-entity-id&TMID=numeric-tmid',
    schedule: 'ScheduleSMS?APIKey=YOUR_API_KEY&senderid=ABCBNK&channel=Promo&DCS=0&flashsms=0&number=91989XXXXXXX&text=test%20message&time=2026-12-31%2023:59:00&DLTTemplateId=approved-dlt-templateid&PEID=sender-entity-id&TMID=numeric-tmid',
    group: 'SendGroupSMS?APIKey=YOUR_API_KEY&senderid=ABCBNK&channel=Promo&DCS=0&groupid=123&text=test%20message&DLTTemplateId=approved-dlt-templateid&PEID=sender-entity-id&TMID=numeric-tmid',
    tiny: 'SendTinySMS?APIKey=YOUR_API_KEY&senderid=ABCBNK&channel=Promo&DCS=0&number=91989XXXXXXX&text=test%20message&url=https://example.com/long-url&DLTTemplateId=approved-dlt-templateid&PEID=sender-entity-id&TMID=numeric-tmid',
    delivery: 'CheckDelivery?APIKey=YOUR_API_KEY&JobId=28660517143280-842',
    balance: 'CheckBalance?APIKey=YOUR_API_KEY'
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#f8fafc] p-4 lg:p-8 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-6">
            {['API Keys', 'Default APIs', 'Custom integrations', 'Webhooks'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`border-b-2 py-3.5 text-[14px] font-bold transition-colors ${
                  activeTab === t
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'API Keys' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-ink">API Keys</h2>
              <Button onClick={handleCreateApiKey}>+ Create API key</Button>
            </div>
            
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MiniIcon name="search" className="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50" placeholder="Search name or prefix..." />
              </div>
              <select className="w-48 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50">
                <option>Any status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                      <th className="py-4 px-6 w-1/4">Name</th>
                      <th className="py-4 px-6">Prefix</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Created</th>
                      <th className="py-4 px-6">Last used</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[13.5px]">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-500">No API keys found.</td>
                      </tr>
                    ) : (
                      apiKeys.map(key => (
                        <tr key={key.id} className="hover:bg-gray-50/30 transition">
                          <td className="py-4 px-6 font-medium text-ink">{key.name}</td>
                          <td className="py-4 px-6 font-mono text-gray-500">{key.prefix}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">
                              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {key.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{key.created}</td>
                          <td className="py-4 px-6 text-gray-500">{key.lastUsed}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <button className="flex items-center gap-1.5 text-gray-600 hover:text-ink transition font-semibold text-[13px]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                Reveal
                              </button>
                              <button 
                                onClick={() => setApiKeys(apiKeys.filter(k => k.id !== key.id))}
                                className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 transition font-semibold text-[13px]"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'Default APIs' && (
          <div className="space-y-6">
            <p className="text-[13.5px] leading-relaxed text-gray-600 max-w-4xl">
              Ready-to-use HTTP endpoints that mirror the conventions of common Indian SMS-aggregator portals.<br />
              Point your existing tooling at these URLs with your username/password or API key — no integration code change required.
            </p>

            <div className="flex flex-wrap items-center gap-2 bg-gray-100/70 p-1.5 rounded-2xl w-fit">
              {apiTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveApi(t.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition ${
                    activeApi === t.id
                      ? 'bg-white text-ink shadow-sm ring-1 ring-gray-200/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Endpoint</h3>
                <button className="flex items-center gap-1.5 text-[12px] font-bold text-brand-600 hover:text-brand-700">
                  <CopyIcon className="h-4 w-4" /> COPY URL
                </button>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-gray-50 p-4 text-[12.5px] leading-relaxed text-gray-800 border border-gray-100">
                <span className="font-bold text-gray-500">GET</span> https://api.sendnsg.io/api/v1/{apiPaths[activeApi]}
              </pre>

              <div className="flex items-center justify-between mt-6 mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sample Response</h3>
                <button className="flex items-center gap-1.5 text-[12px] font-bold text-brand-600 hover:text-brand-700">
                  <CopyIcon className="h-4 w-4" /> COPY
                </button>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-gray-50 p-4 text-[12.5px] leading-relaxed text-gray-800 border border-gray-100">
                {"{\n  \"ErrorCode\": \"000\",\n  \"ErrorMessage\": \"Done\",\n  \"JobId\": \"28660517143280-842\",\n  \"MessageData\": [\n    {\n      \"Number\": \"91989XXXXXXX\",\n      \"MessageId\": \"mvHdpSyS7U0s9hjxiqQlw\"\n    }\n  ]\n}"}
              </pre>
            </Card>

            <Card>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">Parameters</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-48">Parameter</th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-32">Required</th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] divide-y divide-gray-50">
                    {/* Account */}
                    <tr>
                      <td colSpan="3" className="pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/30">Account</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">APIKey</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">required</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Your API key (recommended). Create one under <b>Developer → API Keys</b>. Sends are billed to the key's owning account — never the parent. Required for programmatic use.</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">user</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Legacy username (use with password) — accepted for backwards compatibility with older client tooling. Prefer <code className="text-pink-600 bg-pink-50 px-1 rounded">APIKey</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">password</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Legacy password. Accepted alongside user; ignored when <code className="text-pink-600 bg-pink-50 px-1 rounded">APIKey</code> is set.</td>
                    </tr>

                    {/* Recipients */}
                    <tr>
                      <td colSpan="3" className="pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/30">Recipients</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">number</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">required</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Recipient mobile number with 91 country prefix.</td>
                    </tr>

                    {/* Message */}
                    <tr>
                      <td colSpan="3" className="pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/30">Message</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">senderid</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">required</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Approved sender header (6 characters for India DLT).</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">channel</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">required</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">One of <code className="text-pink-600 bg-pink-50 px-1 rounded">transactional</code>, <code className="text-pink-600 bg-pink-50 px-1 rounded">promotional</code>, or <code className="text-pink-600 bg-pink-50 px-1 rounded">otp</code>. Accepts shorthand: Promo, Trans.</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">text</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">required</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">The message body. URL-encode special characters; the wording must match the approved DLT template exactly (placeholders filled in).</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">DLTTemplateId</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Approved DLT content-template id (0x1401 TLV on the wire). Falls back to the sender ID's stored DLT id when omitted.</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">PEID</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Principal Entity ID registered on the operator's DLT registry (0x1400 TLV). Falls back to the sender ID's stored PEID when omitted.</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">TMID</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Numeric Telemarketer / PE-TM ID as registered on the operator's DLT portal. The portal computes the SHA-256 chain hash itself (over PEID, TMID) and ships <i>that</i> on the wire at TLV 0x1402 — you never need to pre-hash. Falls back to the sender ID's stored tmid, then the account-level TMID, when omitted.</td>
                    </tr>

                    {/* Optional */}
                    <tr>
                      <td colSpan="3" className="pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/30">Optional</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">DCS</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Data coding. 0 = GSM-7 (default, auto-detected). 8 = UCS-2 (for emoji, Devanagari, Tamil).</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">flashsms</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">0 = normal store-and-forward (default). 1 = flash (display once, do not store).</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-medium text-ink align-top">route</td>
                      <td className="py-4 align-top"><span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">optional</span></td>
                      <td className="py-4 text-gray-600 leading-relaxed align-top">Outbound bind <code>id(s)</code> — a Mongo object id, not a route name like "Trans". Pin the send to a specific route; comma-separated for fallback order. <b>Omit unless you know the bind id</b> — the portal otherwise auto-picks by channel.</td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'Custom integrations' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-ink">Custom Integrations</h2>
              <Button onClick={() => setShowCreateForm(true)}>+ Create integration</Button>
            </div>
            
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MiniIcon name="search" className="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50" placeholder="Search name or prefix..." />
              </div>
              <select className="w-48 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50">
                <option>Any status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            {customList.length === 0 ? (
              <Card>
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                    <MiniIcon name="integrations" className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink">No Custom Integrations</h3>
                  <p className="mt-1 text-[13px] text-gray-500">You haven't set up any custom integrations or webhooks yet.</p>
                  <Button className="mt-6 mx-auto" onClick={() => setShowCreateForm(true)}>Create integration</Button>
                </div>
              </Card>
            ) : (
              <Table headers={['Name', 'Channel', 'Sender ID', 'Status', 'Created']}>
                {customList.map(item => (
                  <tr key={item.id}>
                    <Td className="font-semibold text-ink">{item.name}</Td>
                    <Td>{item.channel}</Td>
                    <Td>{item.senderId}</Td>
                    <Td>{item.status}</Td>
                    <Td>{fmtDate(item.created)}</Td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        )}

        {activeTab === 'Webhooks' && (
          <div className="space-y-6 pt-2">
            <Card>
              <h2 className="text-[16px] font-bold text-ink mb-4">Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Webhook URL</label>
                  <input type="text" className={inputCls} placeholder="https://example.com/webhook" />
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <Button>Save</Button>
                  <Button variant="secondary">Rotate secret</Button>
                  <Button variant="secondary" className="opacity-50" disabled>Send test event</Button>
                  <button className="rounded-lg bg-rose-400/10 px-4 py-2 text-[13px] font-bold text-rose-500 transition hover:bg-rose-400/20 ml-auto sm:ml-0">
                    Delete webhook
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-[16px] font-bold text-ink mb-6">Recent attempts</h2>
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="pb-3 w-40">When</th>
                      <th className="pb-3 w-40">Event</th>
                      <th className="pb-3 min-w-[200px]">Message</th>
                      <th className="pb-3 w-32">Status</th>
                      <th className="pb-3 w-32">Duration</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="py-12 text-center text-[13px] text-gray-500">
                No attempts in last 7 days.
              </div>
            </Card>

            <Card>
              <h2 className="text-[16px] font-bold text-ink mb-4">Verify signatures</h2>
              <div className="flex gap-1 mb-4 rounded-lg bg-gray-100/70 p-1 w-fit">
                {['Node.js', 'Python'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setVerifyLang(lang)}
                    className={`rounded-md px-4 py-1.5 text-[12.5px] font-semibold transition ${
                      verifyLang === lang ? 'bg-white text-ink shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <pre className="overflow-x-auto rounded-xl bg-gray-50 p-4 text-[12.5px] leading-relaxed text-gray-600 border border-gray-100">
{verifyLang === 'Node.js' ? `const crypto = require("crypto");
function verify(body, sig, ts, secret) {
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(ts + "." + body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}` : `import hmac
import hashlib

def verify(body, sig, ts, secret):
    mac = hmac.new(secret.encode(), (ts + "." + body).encode(), hashlib.sha256)
    expected = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(sig, expected)`}
              </pre>
            </Card>
          </div>
        )}

        {/* Modal Pop-up for New Integration */}
        <Modal open={showCreateForm} onClose={() => setShowCreateForm(false)} title="New integration" width="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            {/* Left Column: Form */}
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Integration name</label>
                <input type="text" className={inputCls} placeholder="e.g. otp-login" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Channel</label>
                  <select className={inputCls}>
                    <option>transactional</option>
                    <option>promotional</option>
                    <option>otp</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <select className={inputCls}>
                    <option>IN</option>
                    <option>US</option>
                    <option>UK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Sender ID</label>
                <select className={inputCls}>
                  <option>Select...</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Template</label>
                <select className={inputCls}>
                  <option>Select...</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Priority</label>
                  <select className={inputCls}>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>RPS limit (optional)</label>
                  <input type="text" className={inputCls} placeholder="default 10" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Webhook URL (optional)</label>
                <input type="text" className={inputCls} placeholder="https://yourapp.example.com/sms/webhook" />
                <p className={hintCls}>Override your account-level webhook for sends through this integration.</p>
              </div>

              <div>
                <label className={labelCls}>TMID (optional)</label>
                <input type="text" className={inputCls} placeholder="DLT telemarketer ID" />
                <p className={hintCls}>Override the account-level TMID for sends through this integration. Sent on the wire as SMPP optional TLV 0x1403. Falls back to your profile TMID when blank.</p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)}>Create integration</Button>
                <Button variant="secondary" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="hidden md:block">
              <div className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Live Preview</h3>
                <pre className="rounded-xl bg-gray-50/80 p-5 text-[13.5px] font-mono text-ink border border-gray-100 min-h-[160px]">
                  (select a template to preview)
                </pre>
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  )
}
