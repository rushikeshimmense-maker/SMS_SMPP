import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { downloadCSV, fmtMoney, fmtNum, fmtTime, toCSV } from '../lib/format.js'
import { Button, Card, Chip, EmptyRow, inputCls, Table, Td, Modal } from '../components/ui.jsx'
import { DownloadIcon } from '../components/Icons.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'
import { useToast } from '../components/Toast.jsx'
import { PageHeader } from '../components/AppLayout.jsx'


const STATUSES = ['all', 'delivered', 'failed', 'pending', 'submitted', 'scheduled', 'dropped']

function Kpi({ label, value, note, tone = 'text-ink' }) {
  return <Card><div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div><div className={`mt-1 text-[24px] font-extrabold ${tone}`}>{value}</div><div className="mt-0.5 text-[12px] text-gray-400">{note}</div></Card>
}

function bounds(period, custom) {
  const end = new Date(); end.setHours(23, 59, 59, 999)
  if (period === 'custom' && custom.from && custom.to) return [new Date(`${custom.from}T00:00:00`), new Date(`${custom.to}T23:59:59`)]
  const start = new Date(end)
  if (period === 'today') {
    // 30 days of data for 'Day' view
    start.setDate(end.getDate() - 29)
    start.setHours(0, 0, 0, 0)
  } else {
    // 12 months for 'Monthly' view
    start.setMonth(0) // Start of year
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  }
  return [start, end]
}

function isoDay(date) {
  return date.toISOString().slice(0, 10)
}

function createDailySummary(start, end, account = 'all', period = 'today') {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return []
  const rows = []
  const accountSeed = account === 'all' ? 0 : [...account].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  
  if (period === 'month') {
    // Month-by-month (Jan, Feb, etc.)
    const cursor = new Date(end)
    cursor.setDate(1)
    cursor.setHours(0, 0, 0, 0)
    const first = new Date(start)
    first.setDate(1)
    first.setHours(0, 0, 0, 0)
    
    while (cursor >= first && rows.length < 120) {
      const monthSeed = cursor.getFullYear() * 12 + cursor.getMonth() + accountSeed
      const request = 450000 + ((monthSeed * 7919) % 3680000)
      const rejected = monthSeed % 11 === 0 ? 1140 + (monthSeed % 97) : 0
      const submitted = request - rejected
      const dropped = monthSeed % 4 === 0 ? Math.round(submitted * (0.025 + (monthSeed % 6) / 200)) : 0
      const failed = Math.round(submitted * (0.065 + (monthSeed % 9) / 100))
      const delivered = Math.max(0, submitted - dropped - failed)
      
      const monthName = cursor.toLocaleString('default', { month: 'short', year: 'numeric' })
      rows.push({ date: monthName, request, rejected, submitted, delivered, dropped, failed })
      cursor.setMonth(cursor.getMonth() - 1)
    }
  } else {
    // Day-by-day
    const cursor = new Date(end)
    cursor.setHours(0, 0, 0, 0)
    const first = new Date(start)
    first.setHours(0, 0, 0, 0)
    while (cursor >= first && rows.length < 366) {
      const daySeed = Math.floor(cursor.getTime() / 86400000) + accountSeed
      const request = 18500 + ((daySeed * 7919) % 168000)
      const rejected = daySeed % 11 === 0 ? 114 + (daySeed % 97) : 0
      const submitted = request - rejected
      const dropped = daySeed % 4 === 0 ? Math.round(submitted * (0.025 + (daySeed % 6) / 200)) : 0
      const failed = Math.round(submitted * (0.065 + (daySeed % 9) / 100))
      const delivered = Math.max(0, submitted - dropped - failed)
      rows.push({ date: isoDay(cursor), request, rejected, submitted, delivered, dropped, failed })
      cursor.setDate(cursor.getDate() - 1)
    }
  }
  return rows
}

const routeRows = [
  { id: 1, name: 'jio_imnsnew1', ip: '49.50.64.74:7576', channel: 'Transactional', sources: ['smpp 128924', 'api 6', 'integration 1'], submitted: 90320, delivered: 84226, failed: 5800, undelivered: 5808, xdropped: 0, credits: 90320, rate: '94%' },
  { id: 2, name: 'Delhi_airM', ip: '49.50.64.74:7576', channel: 'Transactional', sources: ['smpp 49885'], submitted: 11344, delivered: 10820, failed: 524, undelivered: 524, xdropped: 0, credits: 11344, rate: '95%' },
  { id: 3, name: 'Trans_SpMix', ip: '49.50.64.74:7576', channel: 'Transactional', sources: ['smpp 3361'], submitted: 3281, delivered: 2782, failed: 494, undelivered: 495, xdropped: 0, credits: 3643, rate: '85%' },
  { id: 4, name: 'TImns_cp1', ip: '202.158.258.137:4444', channel: 'Transactional', sources: ['smpp 896'], submitted: 879, delivered: 12, failed: 867, undelivered: 867, xdropped: 0, credits: 879, rate: '1%' },
  { id: 5, name: 'IMS_TRANSn', ip: '103.132.146.170:12267', channel: 'Transactional', sources: ['smpp 21'], submitted: 21, delivered: 1, failed: 20, undelivered: 20, xdropped: 0, credits: 36, rate: '5%' },
]

export default function Reports() {
  const toast = useToast()
  const { user: me } = useAuth()
  const isStaff = me.role !== 'user'
  const isReseller = me?.role === 'reseller'
  const [params, setSearchParams] = useSearchParams()
  
  const tab = params.get('tab') || (params.get('userId') ? 'Delivery Report' : 'Summary')
  const [messages, setMessages] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const [custom, setCustom] = useState({ from: '', to: '' })
  const [summaryUser, setSummaryUser] = useState('all')
  const [delivery, setDelivery] = useState({ userId: params.get('userId') || 'all', status: 'all', dateRange: { from: '', to: '' }, sender: '', mobile: '' })
  
  const [xDroppedFilter, setXDroppedFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })
    const [xDroppedSelectedDate, setXDroppedSelectedDate] = useState(null)
  const [routeFilter, setRouteFilter] = useState({ dateRange: { from: '', to: '' } })
  const [apiSearch, setApiSearch] = useState('')
  const [apiFilter, setApiFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })
  const [smartSmsFilter, setSmartSmsFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })
  const [smartSmsSearch, setSmartSmsSearch] = useState('')
  const [creditFilter, setCreditFilter] = useState({ userId: 'all', type: 'all' })
  const [confirmRefund, setConfirmRefund] = useState(false)

  useEffect(() => {
    Promise.all([api('/messages?pageSize=5000'), api('/campaigns'), api('/users')])
      .then(([m, c, u]) => {
        setMessages(m.items || [])
        setCampaigns(c.items || [])
        setUsers(u.items || [])
      })
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const [start, end] = useMemo(() => bounds(period, custom), [period, custom])
  const summaryRows = useMemo(() => createDailySummary(start, end, summaryUser, period), [start, end, summaryUser, period])
  const summaryTotals = useMemo(() => {
    return summaryRows.reduce(
      (acc, r) => {
        acc.request += r.request; acc.rejected += r.rejected; acc.submitted += r.submitted
        acc.delivered += r.delivered; acc.dropped += r.dropped; acc.failed += r.failed
        return acc
      },
      { request: 0, rejected: 0, submitted: 0, delivered: 0, dropped: 0, failed: 0 }
    )
  }, [summaryRows])

  const deliveryRows = useMemo(() => {
    return messages.filter((m) => {
      if (delivery.userId !== 'all' && m.userId !== delivery.userId) return false
      if (delivery.status !== 'all' && m.status !== delivery.status) return false
      if (delivery.sender && !m.from?.toLowerCase().includes(delivery.sender.toLowerCase())) return false
      if (delivery.mobile && !m.to?.includes(delivery.mobile)) return false
      if (delivery.dateRange?.from || delivery.dateRange?.to) {
        const t = m.submittedAt || m.createdAt;
        if (!t) return false;
        const d = t.split('T')[0];
        if (delivery.dateRange.from && d < delivery.dateRange.from) return false;
        if (delivery.dateRange.to && d > delivery.dateRange.to) return false;
      }
      return true
    })
  }, [messages, delivery])

  

    
  
  const xDroppedAggregates = useMemo(() => {
    const dropped = messages.filter(m => m.status === 'dropped');
    // apply filters if any
    const filtered = dropped.filter(m => {
      if (xDroppedFilter.userId !== 'all' && m.userId !== xDroppedFilter.userId) return false;
      if (xDroppedFilter.dateRange?.from || xDroppedFilter.dateRange?.to) {
        const t = m.submittedAt || m.createdAt;
        if (!t) return false;
        const d = t.split('T')[0];
        if (xDroppedFilter.dateRange.from && d < xDroppedFilter.dateRange.from) return false;
        if (xDroppedFilter.dateRange.to && d > xDroppedFilter.dateRange.to) return false;
      }
      return true;
    });

    // Day-wise grouping
    const dayMap = {};
    let totalDropped = 0;
    filtered.forEach(m => {
      const d = (m.submittedAt || m.createdAt || '').split('T')[0];
      if (!d) return;
      if (!dayMap[d]) dayMap[d] = 0;
      dayMap[d]++;
      totalDropped++;
    });

    const dayRows = Object.keys(dayMap).sort((a,b) => b.localeCompare(a)).map(d => ({
      date: d,
      dropped: dayMap[d],
      credits: dayMap[d]
    }));

    // If a date is selected, group by user for that date
    let userRows = [];
    let selectedDateTotal = 0;
    if (xDroppedSelectedDate) {
      const userMap = {};
      filtered.filter(m => (m.submittedAt || m.createdAt || '').startsWith(xDroppedSelectedDate)).forEach(m => {
        if (!userMap[m.userId]) userMap[m.userId] = 0;
        userMap[m.userId]++;
        selectedDateTotal++;
      });
      userRows = Object.keys(userMap).map(uid => {
        const u = users.find(x => x.id === uid) || { companyName: 'Unknown', role: 'user' };
        return {
          userId: uid,
          companyName: u.companyName,
          type: u.role,
          dropped: userMap[uid],
          credits: userMap[uid]
        };
      }).sort((a,b) => b.dropped - a.dropped);
    }

    return { totalDropped, dayRows, userRows, selectedDateTotal };
  }, [messages, xDroppedFilter, xDroppedSelectedDate, users]);

  const xDroppedRows = useMemo(() => {
    return messages.filter((m) => {
      if (m.status !== 'dropped') return false;
      if (xDroppedFilter.userId !== 'all' && m.userId !== xDroppedFilter.userId) return false;
      if (xDroppedFilter.dateRange?.from || xDroppedFilter.dateRange?.to) {
        const t = m.submittedAt || m.createdAt;
        if (!t) return false;
        const d = t.split('T')[0];
        if (xDroppedFilter.dateRange.from && d < xDroppedFilter.dateRange.from) return false;
        if (xDroppedFilter.dateRange.to && d > xDroppedFilter.dateRange.to) return false;
      }
      return true;
    });
  }, [messages, xDroppedFilter]);

  const creditRows = useMemo(() => {
    const mocked = []
    for (let i = 0; i < 40; i++) {
      const typeSeed = i % 10;
      let type = 'deduction';
      let amount = -500;
      let desc = 'API Campaign Dispatch';
      
      if (typeSeed === 1) { type = 'topup'; amount = 50000; desc = 'Admin Manual Credit'; }
      if (typeSeed === 5) { type = 'refund'; amount = 20; desc = 'DND Refund (Batch #829)'; }
      if (typeSeed === 8) { type = 'topup'; amount = 10000; desc = 'Razorpay Payment'; }

      mocked.push({
        id: 'txn_' + Math.random().toString(36).slice(2, 9),
        time: new Date(Date.now() - i * 86400000).toISOString(),
        account: users[i % users.length]?.companyName || 'Reseller A',
        userId: users[i % users.length]?.id || '1',
        type,
        amount,
        balanceAfter: 150000 - (i * 1234),
        description: desc
      })
    }
    
    return mocked.filter(r => {
      if (creditFilter.userId !== 'all' && r.userId !== creditFilter.userId) return false;
      if (creditFilter.type !== 'all' && r.type !== creditFilter.type) return false;
      return true;
    })
  }, [users, creditFilter])

  
  const smartSmsRows = useMemo(() => {
    const term = smartSmsSearch.toLowerCase()
    const mocked = []
    const domains = ['https://google.com', 'https://amazon.in/offer', 'https://flipkart.com/sale'];
    for (let i = 0; i < 25; i++) {
      const u = users[i % users.length] || { id: 'unknown', companyName: 'Unknown' };
      mocked.push({
        id: 'click_' + Math.random().toString(36).slice(2, 9),
        userId: u.id,
        account: u.companyName,
        time: new Date(Date.now() - (i * 2 + 1) * 3600000).toISOString(),
        mobile: '+919' + Math.floor(100000000 + Math.random() * 900000000),
        originalUrl: domains[i % 3],
        shortUrl: 'https://smrt.to/' + Math.random().toString(36).slice(2, 6),
        clicks: Math.floor(Math.random() * 3) + 1,
        device: i % 2 === 0 ? 'Mobile (Android)' : 'Mobile (iOS)'
      })
    }
    
    let filtered = mocked;
    if (smartSmsFilter.userId !== 'all') {
      filtered = filtered.filter(r => r.userId === smartSmsFilter.userId);
    }
    if (smartSmsFilter.dateRange?.from || smartSmsFilter.dateRange?.to) {
      filtered = filtered.filter(r => {
        const d = r.time.split('T')[0];
        if (smartSmsFilter.dateRange.from && d < smartSmsFilter.dateRange.from) return false;
        if (smartSmsFilter.dateRange.to && d > smartSmsFilter.dateRange.to) return false;
        return true;
      });
    }

    if (!term) return filtered;
    return filtered.filter(r => r.mobile.includes(term) || r.account.toLowerCase().includes(term) || r.shortUrl.toLowerCase().includes(term))
  }, [smartSmsSearch, users, smartSmsFilter])

  const apiRows = useMemo(() => {
    const term = apiSearch.toLowerCase()
    const mocked = []
    for (let i = 0; i < 20; i++) {
      const u = users[i % users.length] || { id: 'unknown', companyName: 'Unknown' };
      mocked.push({
        id: 'req_' + Math.random().toString(36).slice(2, 9),
        userId: u.id,
        time: new Date(Date.now() - i * 3600000).toISOString(),
        account: u.companyName,
        endpoint: '/v1/sms/send',
        status: i % 7 === 0 ? 400 : 200,
        latency: 12 + (i % 80),
        messageId: i % 7 === 0 ? '-' : 'msg_' + Math.random().toString(36).slice(2, 9)
      })
    }
    
    let filtered = mocked;
    if (apiFilter.userId !== 'all') {
      filtered = filtered.filter(r => r.userId === apiFilter.userId);
    }
    if (apiFilter.dateRange?.from || apiFilter.dateRange?.to) {
      filtered = filtered.filter(r => {
        const d = r.time.split('T')[0];
        if (apiFilter.dateRange.from && d < apiFilter.dateRange.from) return false;
        if (apiFilter.dateRange.to && d > apiFilter.dateRange.to) return false;
        return true;
      });
    }

    if (!term) return filtered;
    return filtered.filter(r => r.id.toLowerCase().includes(term) || r.account.toLowerCase().includes(term) || r.messageId.toLowerCase().includes(term))
  }, [apiSearch, users, apiFilter])

  function exportRows(rows, name) {
    if (!rows.length) return toast('No data to export', 'error')
    const csv = toCSV(rows)
    downloadCSV(csv, name + '-' + isoDay(new Date()) + '.csv')
  }

  function MessageTable({ rows }) {
    return <Table headers={['ID', 'Time', 'Sender ID', 'To', 'Cost', 'Status', 'Message']}>{rows.length ? rows.map((r) => <tr key={r.id}><Td className="font-mono text-[11px] text-gray-400">{r.id}</Td><Td>{fmtTime(r.createdAt || r.submittedAt)}</Td><Td className="font-bold text-ink">{r.from}</Td><Td className="font-mono text-[13px]">{r.to}</Td><Td>{fmtMoney(0.02)}</Td><Td><Chip status={r.status} /></Td><Td className="max-w-[200px] truncate">{r.text}</Td></tr>) : <EmptyRow colSpan={7} text="No messages found" />}</Table>
  }

  if (loading) return <div className="p-8 text-center text-[13.5px] font-semibold text-gray-500">Loading reports...</div>

  return <div>
    
      <div className="mb-6">
        <PageHeader title="Reports" sub="Clear operational reports in one place" />
        {(isReseller ? ['Summary', 'Campaign Report', 'Delivery Report', 'API Report', 'Smart SMS'] : ['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS']).includes(tab) && (
          <div className="mt-5 flex gap-1 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto max-w-full">
            {(isReseller ? ['Summary', 'Campaign Report', 'Delivery Report', 'API Report', 'Smart SMS'] : ['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS']).map(item => (
              <button
                key={item}
                onClick={() => setSearchParams({ tab: item })}
                className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap outline-none ${tab === item ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

    {tab === 'Summary' && <>
      <Card className="mb-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="flex w-full overflow-x-auto rounded-xl bg-gray-100 p-1 xl:w-auto">{[['today', 'Day'], ['month', 'Monthly'], ['custom', 'Custom']].map(([key, label]) => <button key={key} onClick={() => setPeriod(key)} className={`min-w-[92px] rounded-lg px-4 py-2 text-[13px] font-semibold transition ${period === key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}`}>{label}</button>)}</div>
          {period === 'custom' && <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto"><input aria-label="From date" type="date" className={`${inputCls} xl:w-[170px]`} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} /><input aria-label="To date" type="date" className={`${inputCls} xl:w-[170px]`} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} /></div>}
          {isStaff && <select aria-label="Client or reseller" className={`${inputCls} xl:ml-auto xl:max-w-[260px]`} value={summaryUser} onChange={(e) => setSummaryUser(e.target.value)}><option value="all">All clients / resellers</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}
          <Button onClick={() => exportRows(summaryRows, 'summary-report')} disabled={!summaryRows.length}><DownloadIcon className="h-[18px] w-[18px]" /> Download</Button>
            {isStaff && (
              <Button 
                variant="secondary"
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 border-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setConfirmRefund(true)}
                disabled={summaryUser === 'all'}
                title={summaryUser === 'all' ? "Please select a specific client first" : "Process refund for this client"}
              >
                Refund
              </Button>
            )}
        </div>
      </Card>
      <Card className="overflow-hidden p-0 sm:p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-[16px] font-extrabold text-ink">Summary</h2><p className="mt-0.5 text-[12.5px] text-gray-400">{summaryRows.length} day{summaryRows.length === 1 ? '' : 's'} – figures shown day-wise</p></div>
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-bold text-brand-600">IST</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-gray-50/80"><tr>{['Summary date', 'Total request', 'Total rejected', 'Total submitted', 'Total delivered', 'Total X-dropped', 'Total failed'].map((heading, i) => <th key={heading} className={`border-b border-gray-100 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 ${i === 0 ? 'text-left pl-5 pr-4' : 'text-right px-4'}`}>{heading}</th>)}</tr></thead>
              <tbody className="text-[13.5px] text-gray-600">
                {summaryRows.length ? summaryRows.map((row) => <tr key={row.date} className="transition hover:bg-brand-50/30"><Td className="pl-5 font-bold text-brand-600 text-left">{row.date}</Td><Td className="text-right px-4">{fmtNum(row.request)}</Td><Td className="text-right px-4">{fmtNum(row.rejected)}</Td><Td className="text-right px-4">{fmtNum(row.submitted)}</Td><Td className="font-semibold text-emerald-600 text-right px-4">{fmtNum(row.delivered)}</Td><Td className="text-right px-4">{fmtNum(row.dropped)}</Td><Td className="text-rose-500 text-right px-4">{fmtNum(row.failed)}</Td></tr>) : <EmptyRow colSpan={7} text="Select a valid date range" />}
              </tbody>
              {!!summaryRows.length && <tfoot><tr className="bg-gray-50 font-extrabold text-ink"><td className="pl-5 pr-4 py-4 text-left">Total</td>{['request', 'rejected', 'submitted', 'delivered', 'dropped', 'failed'].map((key) => <td key={key} className="px-4 py-4 text-right">{fmtNum(summaryTotals[key])}</td>)}</tr></tfoot>}
          </table>
        </div>
      </Card>
    </>}

    {tab === 'Delivery Report' && <Card>
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {isStaff && <select className={`${inputCls} sm:max-w-[200px]`} value={delivery.userId} onChange={(e) => setDelivery({ ...delivery, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}
            <select className={`${inputCls} sm:max-w-[180px]`} value={delivery.status} onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All delivery statuses' : s}</option>)}</select>
            <DateRangePicker value={delivery.dateRange} onChange={(r) => setDelivery({ ...delivery, dateRange: r })} />
            <Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(deliveryRows, 'delivery-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-[16px] w-[16px]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input className={`${inputCls} pl-[38px] sm:w-[240px]`} placeholder="Search by Sender ID..." value={delivery.sender} onChange={(e) => setDelivery({ ...delivery, sender: e.target.value })} />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-[16px] w-[16px]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <input className={`${inputCls} pl-[38px] sm:w-[240px]`} placeholder="Search by Mobile..." value={delivery.mobile} onChange={(e) => setDelivery({ ...delivery, mobile: e.target.value })} />
            </div>
          </div>
        </div>
        <MessageTable rows={deliveryRows} />
      </Card>}

    {tab === 'X-Dropped' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Card className="flex-1 max-w-[220px]">
              <div className="text-[11px] font-bold uppercase tracking-wide text-rose-500">X-Dropped</div>
              <div className="mt-1 text-[24px] font-extrabold text-ink">{fmtNum(xDroppedSelectedDate ? xDroppedAggregates.selectedDateTotal : xDroppedAggregates.totalDropped)}</div>
            </Card>
            <Card className="flex-1 max-w-[220px]">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Credits Deducted</div>
              <div className="mt-1 text-[24px] font-extrabold text-ink">{fmtNum(xDroppedSelectedDate ? xDroppedAggregates.selectedDateTotal : xDroppedAggregates.totalDropped)}</div>
            </Card>
          </div>

          {!xDroppedSelectedDate ? (
            <Card>
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Day-wise ({xDroppedAggregates.dayRows.length})</span>
                {isStaff && <select className={`${inputCls} sm:max-w-[280px] ml-auto`} value={xDroppedFilter.userId} onChange={(e) => setXDroppedFilter({ ...xDroppedFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}
                <DateRangePicker value={xDroppedFilter.dateRange} onChange={(r) => setXDroppedFilter({ ...xDroppedFilter, dateRange: r })} />
                <Button variant="secondary" onClick={() => exportRows(xDroppedAggregates.dayRows, 'xdropped-daywise')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button>
              </div>
              <Table headers={['Date (IST)', 'X-Dropped', 'Credits Deducted']}>
                {xDroppedAggregates.dayRows.length ? xDroppedAggregates.dayRows.map(r => (
                  <tr key={r.date}>
                    <Td><button onClick={() => setXDroppedSelectedDate(r.date)} className="font-semibold text-brand-600 hover:underline">{r.date}</button></Td>
                    <Td>{fmtNum(r.dropped)}</Td>
                    <Td>{fmtNum(r.credits)}</Td>
                  </tr>
                )) : <EmptyRow colSpan={3} text="No data found" />}
              </Table>
            </Card>
          ) : (
            <Card>
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <button onClick={() => setXDroppedSelectedDate(null)} className="flex items-center gap-1 text-[13px] font-semibold text-gray-500 hover:text-ink transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to Day-wise
                </button>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Clients / Resellers ({xDroppedAggregates.userRows.length})</span>
                  <Button variant="secondary" onClick={() => exportRows(xDroppedAggregates.userRows, 'xdropped-users')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button>
                </div>
              </div>
              <Table headers={['Client / Reseller', 'Type', 'X-Dropped', 'Credits Deducted']}>
                {xDroppedAggregates.userRows.length ? xDroppedAggregates.userRows.map(r => (
                  <tr key={r.userId}>
                    <Td className="font-semibold text-brand-600">{r.companyName}</Td>
                    <Td><Chip status={r.type === 'user' ? 'client' : r.type} /></Td>
                    <Td>{fmtNum(r.dropped)}</Td>
                    <Td>{fmtNum(r.credits)}</Td>
                  </tr>
                )) : <EmptyRow colSpan={4} text="No users found for this date" />}
              </Table>
            </Card>
          )}
        </div>
      )}

    {tab === 'Campaign Report' && <Card><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-[16px] font-extrabold text-ink">Campaign performance</h2><Button variant="secondary" onClick={() => exportRows(campaigns, 'campaign-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><Table headers={['Campaign', 'Sender ID', 'Audience', 'Delivered', 'Delivery %', 'Status', 'Created']}>{campaigns.length ? campaigns.map((c) => { const total = c.total || c.audience || 0; const delivered = c.delivered || Math.round(total * 0.96); return <tr key={c.id}><Td className="font-bold text-ink">{c.name}</Td><Td>{c.senderId || '-'}</Td><Td>{fmtNum(total)}</Td><Td className="font-semibold text-emerald-600">{fmtNum(delivered)}</Td><Td>{total ? `${((delivered / total) * 100).toFixed(1)}%` : '-'}</Td><Td><Chip status={c.status} /></Td><Td>{fmtTime(c.createdAt || c.ts)}</Td></tr> }) : <EmptyRow colSpan={7} text="No campaigns found" />}</Table></Card>}

    
    {tab === 'Credit Report' && <Card>
      <div className="mb-4 flex flex-wrap gap-3">
        {isStaff && (
          <select className={`${inputCls} sm:max-w-[280px]`} value={creditFilter.userId} onChange={(e) => setCreditFilter({ ...creditFilter, userId: e.target.value })}>
            <option value="all">All Accounts</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}
          </select>
        )}
        <select className={`${inputCls} sm:max-w-[220px]`} value={creditFilter.type} onChange={(e) => setCreditFilter({ ...creditFilter, type: e.target.value })}>
          <option value="all">All Transactions</option>
          <option value="topup">Credit Additions</option>
          <option value="deduction">Deductions</option>
          <option value="refund">Refunds</option>
        </select>
        <Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(creditRows, 'credit-report')}>
          <DownloadIcon className="h-[18px] w-[18px]" /> Export CSV
        </Button>
      </div>
      <Table headers={['Transaction ID', 'Time', 'Account', 'Description', 'Type', 'Amount (Credits)', 'Balance After']}>
        {creditRows.length ? creditRows.map((r) => (
          <tr key={r.id}>
            <Td className="font-mono text-[11px] text-gray-400">{r.id}</Td>
            <Td>{fmtTime(r.time)}</Td>
            <Td className="font-bold text-ink">{r.account}</Td>
            <Td>{r.description}</Td>
            <Td>
              <span className={`inline-flex rounded-full px-2.5 py-[3px] text-[11.5px] font-bold capitalize ${r.type === 'topup' ? 'bg-emerald-100 text-emerald-700' : r.type === 'refund' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                {r.type}
              </span>
            </Td>
            <Td className={`font-semibold tabular-nums ${r.amount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {r.amount > 0 ? '+' : ''}{fmtNum(r.amount)}
            </Td>
            <Td className="font-mono text-[12px] font-bold text-gray-500">{fmtNum(r.balanceAfter)}</Td>
          </tr>
        )) : <EmptyRow colSpan={7} text="No credit transactions found" />}
      </Table>
    </Card>}

    {tab === 'Route Reports' && (
      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[13px] font-extrabold tracking-widest text-gray-500 uppercase">Routes ({routeRows.length})</h3>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker value={routeFilter.dateRange} onChange={(r) => setRouteFilter({ ...routeFilter, dateRange: r })} />
            <Button variant="secondary" onClick={() => exportRows(routeRows, 'route-report')}>
              <DownloadIcon className="h-[18px] w-[18px]" /> Export CSV
            </Button>
          </div>
        </div>
        
        <Table headers={['Route', 'Channel', 'Source Mix', 'Submitted', 'Delivered', 'Failed', 'Undelivered', 'X-Dropped', 'Delivery %', 'Credits', 'Rate']}>
          {routeRows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50/50 transition">
              <Td>
                <div className="font-bold text-ink text-[13px]">{r.name}</div>
                <div className="font-mono text-[11px] text-gray-400 mt-0.5">{r.ip}</div>
              </Td>
              <Td className="text-[13px] text-gray-600">{r.channel}</Td>
              <Td>
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                  {r.sources.map((s, i) => (
                    <span key={i} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-200">{s}</span>
                  ))}
                </div>
              </Td>
              <Td className="text-[13px] font-semibold text-gray-700">{fmtNum(r.submitted)}</Td>
              <Td>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-bold text-emerald-600 border border-emerald-100">{fmtNum(r.delivered)}</span>
              </Td>
              <Td>
                <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-[12px] font-bold text-rose-500 border border-rose-100">{fmtNum(r.failed)}</span>
              </Td>
              <Td className="text-[13px] font-semibold text-gray-600">{fmtNum(r.undelivered)}</Td>
              <Td className="text-[13px] font-semibold text-gray-600">{fmtNum(r.xdropped)}</Td>
              <Td className="text-[13px] font-bold text-ink">
                {((r.delivered / r.submitted) * 100).toFixed(1)}%
              </Td>
              <Td className="text-[13px] font-semibold text-gray-700">{fmtNum(r.credits)}</Td>
              <Td className={`text-[13px] font-bold ${parseFloat(r.rate) >= 90 ? 'text-emerald-600' : parseFloat(r.rate) >= 50 ? 'text-ink' : 'text-amber-500'}`}>{r.rate}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    )}

    

    {tab === 'API Report' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={`${inputCls} sm:max-w-[280px]`} value={apiFilter.userId} onChange={(e) => setApiFilter({ ...apiFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<DateRangePicker value={apiFilter.dateRange} onChange={(r) => setApiFilter({ ...apiFilter, dateRange: r })} /><input className={`${inputCls} sm:max-w-[380px]`} placeholder="Search request, message ID or account" value={apiSearch} onChange={(e) => setApiSearch(e.target.value)} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(apiRows, 'api-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><Table headers={['Request ID', 'Time', 'Account', 'Endpoint', 'HTTP', 'Latency', 'Message ID']}>{apiRows.length ? apiRows.map((r) => <tr key={r.id}><Td className="font-mono text-[12px]">{r.id}</Td><Td>{fmtTime(r.time)}</Td><Td className="font-semibold text-ink">{r.account}</Td><Td className="font-mono text-[12px]">{r.endpoint}</Td><Td><Chip status={r.status === 200 ? 'delivered' : 'failed'}>{r.status}</Chip></Td><Td>{r.latency} ms</Td><Td className="font-mono text-[12px] text-gray-400">{r.messageId}</Td></tr>) : <EmptyRow colSpan={7} text="No API requests found" />}</Table></Card>}
  
      <Modal open={confirmRefund} onClose={() => setConfirmRefund(false)} title="Confirm Auto-Refund">
        <div className="space-y-4">
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Are you sure you want to proceed? The system will automatically refund all failed and rejected traffic for the selected client in this date range (X-Dropped traffic is never refunded).
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setConfirmRefund(false)}>Cancel</Button>
            <Button onClick={() => {
              const toRefund = summaryTotals.rejected + summaryTotals.failed;
              if (toRefund > 0) {
                toast(`Refunded ${fmtNum(toRefund)} credits for failed and rejected traffic.`, 'success');
              } else {
                toast('No failed or rejected traffic to refund in this period.', 'error');
              }
              setConfirmRefund(false);
            }}>Proceed</Button>
          </div>
        </div>
      </Modal>
    
      {tab === 'Smart SMS' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={`${inputCls} sm:max-w-[280px]`} value={smartSmsFilter.userId} onChange={(e) => setSmartSmsFilter({ ...smartSmsFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<DateRangePicker value={smartSmsFilter.dateRange} onChange={(r) => setSmartSmsFilter({ ...smartSmsFilter, dateRange: r })} /><input className={`${inputCls} sm:max-w-[280px]`} placeholder="Search mobile or short URL" value={smartSmsSearch} onChange={(e) => setSmartSmsSearch(e.target.value)} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(smartSmsRows, 'smartsms-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><Table headers={['Click Time', 'Account', 'Mobile Number', 'Short URL', 'Device', 'Clicks']}>{smartSmsRows.length ? smartSmsRows.map((r) => <tr key={r.id}><Td>{fmtTime(r.time)}</Td><Td className="font-semibold text-ink">{r.account}</Td><Td className="font-mono text-[13px]">{r.mobile}</Td><Td className="font-mono text-[12px] text-brand-600 hover:underline cursor-pointer">{r.shortUrl}</Td><Td>{r.device}</Td><Td className="font-bold text-center">{r.clicks}</Td></tr>) : <EmptyRow colSpan={6} text="No click analytics found" />}</Table></Card>}
</div>
}