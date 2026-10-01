import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { creditStr, fmtMoney, fmtNum } from '../lib/format.js'
import { useAuth } from '../lib/auth.jsx'
import { AreaChart, DonutChart } from '../components/Charts.jsx'
import PerClientActivity from '../components/PerClientActivity.jsx'
import { Button, Card, StatCard } from '../components/ui.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('today')
  const [summary, setSummary] = useState(null)
  const [traffic, setTraffic] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [platform, setPlatform] = useState(null)

  useEffect(() => {
    let live = true
    const refresh = async () => {
      const [s, t, d, p] = await Promise.all([
        api(`/stats/summary?period=${period}`),
        api(`/stats/traffic?period=${period}`),
        api(`/stats/delivery?period=${period}`),
        api('/stats/platform').catch(() => null),
      ])
      if (!live) return
      setSummary(s); setTraffic(t); setDelivery(d); setPlatform(p)
    }
    refresh()
    const iv = setInterval(refresh, 6000)
    return () => { live = false; clearInterval(iv) }
  }, [period])

  const s = summary?.summary
  const d = delivery

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub={summary ? `All-time ${fmtNum(summary.allTimeSent)} messages sent` : 'Loading…'}
      >
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition ${
                period === p.key ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* role / platform cards */}
      {platform?.cards && (
        <div className="mb-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 xl:grid-cols-4">
          {platform.cards.map((c) => (
            <Card key={c.label} className="flex items-center gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{c.label}</div>
                <div className="mt-1 text-[24px] font-extrabold tracking-tight text-ink">{c.value}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Sent" value={fmtNum(s?.sent)} delta={s?.deltas?.sent} sub="Messages submitted" />
        <StatCard label="Delivered" value={fmtNum(s?.delivered)} delta={s?.deltas?.delivered} accent="text-emerald-600" sub="DLR: DELIVRD" />
        <StatCard label="Failed" value={fmtNum(s?.failed)} delta={s?.deltas?.failed} accent="text-rose-500" sub="DLR: UNDELIV / REJECTD" />
        <StatCard label="Pending" value={fmtNum(s?.pending)} delta={s?.deltas?.pending} accent="text-amber-500" sub="Awaiting DLR / scheduled" />
        <StatCard label="X-Dropped" value={fmtNum(s?.xdropped)} delta={s?.deltas?.xdropped} accent="text-slate-400" sub="Dropped before delivery" />
      </div>

      {/* charts row */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">SMS Traffic</h2>
            <div className="flex items-center gap-4 text-[12px] font-semibold text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Sent</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Delivered</span>
            </div>
          </div>
          {traffic ? (
            <AreaChart
              points={traffic.points}
              series={[
                { key: 'sent', color: '#e30613', label: 'Sent' },
                { key: 'delivered', color: '#10b981', label: 'Delivered' },
              ]}
            />
          ) : (
            <div className="h-[240px] animate-pulse rounded-xl bg-gray-50" />
          )}
        </Card>

        <Card>
          <h2 className="mb-2 text-[16px] font-extrabold tracking-tight text-ink">Delivery Rate</h2>
          {d ? (
            <>
              <div className="flex justify-center py-2">
                <DonutChart
                  size={168}
                  label={`${d.rate}%`}
                  sublabel="delivery rate"
                  segments={[
                    { label: 'Delivered', value: d.delivered, color: '#10b981' },
                    { label: 'Pending', value: d.pending, color: '#fbbf24' },
                    { label: 'Failed', value: d.failed, color: '#f43f5e' },
                  ]}
                />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  ['bg-emerald-500', 'Delivered', d.delivered],
                  ['bg-amber-400', 'Pending', d.pending],
                  ['bg-rose-500', 'Failed', d.failed],
                ].map(([c, l, v]) => (
                  <div key={l} className="flex items-center gap-2 text-[13px]">
                    <span className={`h-2.5 w-2.5 rounded-full ${c}`} />
                    <span className="flex-1 font-medium text-gray-500">{l}</span>
                    <span className="font-bold text-ink">{fmtNum(v)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[240px] animate-pulse rounded-xl bg-gray-50" />
          )}
        </Card>
      </div>

      <PerClientActivity period="today" />
    </div>
  )
}
