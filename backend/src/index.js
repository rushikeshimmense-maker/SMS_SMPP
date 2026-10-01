/**
 * Nexora SMS & SMPP Panel — REST API with JWT auth + 3-tier RBAC.
 * superadmin → reseller → user. Everything scoped to the caller's subtree.
 */
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { calcSegments, getDb, loadDb, save, uid } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'nexora-dev-secret-change-me'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

loadDb()

/* ------------------------------- helpers ------------------------------- */
const sign = (user, remember) =>
  jwt.sign({ sub: user.id, userId: user.userId, role: user.role }, JWT_SECRET, {
    expiresIn: remember ? '30d' : '12h',
  })

const publicUser = (u) => {
  const { passwordHash, securityAnswer, ...rest } = u
  return rest
}

function subtreeIds(user) {
  const db = getDb()
  const ids = new Set([user.id])
  let frontier = [user.id]
  while (frontier.length) {
    const next = []
    for (const id of frontier) {
      for (const u of db.users) {
        if (u.parentId === id && !ids.has(u.id)) {
          ids.add(u.id)
          next.push(u.id)
        }
      }
    }
    frontier = next
  }
  return ids
}

function auth(req, res, next) {
  const h = req.headers.authorization || ''
  let token = h.startsWith('Bearer ') && h.length > 7 ? h.slice(7) : null
  let via = 'bearer'
  if (!token && req.headers['x-nx-token']) {
    token = String(req.headers['x-nx-token'])
    via = 'x-nx-token'
  }
  if (!token) {
    const m = /(?:^|;\s*)nx_tok=([^;]+)/.exec(req.headers.cookie || '')
    if (m) {
      token = decodeURIComponent(m[1])
      via = 'cookie'
    }
  }
  if (!token) {
    console.log(`[auth] 401 no-token ${req.method} ${req.path}`)
    return res.status(401).json({ error: 'Not authenticated' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = getDb().users.find((u) => u.id === payload.sub)
    if (!user) return res.status(401).json({ error: 'Session expired' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    req.user = user
    req.scope = subtreeIds(user) // Set of visible user ids (self + descendants)
    req.seeAll = user.role === 'superadmin'
    next()
  } catch (e) {
    console.log(`[auth] 401 bad-token via=${via} reason=${e.message}`)
    return res.status(401).json({ error: 'Session expired' })
  }
}

const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden for your role' })

const owns = (req, row) => req.seeAll || req.scope.has(row.userId)

function pushLog({ dir, pdu, detail, accountId }) {
  const db = getDb()
  const row = { id: uid('log'), ts: new Date().toISOString(), dir, pdu, detail, accountId: accountId || null }
  db.smppLogs.unshift(row)
  if (db.smppLogs.length > 300) db.smppLogs.length = 300
  const acc = accountId ? db.smppAccounts.find((a) => a.id === accountId) : null
  broadcast('pdu', row, (c) => {
    if (!accountId) return c.seeAll
    return acc ? c.seeAll || c.scope.has(acc.ownerId) : false
  })
}

function addTx({ type, fromId, toId, amount, note, balanceAfter }) {
  getDb().transactions.unshift({
    id: uid('tx'), ts: new Date().toISOString(), type, fromId: fromId || null, toId: toId || null,
    amount: +(+amount).toFixed(4), note, balanceAfter: +(balanceAfter ?? 0).toFixed(2),
  })
}

/* --------------------- notifications + SSE live feed --------------------- */
const sseClients = new Set()

function broadcast(type, payload, filter) {
  const frame = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`
  for (const c of sseClients) {
    if (!filter || filter(c)) {
      try {
        c.res.write(frame)
      } catch {
        /* drop dead connections */
      }
    }
  }
}

export function notify({ userId, type, title, body }) {
  const n = { id: uid('ntf'), userId, type, title, body, read: false, ts: new Date().toISOString() }
  getDb().notifications.unshift(n)
  if (getDb().notifications.length > 200) getDb().notifications.length = 200
  broadcast('notification', n, (c) => c.userId === userId)
  save()
  return n
}

function broadcastBalance(user) {
  broadcast('balance', { userId: user.id, balance: user.balance }, (c) => c.userId === user.id)
}

const dayStart = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const inPeriod = (iso, period) => {
  const t = new Date(iso).getTime()
  if (period === 'today') return t >= dayStart().getTime()
  const days = period === '30d' ? 30 : 7
  return t >= Date.now() - days * 86400000
}

const scopedMessages = (req) => {
  const db = getDb()
  return req.seeAll ? db.messages : db.messages.filter((m) => req.scope.has(m.userId))
}

function simulateDlr(msg) {
  setTimeout(() => {
    const db = getDb()
    const m = db.messages.find((x) => x.id === msg.id)
    if (!m || m.status !== 'submitted') return
    const r = Math.random()
    m.status = r < 0.86 ? 'delivered' : r < 0.94 ? 'failed' : r < 0.975 ? 'pending' : 'dropped'
    if (m.status === 'delivered') m.deliveredAt = new Date().toISOString()
    const acc = db.smppAccounts.find((a) => a.live)
    pushLog({ dir: '←', pdu: 'deliver_sm', detail: `stat:${m.status === 'delivered' ? 'DELIVRD' : m.status === 'dropped' ? 'EXPIRED' : 'UNDELIV'} msg_id=${m.id.slice(-6)}`, accountId: acc?.id })
    save()
  }, 2500 + Math.random() * 4000)
}

// login rate limit: 40 attempts / 5 min per IP+user
const attempts = new Map()
function loginLimit(req, res, next) {
  const key = `${req.ip}:${req.body?.userId || '*'}`
  const now = Date.now()
  const entry = attempts.get(key) || { n: 0, ts: now }
  if (now - entry.ts > 300000) { entry.n = 0; entry.ts = now }
  entry.n++
  attempts.set(key, entry)
  if (entry.n > 40) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
  next()
}

/* -------------------------------- auth --------------------------------- */
app.post('/api/auth/login', loginLimit, (req, res) => {
  const { userId, password, remember } = req.body || {}
  const user = getDb().users.find((u) => u.userId === String(userId || '').trim().toLowerCase())
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid User ID or Password' })
  }
  if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended — contact your provider' })
  res.json({ token: sign(user, !!remember), user: publicUser(user) })
})

app.post('/api/auth/security-question', (req, res) => {
  const user = getDb().users.find((u) => u.userId === String(req.body?.userId || '').trim().toLowerCase())
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (!user.securityQuestion) return res.json({ setupRequired: true })
  res.json({ question: user.securityQuestion })
})

app.post('/api/auth/setup-security', loginLimit, (req, res) => {
  const { userId, question, answer } = req.body || {}
  const user = getDb().users.find((u) => u.userId === String(userId || '').trim().toLowerCase())
  if (!user) return res.status(401).json({ error: 'Invalid user' })
  if (user.securityQuestion) return res.status(400).json({ error: 'Security question already set' })
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' })
  
  user.securityQuestion = question.trim()
  user.securityAnswer = answer.trim().toLowerCase()
  save()
  res.json({ token: sign(user, false), user: publicUser(user) })
})

app.post('/api/auth/security-answer', loginLimit, (req, res) => {
  const { userId, answer } = req.body || {}
  const user = getDb().users.find((u) => u.userId === String(userId || '').trim().toLowerCase())
  if (!user) return res.status(401).json({ error: 'Invalid answer' })
  if (String(answer || '').trim().toLowerCase() !== user.securityAnswer) {
    return res.status(401).json({ error: 'Incorrect answer' })
  }
  res.json({ token: sign(user, false), user: publicUser(user) })
})

app.post('/api/auth/forgot', (req, res) => {
  res.json({ ok: true, message: 'If that account exists, a reset link has been sent.' })
})

app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user) }))

app.post('/api/auth/change-password', auth, (req, res) => {
  const { current, next } = req.body || {}
  if (!current || !next || String(next).length < 6) {
    return res.status(400).json({ error: 'Current password and a new password of 6+ characters are required' })
  }
  if (!bcrypt.compareSync(String(current), req.user.passwordHash)) {
    return res.status(400).json({ error: 'Current password is incorrect' })
  }
  req.user.passwordHash = bcrypt.hashSync(String(next), 10)
  notify({
    userId: req.user.id, type: 'security', title: 'Password changed',
    body: 'Your account password was updated just now. If this was not you, contact support immediately.',
  })
  save()
  res.json({ ok: true })
})

/* ------------------------------- users --------------------------------- */
const withMeta = (u) => {
  const { passwordHash, securityAnswer, ...rest } = u
  const parent = getDb().users.find((p) => p.id === u.parentId)
  return { ...rest, parentName: parent ? parent.companyName : 'Platform' }
}

app.post('/api/users/:id/impersonate', auth, requireRole('superadmin'), (req, res) => {
  const u = getDb().users.find((x) => x.id === req.params.id)
  if (!u) return res.status(404).json({ error: 'User not found' })
  res.json({ token: sign(u, false), user: publicUser(u) })
})

app.get('/api/users', auth, requireRole('superadmin', 'reseller'), (req, res) => {
  const { role, search } = req.query
  let items = getDb().users.filter((u) => (req.seeAll ? u.id !== req.user.id || true : req.scope.has(u.id)) && u.id !== req.user.id)
  if (role && role !== 'all') items = items.filter((u) => u.role === role)
  if (search) {
    const s = String(search).toLowerCase()
    items = items.filter((u) => u.name.toLowerCase().includes(s) || u.userId.includes(s) || (u.companyName || '').toLowerCase().includes(s))
  }
  res.json({ items: items.map(withMeta) })
})

app.post('/api/users', auth, requireRole('superadmin', 'reseller'), (req, res) => {
  const { userId, name, companyName, email, password, role, pricePerSms, initialFund, parentId } = req.body || {}
  const uidClean = String(userId || '').trim().toLowerCase()
  if (!uidClean || !name || !password) return res.status(400).json({ error: 'User ID, name and password are required' })
  if (getDb().users.some((u) => u.userId === uidClean)) return res.status(400).json({ error: 'User ID already exists' })
  let newRole = role === 'reseller' ? 'reseller' : 'user'
  if (req.user.role !== 'superadmin' && newRole !== 'user') {
    return res.status(403).json({ error: 'Resellers can only create user accounts' })
  }
  // parent: superadmin may assign a reseller parent; reseller creates under self
  let parent = req.user
  if (req.user.role === 'superadmin' && parentId) {
    const p = getDb().users.find((u) => u.id === parentId && u.role === 'reseller')
    if (p) parent = p
  }
  const rate = +pricePerSms || (req.user.role === 'reseller' ? Math.max(req.user.pricePerSms + 0.002, 0.018) : 0.02)
  const fund = Math.max(0, +initialFund || 0)
  if (req.user.role !== 'superadmin') {
    if (fund > req.user.balance) return res.status(400).json({ error: 'Insufficient balance to fund this account' })
    req.user.balance = +(req.user.balance - fund).toFixed(2)
    addTx({ type: 'funding', fromId: req.user.id, toId: null, amount: -fund, note: `Account creation funding → ${uidClean}`, balanceAfter: req.user.balance })
  }
  const u = {
    id: uid('usr'), userId: uidClean, name, companyName: companyName || name,
    role: newRole, parentId: parent.id, email: email || `${uidClean}@example.com`,
    passwordHash: bcrypt.hashSync(String(password), 10),
    securityQuestion: 'In which city were you born?', securityAnswer: 'mumbai',
    pricePerSms: rate, balance: fund, status: 'active', createdAt: new Date().toISOString(),
  }
  getDb().users.push(u)
  if (fund > 0) addTx({ type: 'funding', fromId: req.user.id, toId: u.id, amount: fund, note: 'Initial funding', balanceAfter: fund })
  notify({
    userId: u.id, type: 'account', title: 'Welcome to Nexora',
    body: `Your ${newRole} account is active. Sign in as @${u.userId} to start messaging.`,
  })
  save()
  res.json({ ok: true, user: withMeta(u) })
})

app.patch('/api/users/:id', auth, requireRole('superadmin', 'reseller'), (req, res) => {
  const u = getDb().users.find((x) => x.id === req.params.id)
  if (!u || (!req.seeAll && !req.scope.has(u.id)) || u.id === req.user.id) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (req.user.role === 'reseller' && u.parentId !== req.user.id) {
    return res.status(403).json({ error: 'You can only manage direct children' })
  }
  const { status, pricePerSms, name, companyName, email, userId, profile, role, password } = req.body || {}
    if (password) u.passwordHash = bcrypt.hashSync(String(password), 10)
    if (role && req.user.role === 'superadmin' && u.role !== 'superadmin') u.role = role === 'reseller' ? 'reseller' : 'user'
  if (status) {
      const newStatus = status === 'suspended' ? 'suspended' : 'active'
      if (u.status !== newStatus) {
        u.status = newStatus
        const scope = subtreeIds(u)
        for (const child of getDb().users) {
          if (scope.has(child.id)) child.status = newStatus
        }
      }
    }
  if (pricePerSms !== undefined && req.user.role === 'superadmin') u.pricePerSms = +pricePerSms
  if (pricePerSms !== undefined && req.user.role === 'reseller' && u.parentId === req.user.id) {
    const p = +pricePerSms
    if (p < req.user.pricePerSms) return res.status(400).json({ error: `Rate cannot be below your cost ($${req.user.pricePerSms})` })
    u.pricePerSms = p
  }
  if (name) u.name = name
  if (companyName) u.companyName = companyName
  if (email) u.email = email
  if (userId) {
    const clean = String(userId).trim().toLowerCase()
    if (clean !== u.userId) {
      if (!clean || getDb().users.some((x) => x.userId === clean)) return res.status(400).json({ error: 'User ID unavailable' })
      u.userId = clean
    }
  }
  if (profile && typeof profile === 'object') u.profile = { ...(u.profile || {}), ...profile }
  save()
  res.json({ ok: true, user: withMeta(u) })
})

function moveFunds(req, res, credit) {
  const target = getDb().users.find((x) => x.id === req.params.id)
  if (!target || (!req.seeAll && !req.scope.has(target.id)) || target.id === req.user.id) {
    return res.status(404).json({ error: 'User not found' })
  }
  const amount = Math.abs(+(req.body?.amount || 0))
  if (!amount) return res.status(400).json({ error: 'Enter an amount' })
  if (req.user.role === 'reseller' && target.parentId !== req.user.id) {
    return res.status(403).json({ error: 'You can only move funds for direct children' })
  }
  const note = req.body?.note || (credit ? 'Wallet funding' : 'Credit deduction')
  if (credit) {
    if (req.user.role !== 'superadmin') {
      if (req.user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' })
      req.user.balance = +(req.user.balance - amount).toFixed(2)
      addTx({ type: 'funding', fromId: req.user.id, toId: target.id, amount: -amount, note, balanceAfter: req.user.balance })
    }
    target.balance = +(target.balance + amount).toFixed(2)
    addTx({ type: 'funding', fromId: req.user.id, toId: target.id, amount, note, balanceAfter: target.balance })
    pushLog({ dir: '↔', pdu: 'admin_adjust', detail: `fund ${target.userId} +$${amount}`, accountId: null })
  } else {
    if (target.balance < amount) return res.status(400).json({ error: 'User does not have that much credit' })
    target.balance = +(target.balance - amount).toFixed(2)
    addTx({ type: 'adjust', fromId: req.user.id, toId: target.id, amount: -amount, note, balanceAfter: target.balance })
    if (req.user.role !== 'superadmin') {
      req.user.balance = +(req.user.balance + amount).toFixed(2)
      addTx({ type: 'funding', fromId: target.id, toId: req.user.id, amount, note, balanceAfter: req.user.balance })
      broadcastBalance(req.user)
    }
  }
  notify({
    userId: target.id, type: 'billing',
    title: credit ? 'Credits added' : 'Credits deducted',
    body: `${req.user.companyName} ${credit ? 'added' : 'deducted'} $${amount.toFixed(2)} ${credit ? 'to' : 'from'} your wallet.`,
  })
  broadcastBalance(target)
  save()
  res.json({ ok: true, user: withMeta(target) })
}
app.post('/api/users/:id/fund', auth, requireRole('superadmin', 'reseller'), (req, res) => moveFunds(req, res, true))
app.post('/api/users/:id/deduct', auth, requireRole('superadmin', 'reseller'), (req, res) => moveFunds(req, res, false))

/* ------------------------------ billing -------------------------------- */
app.get('/api/billing/overview', auth, (req, res) => {
  const db = getDb()
  const scopedTx = db.transactions.filter((t) => req.seeAll || req.scope.has(t.fromId) || req.scope.has(t.toId))
  const monthAgo = Date.now() - 30 * 86400000
  const usage = scopedTx
    .filter((t) => t.type === 'usage' && new Date(t.ts).getTime() > monthAgo)
    .reduce((a, t) => a + Math.abs(t.amount), 0)
  const topups = db.topups.filter((t) => (req.seeAll ? true : req.scope.has(t.userId)))
  const pending = topups.filter((t) => t.status === 'pending')
  // margin: children pay more than we do
  let margin = 0
  for (const child of db.users.filter((u) => req.scope.has(u.id) && u.id !== req.user.id)) {
    const parent = db.users.find((p) => p.id === child.parentId)
    if (!parent) continue
    const volume = db.messages
      .filter((m) => m.userId === child.id && new Date(m.submittedAt).getTime() > monthAgo)
      .reduce((a, m) => a + m.segments, 0)
    margin += Math.max(0, child.pricePerSms - parent.pricePerSms) * volume
  }
  res.json({
    balance: req.user.balance,
    usage30d: +usage.toFixed(2),
    pendingCount: pending.length,
    pendingSum: +pending.reduce((a, t) => a + t.amount, 0).toFixed(2),
    margin30d: +margin.toFixed(2),
    transactions: scopedTx.slice(0, 40),
    topups: topups.slice(0, 20),
  })
})

app.get('/api/billing/topups', auth, (req, res) => {
  const db = getDb()
  let items = db.topups.filter((t) => (req.seeAll ? true : req.scope.has(t.userId)))
  if (req.user.role === 'user') items = items.filter((t) => t.userId === req.user.id)
  res.json({
    items: items.map((t) => {
      const u = db.users.find((x) => x.id === t.userId)
      return { ...t, userName: u?.name, companyName: u?.companyName }
    }),
  })
})

app.post('/api/billing/topups', auth, (req, res) => {
  const amount = +(req.body?.amount || 0)
  if (amount < 5) return res.status(400).json({ error: 'Minimum top-up request is $5' })
  const t = {
    id: uid('tp'), userId: req.user.id, amount: +amount.toFixed(2),
    note: req.body?.note || '', status: 'pending', createdAt: new Date().toISOString(),
    resolvedAt: null, resolvedBy: null,
  }
  getDb().topups.unshift(t)
  const parent = getDb().users.find((u) => u.id === req.user.parentId)
  if (parent) {
    notify({
      userId: parent.id, type: 'topup', title: 'Top-up requested',
      body: `${req.user.companyName} requested $${t.amount} in credits.`,
    })
  }
  save()
  res.json({ ok: true, topup: t })
})

function resolveTopup(req, res, approve) {
  const t = getDb().topups.find((x) => x.id === req.params.id)
  if (!t || t.status !== 'pending') return res.status(404).json({ error: 'Request not found' })
  const user = getDb().users.find((u) => u.id === t.userId)
  const parent = getDb().users.find((u) => u.id === user?.parentId)
  const canResolve = req.user.role === 'superadmin' || (parent && parent.id === req.user.id)
  if (!canResolve) return res.status(403).json({ error: 'Only the parent provider can resolve this request' })
  t.status = approve ? 'approved' : 'rejected'
  t.resolvedAt = new Date().toISOString()
  t.resolvedBy = req.user.id
  if (approve && user) {
    if (req.user.role !== 'superadmin') {
      if (req.user.balance < t.amount) return res.status(400).json({ error: 'Your balance is too low to approve this request' })
      req.user.balance = +(req.user.balance - t.amount).toFixed(2)
      addTx({ type: 'funding', fromId: req.user.id, toId: user.id, amount: -t.amount, note: `Top-up approved for ${user.userId}`, balanceAfter: req.user.balance })
    }
    user.balance = +(user.balance + t.amount).toFixed(2)
    addTx({ type: 'funding', fromId: req.user.id, toId: user.id, amount: t.amount, note: 'Top-up approved', balanceAfter: user.balance })
    broadcastBalance(user)
  }
  notify({
    userId: t.userId, type: 'topup',
    title: `Top-up ${approve ? 'approved' : 'rejected'}`,
    body: `Your request for $${t.amount} was ${approve ? 'approved' : 'rejected'} by ${req.user.companyName}.`,
  })
  save()
  res.json({ ok: true, topup: t })
}
app.post('/api/billing/topups/:id/approve', auth, requireRole('superadmin', 'reseller'), (req, res) => resolveTopup(req, res, true))
app.post('/api/billing/topups/:id/reject', auth, requireRole('superadmin', 'reseller'), (req, res) => resolveTopup(req, res, false))

/* -------------------------------- SMPP ---------------------------------- */
const accountView = (a) => {
  const owner = getDb().users.find((u) => u.id === a.ownerId)
  return { ...a, password: undefined, ownerName: owner?.name, ownerCompany: owner?.companyName, ownerUserId: owner?.userId }
}

app.get('/api/smpp/accounts', auth, (req, res) => {
  const items = getDb().smppAccounts
    .filter((a) => req.seeAll || req.scope.has(a.ownerId))
    .map(accountView)
  res.json({ items })
})

app.post('/api/smpp/accounts', auth, requireRole('superadmin', 'reseller'), (req, res) => {
  const { ownerId, systemId, maxTps, ipWhitelist, bindType } = req.body || {}
  const sid = String(systemId || '').trim().toLowerCase()
  if (!sid) return res.status(400).json({ error: 'System ID is required' })
  if (getDb().smppAccounts.some((a) => a.systemId === sid)) return res.status(400).json({ error: 'System ID already exists' })
  let owner = req.user
  if (ownerId && ownerId !== req.user.id) {
    const o = getDb().users.find((u) => u.id === ownerId)
    if (!o || (!req.seeAll && !req.scope.has(o.id))) return res.status(403).json({ error: 'Owner out of scope' })
    owner = o
  }
  const a = {
    id: uid('acc'), ownerId: owner.id, systemId: sid,
    password: `smp#${Math.random().toString(36).slice(2, 8)}Lm`,
    ipWhitelist: String(ipWhitelist || '').split(/[,\s]+/).filter(Boolean).slice(0, 6),
    maxTps: Math.max(1, +maxTps || 50),
    status: 'active', autoDlr: true,
    bindType: bindType || 'TRX',
    createdAt: new Date().toISOString(),
    live: null,
  }
  getDb().smppAccounts.push(a)
  pushLog({ dir: '↔', pdu: 'create_smpp_account', detail: `${a.systemId} for ${owner.userId} tps=${a.maxTps}`, accountId: a.id })
  save()
  res.json({ ok: true, account: accountView(a), password: a.password })
})

app.patch('/api/smpp/accounts/:id', auth, (req, res) => {
  const a = getDb().smppAccounts.find((x) => x.id === req.params.id)
  if (!a || (!req.seeAll && !req.scope.has(a.ownerId))) return res.status(404).json({ error: 'Account not found' })
  const isStaff = req.user.role !== 'user' && (req.seeAll || req.scope.has(a.ownerId))
  const { maxTps, ipWhitelist, status, rotatePassword, autoDlr } = req.body || {}
  if (maxTps !== undefined) {
    if (!isStaff) return res.status(403).json({ error: 'Only providers can change TPS limits' })
    a.maxTps = Math.max(1, +maxTps)
  }
  if (status !== undefined) {
    if (!isStaff) return res.status(403).json({ error: 'Only providers can suspend accounts' })
    a.status = status === 'suspended' ? 'suspended' : 'active'
    if (a.status === 'suspended') a.live = null
  }
  if (ipWhitelist !== undefined) {
    a.ipWhitelist = String(ipWhitelist).split(/[,\s]+/).filter(Boolean).slice(0, 6)
  }
  if (autoDlr !== undefined) a.autoDlr = !!autoDlr
  let password
  if (rotatePassword) {
    a.password = `smp#${Math.random().toString(36).slice(2, 8)}Lm`
    password = a.password
    a.live = null
    pushLog({ dir: '↔', pdu: 'rotate_password', detail: `${a.systemId} credentials rotated`, accountId: a.id })
  }
  save()
  res.json({ ok: true, account: accountView(a), password })
})

app.post('/api/smpp/accounts/:id/kick', auth, (req, res) => {
  const a = getDb().smppAccounts.find((x) => x.id === req.params.id)
  if (!a || (!req.seeAll && !req.scope.has(a.ownerId))) return res.status(404).json({ error: 'Account not found' })
  if (a.live) {
    a.live = null
    pushLog({ dir: '→', pdu: 'unbind', detail: `${a.systemId} disconnected by ${req.user.userId}`, accountId: a.id })
    if (a.ownerId !== req.user.id) {
      notify({
        userId: a.ownerId, type: 'smpp', title: 'SMPP session force-closed',
        body: `${a.systemId} was disconnected by ${req.user.companyName}.`,
      })
    }
    save()
  }
  res.json({ ok: true, account: accountView(a) })
})

app.get('/api/smpp/live', auth, (req, res) => {
  const items = getDb().smppAccounts
    .filter((a) => a.live && (req.seeAll || req.scope.has(a.ownerId)))
    .map(accountView)
  res.json({ items })
})

app.get('/api/smpp/gateways', auth, requireRole('superadmin', 'reseller'), (req, res) => {
  res.json({ items: getDb().gateways })
})

app.post('/api/smpp/gateways', auth, requireRole('superadmin'), (req, res) => {
  const { name, country, operator, host, port, bindType, prefix, rate, tpsLimit, priority } = req.body || {}
  if (!name || !host) return res.status(400).json({ error: 'Name and host are required' })
  const g = {
    id: uid('gw'), name, country: country || '', operator: operator || '', host,
    port: +port || 2775, bindType: bindType || 'TRX', prefix: prefix || '',
    rate: +rate || 0.01, tpsLimit: +tpsLimit || 500, tpsNow: 0,
    priority: +priority || 1, status: 'disconnected',
  }
  getDb().gateways.push(g)
  save()
  res.json({ ok: true, gateway: g })
})

app.patch('/api/smpp/gateways/:id', auth, requireRole('superadmin'), (req, res) => {
  const g = getDb().gateways.find((x) => x.id === req.params.id)
  if (!g) return res.status(404).json({ error: 'Not found' })
  const { status, priority, tpsLimit, rate, name, host, port, bindType } = req.body || {}
  if (status !== undefined) {
    g.status = status === 'connected' ? 'connected' : status === 'degraded' ? 'degraded' : 'disconnected'
    if (g.status !== 'connected') g.tpsNow = 0
    pushLog({ dir: '↔', pdu: g.status === 'connected' ? 'bind_transceiver' : 'unbind', detail: `gateway ${g.name} → ${g.status}`, accountId: null })
  }
  if (priority !== undefined) g.priority = +priority
  if (tpsLimit !== undefined) g.tpsLimit = +tpsLimit
  if (rate !== undefined) g.rate = +rate
  if (name !== undefined) g.name = name
  if (host !== undefined) g.host = host
  if (port !== undefined) g.port = +port
  if (bindType !== undefined) g.bindType = bindType
  save()
  res.json({ ok: true, gateway: g })
})

app.get('/api/smpp/logs', auth, (req, res) => {
  const db = getDb()
  const accFilter = req.query.accountId
  let items = db.smppLogs.filter((l) => {
    if (!l.accountId) return req.user.role !== 'user'
    const a = db.smppAccounts.find((x) => x.id === l.accountId)
    return a && (req.seeAll || req.scope.has(a.ownerId))
  })
  if (accFilter) items = items.filter((l) => l.accountId === accFilter)
  res.json({ items: items.slice(0, 60) })
})

/* ------------------------------- stats --------------------------------- */
function summaryFor(req, period) {
  const msgs = scopedMessages(req).filter((m) => inPeriod(m.submittedAt, period))
  const s = { sent: msgs.length, delivered: 0, failed: 0, pending: 0, xdropped: 0 }
  for (const m of msgs) {
    const k = m.status === 'dropped' ? 'xdropped' : m.status
    if (s[k] !== undefined) s[k]++
  }
  return s
}

app.get('/api/stats/summary', auth, (req, res) => {
  const period = req.query.period || '7d'
  const cur = summaryFor(req, period)
  const days = period === 'today' ? 1 : period === '30d' ? 30 : 7
  const all = scopedMessages(req)
  const prevMsgs = all.filter((m) => {
    const t = new Date(m.submittedAt).getTime()
    return t >= Date.now() - 2 * days * 86400000 && t < Date.now() - days * 86400000
  })
  const prev = { sent: prevMsgs.length, delivered: 0, failed: 0, pending: 0, xdropped: 0 }
  for (const m of prevMsgs) {
    const k = m.status === 'dropped' ? 'xdropped' : m.status
    if (prev[k] !== undefined) prev[k]++
  }
  const pct = (a, b) => (b === 0 ? (a > 0 ? 100 : 0) : +(((a - b) / b) * 100).toFixed(1))
  res.json({
    period,
    summary: { ...cur, deltas: { sent: pct(cur.sent, prev.sent), delivered: pct(cur.delivered, prev.delivered), failed: pct(cur.failed, prev.failed), pending: pct(cur.pending, prev.pending), xdropped: pct(cur.xdropped, prev.xdropped) } },
    allTimeSent: getDb().settings.archivedSent + all.length,
    balance: req.user.balance,
  })
})

app.get('/api/stats/traffic', auth, (req, res) => {
  const period = req.query.period || '7d'
  const now = new Date()
  const out = []
  const msgs = scopedMessages(req)
  if (period === 'today') {
    for (let h = 0; h <= now.getHours(); h++) out.push({ label: `${String(h).padStart(2, '0')}:00`, sent: 0, delivered: 0, failed: 0, pending: 0 })
    for (const m of msgs) {
      const d = new Date(m.submittedAt)
      if (d >= dayStart()) {
        const slot = out[d.getHours()]
        if (slot) { slot.sent++; if (slot[m.status] !== undefined) slot[m.status]++ }
      }
    }
  } else {
    const days = period === '30d' ? 30 : 7
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      out.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, sent: 0, delivered: 0, failed: 0, pending: 0 })
    }
    for (const m of msgs) {
      const d = new Date(m.submittedAt)
      const diff = Math.floor((dayStart() - dayStart(d)) / 86400000)
      const slot = out[out.length - 1 - diff]
      if (slot) { slot.sent++; if (slot[m.status] !== undefined) slot[m.status]++ }
    }
  }
  res.json({ points: out })
})

app.get('/api/stats/delivery', auth, (req, res) => {
  const period = req.query.period || '7d'
  const s = summaryFor(req, period)
  const total = s.delivered + s.failed + s.pending || 1
  res.json({
    delivered: s.delivered, failed: s.failed, pending: s.pending,
    rate: +((s.delivered / total) * 100).toFixed(1),
    recent: scopedMessages(req).slice(0, 8),
  })
})

// Per-client (staff) / per-sender (user) traffic breakdown
app.get('/api/stats/clients', auth, (req, res) => {
  const db = getDb()
  const period = req.query.period || '7d'
  const { from, to } = req.query
  let cutoff =
    period === 'today'
      ? new Date(new Date().setHours(0, 0, 0, 0))
      : new Date(Date.now() - (period === '30d' ? 30 : 7) * 86400000)
  let until = new Date()
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(String(from))) cutoff = new Date(`${from}T00:00:00`)
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(String(to))) until = new Date(`${to}T23:59:59`)
  const byUser = req.user.role !== 'user'
  const map = new Map()
  for (const m of scopedMessages(req)) {
    const ts = new Date(m.submittedAt)
    if (ts < cutoff || ts > until) continue
    const key = byUser ? m.userId : m.from || 'unknown'
    let b = map.get(key)
    if (!b) {
      b = { submitted: 0, delivered: 0, failed: 0, pending: 0, xdropped: 0 }
      map.set(key, b)
    }
    b.submitted++
    if (m.status === 'delivered') b.delivered++
    else if (m.status === 'failed') b.failed++
    else if (m.status === 'dropped') b.xdropped++
    else b.pending++
  }
  const rows = [...map.entries()]
    .map(([key, b]) => {
      const u = byUser ? db.users.find((x) => x.id === key) : null
      const dec = b.delivered + b.failed
      return {
        id: key,
        name: byUser ? u?.companyName || u?.userId || '—' : key,
        type: byUser ? (u?.role === 'reseller' ? 'Reseller' : 'Client') : 'Sender',
        ...b,
        successPct: dec ? +((b.delivered / dec) * 100).toFixed(1) : b.delivered ? 100 : 0,
      }
    })
    .sort((a, b) => b.submitted - a.submitted)
  const tiles = rows.reduce(
    (a, r) => ({
      clients: a.clients + 1,
      submitted: a.submitted + r.submitted,
      delivered: a.delivered + r.delivered,
      failed: a.failed + r.failed,
      pending: a.pending + r.pending,
      xdropped: a.xdropped + r.xdropped,
    }),
    { clients: 0, submitted: 0, delivered: 0, failed: 0, pending: 0, xdropped: 0 },
  )
  res.json({ period, tiles, rows })
})

app.get('/api/stats/platform', auth, (req, res) => {
  const db = getDb()
  const live = db.smppAccounts.filter((a) => a.live && (req.seeAll || req.scope.has(a.ownerId)))
  const accounts = db.smppAccounts.filter((a) => req.seeAll || req.scope.has(a.ownerId))
  const pendingTopups = db.topups.filter((t) => t.status === 'pending' && (req.seeAll || req.scope.has(t.userId)))
  if (req.user.role === 'superadmin') {
    return res.json({
      cards: [
        { label: 'Resellers', value: db.users.filter((u) => u.role === 'reseller').length },
        { label: 'Client accounts', value: db.users.filter((u) => u.role === 'user').length },
        { label: 'Live SMPP binds', value: live.length },
        { label: 'Gateways up', value: `${db.gateways.filter((g) => g.status === 'connected').length}/${db.gateways.length}` },
      ],
    })
  }
  if (req.user.role === 'reseller') {
    const kids = db.users.filter((u) => u.parentId === req.user.id)
    return res.json({
      cards: [
        { label: 'My clients', value: kids.length },
        { label: 'Portfolio balance', value: `$${kids.reduce((a, u) => a + u.balance, 0).toFixed(0)}` },
        { label: 'Live SMPP binds', value: live.length },
        { label: 'Top-up requests', value: pendingTopups.length },
      ],
    })
  }
  return res.json({
    cards: [
      { label: 'Wallet balance', value: `$${req.user.balance.toFixed(2)}` },
      { label: 'Live SMPP binds', value: live.length },
      { label: 'SMPP accounts', value: accounts.length },
      { label: 'Rate / SMS', value: `$${req.user.pricePerSms.toFixed(3)}` },
    ],
  })
})

/* ----------------------------- messages -------------------------------- */
app.get('/api/messages', auth, (req, res) => {
  const { status, search, from, to, userId, page = 1, pageSize = 12 } = req.query
  let items = scopedMessages(req)
  if (userId && (req.seeAll || req.scope.has(userId))) items = items.filter((m) => m.userId === userId)
  if (status && status !== 'all') items = items.filter((m) => m.status === status)
  if (search) {
    const s = String(search).toLowerCase()
    items = items.filter((m) => m.to.includes(s) || m.from.toLowerCase().includes(s) || m.text.toLowerCase().includes(s) || m.id.includes(s))
  }
  if (from) items = items.filter((m) => new Date(m.submittedAt) >= new Date(from))
  if (to) items = items.filter((m) => new Date(m.submittedAt) <= new Date(`${to}T23:59:59`))
  const total = items.length
  const p = Math.max(1, +page), ps = Math.min(500, +pageSize || 12)
  const db = getDb()
  const ownerName = (id) => db.users.find((u) => u.id === id)?.companyName || '—'
  res.json({
    items: items.slice((p - 1) * ps, p * ps).map((m) => ({ ...m, ownerName: ownerName(m.userId) })),
    total, page: p, pageSize: ps,
  })
})

app.post('/api/messages/send', auth, (req, res) => {
  const { senderId, recipients, text, scheduleAt } = req.body || {}
  const rawList = Array.isArray(recipients) ? recipients.map((x) => String(x).trim()).filter(Boolean) : []
  const body = String(text || '')
  if (!senderId) return res.status(400).json({ error: 'Sender ID is required' })
  if (!rawList.length) return res.status(400).json({ error: 'Add at least one recipient' })
  if (!body.trim()) return res.status(400).json({ error: 'Message text is required' })
  if (rawList.length > 500) return res.status(400).json({ error: 'Max 500 recipients per batch' })

  // DND / opt-out compliance: silently skip blocked numbers, report the count
  const dndSet = new Set(getDb().dnd.map((d) => normNum(d.number)))
  const list = [], skipped = []
  for (const to of rawList) (dndSet.has(normNum(to)) ? skipped : list).push(to)
  if (!list.length) {
    return res.status(400).json({ error: `All ${skipped.length} recipient(s) are on the DND/opt-out list — nothing to send`, skippedDnd: skipped.length })
  }

  const seg = calcSegments(body)
  const cost = +(list.length * seg.segments * req.user.pricePerSms).toFixed(4)
  if (req.user.balance < cost) {
    return res.status(402).json({ error: `Insufficient balance — this batch costs $${cost.toFixed(2)}, you have $${req.user.balance.toFixed(2)}` })
  }
  if (req.user.balance - cost < 25) {
    notify({
      userId: req.user.id, type: 'balance', title: 'Low balance warning',
      body: `After this send your wallet drops below $25 — request a top-up to avoid interruptions.`,
    })
  }

  const db = getDb()
  const scheduled = scheduleAt && new Date(scheduleAt) > new Date(Date.now() + 60000)
  const created = []
  for (const to of list) {
    const msg = {
      id: uid('msg'), userId: req.user.id, to, from: senderId, text: body,
      status: scheduled ? 'scheduled' : 'submitted',
      segments: seg.segments, encoding: seg.encoding,
      cost: +(seg.segments * req.user.pricePerSms).toFixed(4),
      submittedAt: new Date().toISOString(),
      deliveredAt: null, campaignId: null,
      scheduleAt: scheduled ? new Date(scheduleAt).toISOString() : null,
    }
    db.messages.unshift(msg)
    created.push(msg)
    if (!scheduled) simulateDlr(msg)
  }
  if (db.messages.length > 4500) db.messages.length = 4500
  req.user.balance = +(req.user.balance - cost).toFixed(4)
  addTx({ type: 'usage', fromId: req.user.id, toId: null, amount: -cost, note: `SMS send — ${list.length} × ${seg.segments} seg`, balanceAfter: req.user.balance })
  broadcastBalance(req.user)
  const acc = db.smppAccounts.find((a) => a.ownerId === req.user.id && a.live) || db.smppAccounts.find((a) => a.live)
  pushLog({ dir: '→', pdu: 'submit_sm', detail: `src=${senderId} count=${list.length} dcs=${seg.encoding === 'GSM-7' ? 0 : 8}`, accountId: acc?.id })
  save()
  res.json({ ok: true, count: created.length, skippedDnd: skipped.length, segments: seg.segments, encoding: seg.encoding, cost, balance: req.user.balance, ids: created.map((m) => m.id) })
})

/* --------------------- contacts / templates / DND ----------------------- */
const normNum = (n) => String(n || '').replace(/\D/g, '').slice(-10)

app.get('/api/contacts', auth, (req, res) =>
  res.json({ items: getDb().contacts.filter((c) => req.seeAll || req.scope.has(c.userId)) }),
)
app.post('/api/contacts', auth, (req, res) => {
  const { name, number, group, items } = req.body || {}
  const mk = (nm, num, grp) => ({
    id: uid('ct'), userId: req.user.id,
    name: String(nm || '').slice(0, 80), number: String(num || '').trim(),
    group: String(grp || 'General').slice(0, 40),
  })
  if (Array.isArray(items)) {
    const rows = items
      .filter((it) => it && String(it.number || '').trim())
      .slice(0, 1000)
      .map((it) => mk(it.name, it.number, it.group))
    if (!rows.length) return res.status(400).json({ error: 'No valid rows — each needs a number' })
    getDb().contacts.unshift(...rows)
    save()
    return res.json({ ok: true, count: rows.length, items: rows })
  }
  if (!number || !String(number).trim()) return res.status(400).json({ error: 'Number is required' })
  const row = mk(name, number, group)
  getDb().contacts.unshift(row)
  save()
  res.json({ ok: true, count: 1, item: row })
})
app.patch('/api/contacts/:id', auth, (req, res) => {
  const c = getDb().contacts.find((x) => x.id === req.params.id)
  if (!c || (!req.seeAll && c.userId !== req.user.id)) return res.status(404).json({ error: 'Not found' })
  if (req.body?.name !== undefined) c.name = String(req.body.name).slice(0, 80)
  if (req.body?.number !== undefined) c.number = String(req.body.number).trim()
  if (req.body?.group !== undefined) c.group = String(req.body.group).slice(0, 40)
  save()
  res.json({ ok: true, item: c })
})
app.delete('/api/contacts/:id', auth, (req, res) => {
  const db = getDb()
  const c = db.contacts.find((x) => x.id === req.params.id)
  if (!c || (!req.seeAll && c.userId !== req.user.id)) return res.status(404).json({ error: 'Not found' })
  db.contacts = db.contacts.filter((x) => x.id !== c.id)
  save()
  res.json({ ok: true })
})

app.get('/api/templates', auth, (req, res) =>
  res.json({ items: getDb().templates.filter((t) => req.seeAll || req.scope.has(t.userId)) }),
)
app.post('/api/templates', auth, (req, res) => {
  const { name, body } = req.body || {}
  if (!name || !body) return res.status(400).json({ error: 'Name and body are required' })
  const t = { id: uid('tpl'), userId: req.user.id, name: String(name).slice(0, 60), body: String(body).slice(0, 1000) }
  getDb().templates.unshift(t)
  save()
  res.json({ ok: true, item: t })
})
app.patch('/api/templates/:id', auth, (req, res) => {
  const t = getDb().templates.find((x) => x.id === req.params.id)
  if (!t || (!req.seeAll && t.userId !== req.user.id)) return res.status(404).json({ error: 'Not found' })
  if (req.body?.name !== undefined) t.name = String(req.body.name).slice(0, 60)
  if (req.body?.body !== undefined) t.body = String(req.body.body).slice(0, 1000)
  save()
  res.json({ ok: true, item: t })
})
app.delete('/api/templates/:id', auth, (req, res) => {
  const db = getDb()
  const t = db.templates.find((x) => x.id === req.params.id)
  if (!t || (!req.seeAll && t.userId !== req.user.id)) return res.status(404).json({ error: 'Not found' })
  db.templates = db.templates.filter((x) => x.id !== t.id)
  save()
  res.json({ ok: true })
})

app.get('/api/dnd', auth, (req, res) =>
  res.json({ items: getDb().dnd.filter((d) => req.seeAll || req.scope.has(d.userId)) }),
)
app.post('/api/dnd', auth, (req, res) => {
  const { number, numbers, reason } = req.body || {}
  const list = (Array.isArray(numbers) ? numbers : [number])
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .slice(0, 500)
  if (!list.length) return res.status(400).json({ error: 'Provide at least one number' })
  const existing = new Set(getDb().dnd.map((d) => normNum(d.number)))
  const rows = []
  for (const num of list) {
    if (existing.has(normNum(num))) continue
    existing.add(normNum(num))
    rows.push({
      id: uid('dnd'), userId: req.user.id, number: num,
      reason: String(reason || 'Manual block').slice(0, 80), createdAt: new Date().toISOString(),
    })
  }
  getDb().dnd.unshift(...rows)
  save()
  res.json({ ok: true, count: rows.length, skippedExisting: list.length - rows.length, items: rows })
})
app.delete('/api/dnd/:id', auth, (req, res) => {
  const db = getDb()
  const d = db.dnd.find((x) => x.id === req.params.id)
  if (!d || (!req.seeAll && d.userId !== req.user.id)) return res.status(404).json({ error: 'Not found' })
  db.dnd = db.dnd.filter((x) => x.id !== d.id)
  save()
  res.json({ ok: true })
})

/* ----------------------------- campaigns -------------------------------- */
app.get('/api/campaigns', auth, (req, res) => {
  const db = getDb()
  const items = getDb().campaigns
    .filter((c) => req.seeAll || req.scope.has(c.userId))
    .sort((a, b) => (a.created < b.created ? 1 : -1))
    .map((c) => ({ ...c, ownerName: db.users.find((u) => u.id === c.userId)?.companyName || '—' }))
  res.json({ items })
})

app.post('/api/campaigns', auth, (req, res) => {
  const { name, text, audience, total = 1000, scheduleAt } = req.body || {}
  if (!name || !text) return res.status(400).json({ error: 'Name and message are required' })
  const size = Math.max(10, +total || 1000)
  const seg = calcSegments(text)
  const cost = +(size * seg.segments * req.user.pricePerSms).toFixed(2)
  if (req.user.balance < cost) {
    return res.status(402).json({ error: `Insufficient balance — campaign needs ~$${cost.toFixed(2)}` })
  }
  req.user.balance = +(req.user.balance - cost).toFixed(2)
  addTx({ type: 'usage', fromId: req.user.id, toId: null, amount: -cost, note: `Campaign reserve — ${name}`, balanceAfter: req.user.balance })
  broadcastBalance(req.user)
  const scheduled = scheduleAt && new Date(scheduleAt) > new Date(Date.now() + 60000)
  const cmp = {
    id: uid('cmp'), userId: req.user.id, name: String(name), text: String(text),
    audience: audience || 'All Contacts',
    status: scheduled ? 'scheduled' : 'running',
    scheduledAt: scheduled ? new Date(scheduleAt).toISOString() : new Date().toISOString(),
    total: size, sent: 0, delivered: 0, failed: 0, created: new Date().toISOString(),
  }
  getDb().campaigns.unshift(cmp)
  save()
  res.json({ ok: true, campaign: cmp, cost, balance: req.user.balance })
})

app.post('/api/campaigns/:id/toggle', auth, (req, res) => {
  const cmp = getDb().campaigns.find((c) => c.id === req.params.id)
  if (!cmp || (!req.seeAll && !req.scope.has(cmp.userId))) return res.status(404).json({ error: 'Not found' })
  if (cmp.status === 'running') cmp.status = 'paused'
  else if (cmp.status === 'paused' || cmp.status === 'scheduled') cmp.status = 'running'
  save()
  res.json({ ok: true, campaign: cmp })
})

const randInt2 = (a, b) => a + Math.floor(Math.random() * (b - a + 1))

/* --------------------------- live simulators ---------------------------- */
setInterval(() => {
  const db = getDb()
  let dirty = false

  // campaigns throughput + DLRs
  for (const c of db.campaigns) {
    if (c.status !== 'running') continue
    const chunk = Math.min(c.total - c.sent, Math.max(2, Math.round(c.total * 0.012)))
    if (chunk <= 0) { c.status = 'completed'; dirty = true; continue }
    c.sent += chunk
    for (let i = 0; i < Math.min(3, chunk); i++) {
      const r = Math.random()
      const st = r < 0.9 ? 'delivered' : 'failed'
      c[st]++
      db.messages.unshift({
        id: uid('msg'), userId: c.userId, to: `+91 9${randInt2(10, 99)} ${randInt2(100, 999)} ${randInt2(1000, 9999)}`,
        from: db.settings.defaultSender, text: c.text, status: st, segments: 1, encoding: 'GSM-7',
        cost: 0.02, submittedAt: new Date().toISOString(),
        deliveredAt: st === 'delivered' ? new Date().toISOString() : null, campaignId: c.id,
      })
    }
    if (db.messages.length > 4500) db.messages.length = 4500
    if (c.sent >= c.total) {
      c.status = 'completed'
      pushLog({ dir: '←', pdu: 'deliver_sm', detail: `campaign=${c.name.slice(0, 14)} done`, accountId: null })
      notify({
        userId: c.userId, type: 'campaign', title: 'Campaign completed',
        body: `“${c.name}” finished — ${c.delivered} delivered / ${c.failed} failed.`,
      })
    }
    dirty = true
  }

  // SMPP live throughput walk + PDU chatter
  for (const a of db.smppAccounts) {
    if (!a.live) continue
    const cap = a.maxTps
    a.live.tpsOut = a.bindType === 'RX' ? 0 : Math.max(0, Math.min(cap, a.live.tpsOut + randInt2(-25, 25)))
    a.live.tpsIn = a.bindType === 'TX' ? 0 : Math.max(0, Math.min(cap, a.live.tpsIn + randInt2(-20, 20)))
    a.live.histIn = [...a.live.histIn.slice(11), a.live.tpsIn]
    a.live.histOut = [...a.live.histOut.slice(11), a.live.tpsOut]
    const roll = Math.random()
    if (roll < 0.22) pushLog({ dir: '↔', pdu: 'enquire_link', detail: `${a.systemId} keep-alive`, accountId: a.id })
    else if (roll < 0.34) pushLog({ dir: '←', pdu: 'deliver_sm', detail: `stat:DELIVRD msg_id=nx_${randInt2(1000, 9999)}`, accountId: a.id })
    dirty = true
  }

  // gateway TPS walk
  for (const g of db.gateways) {
    if (g.status !== 'connected') continue
    g.tpsNow = Math.max(0, Math.min(g.tpsLimit, g.tpsNow + randInt2(-40, 40)))
    dirty = true
  }

  if (dirty) save()
}, 3000)

/* ------------------------------ settings -------------------------------- */
app.get('/api/settings', auth, (req, res) => {
  const db = getDb()
  const scoped = (arr, key = 'userId') => arr.filter((x) => req.seeAll || req.scope.has(x[key]))
  res.json({
    settings: db.settings,
    profile: publicUser(req.user),
    senderIds: scoped(db.senderIds),
    apiKeys: db.apiKeys.filter((k) => k.userId === req.user.id),
    team: req.seeAll ? db.team : db.team.filter((t) => t.userId === req.user.id),
    gateways: req.user.role === 'superadmin' ? db.gateways : null,
  })
})

app.put('/api/settings', auth, (req, res) => {
  const db = getDb()
  if (req.user.role === 'superadmin') {
    for (const k of ['companyName', 'email', 'timezone', 'defaultSender', 'webhook', 'smppHost']) {
      if (req.body?.[k] !== undefined) db.settings[k] = req.body[k]
    }
    save()
    return res.json({ ok: true, settings: db.settings })
  }
  const { name, companyName, email } = req.body || {}
  if (name) req.user.name = name
  if (companyName) req.user.companyName = companyName
  if (email) req.user.email = email
  save()
  res.json({ ok: true, profile: publicUser(req.user) })
})

app.post('/api/sender-ids', auth, (req, res) => {
  const { senderId, entity, route } = req.body || {}
  if (!senderId) return res.status(400).json({ error: 'Sender ID is required' })
  const s = {
    id: uid('snd'), userId: req.user.id,
    senderId: String(senderId).toUpperCase().slice(0, 10),
    entity: entity || 'NEX0001234', status: 'Pending', route: route || 'Transactional',
    created: new Date().toISOString(),
  }
  getDb().senderIds.push(s)
  save()
  res.json({ ok: true, senderId: s })
})

app.post('/api/sender-ids/:id/approve', auth, requireRole('superadmin', 'reseller'), (req, res) => {
  const s = getDb().senderIds.find((x) => x.id === req.params.id)
  if (!s || (!req.seeAll && !req.scope.has(s.userId))) return res.status(404).json({ error: 'Not found' })
  if (req.user.role === 'reseller') {
    const owner = getDb().users.find((u) => u.id === s.userId)
    if (!owner || owner.parentId !== req.user.id) return res.status(403).json({ error: 'Out of scope' })
  }
  s.status = s.status === 'Approved' ? 'Pending' : 'Approved'
  notify({
    userId: s.userId, type: 'sender',
    title: `Sender ID ${s.status === 'Approved' ? 'approved' : 'revoked'}`,
    body: `${s.senderId} is now ${s.status}.`,
  })
  save()
  res.json({ ok: true, senderId: s })
})

app.post('/api/api-keys/regenerate', auth, (req, res) => {
  const key = getDb().apiKeys.find((k) => k.id === req.body?.id && k.userId === req.user.id)
  if (!key) return res.status(404).json({ error: 'Not found' })
  key.key = `nx_live_${uid('').replace('id_', '').slice(0, 20)}`
  key.created = new Date().toISOString()
  save()
  res.json({ ok: true, apiKey: key })
})

app.post('/api/team', auth, (req, res) => {
  const { name, email, role } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' })
  const m = { id: uid('tm'), userId: req.user.id, name, email, role: role || 'Analyst', status: 'Invited' }
  getDb().team.push(m)
  save()
  res.json({ ok: true, member: m })
})

/* --------------------- live feed, notifications, packages ---------------- */
app.get('/api/live', (req, res) => {
  // EventSource cannot set headers — auth via ?token= or cookie
  const q = req.query.token
  let token = q ? String(q) : null
  if (!token) {
    const m = /(?:^|;\s*)nx_tok=([^;]+)/.exec(req.headers.cookie || '')
    if (m) token = decodeURIComponent(m[1])
  }
  let user = null
  try {
    const payload = jwt.verify(token || '', JWT_SECRET)
    user = getDb().users.find((u) => u.id === payload.sub)
  } catch {
    /* fallthrough */
  }
  if (!user) return res.status(401).end()

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write(`retry: 3000\n\nevent: hello\ndata: {"ok":true}\n\n`)

  const client = { res, userId: user.id, scope: subtreeIds(user), seeAll: user.role === 'superadmin' }
  sseClients.add(client)
  const ping = setInterval(() => {
    try {
      res.write(': ping\n\n')
    } catch {
      /* noop */
    }
  }, 15000)
  req.on('close', () => {
    clearInterval(ping)
    sseClients.delete(client)
  })
})

app.get('/api/notifications', auth, (req, res) => {
  const items = getDb().notifications.filter((n) => n.userId === req.user.id).slice(0, 25)
  res.json({ items, unread: items.filter((n) => !n.read).length })
})

app.post('/api/notifications/read', auth, (req, res) => {
  for (const n of getDb().notifications) {
    if (n.userId === req.user.id) n.read = true
  }
  save()
  res.json({ ok: true })
})

app.get('/api/packages', auth, (req, res) => {
  const db = getDb()
  const items = req.seeAll ? db.packages : db.packages.filter((p) => p.status === 'active')
  const purchases = req.seeAll
    ? db.purchases.slice(0, 30)
    : db.purchases.filter((p) => req.scope.has(p.userId)).slice(0, 30)
  const nameOf = (id) => db.users.find((u) => u.id === id)?.companyName || '—'
  res.json({
    items,
    purchases: purchases.map((p) => ({ ...p, userName: nameOf(p.userId) })),
  })
})

app.post('/api/packages', auth, requireRole('superadmin'), (req, res) => {
  const { name, price, credits, validityDays, description } = req.body || {}
  if (!name || !+price || !+credits) return res.status(400).json({ error: 'Name, price and credits are required' })
  const p = {
    id: uid('pkg'), name: String(name), price: +price, credits: +credits,
    validityDays: +validityDays || 90, description: description || '', status: 'active',
    created: new Date().toISOString(),
  }
  getDb().packages.push(p)
  save()
  res.json({ ok: true, package: p })
})

app.patch('/api/packages/:id', auth, requireRole('superadmin'), (req, res) => {
  const p = getDb().packages.find((x) => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  if (req.body?.status) p.status = req.body.status === 'active' ? 'active' : 'hidden'
  save()
  res.json({ ok: true, package: p })
})

app.post('/api/packages/:id/buy', auth, requireRole('reseller', 'user'), (req, res) => {
  const p = getDb().packages.find((x) => x.id === req.params.id)
  if (!p || p.status !== 'active') return res.status(404).json({ error: 'Package not available' })
  if (req.user.balance < p.price) {
    return res.status(400).json({ error: `Insufficient balance — package costs $${p.price}, you have $${req.user.balance.toFixed(2)}` })
  }
  req.user.balance = +(req.user.balance - p.price).toFixed(2)
  addTx({ type: 'package', fromId: req.user.id, toId: null, amount: -p.price, note: `Purchased ${p.name}`, balanceAfter: req.user.balance })
  req.user.balance = +(req.user.balance + p.credits).toFixed(2)
  addTx({ type: 'funding', fromId: req.user.id, toId: req.user.id, amount: p.credits, note: `Package credit — ${p.name}`, balanceAfter: req.user.balance })
  const pur = {
    id: uid('pur'), userId: req.user.id, packageId: p.id, packageName: p.name,
    price: p.price, credits: p.credits, ts: new Date().toISOString(), status: 'completed',
  }
  getDb().purchases.unshift(pur)
  const bonus = Math.round(((p.credits - p.price) / p.price) * 100)
  notify({
    userId: req.user.id, type: 'package', title: 'Package activated',
    body: `${p.name} — $${p.credits} credited to your wallet${bonus > 0 ? ` (${bonus}% bonus)` : ''}.`,
  })
  broadcastBalance(req.user)
  save()
  res.json({ ok: true, purchase: pur, balance: req.user.balance })
})

/* ------------------------- frontend (dev proxy + prod static) ------------- */
const VITE_ORIGIN = { host: '127.0.0.1', port: 5173 }
const dist = path.join(__dirname, '..', '..', 'frontend', 'dist')
app.use(express.static(dist))
app.use((req, res) => {
  if (req.method !== 'GET' || req.url.startsWith('/api')) return res.status(404).json({ error: 'Not found' })
  // Production SPA fallback: React Router routes such as /dashboard must
  // return index.html instead of trying to contact the development server.
  if (process.env.NODE_ENV === 'production') {
    return res.sendFile(path.join(dist, 'index.html'))
  }
  // Development convenience: proxy non-API routes to Vite.
  const proxyReq = http.request(
    { host: VITE_ORIGIN.host, port: VITE_ORIGIN.port, path: req.url, method: 'GET', headers: { ...req.headers, host: 'localhost:5173' } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    }
  )
  proxyReq.on('error', () => res.status(503).end('Frontend not running'))
  proxyReq.end()
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] Nexora API listening on http://0.0.0.0:${PORT}`)
})
