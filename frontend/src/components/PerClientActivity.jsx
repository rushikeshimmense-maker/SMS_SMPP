import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { fmtNum } from '../lib/format.js'
import { Button, Card, inputCls, Table, Td } from './ui.jsx'

const LIMIT = 5
const PAGE_SIZE = 25

const QUICK = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
]

const fmtDay = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function TypePill({ type }) {
  return (
    <span className="inline-flex rounded-full border border-gray-200 px-2.5 py-[2px] text-[11px] font-bold text-gray-500">
      {type}
    </span>
  )
}

function DateRangePicker({ sel, setSel, custom, setCustom }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ from: '', to: '' })

  const today = new Date()
  const rangeEnd = custom ? new Date(`${custom.to}T00:00:00`) : today
  const rangeStart = custom
    ? new Date(`${custom.from}T00:00:00`)
    : sel === 'today'
      ? today
      : new Date(today.getTime() - (sel === '30d' ? 29 : 6) * 86400000)
  const label = `${fmtDay(rangeStart)} – ${fmtDay(rangeEnd)}`

  function applyCustom() {
    if (!draft.from || !draft.to || draft.from > draft.to) return
    setCustom({ from: draft.from, to: draft.to })
    setOpen(false)
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white pl-3 pr-2.5 text-[12.5px] font-semibold text-gray-600 transition hover:border-brand-300 hover:text-brand-600 sm:w-auto"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className="whitespace-nowrap tabular-nums">{label}</span>
        <span className="rounded-md bg-gray-100 px-1.5 py-[1px] text-[10px] font-bold tracking-wide text-gray-400">IST</span>
        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="shrink-0 opacity-60">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[75]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+8px)] z-[80] w-[min(280px,calc(100vw-48px))] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl sm:left-auto sm:right-0" role="menu">
            {QUICK.map((q) => {
              const active = !custom && sel === q.key
              return (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => { setSel(q.key); setCustom(null); setOpen(false) }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold transition ${
                    active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-gray-600 hover:bg-gray-50 hover:text-ink'
                  }`}
                >
                  {q.label}
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="shrink-0"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" /></svg>
                  )}
                </button>
              )
            })}
            <div className="my-1 border-t border-gray-100" />
            <div className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">Custom range</div>
            <div className="flex flex-col gap-2 px-3 pb-3">
              <input type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={inputCls} />
              <input type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={inputCls} />
              <Button onClick={applyCustom} disabled={!draft.from || !draft.to || draft.from > draft.to}>
                Apply range
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function PerClientActivity({ period = '7d', showAll = false, showTotals = false }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [sel, setSel] = useState(period)
  const [custom, setCustom] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setSel(period)
    setCustom(null)
  }, [period])

  const query = custom ? `from=${custom.from}&to=${custom.to}` : `period=${sel}`
  const load = useCallback(() => {
    api(`/stats/clients?${query}`).then(setData).catch(() => {})
  }, [query])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [query, showAll])

  const rows = data?.rows || []
  const isSender = rows[0]?.type === 'Sender'
  const nameLabel = isSender ? 'Sender ID' : 'Client'
  const unit = isSender ? 'senders' : 'clients'
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const activePage = Math.min(page, totalPages)
  const pageStart = (activePage - 1) * PAGE_SIZE
  const visible = showAll ? rows.slice(pageStart, pageStart + PAGE_SIZE) : rows.slice(0, LIMIT)

  const openRow = (r) => {
    if (r.type === 'Sender') navigate(`/reports?search=${encodeURIComponent(r.id)}`)
    else navigate(`/reports?userId=${r.id}`)
  }

  const headers = [nameLabel, 'Type', 'Submitted', 'Delivered', 'Failed', 'Pending', 'X-Dropped', 'Success %', '']

  const renderRow = (r) => (
    <tr key={r.id} onClick={() => openRow(r)} className="cursor-pointer transition hover:bg-gray-50/70">
      <Td className="font-bold text-ink">{r.name}</Td>
      <Td><TypePill type={r.type} /></Td>
      <Td className="font-semibold text-ink tabular-nums">{fmtNum(r.submitted)}</Td>
      <Td className="font-semibold text-emerald-600 tabular-nums">{fmtNum(r.delivered)}</Td>
      <Td className="font-semibold text-rose-500 tabular-nums">{fmtNum(r.failed)}</Td>
      <Td className="font-semibold text-amber-500 tabular-nums">{fmtNum(r.pending)}</Td>
      <Td className="font-semibold text-slate-400 tabular-nums">{fmtNum(r.xdropped)}</Td>
      <Td className={`font-bold tabular-nums ${r.successPct >= 90 ? 'text-emerald-600' : r.successPct >= 75 ? 'text-amber-600' : 'text-rose-500'}`}>
        {r.submitted ? `${r.successPct.toFixed(1)}%` : '—'}
      </Td>
      <Td className="text-right">
        <span className="text-[12.5px] font-bold text-brand-600 hover:underline">Open</span>
      </Td>
    </tr>
  )

  return (
    <>
      {showTotals && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Submitted', value: fmtNum(rows.reduce((a, b) => a + (b.submitted || 0), 0)) },
            { label: 'Delivered', value: fmtNum(rows.reduce((a, b) => a + (b.delivered || 0), 0)), accent: 'text-emerald-600' },
            { label: 'Failed', value: fmtNum(rows.reduce((a, b) => a + (b.failed || 0), 0)), accent: 'text-rose-500' },
            { label: 'Pending', value: fmtNum(rows.reduce((a, b) => a + (b.pending || 0), 0)), accent: 'text-amber-500' },
            { label: 'X-Dropped', value: fmtNum(rows.reduce((a, b) => a + (b.rejected || 0), 0)), accent: 'text-slate-400' },
            { label: 'Success %', value: rows.reduce((a, b) => a + (b.submitted || 0), 0) > 0 ? ((rows.reduce((a, b) => a + (b.delivered || 0), 0) / rows.reduce((a, b) => a + (b.submitted || 0), 0)) * 100).toFixed(1) + '%' : '0%', accent: 'text-brand-600' }
          ].map(c => (
            <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{c.label}</div>
              <div className={`mt-1 text-[22px] font-extrabold tracking-tight ${c.accent || 'text-ink'}`}>{c.value}</div>
            </div>
          ))}
        </div>
      )}
      <Card className="mt-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight text-brand-600">
            <span className="inline-block h-[18px] w-[5px] shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
            {isSender ? 'Per-sender activity' : showAll ? 'All client traffic' : 'Top 5 client activity'}
          </h2>
          <p className="mt-1 text-[12.5px] text-gray-400">
            {isSender
              ? 'Traffic broken down by sender ID. Click a row to drill into those messages with filters and export.'
              : showAll
                ? 'Complete client traffic list, ranked by submitted volume. Click a row for message-level reports.'
                : 'Today’s five highest-sending clients. Click a row for message-level reports.'}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {showAll && <DateRangePicker sel={sel} setSel={setSel} custom={custom} setCustom={setCustom} />}
          {!showAll && (
            <Button onClick={() => navigate('/traffic-routing')} className="bg-red-600 text-white hover:bg-red-700 whitespace-nowrap border-none">
              Show more
            </Button>
          )}
          <Button variant="secondary" onClick={load} className="whitespace-nowrap">Refresh</Button>
        </div>
      </div>

      <Table headers={headers}>
        {visible.map(renderRow)}
        {!rows.length && (
          <tr>
            <td colSpan={9} className="py-10 text-center text-[13.5px] text-gray-400">
              No traffic in this period
            </td>
          </tr>
        )}
      </Table>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12.5px] text-gray-400">
          {showAll
            ? rows.length
              ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, rows.length)} of ${rows.length} ${unit}`
              : `Showing 0 ${unit}`
            : `Showing top ${Math.min(LIMIT, rows.length)} of ${rows.length} ${unit}`}
        </span>
        {showAll && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={activePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="min-w-[88px] text-center text-[12.5px] font-semibold text-gray-500">
              Page {activePage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={activePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Card>
    </>
  )
}
