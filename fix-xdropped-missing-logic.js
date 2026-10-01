import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

if (!code.includes("const [xDroppedSelectedDate, setXDroppedSelectedDate]")) {
  code = code.replace(
    "const [xDroppedFilter, setXDroppedFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })",
    "const [xDroppedFilter, setXDroppedFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })\n    const [xDroppedSelectedDate, setXDroppedSelectedDate] = useState(null)"
  );
}

const aggregateLogic = `
  const xDroppedAggregates = useMemo(() => {
    const dropped = messages.filter(m => m.status === 'dropped');
    // apply filters if any
    const filtered = dropped.filter(m => {
      if (xDroppedFilter.userId !== 'all' && m.userId !== xDroppedFilter.userId) return false;
      if (xDroppedFilter.dateRange?.from || xDroppedFilter.dateRange?.to) {
        const t = m.submittedAt || m.createdAt;
        if (!t) return false;
        const d = t.split('T')[0];
        if (xDroppedFilter.dateRange.from && d < xDroppedFilter.dateRange.from) return false;
        if (xDroppedFilter.dateRange.to && d > xDroppedFilter.dateRange.to) return false;
      }
      return true;
    });

    // Day-wise grouping
    const dayMap = {};
    let totalDropped = 0;
    filtered.forEach(m => {
      const d = (m.submittedAt || m.createdAt || '').split('T')[0];
      if (!d) return;
      if (!dayMap[d]) dayMap[d] = 0;
      dayMap[d]++;
      totalDropped++;
    });

    const dayRows = Object.keys(dayMap).sort((a,b) => b.localeCompare(a)).map(d => ({
      date: d,
      dropped: dayMap[d],
      credits: dayMap[d]
    }));

    // If a date is selected, group by user for that date
    let userRows = [];
    let selectedDateTotal = 0;
    if (xDroppedSelectedDate) {
      const userMap = {};
      filtered.filter(m => (m.submittedAt || m.createdAt || '').startsWith(xDroppedSelectedDate)).forEach(m => {
        if (!userMap[m.userId]) userMap[m.userId] = 0;
        userMap[m.userId]++;
        selectedDateTotal++;
      });
      userRows = Object.keys(userMap).map(uid => {
        const u = users.find(x => x.id === uid) || { companyName: 'Unknown', role: 'user' };
        return {
          userId: uid,
          companyName: u.companyName,
          type: u.role,
          dropped: userMap[uid],
          credits: userMap[uid]
        };
      }).sort((a,b) => b.dropped - a.dropped);
    }

    return { totalDropped, dayRows, userRows, selectedDateTotal };
  }, [messages, xDroppedFilter, xDroppedSelectedDate, users]);
`;

if (!code.includes("const xDroppedAggregates = useMemo")) {
  code = code.replace(
    "const xDroppedRows = useMemo(() => {",
    aggregateLogic + "\n  const xDroppedRows = useMemo(() => {"
  );
}

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
console.log('Success adding missing logic for X-Dropped Aggregates');
