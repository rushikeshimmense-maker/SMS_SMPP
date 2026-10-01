import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

const startStr = "{tab === 'X-Dropped' && <Card><div className=\"mb-4 flex flex-wrap gap-3\"><select className={`${inputCls} sm:max-w-[220px]`} disabled><option>Dropped Status Only</option></select><Button variant=\"secondary\" className=\"sm:ml-auto\" onClick={() => exportRows(messages.filter(m => m.status === 'dropped'), 'xdropped-report')}><DownloadIcon className=\"h-[18px] w-[18px]\" /> Export</Button></div>";

const endStr = "Smart Cut (Option X)</Td></tr>) : <EmptyRow colSpan={7} text=\"No X-dropped messages found\" />}</Table></Card>}";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newUI = `{tab === 'X-Dropped' && <Card><div className="mb-4 flex flex-wrap gap-3">{isStaff && <select className={\`\${inputCls} sm:max-w-[280px]\`} value={xDroppedFilter.userId} onChange={(e) => setXDroppedFilter({ ...xDroppedFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}<select className={\`\${inputCls} sm:max-w-[220px]\`} disabled><option>Dropped Status Only</option></select><DateRangePicker value={xDroppedFilter.dateRange} onChange={(r) => setXDroppedFilter({ ...xDroppedFilter, dateRange: r })} /><Button variant="secondary" className="sm:ml-auto" onClick={() => exportRows(xDroppedRows, 'xdropped-report')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button></div><Table headers={['ID', 'Time', 'Sender ID', 'To', 'Cost', 'Status', 'Drop Reason']}>{xDroppedRows.length ? xDroppedRows.map((r) => <tr key={r.id}><Td className="font-mono text-[11px] text-gray-400">{r.id}</Td><Td>{fmtTime(r.createdAt)}</Td><Td className="font-bold text-ink">{r.from}</Td><Td className="font-mono text-[13px]">{r.to}</Td><Td>{fmtMoney(0.02)}</Td><Td><Chip status={r.status} /></Td><Td className="max-w-[200px] truncate text-amber-600 font-semibold">Smart Cut (Option X)</Td></tr>) : <EmptyRow colSpan={7} text="No X-dropped messages found" />}</Table></Card>}`;
  code = code.substring(0, startIdx) + newUI + code.substring(endIdx + endStr.length);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success final 2');
} else {
  console.log('Failed final bounds', startIdx, endIdx);
}
