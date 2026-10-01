const now = new Date().toISOString()

const user = {
  id: 'u-super', userId: 'superadmin', name: 'System Administrator',
  companyName: 'SMSBridge', email: 'admin@example.com', role: 'superadmin',
  balance: 0, pricePerSms: 0.008, status: 'active', createdAt: '2025-01-12T09:00:00.000Z',
}

const featuredClients = [
  ['u1', 'Acme Retail', 'User', 48640, 47218, 892, 410, 120, 97.1],
  ['u2', 'Orbit Fintech', 'User', 42120, 40896, 740, 344, 140, 97.1],
  ['u3', 'Northstar Media', 'Reseller', 37820, 36104, 1082, 472, 162, 95.5],
  ['u4', 'Metro Health', 'User', 31750, 30592, 684, 332, 142, 96.4],
  ['u5', 'Bright Commerce', 'User', 28960, 27764, 704, 330, 162, 95.9],
  ['u6', 'Summit Travel', 'User', 24340, 23118, 738, 316, 168, 95.0],
  ['u7', 'Cedar Logistics', 'Reseller', 21680, 20544, 706, 276, 154, 94.8],
  ['u8', 'Vertex Labs', 'User', 18420, 17482, 556, 244, 138, 94.9],
]

const additionalNames = [
  'Bluewave Services', 'Kite Digital', 'Pioneer Finance', 'RapidKart', 'Greenfield Education',
  'Nova Insurance', 'Urban Foods', 'Prime Mobility', 'Apex Support', 'Silverline Tech',
  'Cloudnine Retail', 'TrustPay', 'Everest Networks', 'Galaxy Estates', 'Infiniti Care',
  'Sunrise Utilities', 'Quantum Connect',
]

const additionalClients = additionalNames.map((name, index) => {
  const submitted = 17200 - index * 610
  const failed = 320 + (index % 5) * 41
  const pending = 126 + (index % 4) * 29
  const xdropped = 58 + (index % 3) * 17
  const delivered = submitted - failed - pending - xdropped
  return [`u${index + 9}`, name, index % 6 === 0 ? 'Reseller' : 'User', submitted, delivered, failed, pending, xdropped, +((delivered / submitted) * 100).toFixed(1)]
})

const clients = [...featuredClients, ...additionalClients].map(([id, name, type, submitted, delivered, failed, pending, xdropped, successPct]) => ({
  id, name, type, submitted, delivered, failed, pending, xdropped, successPct,
}))

const users = clients.map((c, i) => ({
  id: c.id, userId: c.name.toLowerCase().replaceAll(' ', '.'), name: c.name,
  companyName: c.name, email: `ops${i + 1}@example.com`,
  role: c.type.toLowerCase(), balance: 1250 + i * 380, pricePerSms: 0.011 + i * 0.001,
  status: i === 6 ? 'suspended' : 'active', parentName: 'SMSBridge', createdAt: now,
}))

const messages = Array.from({ length: 18 }, (_, i) => ({
  id: `MSG-${String(81540 + i).padStart(6, '0')}`, ownerId: clients[i % clients.length].id, userId: clients[i % clients.length].id, ownerName: clients[i % clients.length].name,
  to: `+91 98${String(76543210 + i).padStart(8, '0')}`, from: i % 2 ? 'ALERTS' : 'VERIFY',
  status: ['delivered', 'delivered', 'delivered', 'pending', 'failed'][i % 5],
  segments: 1, encoding: 'GSM-7', cost: 0.012, submittedAt: new Date(Date.now() - i * 3600000).toISOString(),
  deliveredAt: i % 5 < 3 ? new Date(Date.now() - i * 3600000 + 18000).toISOString() : null,
  text: i % 2 ? 'Your notification has been processed.' : 'Your verification code is 482193.',
}))

const gateways = [
  { id: 'gw1', name: 'India DLT Primary', host: 'smpp-in-1.example.net', port: 2775, systemId: 'INDIA01', status: 'connected', maxTps: 2500, currentTps: 2091, country: 'India' },
  { id: 'gw2', name: 'US/Canada', host: 'smpp-us.example.net', port: 2775, systemId: 'USCA01', status: 'connected', maxTps: 3000, currentTps: 1086, country: 'US/Canada' },
]

const accounts = users.slice(0, 5).map((u, i) => ({
  id: `smpp${i + 1}`, userId: u.id, username: u.userId, companyName: u.companyName,
  systemId: `client_${i + 1}`, password: '••••••••', maxTps: 100 + i * 50,
  status: i === 4 ? 'inactive' : 'active', binds: i === 4 ? 0 : 1, ip: `10.20.0.${20 + i}`,
}))

const settings = {
  name: 'System Administrator', companyName: 'SMSBridge', email: 'admin@example.com',
  supportEmail: 'support@example.com', timezone: 'UTC', currency: 'USD', lowBalanceAlert: 100,
}

function ok(data) { return Promise.resolve(data) }
function fail(message) { return Promise.reject(new Error(message)) }

export function demoApi(rawPath, { method = 'GET', body = {}, token } = {}) {
  const [path, query = ''] = rawPath.split('?')
  const params = new URLSearchParams(query)

  if (path === '/auth/login') {
    if (!body?.userId || !body?.password) return fail('Enter your user ID and password.')
    return ok({ token: 'nexora-preview-session', user })
  }
  if (path === '/auth/me') return token ? ok({ user }) : fail('Not signed in')
  if (path === '/auth/security-question') return ok({ question: 'What is your account verification word?' })
  if (path === '/auth/security-answer') return ok({ token: 'nexora-preview-session', user })
  if (path === '/auth/forgot' || path === '/auth/change-password') return ok({ ok: true })

  if (!token) return fail('Session expired')

  if (path === '/stats/summary') return ok({
    allTimeSent: 1248640,
    summary: { sent: 185420, delivered: 178936, failed: 3860, pending: 1684, xdropped: 940,
      deltas: { sent: 12.4, delivered: 11.8, failed: -4.2, pending: 2.1, xdropped: -1.6 } },
  })
  if (path === '/stats/traffic') return ok({ points: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => ({ label, sent: [18,24,21,31,27,38,44][i] * 1000, delivered: [17,23,20,29,26,36,42][i] * 1000 })) })
  if (path === '/stats/delivery') return ok({ rate: 96.5, delivered: 178936, pending: 1684, failed: 3860 })
  if (path === '/stats/platform') return ok({ cards: [
    { label: 'Active clients', value: '128' }, { label: 'Live binds', value: '42' },
    { label: 'Available TPS', value: '7,800' }, { label: 'Routes online', value: '12 / 13' },
  ] })
  if (path === '/stats/clients') {
    return ok({ items: clients, rows: clients, total: clients.length })
  }
  if (path === '/users') return ok({ items: users, total: users.length })
  if (path === '/messages') return ok({ items: messages, total: messages.length })
  if (path === '/notifications') return ok({ items: [
    { id: 'n1', title: 'Route restored', message: 'India primary route is operating normally.', createdAt: now, read: false },
    { id: 'n2', title: 'Daily report ready', message: 'Your delivery report is available.', createdAt: now, read: true },
  ], unread: 1 })
  if (path === '/billing/overview') return ok({ balance: 0, usage30d: 2384.72, margin30d: 714.28, pendingCount: 2, pendingSum: 3500, topups: [], transactions: [] })
  if (path === '/smpp/gateways') return ok({ items: gateways })
  if (path === '/smpp/accounts') return ok({ items: accounts })
  if (path === '/smpp/live' || path === '/smpp/binds') return ok({ items: accounts.filter((a) => a.binds).map((a, i) => ({ ...a, id: `bind${i}`, accountId: a.id, connectedAt: now, state: 'BOUND_TRX', currentTps: 34 + i * 9 })) })
  if (path === '/smpp/logs') return ok({ items: accounts.slice(0, 4).map((a, i) => ({ id: `log${i}`, account: a.systemId, event: i ? 'Bind accepted' : 'Session connected', status: 'success', createdAt: now })) })
  if (path === '/campaigns') return ok({ items: [
    { id: 'c1', name: 'September Offers', senderId: 'ALERTS', audience: 28500, delivered: 27342, status: 'running', createdAt: now },
    { id: 'c2', name: 'Payment Reminders', senderId: 'VERIFY', audience: 12400, delivered: 12086, status: 'completed', createdAt: now },
  ] })
  if (path === '/packages') return ok({ items: [
    { id: 'p1', name: 'Starter', credits: 10000, price: 110, validityDays: 30, status: 'active' },
    { id: 'p2', name: 'Growth', credits: 50000, price: 500, validityDays: 60, status: 'active' },
    { id: 'p3', name: 'Scale', credits: 200000, price: 1800, validityDays: 90, status: 'active' },
  ] })
  if (path === '/contacts') return ok({ items: [{ id: 'ct1', name: 'Operations', phone: '+91 98765 43210', group: 'Customers', createdAt: now }] })
  if (path === '/templates') return ok({ items: [{ id: 't1', name: 'OTP', text: 'Your verification code is {{code}}.', category: 'Transactional', status: 'Approved', createdAt: now }] })
  if (path === '/dnd') return ok({ items: [{ id: 'd1', number: '+91 90000 00001', reason: 'Opted out', createdAt: now }] })
  if (path === '/sender-ids') return ok({ items: [{ id: 's1', senderId: 'ALERTS', entity: 'Platform', route: 'Transactional', status: 'Approved', createdAt: now }] })
  if (path === '/settings') return ok({ settings, profile: user, senderIds: [{ id: 's1', senderId: 'ALERTS', entity: 'Platform', route: 'Transactional', status: 'Approved' }], apiKeys: [{ id: 'k1', name: 'Primary API', key: 'nx_live_••••••••••••8f21', createdAt: now }], gateways, team: [] })

  if (path === '/messages/send') return ok({ ok: true, messageId: `MSG-${Date.now()}` })
  if (path === '/api-keys/regenerate') return ok({ apiKey: { id: body?.id || 'k1', key: `nx_demo_${Date.now()}` } })
  if (method !== 'GET') return ok({ ok: true, item: body })
  return ok({ items: [] })
}
