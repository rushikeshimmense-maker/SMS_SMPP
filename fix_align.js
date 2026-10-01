const fs = require('fs');
let path = 'src/pages/Reports.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<thead className="bg-gray-50/80"><tr>{['Summary date', 'Total request', 'Total rejected', 'Total submitted', 'Total delivered', 'Total X-dropped', 'Total failed'].map((heading) => <th key={heading} className="border-b border-gray-100 pr-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-left first:pl-5">{heading}</th>)}</tr></thead>
              <tbody className="text-[13.5px] text-gray-600">
                {summaryRows.length ? summaryRows.map((row) => <tr key={row.date} className="transition hover:bg-brand-50/30"><Td className="pl-5 font-bold text-brand-600">{row.date}</Td><Td>{fmtNum(row.request)}</Td><Td>{fmtNum(row.rejected)}</Td><Td>{fmtNum(row.submitted)}</Td><Td className="font-semibold text-emerald-600">{fmtNum(row.delivered)}</Td><Td>{fmtNum(row.dropped)}</Td><Td className="text-rose-500">{fmtNum(row.failed)}</Td></tr>) : <EmptyRow colSpan={7} text="Select a valid date range" />}
              </tbody>
              {!!summaryRows.length && <tfoot><tr className="bg-gray-50 font-extrabold text-ink"><td className="pl-5 pr-4 py-4">Total</td>{['request', 'rejected', 'submitted', 'delivered', 'dropped', 'failed'].map((key) => <td key={key} className="pr-4 py-4">{fmtNum(summaryTotals[key])}</td>)}</tr></tfoot>}`;

const replacementStr = `<thead className="bg-gray-50/80"><tr>{['Summary date', 'Total request', 'Total rejected', 'Total submitted', 'Total delivered', 'Total X-dropped', 'Total failed'].map((heading, idx) => <th key={heading} className={\`border-b border-gray-100 pr-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 \${idx === 0 ? 'text-left pl-5' : 'text-right'}\`}>{heading}</th>)}</tr></thead>
              <tbody className="text-[13.5px] text-gray-600">
                {summaryRows.length ? summaryRows.map((row) => <tr key={row.date} className="transition hover:bg-brand-50/30"><Td className="pl-5 font-bold text-brand-600 text-left">{row.date}</Td><Td className="text-right">{fmtNum(row.request)}</Td><Td className="text-right">{fmtNum(row.rejected)}</Td><Td className="text-right">{fmtNum(row.submitted)}</Td><Td className="font-semibold text-emerald-600 text-right">{fmtNum(row.delivered)}</Td><Td className="text-right">{fmtNum(row.dropped)}</Td><Td className="text-rose-500 text-right">{fmtNum(row.failed)}</Td></tr>) : <EmptyRow colSpan={7} text="Select a valid date range" />}
              </tbody>
              {!!summaryRows.length && <tfoot><tr className="bg-gray-50 font-extrabold text-ink"><td className="pl-5 pr-4 py-4 text-left">Total</td>{['request', 'rejected', 'submitted', 'delivered', 'dropped', 'failed'].map((key) => <td key={key} className="pr-4 py-4 text-right">{fmtNum(summaryTotals[key])}</td>)}</tr></tfoot>}`;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content);
    console.log("Success");
} else {
    console.log("Target string not found in Reports.jsx");
}
