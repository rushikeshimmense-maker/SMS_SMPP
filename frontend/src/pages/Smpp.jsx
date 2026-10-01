import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { fmtTime } from '../lib/format.js'
import { Sparkline } from '../components/Charts.jsx'
import { Button, Card, Chip, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

export default function Smpp() {
  const toast = useToast()
  const [binds, setBinds] = useState([])
  const [logs, setLogs] = useState([])

  const load = () =>
    Promise.all([api('/smpp/binds'), api('/smpp/logs')]).then(([b, l]) => {
      setBinds(b.items || [])
      setLogs(l.items || [])
    })

  useEffect(() => {
    load()
    const iv = setInterval(load, 4000)
    return () => clearInterval(iv)
  }, [])

  async function toggle(b) {
    try {
      await api(`/smpp/binds/${b.id}/toggle`, { method: 'POST' })
      toast(`${b.systemId} ${b.status === 'bound' ? 'disconnected' : 'bound successfully'}.`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const dirStyle = { '→': 'text-sky-500', '←': 'text-emerald-500', '↔': 'text-gray-400' }

  return (
    <div>
      <PageHeader title="SMPP" sub="SMPP bind accounts, throughput and PDU logs" />

      {/* bind cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {binds.map((b) => (
          <Card key={b.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[15px] font-bold text-ink">{b.systemId}</div>
                <div className="mt-0.5 text-[12.5px] text-gray-400">
                  {b.host}:{b.port}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-gray-100 px-2 py-[3px] text-[11px] font-bold text-gray-500">
                  {b.bindType}
                </span>
                <Chip status={b.status} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#fafbfc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Inbound TPS</div>
                <div className="text-[20px] font-extrabold text-ink">{b.tpsIn}</div>
                <Sparkline data={b.histIn} color="#10b981" />
              </div>
              <div className="rounded-xl bg-[#fafbfc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Outbound TPS</div>
                <div className="text-[20px] font-extrabold text-ink">{b.tpsOut}</div>
                <Sparkline data={b.histOut} color="#e30613" />
              </div>
            </div>

            <Button
              variant={b.status === 'bound' ? 'danger' : 'primary'}
              className="mt-4 w-full"
              onClick={() => toggle(b)}
            >
              {b.status === 'bound' ? 'Unbind / Disconnect' : 'Bind / Connect'}
            </Button>
          </Card>
        ))}
      </div>

      {/* PDU logs */}
      <Card className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold tracking-tight text-ink">SMPP PDU Log</h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold text-brand-600">● Tail (live)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left font-mono text-[12.5px]">
            <thead>
              <tr>
                {['Time', 'Dir', 'PDU', 'Detail'].map((h) => (
                  <th key={h} className="border-b border-gray-100 pb-3 pr-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="transition hover:bg-gray-50/60">
                  <Td className="whitespace-nowrap text-gray-400">{fmtTime(l.ts)}</Td>
                  <Td className={`text-[15px] font-bold ${dirStyle[l.dir] || 'text-gray-400'}`}>{l.dir}</Td>
                  <Td>
                    <span className="rounded bg-ink px-2 py-[2px] text-[11px] font-bold text-white">{l.pdu}</span>
                  </Td>
                  <Td className="text-gray-500">{l.detail}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
