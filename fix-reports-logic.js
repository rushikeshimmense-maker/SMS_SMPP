import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. Update the 'bounds' function
code = code.replace(
  /function bounds\(period, custom\) \{[\s\S]*?return \[start, end\]\n\}/,
  `function bounds(period, custom) {
  const end = new Date(); end.setHours(23, 59, 59, 999)
  if (period === 'custom' && custom.from && custom.to) return [new Date(\`\${custom.from}T00:00:00\`), new Date(\`\${custom.to}T23:59:59\`)]
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
}`
);

// 2. Update 'createDailySummary' to group by month if period is 'month'
code = code.replace(
  /function createDailySummary\(start, end, account = 'all'\) \{[\s\S]*?return rows\n\}/,
  `function createDailySummary(start, end, account = 'all', period = 'today') {
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
}`
);

// 3. Update useMemo to pass \`period\`
code = code.replace(
  "const summaryRows = useMemo(() => createDailySummary(start, end, summaryUser), [start, end, summaryUser])",
  "const summaryRows = useMemo(() => createDailySummary(start, end, summaryUser, period), [start, end, summaryUser, period])"
);

// Change the default period back to 'today' so it opens on 'Day' tab. 
code = code.replace(
  "const [period, setPeriod] = useState('month')",
  "const [period, setPeriod] = useState('today')"
);

// Update subtitle
code = code.replace(
  "1 day \u2013 figures shown day-wise",
  "{period === 'today' ? 'Last 30 days \u2013 figures shown day-wise' : period === 'month' ? 'This year \u2013 figures shown month-wise' : 'Custom range \u2013 figures shown day-wise'}"
);
// Handle cases where the text was written inside JSX
code = code.replace(
  "1 day \u2013 figures shown day-wise",
  "{period === 'today' ? 'Last 30 days \u2013 figures shown day-wise' : period === 'month' ? 'This year \u2013 figures shown month-wise' : 'Custom range \u2013 figures shown day-wise'}"
);
code = code.replace(
  ">1 day – figures shown day-wise<",
  ">{period === 'today' ? 'Last 30 days – figures shown day-wise' : period === 'month' ? 'This year – figures shown month-wise' : 'Custom range – figures shown day-wise'}<"
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
