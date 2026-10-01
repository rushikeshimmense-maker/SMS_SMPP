import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { onLive } from '../lib/live.js'
import { fmtTime } from '../lib/format.js'
import { Sparkline } from '../components/Charts.jsx'
import { Button, Card, Chip, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { CopyIcon, EyeIcon, EyeOffIcon, RefreshIcon } from '../components/Icons.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

export default function MySmpp() {
  const toast = useToast()
  const [accounts, setAccounts] = useState([])
  const [logs, setLogs] = useState([])
  const [settings, setSettings] = useState(null)
  const [shown, setShown] = useState({}) // accountId -> password (after rotate)

  const load = () => {
    api('/smpp/accounts').then((d) => setAccounts(d.items || []))
    api('/smpp/logs').then((d) => setLogs(d.items || []))
    api('/settings').then((d) => setSettings(d.settings))
  }
  useEffect(() => {
    load()
    const off = onLive('pdu', load)
    const iv = setInterval(load, 4000)
    return () => {
      off()
      clearInterval(iv)
    }
  }, [])

  async function rotate(acc) {
    try {
      const r = await api(`/smpp/accounts/${acc.id}`, { method: 'PATCH', body: { rotatePassword: true } })
      setShown((s) => ({ ...s, [acc.id]: r.password }))
      toast('Password rotated — copy it now.', 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const host = settings?.smppHost || 'smpp.example.com'
  const ports = settings?.ports || { trx: 2775, tx: 2776, rx: 2777 }

  return (
    <div>
      <PageHeader title="My SMPP" sub="Your bind credentials, live connection status and PDU logs" />

      {/* endpoint info */}
      <Card className="mb-5">
        <h2 className="mb-3 text-[16px] font-extrabold tracking-tight text-ink">Connection endpoint</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Host', host],
            ['TRX port', ports.trx],
            ['TX port', ports.tx],
            ['RX port', ports.rx],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-[#fafbfc] p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{l}</div>
              <div className="mt-1 font-mono text-[15px] font-bold text-ink">{v}</div>
            </div>
          ))}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-[12px] leading-relaxed text-emerald-300">{`smpp_client -H ${host} -p ${ports.trx} \\
  -u ${accounts[0]?.systemId || '<system_id>'} -P '<password>' \\
  -b TRX --tls --dlr-forward https://yourapp.example/dlr`}</pre>
      </Card>

      {/* accounts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[16px] font-bold text-ink">{a.systemId}</div>
                <div className="mt-0.5 text-[12.5px] text-gray-400">{a.bindType || 'TRX'} · max {a.maxTps} TPS · created {fmtTime(a.createdAt)}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Chip status={a.status === 'active' ? 'Active' : 'Pending'}>{a.status}</Chip>
                {a.live ? <Chip status="bound">● bound</Chip> : <Chip status="unbound">not bound</Chip>}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 bg-[#fafbfc] p-3.5">
              <div className="flex items-center gap-2">
                <span className="w-[72px] text-[11px] font-bold uppercase tracking-wide text-gray-400">Password</span>
                <code className="flex-1 select-all font-mono text-[13.5px] font-bold text-gray-700">
                  {shown[a.id] ? shown[a.id] : shown[a.id] === '' ? '' : '••••••••••'}
                </code>
                <button
                  type="button"
                  title="Rotate password (connection will drop)"
                  onClick={() => rotate(a)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-brand-600"
                >
                  <RefreshIcon className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  title="Copy password"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(shown[a.id] || '(rotate to reveal)').catch(() => {})
                    toast('Copied.', 'success')
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <CopyIcon className="h-[18px] w-[18px]" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="w-[72px] text-[11px] font-bold uppercase tracking-wide text-gray-400">IP allow</span>
                <span className="flex flex-wrap gap-1.5">
                  {(a.ipWhitelist || []).map((ip) => (
                    <span key={ip} className="rounded-md bg-white px-2 py-[3px] font-mono text-[12px] text-gray-600 shadow-sm">{ip}</span>
                  ))}
                  {!a.ipWhitelist?.length && <span className="text-[12.5px] text-gray-400">Any IP</span>}
                </span>
              </div>
            </div>

            {a.live && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#fafbfc] p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Inbound TPS</div>
                  <div className="text-[18px] font-extrabold text-ink">{a.live.tpsIn}</div>
                  <Sparkline data={a.live.histIn} color="#10b981" height={30} />
                </div>
                <div className="rounded-xl bg-[#fafbfc] p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Outbound TPS</div>
                  <div className="text-[18px] font-extrabold text-ink">{a.live.tpsOut}</div>
                  <Sparkline data={a.live.histOut} color="#e30613" height={30} />
                </div>
              </div>
            )}
            {!a.live && (
              <p className="mt-4 rounded-xl bg-[#fafbfc] p-3.5 text-[13px] leading-relaxed text-gray-500">
                Not currently bound. Use the credentials above from your SMPP client — the connection will appear here within seconds with live TPS.
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* PDU logs */}
      <Card className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold tracking-tight text-ink">My PDU log</h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold text-brand-600">● Tail (live)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left font-mono text-[12.5px]">
            <thead>
              <tr>
                {['Time', 'Dir', 'PDU', 'Account', 'Detail'].map((h) => (
                  <th key={h} className="border-b border-gray-100 pb-3 pr-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const acc = accounts.find((x) => x.id === l.accountId)
                return (
                  <tr key={l.id} className="transition hover:bg-gray-50/60">
                    <Td className="whitespace-nowrap text-gray-400">{fmtTime(l.ts)}</Td>
                    <Td className="text-[15px] font-bold text-sky-500">{l.dir}</Td>
                    <Td><span className="rounded bg-ink px-2 py-[2px] text-[11px] font-bold text-white">{l.pdu}</span></Td>
                    <Td className="text-gray-500">{acc?.systemId || '—'}</Td>
                    <Td className="text-gray-500">{l.detail}</Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
