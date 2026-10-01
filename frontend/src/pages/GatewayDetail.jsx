import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function GatewayDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { label: 'HEALTHY SESSIONS', value: '10 / 10', sub: 'bound / target', color: 'text-gray-800' },
    { label: 'IN-FLIGHT PDUS', value: '0', sub: 'queue 0', color: 'text-gray-800' },
    { label: 'SENT (LAST 1M)', value: '0', sub: '0/sec - 0 rej', color: 'text-gray-800' },
    { label: 'DLR SUCCESS (1H)', value: '—', sub: 'no DLRs yet', color: 'text-gray-800' },
    { label: 'PDUS IN / S', value: '1.5', sub: 'v 23,63,605', color: 'text-gray-800' },
    { label: 'PDUS OUT / S', value: '1.5', sub: 'v 23,62,704', color: 'text-gray-800' },
  ]

  const sessions = [
    { id: 'sess_1', bindType: 'trx', status: 'Bound', ip: '49.50.64.74', latency: '45ms', lastError: 'None' },
    { id: 'sess_2', bindType: 'trx', status: 'Bound', ip: '49.50.64.74', latency: '42ms', lastError: 'None' },
    { id: 'sess_3', bindType: 'trx', status: 'Disconnected', ip: '49.50.64.74', latency: '-', lastError: '0x00000005 (ESME_RINVPASWD)' },
  ]

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#f8fafc] p-4 lg:p-6 pb-12">
      {/* Breadcrumbs & Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link> &rsaquo;{' '}
            <Link to="/gateway" className="hover:text-brand-600">Gateway Center</Link> &rsaquo;{' '}
            <span className="text-gray-600">Delhi_airM</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-ink tracking-tight">Delhi_airM</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Live status, throughput, and assigned users for this outbound bind.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
             Edit
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
             Disable
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
             Restart
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px">
        {['Overview', 'TCP Sessions'].map(tab => {
          const isActive = activeTab === tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 text-[13px] font-bold transition border-b-2 ${
                isActive 
                  ? 'border-brand-600 text-brand-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <div>
                <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Status</div>
                <div className="text-[14px] font-bold text-emerald-800">Healthy - 10 sessions bound</div>
              </div>
            </div>
            <div className="flex gap-8 mt-4 md:mt-0 text-right">
              <div>
                <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Host</div>
                <div className="text-[13px] font-bold text-emerald-800 font-mono">49.50.64.74:7576</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Last Change</div>
                <div className="text-[13px] font-bold text-emerald-800">19 days ago</div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</div>
                <div className={`text-[20px] font-extrabold ${s.color} leading-none`}>{s.value}</div>
                <div className="text-[11px] text-gray-400 font-medium mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Live PDU Traffic - Last 1H</div>
            <div className="h-32 w-full bg-gradient-to-t from-brand-50 to-transparent flex items-end">
               <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 L0,50 L20,40 L40,60 L60,20 L80,30 L100,10 L100,100 Z" fill="rgba(59, 130, 246, 0.1)"></path>
                  <polyline points="0,50 20,40 40,60 60,20 80,30 100,10" fill="none" stroke="#3b82f6" strokeWidth="2"></polyline>
               </svg>
            </div>
          </div>

          {/* Configuration & Limits Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-[14px] font-extrabold text-ink mb-4">Configuration</h3>
              <div className="grid grid-cols-2 gap-y-4 text-[13px]">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Host</div>
                  <div className="font-mono font-bold text-gray-700">49.50.64.74:7576</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status</div>
                  <div className="font-bold text-gray-700">Enabled</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Channel</div>
                  <div className="font-bold text-gray-700">Transactional</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-[14px] font-extrabold text-ink mb-4">Limits & State</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Throughput (TPS)</label>
                  <input type="number" defaultValue={1000} className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-bold outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Max Connections</label>
                  <input type="number" defaultValue={10} className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-bold outline-none" />
                </div>
                <div className="col-span-2">
                   <button className="w-full rounded-lg bg-brand-600 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-brand-500 transition">Save Limits</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
                <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
            <div>
               <h3 className="text-[14px] font-extrabold text-ink">TCP Connections Pool</h3>
               <p className="text-[12px] text-gray-500">Monitoring 10 allocated sockets to 49.50.64.74:7576</p>
            </div>
            <div className="flex gap-4">
               <div className="text-center px-4 border-r border-gray-100">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Binds</div>
                 <div className="text-[16px] font-extrabold text-emerald-600">8 / 10</div>
               </div>
               <div className="text-center px-4">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Latency</div>
                 <div className="text-[16px] font-extrabold text-blue-600">45ms</div>
               </div>
               <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Refresh Pool
               </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-3 pl-4">Connection</th>
                    <th className="p-3">Network Route (Local &rarr; Remote)</th>
                    <th className="p-3">State & Uptime</th>
                    <th className="p-3 text-center">Heartbeat (RTT)</th>
                    <th className="p-3 text-center">TPS / Window</th>
                    <th className="p-3">Last Error</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[12px]">
                  {sessions.map(sess => (
                    <tr key={sess.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3 pl-4">
                        <div className="font-mono font-bold text-brand-700">{sess.id}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">{sess.bindType} BIND</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                           <span className="text-gray-500">{sess.local}</span>
                           <span className="text-gray-300">&rarr;</span>
                           <span className="text-gray-800 font-bold">{sess.remote}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${sess.state === 'BOUND' ? 'bg-emerald-500' : sess.state === 'RECONNECTING' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                          <span className={`font-bold ${sess.state === 'BOUND' ? 'text-emerald-700' : sess.state === 'RECONNECTING' ? 'text-amber-600' : 'text-red-600'}`}>{sess.state}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{sess.uptime}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-mono font-bold ${sess.rtt === '-' ? 'text-gray-300' : 'text-gray-700'}`}>{sess.rtt}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-bold text-gray-800">{sess.tps} <span className="text-gray-400 font-normal text-[10px]">TPS</span></div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{sess.window} inflight</div>
                      </td>
                      <td className="p-3">
                         {sess.lastError === '-' ? (
                            <span className="text-gray-300 font-medium">-</span>
                         ) : (
                            <div className="flex flex-col">
                              <span className="text-red-600 font-mono font-bold text-[11px] truncate max-w-[150px]" title={sess.lastError}>{sess.lastError}</span>
                            </div>
                         )}
                      </td>
                      <td className="p-3 pr-4 text-right">
                         <button className="text-[11px] font-bold text-gray-500 hover:text-brand-600 mr-3">Trace</button>
                         <button className="text-[11px] font-bold text-red-500 hover:text-red-700">Kill</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
