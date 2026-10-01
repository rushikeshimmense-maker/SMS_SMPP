import React, { useState, useEffect } from 'react'
import { PlusIcon } from '../components/Icons.jsx'
import { Modal, Button } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { api } from '../lib/api.js'

export default function GatewayCenter() {
  const toast = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingGw, setEditingGw] = useState(null)
  const [bindMode, setBindMode] = useState('trx')
  
  // Dashboard Modal State
  const [viewingGw, setViewingGw] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [gateways, setGateways] = useState([])
  
  useEffect(() => {
    api('/smpp/gateways')
      .then(res => {
        const mapped = (res.items || []).map(g => {
          let sCount = 0;
          let sText = 'Disconnected';
          if (g.status === 'connected') { sCount = 10; sText = 'Healthy - 10 bound'; }
          else if (g.status === 'degraded') { sCount = 5; sText = 'Degraded - 5 bound'; }
          
          return {
            id: g.id,
            name: g.name,
            ip: g.host,
            port: g.port,
            channel: g.bindType === 'TRX' ? 'Transactional' : 'Promotional',
            tps: g.tpsLimit,
            sessions: sCount,
            status: sText,
            raw: g // store raw object just in case
          }
        });
        setGateways(mapped);
      })
      .catch(err => toast(err.message, 'error'))
  }, [])

  const tcpSessions = [
    { id: 'tcp_9a2b', bindType: 'TRX', local: '10.0.1.15:49102', remote: '49.50.64.74:7576', state: 'BOUND', uptime: '14h 22m', rtt: '45ms', tps: '102', window: '4/50', lastError: '-' },
    { id: 'tcp_9a2c', bindType: 'TRX', local: '10.0.1.15:49103', remote: '49.50.64.74:7576', state: 'BOUND', uptime: '14h 22m', rtt: '42ms', tps: '98', window: '2/50', lastError: '-' },
    { id: 'tcp_9a2d', bindType: 'TRX', local: '10.0.1.15:49104', remote: '49.50.64.74:7576', state: 'BOUND', uptime: '14h 21m', rtt: '48ms', tps: '105', window: '5/50', lastError: '-' },
    { id: 'tcp_9a33', bindType: 'TRX', local: '10.0.1.15:50211', remote: '49.50.64.74:7576', state: 'RECONNECTING', uptime: '0s', rtt: '-', tps: '0', window: '0/50', lastError: '0x00000058 (ESME_RTHROTTLED)' }
  ]

  const mockLogs = [
    { time: '14:52:10.104', dir: 'OUT', pdu: 'submit_sm', hex: '0x00000004', seq: '1042', status: '-' },
    { time: '14:52:10.145', dir: 'IN', pdu: 'submit_sm_resp', hex: '0x80000004', seq: '1042', status: 'ESME_ROK' },
    { time: '14:52:11.002', dir: 'IN', pdu: 'deliver_sm', hex: '0x00000005', seq: '1043', status: '-' },
    { time: '14:52:11.010', dir: 'OUT', pdu: 'deliver_sm_resp', hex: '0x80000005', seq: '1043', status: 'ESME_ROK' },
    { time: '14:52:12.500', dir: 'OUT', pdu: 'enquire_link', hex: '0x00000015', seq: '1044', status: '-' },
    { time: '14:52:12.544', dir: 'IN', pdu: 'enquire_link_resp', hex: '0x80000015', seq: '1044', status: 'ESME_ROK' },
  ]

  const lblCls = "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5"
  const inpCls = "w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-[13px] text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"

  const handleEdit = (gw, e) => {
    e.stopPropagation();
    setEditingGw(gw);
    setIsEditModalOpen(true);
  }
  
  const handleView = (gw) => {
    setViewingGw(gw);
    setActiveTab('overview');
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#f8fafc] p-4 lg:p-6 pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-tight">Gateway Center</h1>
          <p className="text-[13px] text-gray-500 mt-1">Bind and manage your Operator / Vendor SMPP connections.</p>
        </div>
        <button 
          onClick={() => { setEditingGw(null); setIsEditModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md hover:bg-brand-500 transition"
        >
          <PlusIcon className="h-4 w-4" /> Add New Gateway
        </button>
      </div>

      {/* Main Gateway List */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm mb-6">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="p-4">Name</th>
              <th className="p-4">Host IP : Port</th>
              <th className="p-4">Channel</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">TPS</th>
              <th className="p-4 text-center">Sessions</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gateways.map(gw => (
              <tr key={gw.id} className="transition cursor-pointer hover:bg-brand-50/30 group" onClick={() => handleView(gw)}>
                <td className="p-4 flex items-center gap-2">
                  <span className="text-[13px] font-bold text-brand-600 group-hover:underline underline-offset-2 decoration-brand-300">
                    {gw.name}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-mono text-[13px] text-gray-700">{gw.ip}:{gw.port}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                    {gw.channel}
                  </span>
                </td>
                <td className="p-4">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${gw.status.includes('Healthy') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${gw.status.includes('Healthy') ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {gw.status}
                  </div>
                </td>
                <td className="p-4 text-center text-[13px] font-bold text-gray-700">
                  {gw.tps}
                </td>
                <td className="p-4 text-center text-[13px] font-bold text-gray-700">
                  {gw.sessions}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => handleEdit(gw, e)} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 shadow-sm transition" title="Edit Gateway">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleView(gw); }} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition" title="Dashboard">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast('Transfer window opened.', 'success'); }} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 shadow-sm transition" title="Transfer Users">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast('Status toggled successfully.', 'success'); }} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 shadow-sm transition" title={gw.status.includes('Disconnected') ? 'Enable' : 'Disable'}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast('Gateway rebound successfully.', 'success'); }} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 shadow-sm transition" title="Refresh / Rebind">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast('Gateway deleted.', 'success'); }} className="rounded-lg border border-red-100 bg-red-50/50 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 shadow-sm transition" title="Delete Gateway">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DASHBOARD MODAL */}
      {viewingGw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-[#f8fafc] w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
                    <h2 className="text-[18px] font-black text-ink">{viewingGw.name}</h2>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${viewingGw.status.includes('Healthy') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${viewingGw.status.includes('Healthy') ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {viewingGw.status}
                  </div>
                  <div className="font-mono text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{viewingGw.ip}:{viewingGw.port}</div>
               </div>
               <button onClick={() => setViewingGw(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            {/* Modal Tabs */}
            <div className="bg-white px-6 border-b border-gray-200 flex gap-6 shrink-0">
               {['Overview', 'TCP Connections', 'Live Console', 'Alerts'].map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab.toLowerCase())}
                   className={`py-3 text-[13px] font-bold transition border-b-2 ${activeTab === tab.toLowerCase() ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
               {activeTab === 'overview' && (
                 <div className="space-y-6">
                    {/* Top Vitals Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Live Throughput</div>
                        <div className="text-[28px] font-black text-ink tracking-tight">{viewingGw.tps} <span className="text-[12px] font-bold text-gray-400">TPS</span></div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                          12% vs last hour
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Avg Latency</div>
                        <div className="text-[28px] font-black text-ink tracking-tight">42<span className="text-[12px] font-bold text-gray-400">ms</span></div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1">Optimal heartbeat</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">DLR Success (1H)</div>
                        <div className="text-[28px] font-black text-ink tracking-tight">94.8<span className="text-[12px] font-bold text-gray-400">%</span></div>
                        <div className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                          1.2% dropped
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Queue Backlog</div>
                        <div className="text-[28px] font-black text-ink tracking-tight">1,204</div>
                        <div className="text-[11px] text-gray-500 font-bold mt-1">Flushing normally</div>
                      </div>
                    </div>

                    {/* Advanced Traffic Graph Monitor */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-[13px] font-extrabold text-ink uppercase tracking-wider">SMPP Tx/Rx Monitor</h3>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">submit_sm vs deliver_sm traffic pattern (Last 15m)</p>
                        </div>
                        <div className="flex gap-4 text-[11px] font-bold">
                          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[3px] bg-brand-500"></div> Submit (Tx)</span>
                          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500"></div> Deliver (Rx)</span>
                        </div>
                      </div>
                      <div className="h-40 w-full rounded-lg bg-gray-50 flex items-end relative overflow-hidden border border-gray-100">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-5 pointer-events-none">
                          <div className="border-t border-gray-900 w-full"></div>
                          <div className="border-t border-gray-900 w-full"></div>
                          <div className="border-t border-gray-900 w-full"></div>
                          <div className="border-t border-gray-900 w-full"></div>
                        </div>
                        
                        {/* Vector Graph using pure SVG */}
                        <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                          {/* Rx Area (Emerald) */}
                          <path d="M0,100 L0,70 L10,65 L20,80 L30,60 L40,55 L50,65 L60,50 L70,55 L80,45 L90,60 L100,50 L100,100 Z" fill="rgba(16, 185, 129, 0.1)"></path>
                          <polyline points="0,70 10,65 20,80 30,60 40,55 50,65 60,50 70,55 80,45 90,60 100,50" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round"></polyline>
                          
                          {/* Tx Area (Brand Blue) */}
                          <path d="M0,100 L0,50 L10,40 L20,60 L30,30 L40,25 L50,45 L60,20 L70,35 L80,15 L90,30 L100,20 L100,100 Z" fill="rgba(37, 99, 235, 0.15)"></path>
                          <polyline points="0,50 10,40 20,60 30,30 40,25 50,45 60,20 70,35 80,15 90,30 100,20" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round"></polyline>
                        </svg>
                      </div>
                    </div>

                    {/* Protocol Stats & Errors Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[12px] font-extrabold text-ink uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Protocol Counters (1H)</h3>
                        <div className="space-y-3 text-[12px]">
                          <div className="flex justify-between items-center"><span className="text-gray-500 font-mono text-[11px]">submit_sm</span><span className="font-bold">245,102</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-500 font-mono text-[11px]">submit_sm_resp</span><span className="font-bold">245,098</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-500 font-mono text-[11px]">deliver_sm (DLR)</span><span className="font-bold">230,405</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-500 font-mono text-[11px]">deliver_sm_resp</span><span className="font-bold">230,405</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-500 font-mono text-[11px]">enquire_link</span><span className="font-bold">1,240</span></div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-50"><span className="text-gray-500 font-bold text-[11px] uppercase">In-flight Window</span><span className="font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">4 PDUs</span></div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[12px] font-extrabold text-ink uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Routing & DLT Info</h3>
                        <div className="space-y-4 text-[12px]">
                          <div>
                              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-0.5">DLT Scrubbing</div>
                              <div className="font-bold text-emerald-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active (Strict Mode)</div>
                          </div>
                          <div>
                              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-0.5">Bind Allowed</div>
                              <div className="font-bold text-ink">Transceiver (TRX)</div>
                          </div>
                          <div>
                              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-0.5">System ID (Node)</div>
                              <div className="font-bold text-ink font-mono bg-gray-50 px-2 py-1 rounded inline-block">{viewingGw.systemId}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-[12px] font-extrabold text-ink uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                          Top ESME Errors
                          <span className="text-[9px] font-bold bg-red-50 text-red-600 px-2 rounded-full py-0.5">Last 1H</span>
                        </h3>
                        <div className="space-y-4 text-[11px]">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-mono text-red-600 font-extrabold text-[12px]">0x0000000B</div>
                              <div className="text-gray-400 font-bold mt-0.5">ESME_RINVDSTADR</div>
                            </div>
                            <span className="font-bold text-ink bg-gray-50 px-2 py-0.5 rounded">1,402 hits</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-mono text-amber-600 font-extrabold text-[12px]">0x00000058</div>
                              <div className="text-gray-400 font-bold mt-0.5">ESME_RTHROTTLED</div>
                            </div>
                            <span className="font-bold text-ink bg-gray-50 px-2 py-0.5 rounded">34 hits</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-mono text-purple-600 font-extrabold text-[12px]">0x00000014</div>
                              <div className="text-gray-400 font-bold mt-0.5">ESME_RMSGQFUL</div>
                            </div>
                            <span className="font-bold text-ink bg-gray-50 px-2 py-0.5 rounded">2 hits</span>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
               )}

               {activeTab === 'tcp connections' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-3">
                           <div>
                             <h3 className="text-[13px] font-extrabold text-ink uppercase tracking-wider mb-0.5">Socket Topology Matrix</h3>
                             <p className="text-[11px] text-gray-400 font-medium">Monitoring {viewingGw.sessions} allocated concurrent connections to {viewingGw.ip}:{viewingGw.port}</p>
                           </div>
                           <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-white shadow-sm transition">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                              Rebind All
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {[...Array(viewingGw.sessions)].map((_, i) => (
                             <div key={i} className={`w-[12px] h-[32px] rounded-[3px] ${i < (viewingGw.sessions * 0.8) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400 animate-pulse'}`} title={i < (viewingGw.sessions * 0.8) ? 'BOUND' : 'RECONNECTING'}></div>
                           ))}
                        </div>
                      </div>
                      
                      <div className="bg-brand-600 p-5 rounded-xl shadow-lg shadow-brand-500/20 text-white flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:scale-110 transition-transform duration-500">
                           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        </div>
                        <div className="relative z-10">
                          <div className="text-[10px] font-extrabold text-brand-100 uppercase tracking-widest mb-1">Pool Health Score</div>
                          <div className="text-[32px] font-black leading-none tracking-tight">80<span className="text-[14px] font-bold text-brand-200">%</span></div>
                          <div className="text-[11px] text-brand-100 mt-2 font-medium flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping"></span>
                             2 nodes reconnecting
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                              <th className="p-4">Socket / Mode</th>
                              <th className="p-4">Network Route</th>
                              <th className="p-4">State & Uptime</th>
                              <th className="p-4 text-center">Heartbeat (RTT)</th>
                              <th className="p-4 w-48">Window / Queue</th>
                              <th className="p-4">Data Transferred</th>
                              <th className="p-4 pr-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-[12px]">
                            {tcpSessions.map((sess, idx) => {
                              const windowParts = sess.window.split('/');
                              const inflight = parseInt(windowParts[0]) || 0;
                              const wLimit = parseInt(windowParts[1]) || 50;
                              const percent = Math.min(100, Math.round((inflight / wLimit) * 100));
                              const isReconnecting = sess.state === 'RECONNECTING';

                              return (
                                <tr key={sess.id} className="hover:bg-brand-50/30 transition group">
                                  <td className="p-4">
                                    <div className="font-mono font-bold text-brand-700">{sess.id}</div>
                                    <div className="text-[9px] font-extrabold text-gray-400 mt-0.5 tracking-wider uppercase">{sess.bindType} BIND</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2 font-mono text-[11px]">
                                       <span className="text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{sess.local}</span>
                                       <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                       <span className="text-gray-800 font-bold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">{sess.remote}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider ${!isReconnecting ? 'bg-emerald-500 text-white shadow-[0_2px_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 text-white shadow-[0_2px_4px_rgba(245,158,11,0.2)]'}`}>
                                        {sess.state}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                      {sess.uptime}
                                    </div>
                                  </td>
                                  <td className="p-4 text-center">
                                    {isReconnecting ? (
                                      <span className="font-mono text-[11px] text-gray-300 font-bold">-</span>
                                    ) : (
                                      <div className="inline-flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="font-mono font-bold text-[11px] text-gray-700">{sess.rtt}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    {!isReconnecting && (
                                      <div className="w-full">
                                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                          <span className="text-ink">{inflight} inflight</span>
                                          <span className="text-gray-400">/ {wLimit} max</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <div className={`h-full transition-all duration-500 ${percent > 80 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                      </div>
                                    )}
                                    {isReconnecting && (
                                      <div className="text-[10px] font-bold text-amber-600 truncate max-w-[140px]" title={sess.lastError}>{sess.lastError}</div>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    {!isReconnecting ? (
                                      <div className="flex flex-col gap-0.5 font-mono text-[10px]">
                                         <div className="flex items-center justify-between gap-3">
                                            <span className="text-gray-400">Tx</span>
                                            <span className="text-blue-600 font-bold">{12 + idx}.{idx} MB</span>
                                         </div>
                                         <div className="flex items-center justify-between gap-3">
                                            <span className="text-gray-400">Rx</span>
                                            <span className="text-emerald-600 font-bold">{8 + idx}.{idx*2} MB</span>
                                         </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-300 font-mono text-[10px] font-bold">0.0 MB</span>
                                    )}
                                  </td>
                                  <td className="p-4 pr-4 text-right">
                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                       <button onClick={(e) => { e.stopPropagation(); toast('Tracing connection...', 'success'); }} className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-600 hover:text-brand-600 hover:border-brand-200 shadow-sm transition">Trace</button>
                                       <button onClick={(e) => { e.stopPropagation(); toast('Connection killed.', 'success'); }} className="rounded border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100 shadow-sm transition">Kill</button>
                                     </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                 </div>
               )}

               {activeTab === 'live console' && (
                 <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden font-mono shadow-2xl">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                       <div className="flex items-center gap-3">
                         <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                         </div>
                         <span className="text-gray-400 text-[11px] font-bold">smpp-trace.log</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold animate-pulse">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                           LIVE STREAM
                         </span>
                         <button className="text-gray-500 hover:text-white transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                       </div>
                    </div>
                    <div className="p-4 text-[11px] h-[400px] overflow-y-auto space-y-1">
                      {mockLogs.map((log, i) => (
                        <div key={i} className="flex hover:bg-white/5 px-2 py-0.5 rounded transition">
                          <span className="text-gray-500 w-24 shrink-0">{log.time}</span>
                          <span className={`w-12 shrink-0 font-bold ${log.dir === 'OUT' ? 'text-blue-400' : 'text-emerald-400'}`}>{log.dir}</span>
                          <span className="text-purple-400 w-36 shrink-0">{log.pdu}</span>
                          <span className="text-amber-300 w-24 shrink-0">{log.hex}</span>
                          <span className="text-gray-400 w-16 shrink-0">#{log.seq}</span>
                          <span className={`font-bold ${log.status === 'ESME_ROK' ? 'text-emerald-400' : 'text-gray-500'}`}>{log.status}</span>
                        </div>
                      ))}
                      <div className="text-gray-500 px-2 pt-2 animate-pulse">Waiting for next PDU...</div>
                    </div>
                 </div>
               )}

               {activeTab === 'alerts' && (
                 <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                       <div className="mt-0.5 text-red-500">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                       </div>
                       <div>
                          <h4 className="text-[13px] font-extrabold text-red-900">ESME_RTHROTTLED Threshold Exceeded</h4>
                          <p className="text-[12px] text-red-700 mt-1">Gateway is returning high volume of 0x00000058 responses. Adjusting TPS limits is recommended.</p>
                          <span className="text-[10px] font-bold text-red-500 mt-2 block">Triggered 12 mins ago</span>
                       </div>
                       <button className="ml-auto bg-white border border-red-200 text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 shadow-sm transition">Acknowledge</button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-start gap-3 opacity-60">
                       <div className="mt-0.5 text-emerald-500">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <div>
                          <h4 className="text-[13px] font-extrabold text-ink">Rebound Successfully</h4>
                          <p className="text-[12px] text-gray-600 mt-1">Socket tcp_9a33 successfully re-established connection after TCP timeout.</p>
                          <span className="text-[10px] font-bold text-gray-400 mt-2 block">Resolved 2 hours ago</span>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Add Gateway Modal */}
      <Modal open={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingGw(null); }} title="Bind Operator Gateway" width="max-w-2xl">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 mt-2">
            <div className="sm:col-span-2">
              <label className={lblCls}>Name</label>
              <input className={inpCls} placeholder="e.g. Airtel Primary Route" />
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Channel</label>
              <select className={inpCls}>
                <option value="transactional">Transactional</option>
                <option value="promotional">Promotional</option>
                <option value="service-explicit">Service Explicit</option>
                <option value="service-implicit">Service Implicit</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Country codes</label>
              <input className={inpCls} placeholder="ISO-2 (e.g. IN, US)" />
            </div>
            
            <div className="sm:col-span-1">
              <label className={lblCls}>Status</label>
              <select className={inpCls}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Host</label>
              <input className={inpCls} placeholder="smpp.provider.com" />
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>System ID</label>
              <input className={inpCls} placeholder="Operator Username" />
            </div>
            
            <div className="sm:col-span-1">
              <label className={lblCls}>Password</label>
              <input className={inpCls} placeholder="••••••••" type="password" />
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>System Type (optional)</label>
              <input className={inpCls} placeholder="vendor client/account code, e.g. 82704" />
            </div>

            <div className="sm:col-span-1">
              <label className={lblCls}>Bind mode</label>
              <select className={inpCls} value={bindMode} onChange={(e) => setBindMode(e.target.value)}>
                <option value="trx">Transceiver (trx) only</option>
                <option value="tx_rx">Separate (tx and rx)</option>
              </select>
            </div>

            {bindMode === 'trx' ? (
              <>
                <div className="sm:col-span-1">
                  <label className={lblCls}>Port</label>
                  <input className={inpCls} placeholder="2775" type="number" />
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>TPS</label>
                  <input className={inpCls} placeholder="100" type="number" defaultValue={100} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lblCls}>Max sessions</label>
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
                  <input className={inpCls} placeholder="2775" type="number" />
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>TX TPS</label>
                  <input className={inpCls} placeholder="100" type="number" defaultValue={100} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lblCls}>TX Sessions</label>
                  <input className={inpCls} placeholder="4" type="number" defaultValue={4} />
                </div>

                <div className="sm:col-span-2 border-b border-brand-100 pb-2 mb-2 mt-4">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">RX (Receiver) Configuration</h4>
                </div>

                <div className="sm:col-span-1">
                  <label className={lblCls}>RX Port</label>
                  <input className={inpCls} placeholder="2776" type="number" />
                </div>
                <div className="sm:col-span-1">
                  <label className={lblCls}>RX TPS</label>
                  <input className={inpCls} placeholder="100" type="number" defaultValue={100} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lblCls}>RX Sessions</label>
                  <input className={inpCls} placeholder="4" type="number" defaultValue={4} />
                </div>
              </div>
            )}
         </div>
         
         <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button onClick={() => { setIsEditModalOpen(false); setEditingGw(null); }} className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
            <button onClick={() => { setIsEditModalOpen(false); setEditingGw(null); }} className="rounded-xl bg-brand-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-md hover:bg-brand-500">Create</button>
         </div>
      </Modal>
  </div>
)
}
