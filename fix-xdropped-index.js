import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

const startIdx = code.indexOf("{tab === 'X-Dropped'");
// The end index is exactly where "No X-dropped messages found" />}</Table></Card>}" ends.
const endStr = "No X-dropped messages found\" /></Table></Card>}";
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newUI = `{tab === 'X-Dropped' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Card className="flex-1 max-w-[220px]">
              <div className="text-[11px] font-bold uppercase tracking-wide text-rose-500">X-Dropped</div>
              <div className="mt-1 text-[24px] font-extrabold text-ink">{fmtNum(xDroppedSelectedDate ? xDroppedAggregates.selectedDateTotal : xDroppedAggregates.totalDropped)}</div>
            </Card>
            <Card className="flex-1 max-w-[220px]">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Credits Deducted</div>
              <div className="mt-1 text-[24px] font-extrabold text-ink">{fmtNum(xDroppedSelectedDate ? xDroppedAggregates.selectedDateTotal : xDroppedAggregates.totalDropped)}</div>
            </Card>
          </div>

          {!xDroppedSelectedDate ? (
            <Card>
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Day-wise ({xDroppedAggregates.dayRows.length})</span>
                {isStaff && <select className={\`\${inputCls} sm:max-w-[280px] ml-auto\`} value={xDroppedFilter.userId} onChange={(e) => setXDroppedFilter({ ...xDroppedFilter, userId: e.target.value })}><option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.companyName}</option>)}</select>}
                <DateRangePicker value={xDroppedFilter.dateRange} onChange={(r) => setXDroppedFilter({ ...xDroppedFilter, dateRange: r })} />
                <Button variant="secondary" onClick={() => exportRows(xDroppedAggregates.dayRows, 'xdropped-daywise')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button>
              </div>
              <Table headers={['Date (IST)', 'X-Dropped', 'Credits Deducted']}>
                {xDroppedAggregates.dayRows.length ? xDroppedAggregates.dayRows.map(r => (
                  <tr key={r.date}>
                    <Td><button onClick={() => setXDroppedSelectedDate(r.date)} className="font-semibold text-brand-600 hover:underline">{r.date}</button></Td>
                    <Td>{fmtNum(r.dropped)}</Td>
                    <Td>{fmtNum(r.credits)}</Td>
                  </tr>
                )) : <EmptyRow colSpan={3} text="No data found" />}
              </Table>
            </Card>
          ) : (
            <Card>
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <button onClick={() => setXDroppedSelectedDate(null)} className="flex items-center gap-1 text-[13px] font-semibold text-gray-500 hover:text-ink transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to Day-wise
                </button>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Clients / Resellers ({xDroppedAggregates.userRows.length})</span>
                  <Button variant="secondary" onClick={() => exportRows(xDroppedAggregates.userRows, 'xdropped-users')}><DownloadIcon className="h-[18px] w-[18px]" /> Export</Button>
                </div>
              </div>
              <Table headers={['Client / Reseller', 'Type', 'X-Dropped', 'Credits Deducted']}>
                {xDroppedAggregates.userRows.length ? xDroppedAggregates.userRows.map(r => (
                  <tr key={r.userId}>
                    <Td className="font-semibold text-brand-600">{r.companyName}</Td>
                    <Td><Chip status={r.type === 'user' ? 'client' : r.type} /></Td>
                    <Td>{fmtNum(r.dropped)}</Td>
                    <Td>{fmtNum(r.credits)}</Td>
                  </tr>
                )) : <EmptyRow colSpan={4} text="No users found for this date" />}
              </Table>
            </Card>
          )}
        </div>
      )}`;
  code = code.substring(0, startIdx) + newUI + code.substring(endIdx + endStr.length);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success UI index based');
} else {
  console.log('Failed UI index based', startIdx, endIdx);
}
