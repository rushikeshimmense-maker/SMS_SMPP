import React, { useState, useEffect } from 'react'
import { PageHeader } from '../components/AppLayout.jsx'
import { Button, Card, Field, inputCls, Table, Td, Chip, Modal } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PlusIcon, MiniIcon } from '../components/Icons.jsx'

const MOCK_TODAY_CAMPAIGNS = {
  'user1': [
    { id: 'CAMP_101', name: 'Diwali_Promo', total: 400000, delivered: 200000, failed: 100000, undelivered: 50000, pending: 50000, status: 'Completed' },
    { id: 'CAMP_102', name: 'OTP_Morning', total: 15000, delivered: 10000, failed: 2000, undelivered: 1000, pending: 2000, status: 'Running' }
  ],
  'user2': [
    { id: 'CAMP_103', name: 'Weekend_Sale', total: 100000, delivered: 45000, failed: 30000, undelivered: 15000, pending: 10000, status: 'Paused' }
  ]
}

const INITIAL_RULES = [
  { id: 1, target: 'Global (All Users)', minSize: 10000, cutPercent: 15, source: 'Failed + Undelivered', status: 'Active', protocol: 'SMPP Only' },
  { id: 2, target: 'Acme Corp (@acmecorp)', minSize: 5000, cutPercent: 20, source: 'Pending + Failed', status: 'Paused', protocol: 'API Only' }
]

export default function Settings() {
  const toast = useToast()
  
  // Tabs: Manual vs Auto
  const tabs = ['Manual Live Cutting', 'Auto-Cutting Engine']
  const [activeTab, setActiveTab] = useState('Manual Live Cutting')
  
  // --- MANUAL CUTTING STATE ---
  const [cutUser, setCutUser] = useState('')
  const [liveCampaigns, setLiveCampaigns] = useState([])
  const [cutInputs, setCutInputs] = useState({})
  
  // Advanced: View Modes
  const [viewMode, setViewMode] = useState('campaign') // 'campaign' | 'overall'
  const [globalCut, setGlobalCut] = useState({ source: 'auto', amount: '' })

  // --- AUTO CUTTING STATE ---
  const [autoRules, setAutoRules] = useState(INITIAL_RULES)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [newRule, setNewRule] = useState({ target: 'Global (All Users)', minSize: '10000', cutPercent: '20', source: 'Failed + Undelivered', protocol: 'All Sources' })

  useEffect(() => {
    if (cutUser) {
      setLiveCampaigns(MOCK_TODAY_CAMPAIGNS[cutUser] || [])
      setCutInputs({})
      setGlobalCut({ source: 'auto', amount: '' })
    } else {
      setLiveCampaigns([])
    }
  }, [cutUser])

  // Compute Overall Stats
  const overallStats = liveCampaigns.reduce((acc, c) => ({
    total: acc.total + c.total,
    delivered: acc.delivered + c.delivered,
    failed: acc.failed + c.failed,
    undelivered: acc.undelivered + c.undelivered,
    pending: acc.pending + c.pending
  }), { total: 0, delivered: 0, failed: 0, undelivered: 0, pending: 0 })

  const handleApplyCut = (camp) => {
    const inputState = cutInputs[camp.id] || {}
    const amount = parseInt(inputState.amount)
    const source = inputState.source || 'auto'

    if (!amount || isNaN(amount) || amount <= 0) return toast('Enter a valid amount to convert', 'error')
    
    if (source === 'failed' && amount > camp.failed) return toast('Not enough Failed messages to cut from', 'error')
    if (source === 'undelivered' && amount > camp.undelivered) return toast('Not enough Undelivered messages to cut from', 'error')
    if (source === 'pending' && amount > camp.pending) return toast('Not enough Pending messages to cut from', 'error')
    
    if (source === 'auto') {
      const maxAvailable = camp.failed + camp.undelivered + camp.pending;
      if (amount > maxAvailable) return toast('Cannot exceed available non-delivered (' + maxAvailable + ')', 'error')
    }

    setLiveCampaigns(prev => prev.map(c => {
      if (c.id === camp.id) {
        let newFailed = c.failed
        let newUndel = c.undelivered
        let newPending = c.pending

        if (source === 'failed') { newFailed -= amount } 
        else if (source === 'undelivered') { newUndel -= amount } 
        else if (source === 'pending') { newPending -= amount } 
        else {
          let remAmount = amount
          if (newFailed >= remAmount) { newFailed -= remAmount; remAmount = 0 } else { remAmount -= newFailed; newFailed = 0 }
          if (remAmount > 0) { if (newUndel >= remAmount) { newUndel -= remAmount; remAmount = 0 } else { remAmount -= newUndel; newUndel = 0 } }
          if (remAmount > 0) { if (newPending >= remAmount) { newPending -= remAmount; remAmount = 0 } else { remAmount -= newPending; newPending = 0 } }
        }
        return { ...c, delivered: c.delivered + amount, failed: newFailed, undelivered: newUndel, pending: newPending }
      }
      return c
    }))
    setCutInputs(prev => ({ ...prev, [camp.id]: { source: 'auto', amount: '' } }))
    toast('Applied fake DLR: +' + amount + ' Delivered for ' + camp.name, 'success')
  }

  const handleApplyGlobalCut = () => {
    const amount = parseInt(globalCut.amount)
    const source = globalCut.source || 'auto'

    if (!amount || isNaN(amount) || amount <= 0) return toast('Enter a valid amount to convert', 'error')
    
    if (source === 'failed' && amount > overallStats.failed) return toast('Not enough Overall Failed messages', 'error')
    if (source === 'undelivered' && amount > overallStats.undelivered) return toast('Not enough Overall Undelivered messages', 'error')
    if (source === 'pending' && amount > overallStats.pending) return toast('Not enough Overall Pending messages', 'error')
    
    if (source === 'auto') {
      const maxAvailable = overallStats.failed + overallStats.undelivered + overallStats.pending;
      if (amount > maxAvailable) return toast('Cannot exceed available non-delivered (' + maxAvailable + ')', 'error')
    }

    setLiveCampaigns(prev => {
      let remaining = amount;
      return prev.map(c => {
        if (remaining <= 0) return c;
        
        let availableInThisCamp = c.failed + c.undelivered + c.pending;
        if (source === 'failed') availableInThisCamp = c.failed;
        else if (source === 'undelivered') availableInThisCamp = c.undelivered;
        else if (source === 'pending') availableInThisCamp = c.pending;

        let cutFromThis = Math.min(remaining, availableInThisCamp);
        if (cutFromThis <= 0) return c;

        remaining -= cutFromThis;

        let newFailed = c.failed
        let newUndel = c.undelivered
        let newPending = c.pending

        if (source === 'failed') { newFailed -= cutFromThis } 
        else if (source === 'undelivered') { newUndel -= cutFromThis } 
        else if (source === 'pending') { newPending -= cutFromThis } 
        else {
          let remAmt = cutFromThis
          if (newFailed >= remAmt) { newFailed -= remAmt; remAmt = 0 } else { remAmt -= newFailed; newFailed = 0 }
          if (remAmt > 0) { if (newUndel >= remAmt) { newUndel -= remAmt; remAmt = 0 } else { remAmt -= newUndel; newUndel = 0 } }
          if (remAmt > 0) { if (newPending >= remAmt) { newPending -= remAmt; remAmt = 0 } else { remAmt -= newPending; newPending = 0 } }
        }

        return { ...c, delivered: c.delivered + cutFromThis, failed: newFailed, undelivered: newUndel, pending: newPending }
      })
    })

    setGlobalCut({ source: 'auto', amount: '' })
    toast('Applied Global Fake DLR: +' + amount + ' Delivered across campaigns', 'success')
  }

  const handleSaveRule = () => {
    if (!newRule.minSize || !newRule.cutPercent) return toast('Please fill all fields', 'error')
    setAutoRules([...autoRules, { id: Date.now(), ...newRule, status: 'Active' }])
    setShowRuleModal(false)
    toast('Auto-cutting rule activated successfully', 'success')
  }

  const toggleRule = (id) => {
    setAutoRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r))
    toast('Rule status updated', 'success')
  }

  return (
    <div>
      <PageHeader
        title="SMS Report Manipulation"
        sub="Advanced DLR Cutting & Fake Delivery Engine"
      />

      <div className="mb-5 flex flex-wrap gap-1.5 border-b border-gray-100 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={'rounded-full px-4 py-2 text-[13px] font-bold transition ' + (activeTab === t ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900')}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Manual Live Cutting' && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-[18px] font-extrabold tracking-tight text-ink">Live Report Manipulation</h2>
                <p className="text-[13px] text-gray-500 mt-1">
                  Select a user to view today's campaigns. Convert <b className="text-red-400">Failed</b>, <b className="text-amber-400">Undelivered</b>, or <b className="text-blue-400">Pending</b> into <b className="text-emerald-500">Delivered</b> instantly.
                </p>
              </div>
              <div className="w-full md:w-72">
                <select className={inputCls} value={cutUser} onChange={e => setCutUser(e.target.value)}>
                  <option value="">-- Select User --</option>
                  <option value="user1">Acme Corp (@acmecorp)</option>
                  <option value="user2">Global Reseller (@globalres)</option>
                </select>
              </div>
            </div>
          </Card>

          {cutUser && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <h3 className="text-[14px] font-bold text-ink flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Cutting Dashboard
                </h3>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  <button 
                    onClick={() => setViewMode('campaign')} 
                    className={'px-3 py-1.5 text-[12px] font-bold rounded ' + (viewMode === 'campaign' ? 'bg-white shadow text-ink' : 'text-gray-500 hover:text-ink')}
                  >
                    Campaign-Wise
                  </button>
                  <button 
                    onClick={() => setViewMode('overall')} 
                    className={'px-3 py-1.5 text-[12px] font-bold rounded ' + (viewMode === 'overall' ? 'bg-white shadow text-ink' : 'text-gray-500 hover:text-ink')}
                  >
                    User-Wise (Overall)
                  </button>
                </div>
              </div>
              
              {viewMode === 'campaign' && (
                <div className="-mx-5 -mb-5 overflow-x-auto">
                  <Table headers={['Campaign', 'Status', 'Delivery %', 'Live Stats', 'Apply Fake DLR']}>
                    {liveCampaigns.map(c => {
                      const delPct = ((c.delivered / c.total) * 100).toFixed(1)
                      return (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition border-b border-gray-100 last:border-0">
                          <Td>
                            <div className="font-bold text-ink">{c.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{c.protocol}</span>
                              <div className="text-[11px] font-mono text-gray-400">{c.id}</div>
                            </div>
                          </Td>
                          <Td>
                            <Chip status={c.status === 'Completed' ? 'Approved' : 'Pending'}>{c.status}</Chip>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2 w-32">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: delPct + '%' }}></div>
                              </div>
                              <span className="text-[12px] font-bold text-gray-700">{delPct}%</span>
                            </div>
                          </Td>
                          <Td>
                            <div className="flex gap-3 text-[11px] whitespace-nowrap">
                              <div className="bg-gray-50 px-2 py-1 rounded">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Total</div>
                                <div className="font-semibold">{c.total.toLocaleString()}</div>
                              </div>
                              <div className="bg-emerald-50 px-2 py-1 rounded">
                                <div className="text-emerald-600 uppercase font-bold text-[9px] mb-0.5">Deliv</div>
                                <div className="font-bold">{c.delivered.toLocaleString()}</div>
                              </div>
                              <div className="bg-red-50 px-2 py-1 rounded">
                                <div className="text-red-500 uppercase font-bold text-[9px] mb-0.5">Fail</div>
                                <div className="font-bold">{c.failed.toLocaleString()}</div>
                              </div>
                              <div className="bg-amber-50 px-2 py-1 rounded">
                                <div className="text-amber-500 uppercase font-bold text-[9px] mb-0.5">Undel</div>
                                <div className="font-bold">{c.undelivered.toLocaleString()}</div>
                              </div>
                              <div className="bg-blue-50 px-2 py-1 rounded">
                                <div className="text-blue-500 uppercase font-bold text-[9px] mb-0.5">Pend</div>
                                <div className="font-bold">{c.pending.toLocaleString()}</div>
                              </div>
                            </div>
                          </Td>
                          <Td>
                            <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all w-[240px]">
                              <select 
                                className="bg-gray-50 border-r border-gray-200 text-[11px] font-bold text-gray-600 px-2 py-1.5 outline-none cursor-pointer w-[110px]"
                                value={cutInputs[c.id]?.source || 'auto'}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), source: e.target.value }})}
                                title="Select source to cut from"
                              >
                                <option value="auto">🪄 Cut: Smart</option>
                                <option value="failed">🔴 Cut: Failed</option>
                                <option value="undelivered">🟡 Cut: Undeliv</option>
                                <option value="pending">🔵 Cut: Pending</option>
                              </select>
                              <input 
                                type="number" 
                                min="1" 
                                placeholder="Vol..."
                                className="flex-1 w-full px-2 py-1.5 text-[12px] font-semibold text-ink outline-none"
                                value={cutInputs[c.id]?.amount || ''}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), amount: e.target.value }})}
                              />
                              <button 
                                onClick={() => handleApplyCut(c)}
                                className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition-colors"
                              >
                                Cut
                              </button>
                            </div>
                          </Td>
                        </tr>
                      )
                    })}
                    {!liveCampaigns.length && (
                      <tr><Td colSpan={5} className="text-center py-8 text-gray-400">No campaigns found for today.</Td></tr>
                    )}
                  </Table>
                </div>
              )}

              {viewMode === 'overall' && (
                <div className="py-2">
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-6 text-center">
                    <h4 className="text-[12px] font-bold uppercase tracking-widest text-brand-600 mb-2">Overall Delivery Rate (Today)</h4>
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-[32px] font-black text-brand-700">
                        {overallStats.total > 0 ? ((overallStats.delivered / overallStats.total) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="w-full max-w-lg h-3 bg-brand-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: (overallStats.total > 0 ? ((overallStats.delivered / overallStats.total) * 100) : 0) + '%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 mb-8">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Total Sent</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center shadow-sm shadow-emerald-100/50">
                      <div className="text-emerald-600 uppercase font-bold text-[10px] tracking-wider mb-1">Delivered</div>
                      <div className="text-[18px] font-black text-emerald-600">{overallStats.delivered.toLocaleString()}</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                      <div className="text-red-500 uppercase font-bold text-[10px] tracking-wider mb-1">Failed</div>
                      <div className="text-[18px] font-black text-red-600">{overallStats.failed.toLocaleString()}</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                      <div className="text-amber-500 uppercase font-bold text-[10px] tracking-wider mb-1">Undelivered</div>
                      <div className="text-[18px] font-black text-amber-600">{overallStats.undelivered.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                      <div className="text-blue-500 uppercase font-bold text-[10px] tracking-wider mb-1">Pending</div>
                      <div className="text-[18px] font-black text-blue-600">{overallStats.pending.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-[14px] font-extrabold text-ink mb-4">Apply Global Fake DLR</h3>
                    <p className="text-[12px] text-gray-500 mb-4 max-w-2xl">
                      Enter the total amount of messages you want to convert to "Delivered" for this user today. The system will automatically distribute this cut across their active campaigns sequentially.
                    </p>
                    <div className="flex items-center rounded-xl border-2 border-brand-100 bg-white shadow-sm overflow-hidden focus-within:border-brand-500 transition-all w-full max-w-lg">
                      <select 
                        className="bg-brand-50/50 border-r border-brand-100 text-[13px] font-bold text-brand-800 px-4 py-3 outline-none cursor-pointer w-[150px]"
                        value={globalCut.source}
                        onChange={e => setGlobalCut({...globalCut, source: e.target.value})}
                      >
                        <option value="auto">🪄 Smart Cut</option>
                        <option value="failed">🔴 From Failed</option>
                        <option value="undelivered">🟡 From Undeliv</option>
                        <option value="pending">🔵 From Pending</option>
                      </select>
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="Enter total volume to cut..."
                        className="flex-1 w-full px-4 py-3 text-[14px] font-bold text-ink outline-none"
                        value={globalCut.amount}
                        onChange={e => setGlobalCut({...globalCut, amount: e.target.value})}
                      />
                      <button 
                        onClick={handleApplyGlobalCut}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 text-[13px] font-extrabold uppercase tracking-widest transition-colors"
                      >
                        Apply Global Cut
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'Auto-Cutting Engine' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] font-extrabold tracking-tight text-ink">Auto-Cutting Rules</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Configure smart rules to automatically inject fake DLRs based on campaign volume.
              </p>
            </div>
            <Button onClick={() => setShowRuleModal(true)}>
              <PlusIcon className="w-4 h-4" /> Create Rule
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table headers={['Target User', 'Traffic Source', 'Condition', 'Action (Cut %)', 'Source To Cut', 'Status', 'Actions']}>
              {autoRules.map(r => (
                <tr key={r.id}>
                  <Td className="font-bold text-ink">{r.target}</Td>
                  <Td><span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{r.protocol}</span></Td>
                  <Td>Size &gt; {r.minSize.toLocaleString()}</Td>
                  <Td>
                    <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-[12px]">+{r.cutPercent}% Delivered</span>
                  </Td>
                  <Td className="text-[13px] text-gray-500">{r.source}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className={'w-2.5 h-2.5 rounded-full ' + (r.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300')}></div>
                      <span className="text-[12px] font-bold text-gray-700">{r.status}</span>
                    </div>
                  </Td>
                  <Td>
                    <button 
                      onClick={() => toggleRule(r.id)}
                      className={'text-[12px] font-bold underline ' + (r.status === 'Active' ? 'text-amber-600' : 'text-brand-600')}
                    >
                      {r.status === 'Active' ? 'Pause Rule' : 'Activate Rule'}
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>
      )}

      {/* Auto Rule Modal */}
      <Modal open={showRuleModal} onClose={() => setShowRuleModal(false)} title="New Auto-Cutting Rule" width="max-w-md">
        <div className="space-y-4">
          <Field label="Target Application">
            <select className={inputCls} value={newRule.target} onChange={e => setNewRule({...newRule, target: e.target.value})}>
              <option value="Global (All Users)">Global (All Users)</option>
              <option value="Acme Corp (@acmecorp)">Acme Corp (@acmecorp)</option>
              <option value="Global Reseller (@globalres)">Global Reseller (@globalres)</option>
            </select>
          </Field>
          <Field label="Traffic Route (Protocol)">
            <select className={inputCls} value={newRule.protocol} onChange={e => setNewRule({...newRule, protocol: e.target.value})}>
              <option value="All Sources">All Sources (SMPP + API + Web)</option>
              <option value="SMPP Only">SMPP Bind Traffic Only</option>
              <option value="API Only">HTTP API Traffic Only</option>
              <option value="Web Panel Only">Web Panel Campaigns Only</option>
            </select>
          </Field>
          <Field label="Minimum Campaign Size" hint="Rule applies only if campaign exceeds this volume">
            <input type="number" className={inputCls} placeholder="e.g. 10000" value={newRule.minSize} onChange={e => setNewRule({...newRule, minSize: e.target.value})} />
          </Field>
          <Field label="Fake Delivery Percentage" hint="% of non-delivered to convert to Delivered">
            <input type="number" className={inputCls} placeholder="e.g. 20" value={newRule.cutPercent} onChange={e => setNewRule({...newRule, cutPercent: e.target.value})} />
          </Field>
          <Field label="Prioritize Source">
            <select className={inputCls} value={newRule.source} onChange={e => setNewRule({...newRule, source: e.target.value})}>
              <option value="Failed + Undelivered">Failed & Undelivered First</option>
              <option value="Pending + Failed">Pending & Failed First</option>
              <option value="All Equal (Randomized)">Distribute Equally</option>
            </select>
          </Field>
          <Button onClick={handleSaveRule} className="w-full">Activate Auto-Rule</Button>
        </div>
      </Modal>

    </div>
  )
}
