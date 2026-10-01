import React, { useState, useEffect } from 'react'
import { PlusIcon, UserIcon, BoltIcon, CopyIcon } from '../components/Icons.jsx'
import { Modal } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'

export default function SmppCenter() {
  const toast = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [pwdMode, setPwdMode] = useState('auto')
  const [editingAcc, setEditingAcc] = useState(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [userSearchText, setUserSearchText] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [ipMode, setIpMode] = useState('open')
  const [bindMode, setBindMode] = useState('trx')
  
  // Dashboard Modal State
  const [viewingAcc, setViewingAcc] = useState(null)
  const [viewDetailsAcc, setViewDetailsAcc] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [revealedPasswords, setRevealedPasswords] = useState({})
  
  const [accounts, setAccounts] = useState([
    { id: 1, client: 'Global Reseller', systemId: 'GLOBAL_01', ip: 'Any (0.0.0.0/0)', tps: 100, sessions: 5, status: 'Active (2 Bound)', route: 'Airtel Primary' },
    { id: 2, client: 'Local Corp', systemId: 'LC_MKT', ip: '203.0.113.45', tps: 10, sessions: 1, status: 'Paused', route: 'Vodafone Backup' },
    { id: 3, client: 'Alpha Marketing', systemId: 'ALPH_02', ip: '198.51.100.1', tps: 20, sessions: 2, status: 'Active (0 Bound)', route: 'Karix Route' }
  ])

  const tcpSessions = [
    { id: 'bind_11a', bindType: 'TRX', local: '192.168.1.10:2775', remote: '203.0.113.45:49102', state: 'BOUND', uptime: '5h 12m' },
    { id: 'bind_11b', bindType: 'TRX', local: '192.168.1.10:2775', remote: '203.0.113.45:49103', state: 'BOUND', uptime: '5h 11m' },
  ]

  const filteredAccounts = accounts.filter(acc => 
    acc.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
    acc.systemId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lblCls = "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5"
  const inpCls = "w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"

  const handleEdit = (acc, e) => {
    e.stopPropagation();
    setEditingAcc(acc);
    setIsEditModalOpen(true);
  }
  
  const handleView = (acc) => {
    setViewingAcc(acc);
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setRevealedPasswords({});
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#f8fafc] p-4 lg:p-6 pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-tight">SMPP Center</h1>
          <p className="text-[13px] text-gray-500 mt-1">Issue and monitor SMPP credentials for your Users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search Client or System ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[260px] rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-[13px] text-ink shadow-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button 
            onClick={() => { setEditingAcc(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md hover:bg-brand-500 transition shrink-0"
          >
            <PlusIcon className="h-4 w-4" /> Create SMPP Account
          </button>
        </div>
      </div>

      {/* Main Account List (Table Layout like Gateway Center) */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm mb-6">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="p-4">Client Name</th>
              <th className="p-4">System ID</th>
              <th className="p-4">Allowed IPs</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">TPS Limit</th>
              <th className="p-4 text-center">Sessions</th>
              <th className="p-4">Backend Route</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500 font-bold text-[13px]">
                  No SMPP accounts found.
                </td>
              </tr>
            ) : (
              filteredAccounts.map(acc => (
                <tr key={acc.id} className="transition cursor-pointer hover:bg-brand-50/30 group" onClick={() => handleView(acc)}>
                  <td className="p-4 flex items-center gap-2">
                    <span onClick={(e) => { e.stopPropagation(); setViewDetailsAcc(acc); }} className="text-[13px] font-bold text-brand-600 group-hover:underline underline-offset-2 decoration-brand-300 hover:text-brand-700">
                        {acc.client}
                      </span>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-[13px] font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block">{acc.systemId}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-[12px] text-gray-600">
                      {acc.ip}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${acc.status.includes('Active') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${acc.status.includes('Active') ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      {acc.status}
                    </div>
                  </td>
                  <td className="p-4 text-center text-[13px] font-bold text-gray-700">
                    {acc.tps}
                  </td>
                  <td className="p-4 text-center text-[13px] font-bold text-gray-700">
                    {acc.sessions}
                  </td>
                  <td className="p-4">
                    <span className="text-[12px] font-bold text-ink bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      {acc.route}
                    </span>
                  </td>
                  <td className="p-4">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {/* Edit */}
                        <button onClick={(e) => handleEdit(acc, e)} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 shadow-sm transition" title="Edit">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        
                        {/* Stop connection */}
                          <button onClick={(e) => { e.stopPropagation(); toast('Connection stopped successfully.', 'success') }} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 shadow-sm transition" title="Stop connection">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>
                          </button>
                        
                        {/* Reveal password */}
                        <button onClick={(e) => { e.stopPropagation(); setRevealedPasswords(prev => ({...prev, [acc.id]: 'xs_' + acc.systemId.toLowerCase() + '_89'})); }} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 shadow-sm transition relative group" title="Reveal password">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                          {revealedPasswords[acc.id] && (
                             <div 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 navigator.clipboard.writeText(revealedPasswords[acc.id]); 
                                 toast('Password copied to clipboard.', 'success'); 
                               }} 
                               className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 cursor-pointer text-emerald-400 font-mono text-[12px] font-bold rounded-lg shadow-xl border border-gray-700 flex items-center gap-2 group/tooltip"
                             >
                                {revealedPasswords[acc.id]}
                                <svg className="w-3.5 h-3.5 text-gray-500 group-hover/tooltip:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 group-hover/tooltip:border-t-gray-800"></div>
                             </div>
                          )}
                        </button>
                        {/* Restart */}
                        <button onClick={(e) => { e.stopPropagation(); toast('Connection restarted successfully.', 'success') }} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 shadow-sm transition" title="Restart">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                        
                        {/* Delete */}
                        <button onClick={(e) => { e.stopPropagation(); toast('Account deleted successfully.', 'success') }} className="rounded-xl border border-red-100 bg-red-50/50 p-2 text-red-500 hover:bg-red-100 hover:text-red-700 shadow-sm transition" title="Delete">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
        {/* VIEW DETAILS & PDU MODAL */}
        {viewDetailsAcc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setViewDetailsAcc(null)}>
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-gray-100" onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div className="bg-white px-7 py-6 border-b border-gray-100 flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink tracking-tight">{viewDetailsAcc.client}</h2>
                  <p className="text-[13px] text-gray-500 mt-1">Connection details and live PDU log for this bind.</p>
                </div>
                <button onClick={() => setViewDetailsAcc(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              {/* Body */}
              <div className="p-7 overflow-y-auto max-h-[75vh] bg-white">
                <div className="grid grid-cols-2 gap-y-7 gap-x-4 mb-8">
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Host</h4>
                    <p className="text-[13px] font-mono font-bold text-gray-800">smpp.panel.com:2775</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">System_ID</h4>
                    <p className="text-[13px] font-bold text-gray-800">{viewDetailsAcc.systemId}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Channel</h4>
                    <p className="text-[13px] font-bold text-gray-800 capitalize">Transactional</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Status</h4>
                    <p className="text-[13px] font-bold text-emerald-600">{viewDetailsAcc.status}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Throttle</h4>
                    <p className="text-[13px] font-bold text-gray-800">{viewDetailsAcc.tps} TPS</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Max Sessions</h4>
                    <p className="text-[13px] font-bold text-gray-800">{viewDetailsAcc.sessions}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Allowed IPs</h4>
                    <p className="text-[13px] font-mono font-bold text-gray-800">{viewDetailsAcc.ip}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-600">Live PDU Log</h4>
                  </div>
                  <div className="bg-[#0f111a] p-4 h-48 overflow-y-auto font-mono text-[12px]">
                    <div className="text-gray-400 animate-pulse">Waiting for events...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE CONNECTIONS MODAL */}
        {viewingAcc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setViewingAcc(null)}>
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
              
              {/* Header (Restored to original giant modal style) */}
              <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink tracking-tight">{viewingAcc.client}</h2>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                    <span>System ID: <span className="font-mono bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">{viewingAcc.systemId}</span></span>
                    <span>&bull;</span>
                    <span>Route: {viewingAcc.route}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[12px] ${viewingAcc.status.includes('Active') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${viewingAcc.status.includes('Active') ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {viewingAcc.status}
                  </span>
                  
                  <button onClick={() => setViewingAcc(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>
              
              {/* Body (Advanced Live Connections) */}
              <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
                
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 mb-2">Active Sessions</h4>
                    <p className="text-[20px] font-mono font-bold text-ink">
                      {viewingAcc.status.includes('0') ? '0' : '2'} / <span className="text-gray-400">{viewingAcc.sessions}</span>
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Submitted (24H)</h4>
                    <p className="text-[20px] font-mono font-bold text-ink">14,205</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Delivered (24H)</h4>
                    <p className="text-[20px] font-mono font-bold text-ink">13,982</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Failed (24H)</h4>
                    <p className="text-[20px] font-mono font-bold text-ink">223</p>
                  </div>
                </div>

                {/* ACTIVE SESSIONS TABLE */}
                <div className="mb-10">
                  <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-ink mb-3">Active Sessions</h3>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-extrabold uppercase text-gray-500">
                          <th className="p-3 pl-5">Session</th>
                          <th className="p-3">Peer IP</th>
                          <th className="p-3">Bound Since</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-[13px]">
                        {viewingAcc.status.includes('0') ? (
                          <tr>
                            <td colSpan="3" className="p-8 text-center text-gray-500 font-medium">
                              No active sessions. The bind isn't currently connected.
                            </td>
                          </tr>
                        ) : (
                          <>
                            <tr className="hover:bg-gray-50/50 transition">
                              <td className="p-3 pl-5 font-mono font-bold text-gray-800">bind_11a_trx</td>
                              <td className="p-3 font-mono text-gray-600">203.0.113.45</td>
                              <td className="p-3 text-gray-600">5h 12m</td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 transition">
                              <td className="p-3 pl-5 font-mono font-bold text-gray-800">bind_11b_trx</td>
                              <td className="p-3 font-mono text-gray-600">203.0.113.45</td>
                              <td className="p-3 text-gray-600">5h 11m</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RECENT EVENTS TABLE */}
                <div>
                  <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-ink mb-3">Recent Events (Auth + Lifecycle, Last 7 Days)</h3>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-extrabold uppercase text-gray-500">
                          <th className="p-3 pl-5">When</th>
                          <th className="p-3">Event</th>
                          <th className="p-3">Peer IP</th>
                          <th className="p-3">Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-[13px]">
                        <tr className="hover:bg-gray-50/50 transition">
                          <td className="p-3 pl-5 font-mono text-gray-500">9/23/2026, 9:39:43 AM</td>
                          <td className="p-3">
                            <span className="inline-block px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold text-[11px]">session_open</span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">161.248.26.125</td>
                          <td className="p-3 text-gray-400">—</td>
                        </tr>
                        <tr className="hover:bg-gray-50/50 transition">
                          <td className="p-3 pl-5 font-mono text-gray-500">9/23/2026, 9:39:41 AM</td>
                          <td className="p-3">
                            <span className="inline-block px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold text-[11px]">session_open</span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">161.248.26.125</td>
                          <td className="p-3 text-gray-400">—</td>
                        </tr>
                        <tr className="hover:bg-red-50/50 bg-red-50/30 transition">
                          <td className="p-3 pl-5 font-mono text-gray-500">9/23/2026, 9:32:10 AM</td>
                          <td className="p-3">
                            <span className="inline-block px-2.5 py-1 rounded-full border border-brand-200 bg-brand-50 text-brand-600 font-bold text-[11px]">auth_failed</span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">103.112.45.99</td>
                          <td className="p-3 font-medium text-brand-600">Invalid password</td>
                        </tr>
                        <tr className="hover:bg-red-50/50 bg-red-50/30 transition">
                          <td className="p-3 pl-5 font-mono text-gray-500">9/23/2026, 9:31:05 AM</td>
                          <td className="p-3">
                            <span className="inline-block px-2.5 py-1 rounded-full border border-brand-200 bg-brand-50 text-brand-600 font-bold text-[11px]">auth_failed</span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">8.8.8.8</td>
                          <td className="p-3 font-medium text-brand-600">IP not allow-listed</td>
                        </tr>
                        <tr className="hover:bg-gray-50/50 transition">
                          <td className="p-3 pl-5 font-mono text-gray-500">9/22/2026, 4:15:00 PM</td>
                          <td className="p-3">
                            <span className="inline-block px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold text-[11px]">session_close</span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">161.248.26.125</td>
                          <td className="p-3 text-gray-600">Client disconnected</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}



      {/* Add Client SMPP Modal */}
      <Modal open={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingAcc(null); }} title="Create inbound SMPP bind" width="max-w-3xl">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 mt-2">
            
            {/* Custom Searchable User Dropdown */}
            <div className="sm:col-span-2 border-b border-gray-100 pb-5 relative" onMouseLeave={() => setDropdownOpen(false)}>
              <label className={lblCls}>Link to Panel User <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text"
                  className={inpCls}
                  placeholder="Type to search user by name or ID..."
                  value={userSearchText}
                  onChange={(e) => { setUserSearchText(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                />
                <svg className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-[65px] z-50 max-h-[200px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
                  {['Global Reseller (GLOBAL_01)', 'Local Corp (LC_MKT)', 'Alpha Marketing (ALPH_02)', 'Test User 1 (TEST_01)', 'Test User 2 (TEST_02)']
                    .filter(u => u.toLowerCase().includes(userSearchText.toLowerCase()))
                    .map((u, i) => (
                      <div 
                        key={i} 
                        onClick={() => { setUserSearchText(u); setDropdownOpen(false); }}
                        className="cursor-pointer rounded-lg px-3 py-2 text-[13px] text-ink hover:bg-brand-50 hover:text-brand-700"
                      >
                        {u}
                      </div>
                  ))}
                  {['Global Reseller (GLOBAL_01)', 'Local Corp (LC_MKT)', 'Alpha Marketing (ALPH_02)', 'Test User 1 (TEST_01)', 'Test User 2 (TEST_02)'].filter(u => u.toLowerCase().includes(userSearchText.toLowerCase())).length === 0 && (
                    <div className="p-3 text-center text-[12px] text-gray-400">No matching user found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>System_ID (Unique)</label>
              <input className={inpCls} placeholder="e.g. acme-prod" maxLength={15} />
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Password</label>
              <input className={inpCls} placeholder="••••••••" type="password" />
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Bind Type Allowed</label>
              <select className={inpCls} value={bindMode} onChange={(e) => setBindMode(e.target.value)}>
                <option value="trx">Transceiver (trx) only</option>
                <option value="tx_rx">Separate (tx and rx)</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Charset</label>
              <select className={inpCls}>
                <option value="utf-8">UTF-8</option>
                <option value="gsm0338">GSM 03.38</option>
                <option value="latin1">Latin-1 (ISO-8859-1)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={lblCls}>Default Channel</label>
              <select className={inpCls}>
                <option value="transactional">transactional</option>
                <option value="promotional">promotional</option>
              </select>
            </div>

            {bindMode === 'trx' ? (
              <>
                <div className="sm:col-span-1">
                  <label className={lblCls}>Port</label>
                  <input className={inpCls} placeholder="2775" type="number" defaultValue={2775} />
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>Throttle (TPS)</label>
                  <input className={inpCls} placeholder="50" type="number" defaultValue={50} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lblCls}>Max Sessions</label>
                  <input className={inpCls} placeholder="4" type="number" defaultValue={4} />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-brand-100 bg-brand-50/30 p-4">
                <div className="sm:col-span-2 border-b border-brand-100 pb-2 mb-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">TX (Transmitter) Configuration</h4>
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>TX Port</label>
                  <input className={inpCls} placeholder="2775" type="number" defaultValue={2775} />
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>TX TPS</label>
                  <input className={inpCls} placeholder="50" type="number" defaultValue={50} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lblCls}>TX Sessions</label>
                  <input className={inpCls} placeholder="4" type="number" defaultValue={4} />
                </div>

                <div className="sm:col-span-2 border-b border-brand-100 pb-2 mb-2 mt-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">RX (Receiver) Configuration</h4>
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>RX Port</label>
                  <input className={inpCls} placeholder="2776" type="number" defaultValue={2776} />
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>RX TPS</label>
                  <input className={inpCls} placeholder="50" type="number" defaultValue={50} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lblCls}>RX Sessions</label>
                  <input className={inpCls} placeholder="4" type="number" defaultValue={4} />
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className={`${lblCls} !mb-0`}>Allowed Source IPs</label>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => setIpMode('open')} className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${ipMode === 'open' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Open</button>
                  <button onClick={() => setIpMode('whitelist')} className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${ipMode === 'whitelist' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>IP Whitelist</button>
                </div>
              </div>
              {ipMode === 'open' ? (
                <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
                  Accepting connections from any IP address (0.0.0.0/0)
                </div>
              ) : (
                <input className={inpCls} placeholder="e.g. 203.0.113.10/32, 198.51.100.0/24" />
              )}
            </div>

            {/* Routing Section */}
            <div className="sm:col-span-2">
              <label className={lblCls}>Assign Backend Route (Gateway)</label>
              <select className={inpCls}>
                <option value="">— Select Route —</option>
                <option value="airtel">Airtel Primary</option>
                <option value="vodafone">Vodafone Backup</option>
                <option value="karix">Karix Route</option>
              </select>
            </div>
         </div>
         
         <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button onClick={() => { setIsEditModalOpen(false); setEditingAcc(null); }} className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
            <button onClick={() => { setIsEditModalOpen(false); setEditingAcc(null); }} className="rounded-xl bg-brand-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-md hover:bg-brand-500">Create bind</button>
         </div>
      </Modal>
  </div>
)
}
