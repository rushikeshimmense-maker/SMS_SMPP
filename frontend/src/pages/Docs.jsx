import { Card } from '../components/ui.jsx'
import { PageHeader } from '../components/AppLayout.jsx'
import { useAuth } from '../lib/auth.jsx'

function Code({ children }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-emerald-300">
      {children}
    </pre>
  )
}

function Endpoint({ method, path, desc }) {
  const color = { GET: 'bg-sky-50 text-sky-600', POST: 'bg-emerald-50 text-emerald-600', PATCH: 'bg-amber-50 text-amber-600', PUT: 'bg-violet-50 text-violet-600' }
  return (
    <tr>
      <td className="border-b border-gray-50 py-2.5 pr-3">
        <span className={`rounded px-1.5 py-[2px] font-mono text-[11px] font-bold ${color[method] || 'bg-gray-100'}`}>{method}</span>
      </td>
      <td className="border-b border-gray-50 py-2.5 pr-3 font-mono text-[12.5px] font-semibold text-ink">{path}</td>
      <td className="border-b border-gray-50 py-2.5 text-[13px] text-gray-500">{desc}</td>
    </tr>
  )
}

export default function Docs() {
  const { user: me } = useAuth()
  const base = '/api'

  return (
    <div>
      <PageHeader title="API & SMPP Docs" sub="HTTP API reference and SMPP bind guide for developers" />

      <Card className="mb-5">
        <h2 className="text-[17px] font-extrabold tracking-tight text-ink">Authentication</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-gray-500">
          Login returns a JWT (12h, or 30 days with remember). Send it on every request as a Bearer header
          (or the <code className="rounded bg-gray-100 px-1 font-mono text-[12px]">x-nx-token</code> header /{' '}
          <code className="rounded bg-gray-100 px-1 font-mono text-[12px]">nx_tok</code> cookie).
        </p>
        <Code>{`curl -X POST ${base}/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"userId":"${me?.userId || 'user1'}","password":"••••"}'

# → { "token": "eyJhbGciOi…", "user": { "role": "${me?.role || 'user'}", … } }`}</Code>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-[17px] font-extrabold tracking-tight text-ink">Send SMS (HTTP)</h2>
          <Code>{`curl -X POST ${base}/messages/send \\
  -H "Authorization: Bearer $TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "senderId": "SHOPEZ",
    "recipients": ["+91 98765 43210"],
    "text": "Your OTP is 482913",
    "scheduleAt": null
  }'`}</Code>
          <p className="mt-2 text-[12.5px] text-gray-400">
            Segments and encoding are computed server-side (GSM-7 160 / UCS-2 70 chars). Your wallet is debited
            at your rate × segments; 402 is returned when credits are insufficient. DLRs arrive via{' '}
            <code className="rounded bg-gray-100 px-1 font-mono">deliver_sm</code> and your webhook.
          </p>
        </Card>

        <Card>
          <h2 className="text-[17px] font-extrabold tracking-tight text-ink">SMPP bind guide</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="pb-2 pr-3">Setting</th>
                  <th className="pb-2">Value</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['Host', 'smpp.example.com'],
                  ['TRX port', '2775 (bind_transceiver)'],
                  ['TX port', '2776 (bind_transmitter)'],
                  ['RX port', '2777 (bind_receiver)'],
                  ['System ID', 'per SMPP account (My SMPP page)'],
                  ['Password', 'rotate anytime from the panel (kicks live binds)'],
                  ['IP allowlist', 'required — your egress IPs only'],
                  ['Throughput', 'account Max TPS is enforced per bind'],
                  ['DLRs', 'deliver_sm with stat:DELIVRD / UNDELIV'],
                  ['Keep-alive', 'enquire_link every 30s'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="border-b border-gray-50 py-2 pr-3 font-semibold text-ink">{k}</td>
                    <td className="border-b border-gray-50 py-2">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Code>{`smpp_client -H smpp.example.com -p 2775 \\
  -u <system_id> -P '<password>' -b TRX --tls`}</Code>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="text-[17px] font-extrabold tracking-tight text-ink">REST endpoints</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                <th className="pb-2 pr-3">Method</th>
                <th className="pb-2 pr-3">Path</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <Endpoint method="POST" path="/auth/login" desc="Get a JWT (userId, password, remember)" />
              <Endpoint method="POST" path="/auth/security-question" desc="Fallback sign-in — get the question" />
              <Endpoint method="GET" path="/auth/me" desc="Current user + balance" />
              <Endpoint method="GET" path="/stats/summary?period=today|7d|30d" desc="Sent / delivered / failed / pending + deltas" />
              <Endpoint method="GET" path="/stats/traffic" desc="Chart series for the period" />
              <Endpoint method="GET" path="/messages?status=&search=&userId=&page=" desc="DLR log (scoped to your subtree)" />
              <Endpoint method="POST" path="/messages/send" desc="Send/schedule an SMS batch (max 500)" />
              <Endpoint method="GET" path="/campaigns" desc="Bulk campaigns with live progress" />
              <Endpoint method="POST" path="/campaigns" desc="Create a campaign (prepaid reserve)" />
              <Endpoint method="GET" path="/smpp/accounts" desc="Your scoped SMPP client accounts" />
              <Endpoint method="POST" path="/smpp/accounts" desc="Create account (staff) — returns one-time password" />
              <Endpoint method="GET" path="/smpp/live" desc="Live binds with TPS + source IPs" />
              <Endpoint method="GET" path="/smpp/logs" desc="PDU log tail (scoped)" />
              <Endpoint method="GET" path="/smpp/gateways" desc="Upstream operator routes (staff)" />
              <Endpoint method="GET" path="/billing/overview" desc="Wallet, usage, margin, ledger, top-ups" />
              <Endpoint method="POST" path="/billing/topups" desc="Request a top-up (users)" />
              <Endpoint method="POST" path="/billing/topups/:id/approve" desc="Approve top-up (provider)" />
              <Endpoint method="GET" path="/packages" desc="Prepaid bundles + purchase history" />
              <Endpoint method="POST" path="/packages/:id/buy" desc="Buy a bundle with wallet credit" />
              <Endpoint method="GET" path="/users" desc="Accounts in your subtree (staff)" />
              <Endpoint method="POST" path="/users/:id/fund" desc="Move credits to a child account" />
              <Endpoint method="GET" path="/notifications" desc="Notification feed (also on /live SSE)" />
              <Endpoint method="GET" path="/live" desc="SSE stream: notification / balance / pdu events" />
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="text-[17px] font-extrabold tracking-tight text-ink">Live events (SSE)</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-gray-500">
          Connect to <code className="rounded bg-gray-100 px-1 font-mono text-[12px]">GET /live?token=$TOKEN</code> for
          server-sent events. The panel consumes these for the notification bell, wallet balance and the live PDU tail.
        </p>
        <Code>{`event: notification   { "title": "Top-up approved", … }
event: balance        { "userId": "…", "balance": 430.2 }
event: pdu            { "dir": "←", "pdu": "deliver_sm", … }`}</Code>
      </Card>
    </div>
  )
}
