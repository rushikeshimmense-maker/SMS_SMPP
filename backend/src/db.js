/**
 * Nexora panel — JSON file database v2 (multi-tenant: superadmin → reseller → user).
 * db.json persists across restarts; auto-reseeds on schema version bump.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'db.json')
export const DB_VERSION = 6

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

const TEXTS = [
  'Your OTP is 482913. Valid for 5 minutes. Do not share it with anyone. - Nexora',
  'Order #NX-20841 has been shipped and will arrive by tomorrow evening. Track: nxra.io/t/20841',
  'Reminder: your appointment is scheduled for 24 Sep, 11:30 AM. Reply C to confirm or R to reschedule.',
  'Weekend Blast! FLAT 40% off on all plans. Use code NEXORA40. Offer valid till Sunday.',
  'Your account balance is low. Recharge now to keep your messaging services uninterrupted.',
  'Dear customer, your payment of $128.50 was received successfully. Thank you!',
  'Flash Sale starts at 6 PM today. Early access for members. Shop now: nxra.io/sale',
  'Your support ticket #5512 has been resolved. Rate your experience: nxra.io/r/5512',
  'Login alert: new sign-in from Mumbai, IN. If this was not you, secure your account immediately.',
  'Thank you for subscribing to Nexora alerts. Reply STOP to opt out at any time.',
]

const FIRST = ['Aarav','Priya','Rahul','Sneha','Vikram','Ananya','Rohan','Meera','Karan','Isha','Dev','Tara','Aditya','Nisha','Arjun','Kavya','Ravi','Pooja','Sam','Alex','Emma','Liam']
const LAST = ['Sharma','Nair','Verma','Iyer','Patel','Reddy','Khan','Bose','Menon','Joshi','Lee','Brown','Wilson','Clark']

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1))

function makeNumber() {
  const c = Math.random()
  if (c < 0.72) return `+91 9${randInt(10, 99)} ${randInt(100, 999)} ${randInt(1000, 9999)}`
  if (c < 0.85) return `+1 41${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`
  if (c < 0.95) return `+44 7${randInt(100, 999)} ${randInt(100000, 999999)}`
  return `+971 5${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`
}

export function calcSegments(text) {
  const t = text || ''
  const gsm = /^[\x20-\x7E\x0A\x0D\x09\x0C\x1B\x24\x40\x5B\x5C\x5D\x5E\x60\x7B\x7C\x7D\x7F¡£¤¥èéùìòÇØøÅåÆæßÉ!\"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/
  const isGsm = gsm.test(t)
  const single = isGsm ? 160 : 70
  const multi = isGsm ? 153 : 67
  const segments = t.length <= single ? 1 : Math.ceil(t.length / multi)
  return { segments, encoding: isGsm ? 'GSM-7' : 'UCS-2', chars: t.length, per: single }
}

/* ------------------------------- seeding ------------------------------- */
function seedMessages(owners) {
  const msgs = []
  const now = new Date()
  for (let d = 29; d >= 0; d--) {
    const dayStart = new Date(now)
    dayStart.setDate(now.getDate() - d)
    dayStart.setHours(0, 0, 0, 0)
    const dow = dayStart.getDay()
    let base = d < 7 ? 42 : d < 14 ? 30 : 20
    if (dow === 0 || dow === 6) base = Math.round(base * 0.6)
    const dayCount = d === 0 ? 64 : base + randInt(0, 14)
    for (let i = 0; i < dayCount; i++) {
      const maxH = d === 0 ? now.getHours() : 23
      const h = d === 0 ? randInt(0, maxH) : randInt(7, 21)
      const ts = new Date(dayStart)
      ts.setHours(h, randInt(0, 59), randInt(0, 59))
      if (ts > now) ts.setTime(now.getTime() - randInt(60, 3500) * 1000)
      const owner = owners[Math.floor(Math.random() * owners.length)]
      const text = rand(TEXTS)
      const seg = calcSegments(text)
      const s = Math.random()
      const status = s < 0.875 ? 'delivered' : s < 0.95 ? 'failed' : s < 0.985 ? 'pending' : 'dropped'
      msgs.push({
        id: uid('msg'),
        userId: owner.id,
        to: makeNumber(),
        from: rand(['SHOPEZ', 'FITLIFE', 'TRVLKRT', 'NXTPS']),
        text,
        status,
        segments: seg.segments,
        encoding: seg.encoding,
        cost: +(seg.segments * owner.pricePerSms).toFixed(4),
        submittedAt: ts.toISOString(),
        deliveredAt: status === 'delivered' ? new Date(ts.getTime() + randInt(1, 90) * 1000).toISOString() : null,
        campaignId: null,
      })
    }
  }
  msgs.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
  return msgs.slice(0, 2800)
}

function seedSmppAccounts(u1, u2, u3) {
  const acc = (ownerId, systemId, maxTps, ips, live) => ({
    id: uid('acc'), ownerId, systemId,
    password: `smp#${Math.random().toString(36).slice(2, 8)}Lm`,
    ipWhitelist: ips, maxTps,
    status: 'active', autoDlr: true,
    createdAt: new Date(Date.now() - randInt(30, 180) * 86400000).toISOString(),
    live: live
      ? {
          boundAt: new Date(Date.now() - randInt(3600, 86000) * 1000).toISOString(),
          srcIp: ips[0] || '0.0.0.0',
          bindType: 'TRX',
          tpsIn: randInt(120, 420),
          tpsOut: randInt(100, 400),
          histIn: Array.from({ length: 12 }, () => randInt(100, 430)),
          histOut: Array.from({ length: 12 }, () => randInt(80, 400)),
        }
      : null,
  })
  return [
    acc(u1.id, 'shopease_01', 100, ['49.36.180.12', '49.36.180.13'], true),
    acc(u1.id, 'shopease_txn', 25, ['49.36.180.12'], true),
    acc(u2.id, 'fitlife_02', 50, ['103.21.58.44'], false),
    acc(u2.id, 'fitlife_blast', 10, ['103.21.58.44'], false), // suspended below
    acc(u3.id, 'travelkart_01', 200, ['159.89.102.7', '159.89.102.8'], true),
  ]
}

export function buildSeed() {
  const hash = (pw) => bcrypt.hashSync(pw, 10)
  const day = (n) => new Date(Date.now() + n * 86400000).toISOString()

  const superadmin = {
    id: uid('usr'), userId: 'superadmin', name: 'Aarav Mehta', companyName: 'Nexora Operations',
    role: 'superadmin', parentId: null, email: 'aarav@nexora.io',
    passwordHash: hash('super@123'), securityQuestion: 'In which city were you born?', securityAnswer: 'mumbai',
    pricePerSms: 0.010, balance: 50000, status: 'active', createdAt: day(-400),
  }
  const adminAlias = {
    id: uid('usr'), userId: 'admin', name: 'Admin Console', companyName: 'Nexora Operations',
    role: 'superadmin', parentId: null, email: 'admin@nexora.io',
    passwordHash: hash('nexora123'), securityQuestion: 'In which city were you born?', securityAnswer: 'mumbai',
    pricePerSms: 0.010, balance: 0, status: 'active', createdAt: day(-400),
  }
  const reseller1 = {
    id: uid('usr'), userId: 'reseller1', name: 'Rohan Shah', companyName: 'Pixel Media',
    role: 'reseller', parentId: superadmin.id, email: 'rohan@pixelmedia.co',
    passwordHash: hash('reseller@123'), securityQuestion: 'What is your favourite colour?', securityAnswer: 'red',
    pricePerSms: 0.016, balance: 4200, status: 'active', createdAt: day(-200),
  }
  const reseller2 = {
    id: uid('usr'), userId: 'reseller2', name: 'Sneha Iyer', companyName: 'Orbit Telecom',
    role: 'reseller', parentId: superadmin.id, email: 'sneha@orbittelecom.com',
    passwordHash: hash('reseller@123'), securityQuestion: 'What is your favourite colour?', securityAnswer: 'blue',
    pricePerSms: 0.016, balance: 2650, status: 'active', createdAt: day(-160),
  }
  const user1 = {
    id: uid('usr'), userId: 'user1', name: 'Priya Nair', companyName: 'ShopEase Pvt Ltd',
    role: 'user', parentId: reseller1.id, email: 'priya@shopease.in',
    passwordHash: hash('user@123'), securityQuestion: null, securityAnswer: null,
    pricePerSms: 0.020, balance: 380, status: 'active', createdAt: day(-120),
  }
  const user2 = {
    id: uid('usr'), userId: 'user2', name: 'Karan Joshi', companyName: 'FitLife App',
    role: 'user', parentId: reseller1.id, email: 'karan@fitlife.app',
    passwordHash: hash('user@123'), securityQuestion: 'What street did you grow up on?', securityAnswer: 'hill',
    pricePerSms: 0.022, balance: 95, status: 'active', createdAt: day(-90),
  }
  const user3 = {
    id: uid('usr'), userId: 'user3', name: 'Ananya Bose', companyName: 'TravelKart',
    role: 'user', parentId: reseller2.id, email: 'ananya@travelkart.com',
    passwordHash: hash('user@123'), securityQuestion: 'What street did you grow up on?', securityAnswer: 'park',
    pricePerSms: 0.020, balance: 210, status: 'active', createdAt: day(-80),
  }

  const extras = [
    ['user4', 'Vikram Reddy', 'BluePeak Logistics', reseller1, 0.021],
    ['user5', 'Meera Patel', 'Greengotp', reseller1, 0.019],
    ['user6', 'Sam Carter', 'allcomm', reseller1, 0.018],
    ['user7', 'Isha Verma', 'CityMeds Health', reseller1, 0.023],
    ['user8', 'Aditya Rao', 'QuickCart', reseller2, 0.020],
    ['user9', 'Tara Singh', 'FinPeek Wallet', reseller2, 0.022],
    ['user10', 'Rahul Nair', 'EduSpark Academy', reseller2, 0.019],
    ['user11', 'Nisha Khan', 'FreshBasket', reseller1, 0.021],
    ['user12', 'Alex Lee', 'MediaNest Ads', reseller2, 0.020],
    ['user13', 'Emma Wilson', 'AutoHive Motors', reseller1, 0.024],
  ].map(([userId, name, companyName, parent, price], i) => ({
    id: uid('usr'), userId, name, companyName,
    role: 'user', parentId: parent.id,
    email: `${userId}@demo.io`,
    passwordHash: hash('user@123'),
    securityQuestion: 'What street did you grow up on?', securityAnswer: 'demo',
    pricePerSms: price, balance: 120 + i * 35, status: 'active', createdAt: day(-70 + i * 4),
  }))

  let accounts = seedSmppAccounts(user1, user2, user3)
  accounts[3].status = 'suspended'

  const messages = seedMessages([user1, user2, user3, ...extras])

  return {
    meta: { version: DB_VERSION },
    users: [superadmin, adminAlias, reseller1, reseller2, user1, user2, user3, ...extras],
    senderIds: [
      { id: uid('snd'), userId: user1.id, senderId: 'SHOPEZ', entity: 'NEX0001234', status: 'Approved', route: 'India DLT', created: day(-210) },
      { id: uid('snd'), userId: user1.id, senderId: 'SHOPES', entity: 'NEX0001234', status: 'Approved', route: 'Transactional', created: day(-180) },
      { id: uid('snd'), userId: user2.id, senderId: 'FITLIFE', entity: 'NEX0009821', status: 'Approved', route: 'Promotional', created: day(-90) },
      { id: uid('snd'), userId: user2.id, senderId: 'FITLIF', entity: 'NEX0009821', status: 'Pending', route: 'Promotional', created: day(-4) },
      { id: uid('snd'), userId: user3.id, senderId: 'TRVLKRT', entity: 'NEX0004411', status: 'Approved', route: 'Global', created: day(-70) },
    ],
    apiKeys: [
      { id: uid('key'), userId: user1.id, name: 'Production API', key: 'nx_live_8f3a2c91d74b6e05a1c2', created: day(-120), lastUsed: day(0) },
      { id: uid('key'), userId: user1.id, name: 'Staging API', key: 'nx_test_51ba0d83c29e7f4a6b18', created: day(-60), lastUsed: day(-3) },
      { id: uid('key'), userId: user3.id, name: 'Production API', key: 'nx_live_33ac71be90dd4c2f1a77', created: day(-50), lastUsed: day(-1) },
    ],
    team: [
      { id: uid('tm'), userId: superadmin.id, name: 'Aarav Mehta', email: 'aarav@nexora.io', role: 'Administrator', status: 'Active' },
      { id: uid('tm'), userId: superadmin.id, name: 'Rahul Verma', email: 'rahul@nexora.io', role: 'Analyst', status: 'Active' },
      { id: uid('tm'), userId: reseller1.id, name: 'Meera Shah', email: 'meera@pixelmedia.co', role: 'Operator', status: 'Active' },
    ],
    gateways: [
      { id: uid('gw'), name: 'India DLT Primary', country: 'India', operator: 'Airtel', host: 'smpp-in-1.nexora.io', port: 2775, bindType: 'TRX', prefix: '+91', rate: 0.012, tpsLimit: 2500, tpsNow: 1420, priority: 1, status: 'connected' },
      { id: uid('gw'), name: 'India DLT Backup', country: 'India', operator: 'BSNL', host: 'smpp-in-2.nexora.io', port: 2775, bindType: 'TX', prefix: '+91', rate: 0.011, tpsLimit: 1000, tpsNow: 180, priority: 2, status: 'connected' },
      { id: uid('gw'), name: 'US/Canada', country: 'USA', operator: 'Syniverse', host: 'smpp-us.nexora.io', port: 2775, bindType: 'TRX', prefix: '+1', rate: 0.018, tpsLimit: 3000, tpsNow: 640, priority: 1, status: 'connected' },
      { id: uid('gw'), name: 'UK MVNO', country: 'UK', operator: 'EE', host: 'smpp-uk.nexora.io', port: 2776, bindType: 'TRX', prefix: '+44', rate: 0.024, tpsLimit: 800, tpsNow: 90, priority: 1, status: 'degraded' },
      { id: uid('gw'), name: 'UAE', country: 'UAE', operator: 'Etisalat', host: 'smpp-ae.nexora.io', port: 2775, bindType: 'TX', prefix: '+971', rate: 0.03, tpsLimit: 500, tpsNow: 0, priority: 1, status: 'disconnected' },
    ],
    smppAccounts: accounts,
    smppLogs: seedSmppLogs(accounts),
    contacts: [
      ...Array.from({ length: 10 }, () => ({ id: uid('ct'), userId: user1.id, name: `${rand(FIRST)} ${rand(LAST)}`, number: makeNumber(), group: rand(['VIP Customers', 'Retail Offers', 'Product Updates']) })),
      ...Array.from({ length: 6 }, () => ({ id: uid('ct'), userId: user2.id, name: `${rand(FIRST)} ${rand(LAST)}`, number: makeNumber(), group: rand(['Product Updates', 'DND Safe']) })),
      ...Array.from({ length: 5 }, () => ({ id: uid('ct'), userId: user3.id, name: `${rand(FIRST)} ${rand(LAST)}`, number: makeNumber(), group: rand(['VIP Customers', 'Retail Offers']) })),
    ],
    templates: [
      { id: uid('tpl'), userId: user1.id, name: 'OTP Login', body: 'Your OTP is 482913. Valid for 5 minutes. Do not share it with anyone. - Nexora' },
      { id: uid('tpl'), userId: user1.id, name: 'Order Shipped', body: 'Order #NX-20841 has been shipped and will arrive by tomorrow evening. Track: nxra.io/t/20841' },
      { id: uid('tpl'), userId: user2.id, name: 'Workout Reminder', body: 'Reminder: your appointment is scheduled for 24 Sep, 11:30 AM. Reply C to confirm or R to reschedule.' },
      { id: uid('tpl'), userId: user3.id, name: 'Promo Blast', body: 'Weekend Blast! FLAT 40% off on all plans. Use code NEXORA40. Offer valid till Sunday.' },
    ],
    dnd: [
      { id: uid('dnd'), userId: user1.id, number: '+91 98200 41142', reason: 'User opt-out (STOP)', createdAt: day(-12) },
      { id: uid('dnd'), userId: user1.id, number: '+91 99870 22310', reason: 'Regulatory (DND registry)', createdAt: day(-6) },
      { id: uid('dnd'), userId: user2.id, number: '+1 415 555 0132', reason: 'Consent violation', createdAt: day(-3) },
      { id: uid('dnd'), userId: user3.id, number: '+91 94480 77120', reason: 'Hard bounce / invalid', createdAt: day(-2) },
    ],
    messages,
    campaigns: [
      { id: uid('cmp'), userId: user1.id, name: 'Monsoon Mega Sale', text: rand(TEXTS), audience: 'Retail Offers', status: 'completed', scheduledAt: day(-4), total: 4200, sent: 4200, delivered: 3812, failed: 68, created: day(-5) },
      { id: uid('cmp'), userId: user1.id, name: 'Product Launch Teaser', text: rand(TEXTS), audience: 'Product Updates', status: 'completed', scheduledAt: day(0), total: 2800, sent: 2800, delivered: 2560, failed: 44, created: day(-1) },
      { id: uid('cmp'), userId: user1.id, name: 'VIP Early Access', text: rand(TEXTS), audience: 'VIP Customers', status: 'running', scheduledAt: day(0), total: 2600, sent: 480, delivered: 441, failed: 8, created: day(0) },
      { id: uid('cmp'), userId: user2.id, name: 'Reactivation Winback', text: rand(TEXTS), audience: 'DND Safe', status: 'draft', scheduledAt: null, total: 1250, sent: 0, delivered: 0, failed: 0, created: day(-2) },
      { id: uid('cmp'), userId: user3.id, name: 'August Renewal Reminders', text: rand(TEXTS), audience: 'Product Updates', status: 'completed', scheduledAt: day(-21), total: 3100, sent: 3100, delivered: 2884, failed: 51, created: day(-23) },
      { id: uid('cmp'), userId: user3.id, name: 'Diwali Flight Deals', text: rand(TEXTS), audience: 'Retail Offers', status: 'scheduled', scheduledAt: day(3), total: 900, sent: 0, delivered: 0, failed: 0, created: day(-1) },
    ],
    transactions: [
      { id: uid('tx'), ts: day(-30), type: 'funding', fromId: superadmin.id, toId: reseller1.id, amount: 5000, note: 'Initial credit line', balanceAfter: 5000 },
      { id: uid('tx'), ts: day(-28), type: 'funding', fromId: superadmin.id, toId: reseller2.id, amount: 3000, note: 'Initial credit line', balanceAfter: 3000 },
      { id: uid('tx'), ts: day(-20), type: 'funding', fromId: reseller1.id, toId: user1.id, amount: 500, note: 'Wallet top-up', balanceAfter: 500 },
      { id: uid('tx'), ts: day(-18), type: 'funding', fromId: reseller1.id, toId: user2.id, amount: 150, note: 'Wallet top-up', balanceAfter: 150 },
      { id: uid('tx'), ts: day(-15), type: 'funding', fromId: reseller2.id, toId: user3.id, amount: 300, note: 'Wallet top-up', balanceAfter: 300 },
      { id: uid('tx'), ts: day(-3), type: 'funding', fromId: reseller1.id, toId: user1.id, amount: 120, note: 'Top-up approved', balanceAfter: 380 },
      ...Array.from({ length: 14 }, (_, i) => {
        const u = [user1, user1, user1, user2, user3][i % 5]
        return {
          id: uid('tx'), ts: day(-(i + 1)), type: 'usage', fromId: u.id, toId: null,
          amount: -(randInt(40, 260) * u.pricePerSms * 2).toFixed(2) * 1,
          note: `SMS usage — ${randInt(200, 1300)} segments`,
          balanceAfter: randInt(50, 400),
        }
      }),
    ],
    topups: [
      { id: uid('tp'), userId: user1.id, amount: 200, note: 'Festive campaign budget', status: 'pending', createdAt: day(-1), resolvedAt: null, resolvedBy: null },
      { id: uid('tp'), userId: user2.id, amount: 75, note: 'Running low on credits', status: 'pending', createdAt: day(0), resolvedAt: null, resolvedBy: null },
      { id: uid('tp'), userId: user3.id, amount: 150, note: 'Diwali deals push', status: 'approved', createdAt: day(-4), resolvedAt: day(-4), resolvedBy: reseller2.id },
      { id: uid('tp'), userId: user3.id, amount: 400, note: 'Bulk renewal run', status: 'rejected', createdAt: day(-9), resolvedAt: day(-8), resolvedBy: reseller2.id },
    ],
    packages: [
      { id: uid('pkg'), name: 'Starter 10K', description: '≈10,000 SMS at standard rates, valid for 60 days. Great for trial campaigns and transactional alerts.', price: 170, credits: 200, validityDays: 60, status: 'active', created: day(-30) },
      { id: uid('pkg'), name: 'Growth 50K', description: '≈50,000 SMS worth of credit + 25% bonus. Priority routing on all promotional routes.', price: 800, credits: 1000, validityDays: 90, status: 'active', created: day(-30) },
      { id: uid('pkg'), name: 'Scale 200K', description: '≈200,000 SMS worth of credit + 29% bonus. DND-clean delivery reports and extra sender ID slots.', price: 2800, credits: 3600, validityDays: 180, status: 'active', created: day(-30) },
      { id: uid('pkg'), name: 'Enterprise 1M', description: '≈1,000,000 SMS worth of credit + 36% bonus. Dedicated SMPP account and 24×7 support SLA.', price: 12500, credits: 17000, validityDays: 365, status: 'active', created: day(-30) },
    ],
    purchases: [],
    notifications: [
      { id: uid('ntf'), userId: reseller1.id, title: 'Welcome to Nexora', body: 'Your reseller workspace is live. Fund a client or buy a package to start sending.', read: false, createdAt: new Date().toISOString() },
      { id: uid('ntf'), userId: user1.id, title: 'Welcome to Nexora', body: 'Your account is ready. Check Packages for prepaid bundles.', read: false, createdAt: new Date().toISOString() },
      { id: uid('ntf'), userId: adminAlias.id, title: 'Platform boot', body: 'Seed database v3 initialised with packages, purchases and notifications.', read: false, createdAt: new Date().toISOString() },
    ],
    settings: {
      companyName: 'Nexora Enterprise',
      email: 'ops@nexora.io',
      timezone: 'Asia/Kolkata',
      defaultSender: 'SHOPEZ',
      webhook: 'https://hooks.nexora.io/dlr/v1',
      currency: 'USD',
      archivedSent: 118420,
      smppHost: 'smpp.nexora.io',
      ports: { trx: 2775, tx: 2776, rx: 2777 },
    },
  }
}

function seedSmppLogs(accounts) {
  const pdas = [
    ['→', 'submit_sm', 'src=SHOPEZ dcs=0 smpp_msg_id=nx_88f3'],
    ['←', 'submit_sm_resp', 'status:0x0000 msg_id=nx_88f3'],
    ['←', 'deliver_sm', 'stat:DELIVRD msg_id=nx_88f3'],
    ['↔', 'enquire_link', 'keep-alive ping'],
    ['↔', 'enquire_link_resp', 'keep-alive pong'],
    ['→', 'data_sm', 'src=TRVLKRT esm_class=0'],
    ['←', 'deliver_sm', 'stat:UNDELIV err:0x0000000B'],
  ]
  const logs = []
  const now = Date.now()
  for (let i = 44; i >= 0; i--) {
    const [dir, pdu, detail] = pdas[i % pdas.length]
    logs.push({
      id: uid('log'), ts: new Date(now - i * randInt(40, 160) * 1000).toISOString(),
      dir, pdu, detail,
      accountId: accounts[i % accounts.length].id,
    })
  }
  logs.sort((a, b) => (a.ts < b.ts ? 1 : -1))
  return logs
}

/* ------------------------------ persistence ----------------------------- */
let db = null
let saveTimer = null

export function loadDb() {
  if (db) return db
  let loaded = null
  if (fs.existsSync(DB_PATH)) {
    try {
      loaded = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    } catch {
      loaded = null
    }
  }
  db = loaded && loaded.meta?.version === DB_VERSION ? loaded : buildSeed()
  persistNow()
  return db
}

export function getDb() {
  return db || loadDb()
}

export function save() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(persistNow, 300)
}

export function persistNow() {
  if (!db) return
  fs.writeFileSync(DB_PATH, JSON.stringify(db))
}

