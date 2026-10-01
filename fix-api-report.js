import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. Add apiFilter state
if (!code.includes("const [apiFilter, setApiFilter] = useState(")) {
  code = code.replace(
    "const [apiSearch, setApiSearch] = useState('')",
    "const [apiSearch, setApiSearch] = useState('')\n  const [apiFilter, setApiFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })"
  );
}

// 2. Modify apiRows to use apiFilter
const apiRowsNew = `const apiRows = useMemo(() => {
    const term = apiSearch.toLowerCase()
    const mocked = []
    for (let i = 0; i < 20; i++) {
      const u = users[i % users.length] || { id: 'unknown', companyName: 'Unknown' };
      mocked.push({
        id: 'req_' + Math.random().toString(36).slice(2, 9),
        userId: u.id,
        time: new Date(Date.now() - i * 3600000).toISOString(),
        account: u.companyName,
        endpoint: '/v1/sms/send',
        status: i % 7 === 0 ? 400 : 200,
        latency: 12 + (i % 80),
        messageId: i % 7 === 0 ? '-' : 'msg_' + Math.random().toString(36).slice(2, 9)
      })
    }
    
    let filtered = mocked;
    if (apiFilter.userId !== 'all') {
      filtered = filtered.filter(r => r.userId === apiFilter.userId);
    }
    if (apiFilter.dateRange?.from || apiFilter.dateRange?.to) {
      filtered = filtered.filter(r => {
        const d = r.time.split('T')[0];
        if (apiFilter.dateRange.from && d < apiFilter.dateRange.from) return false;
        if (apiFilter.dateRange.to && d > apiFilter.dateRange.to) return false;
        return true;
      });
    }

    if (!term) return filtered;
    return filtered.filter(r => r.id.toLowerCase().includes(term) || r.account.toLowerCase().includes(term) || r.messageId.toLowerCase().includes(term))
  }, [apiSearch, users, apiFilter])`;

code = code.replace(/const apiRows = useMemo\(\(\) => \{[\s\S]*?\}, \[apiSearch, users\]\)/, apiRowsNew);

// 3. Modify API Report UI
const oldUIStr = "{tab === 'API Report' && <Card><div className=\"mb-4 flex flex-wrap gap-3\"><input className={`${inputCls} sm:max-w-[380px]`} placeholder=\"Search request, message ID or account\" value={apiSearch} onChange={(e) => setApiSearch(e.target.value)} /><Button variant=\"secondary\" className=\"sm:ml-auto\" onClick={() => exportRows(apiRows, 'api-report')}><DownloadIcon className=\"h-[18px] w-[18px]\" /> Export</Button></div><Table headers={['Request ID', 'Time', 'Account', 'Endpoint', 'HTTP', 'Latency', 'Message ID']}>{apiRows.length ? apiRows.map((r) => <tr key={r.id}><Td className=\"font-mono text-[12px]\">{r.id}</Td><Td>{fmtTime(r.time)}</Td><Td className=\"font-semibold text-ink\">{r.account}</Td><Td className=\"font-mono text-[12px]\">{r.endpoint}</Td><Td><Chip status={r.status === 200 ? 'delivered' : 'failed'}>{r.status}</Chip></Td><Td>{r.latency} ms</Td><Td className=\"font-mono text-[12px] text-gray-400\">{r.messageId}</Td></tr>) : <EmptyRow colSpan={7} text=\"No API requests found\" />}</Table></Card>}";

const newUIStr = `{tab === 'API Report' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={\`\${inputCls} sm:max-w-[280px]\`} value={apiFilter.userId} onChange={(e) => setApiFilter({ ...apiFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<DateRangePicker value={apiFilter.dateRange} onChange={(r) => setApiFilter({ ...apiFilter, dateRange: r })} /><input className={\`\${inputCls} sm:max-w-[380px]\`} placeholder="Search request, message ID or account" value={apiSearch} onChange={(e) => setApiSearch(e.target.value)} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(apiRows, 'api-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><Table headers={['Request ID', 'Time', 'Account', 'Endpoint', 'HTTP', 'Latency', 'Message ID']}>{apiRows.length ? apiRows.map((r) => <tr key={r.id}><Td className="font-mono text-[12px]">{r.id}</Td><Td>{fmtTime(r.time)}</Td><Td className="font-semibold text-ink">{r.account}</Td><Td className="font-mono text-[12px]">{r.endpoint}</Td><Td><Chip status={r.status === 200 ? 'delivered' : 'failed'}>{r.status}</Chip></Td><Td>{r.latency} ms</Td><Td className="font-mono text-[12px] text-gray-400">{r.messageId}</Td></tr>) : <EmptyRow colSpan={7} text="No API requests found" />}</Table></Card>}`;

if (code.includes(oldUIStr)) {
  code = code.replace(oldUIStr, newUIStr);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success string match UI replacement for API report');
} else {
  console.log('Failed UI string match');
}
