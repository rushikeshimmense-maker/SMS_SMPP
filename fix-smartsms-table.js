import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// Add State
if (!code.includes("const [smartSmsFilter, setSmartSmsFilter] = useState(")) {
  code = code.replace(
    "const [apiFilter, setApiFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })",
    "const [apiFilter, setApiFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })\n  const [smartSmsFilter, setSmartSmsFilter] = useState({ userId: 'all', dateRange: { from: '', to: '' } })\n  const [smartSmsSearch, setSmartSmsSearch] = useState('')"
  );
}

// Add Rows Logic
const smartSmsRowsCode = `
  const smartSmsRows = useMemo(() => {
    const term = smartSmsSearch.toLowerCase()
    const mocked = []
    const domains = ['https://google.com', 'https://amazon.in/offer', 'https://flipkart.com/sale'];
    for (let i = 0; i < 25; i++) {
      const u = users[i % users.length] || { id: 'unknown', companyName: 'Unknown' };
      mocked.push({
        id: 'click_' + Math.random().toString(36).slice(2, 9),
        userId: u.id,
        account: u.companyName,
        time: new Date(Date.now() - (i * 2 + 1) * 3600000).toISOString(),
        mobile: '+919' + Math.floor(100000000 + Math.random() * 900000000),
        originalUrl: domains[i % 3],
        shortUrl: 'https://smrt.to/' + Math.random().toString(36).slice(2, 6),
        clicks: Math.floor(Math.random() * 3) + 1,
        device: i % 2 === 0 ? 'Mobile (Android)' : 'Mobile (iOS)'
      })
    }
    
    let filtered = mocked;
    if (smartSmsFilter.userId !== 'all') {
      filtered = filtered.filter(r => r.userId === smartSmsFilter.userId);
    }
    if (smartSmsFilter.dateRange?.from || smartSmsFilter.dateRange?.to) {
      filtered = filtered.filter(r => {
        const d = r.time.split('T')[0];
        if (smartSmsFilter.dateRange.from && d < smartSmsFilter.dateRange.from) return false;
        if (smartSmsFilter.dateRange.to && d > smartSmsFilter.dateRange.to) return false;
        return true;
      });
    }

    if (!term) return filtered;
    return filtered.filter(r => r.mobile.includes(term) || r.account.toLowerCase().includes(term) || r.shortUrl.toLowerCase().includes(term))
  }, [smartSmsSearch, users, smartSmsFilter])
`;

if (!code.includes("const smartSmsRows = useMemo")) {
  code = code.replace(
    "const apiRows = useMemo(() => {",
    smartSmsRowsCode + "\n  const apiRows = useMemo(() => {"
  );
}

// UI Replacement
const oldUI = "{tab === 'Smart SMS' && (\n        <Card>\n          <div className=\"flex flex-col gap-3 xl:flex-row xl:items-end mb-4\">\n            <h3 className=\"text-[14px] font-extrabold text-ink\">Smart SMS Analytics</h3>\n          </div>\n          <div className=\"flex items-center justify-center p-10 border border-dashed border-gray-200 rounded-xl bg-gray-50/50\">\n            <div className=\"text-center\">\n              <svg className=\"mx-auto h-8 w-8 text-gray-400 mb-2\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth=\"2\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1\"></path></svg>\n              <p className=\"text-[13px] text-gray-500 font-medium\">Tiny URL click analytics will be displayed here.</p>\n            </div>\n          </div>\n        </Card>\n      )}";

const newUI = `{tab === 'Smart SMS' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={\`\${inputCls} sm:max-w-[280px]\`} value={smartSmsFilter.userId} onChange={(e) => setSmartSmsFilter({ ...smartSmsFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<DateRangePicker value={smartSmsFilter.dateRange} onChange={(r) => setSmartSmsFilter({ ...smartSmsFilter, dateRange: r })} /><input className={\`\${inputCls} sm:max-w-[280px]\`} placeholder="Search mobile or short URL" value={smartSmsSearch} onChange={(e) => setSmartSmsSearch(e.target.value)} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(smartSmsRows, 'smartsms-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><Table headers={['Click Time', 'Account', 'Mobile Number', 'Short URL', 'Device', 'Clicks']}>{smartSmsRows.length ? smartSmsRows.map((r) => <tr key={r.id}><Td>{fmtTime(r.time)}</Td><Td className="font-semibold text-ink">{r.account}</Td><Td className="font-mono text-[13px]">{r.mobile}</Td><Td className="font-mono text-[12px] text-brand-600 hover:underline cursor-pointer">{r.shortUrl}</Td><Td>{r.device}</Td><Td className="font-bold text-center">{r.clicks}</Td></tr>) : <EmptyRow colSpan={6} text="No click analytics found" />}</Table></Card>}`;

if (code.includes(oldUI)) {
  code = code.replace(oldUI, newUI);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Replaced Smart SMS UI successfully');
} else {
  console.log('Failed to match Smart SMS UI');
}
