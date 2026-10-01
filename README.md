# Nexora Enterprise — SMS & SMPP Panel (3-Tier)

Full reseller-ready SMS & SMPP platform: **Super Admin → Reseller → User**, with live
SMPP management, credit billing and margin tracking.

## Stack

- **Frontend** — Vite 6, React 18, React Router 6, Tailwind CSS 4
- **Backend** — Node 20, Express, JWT + bcrypt, RBAC (3 roles, subtree scoping)
- **Database** — JSON file (`server/db.json`, v2 schema, auto-seeds)
- Browser calls same-origin `/api/*`; Vite proxies to the API on port 3001

## Run

```bash
npm install
npm run dev        # API :3001 + Web :5173
```

Production: `npm run build && npm start`.

## Demo accounts (tap-to-fill chips on the login page)

| Role | User | Password | Sees |
|------|------|----------|------|
| **Super Admin** | `superadmin` | `super@123` | Whole platform: resellers, all SMPP, gateways, credits |
| **Reseller** | `reseller1` | `reseller@123` | Own clients, their SMPP accounts, funding, margin |
| **User** | `user1` | `user@123` | Own SMS, campaigns, SMPP credentials, wallet |

(also `admin/nexora123` = Super Admin alias)

## Role matrix

| Feature | Super Admin | Reseller | User |
|---|---|---|---|
| Dashboard (scoped stats + platform cards) | ✅ | ✅ | ✅ |
| Send SMS / Campaigns (balance-debited) | ✅ | ✅ | ✅ |
| Reports (DLR, filters, CSV) + account filter | ✅ all | ✅ subtree | ✅ own |
| **SMPP Center** — live binds, kick, TPS | ✅ all | ✅ subtree | — |
| **My SMPP** — credentials, rotate, live TPS | — | — | ✅ |
| SMPP client accounts create/rotate/suspend | ✅ | ✅ for clients | — |
| Upstream **gateways** (routes) CRUD + connect | ✅ | view only | — |
| PDU logs (live tail) | ✅ all | ✅ subtree | ✅ own |
| Users & Resellers (create, rate, status) | ✅ resellers+users | ✅ clients only | — |
| Fund / deduct credits | ✅ anyone | ✅ direct children | — |
| Top-up requests | approve all | approve children | request |
| Billing ledger + **margin** tracking | ✅ | ✅ | own history |
| **Packages** (prepaid bundles + bonus credit) | create/manage | ✅ buy | ✅ buy |
| **Contacts** + **Templates** + **DND/opt-out** (auto-skip at send) | ✅ | ✅ | ✅ |
| **Notifications** bell + SSE live feed | ✅ | ✅ | ✅ |
| Sender IDs + approvals | ✅ | ✅ clients | request only |
| API keys, profile, team, platform settings | ✅ | ✅ (own) | ✅ (own) |

## SMPP features

- **Client accounts** — system_id + password (rotate = live kick), IP whitelist, max TPS, TRX/TX/RX
- **Live binds** — bound sessions with source IP, uptime, in/out TPS sparklines, force-kick
- **Upstream gateways** — operator routes (host/port/bind/prefix/priority/rate/TPS), connect/disconnect
- **PDU log tail** — bind/submit/deliver_sm/enquire_link stream, scoped per account owner
- Live simulators: TPS walks, DLR arrivals, campaign throughput

## Packages & real-time

- **Prepaid packages** (`/packages`) — superadmin creates bundles (price → wallet credit + bonus %); resellers/users buy from wallet; purchase history scoped per tenant tree
- **Contacts** (`/contacts`) — phone book with groups + bulk import, reusable message templates, **DND / opt-out compliance** (blocked numbers are auto-skipped on every send and reported)
- **SSE live feed** (`GET /api/live`) — `balance`, `notification`, `pdu`, `binds` event frames pushed to the UI
- **Notifications** (`GET /notifications`, `POST /notifications/read`) — bell with unread badge; alerts for top-ups, sender approvals, low balance, campaign completion, SMPP kicks

## Billing

Wallet per account, per-role **rate cards** (superadmin $0.010 → reseller $0.016 → user $0.020+),
margins computed from rate spread × volume. Sends & campaigns debit the wallet (402 when low),
top-ups flow user → reseller → superadmin with approve/reject.

## Structure

```
server/
  index.js     # REST API: auth, RBAC, users, billing, SMPP, stats, simulators
  db.js        # JSON DB v2 + seed (7 accounts, SMPP, gateways, ledger…)
src/
  lib/         # api client (3-token transport), auth ctx, formatters
  components/  # AppLayout (role nav), Login/Hero/DeviceScene, Charts, UI kit
  pages/       # Dashboard, SendSms, Campaigns, Reports, Users,
               # SmppCenter, MySmpp, Billing, Settings
```
