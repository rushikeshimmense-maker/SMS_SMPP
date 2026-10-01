const fs = require('fs');
let path = 'src/pages/Reports.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacementStr = `<thead className="bg-gray-50/80"><tr>{['Summary date', 'Total request', 'Total rejected', 'Total submitted', 'Total delivered', 'Total X-dropped', 'Total failed'].map((heading, i) => <th key={heading} className={\`border-b border-gray-100 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 \${i === 0 ? 'text-left pl-5 pr-4' : 'text-right px-4'}\`}>{heading}</th>)}</tr></thead>
              <tbody className="text-[13.5px] text-gray-600">
                {summaryRows.length ? summaryRows.map((row) => <tr key={row.date} className="transition hover:bg-brand-50/30"><Td className="pl-5 font-bold text-brand-600 text-left">{row.date}</Td><Td className="text-right px-4">{fmtNum(row.request)}</Td><Td className="text-right px-4">{fmtNum(row.rejected)}</Td><Td className="text-right px-4">{fmtNum(row.submitted)}</Td><Td className="font-semibold text-emerald-600 text-right px-4">{fmtNum(row.delivered)}</Td><Td className="text-right px-4">{fmtNum(row.dropped)}</Td><Td className="text-rose-500 text-right px-4">{fmtNum(row.failed)}</Td></tr>) : <EmptyRow colSpan={7} text="Select a valid date range" />}
              </tbody>
              {!!summaryRows.length && <tfoot><tr className="bg-gray-50 font-extrabold text-ink"><td className="pl-5 pr-4 py-4 text-left">Total</td>{['request', 'rejected', 'submitted', 'delivered', 'dropped', 'failed'].map((key) => <td key={key} className="px-4 py-4 text-right">{fmtNum(summaryTotals[key])}</td>)}</tr></tfoot>}`;

// Use regex to replace the table inner content
let regex = /<thead className="bg-gray-50\/80">.*?<\/tfoot>}/s;
if(content.match(regex)) {
    content = content.replace(regex, replacementStr);
    fs.writeFileSync(path, content);
    console.log("Success: Replaced table layout.");
} else {
    console.log("Error: Target regex not found.");
}
