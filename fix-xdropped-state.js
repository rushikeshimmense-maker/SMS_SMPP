import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [routeFilter, setRouteFilter] = useState({ dateRange: { from: '', to: '' } })",
  "const [xDroppedFilter, setXDroppedFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })\n  const [routeFilter, setRouteFilter] = useState({ dateRange: { from: '', to: '' } })"
);

// 2. Add useMemo
const xDroppedRowsCode = `
  const xDroppedRows = useMemo(() => {
    return messages.filter((m) => {
      if (m.status !== 'dropped') return false;
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
  }, [messages, xDroppedFilter]);
`;

code = code.replace(
  "const creditRows = useMemo(() => {",
  xDroppedRowsCode + "\n  const creditRows = useMemo(() => {"
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
console.log('Success adding state and rows for xdropped');
