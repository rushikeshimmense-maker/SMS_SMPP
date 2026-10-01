const fs = require('fs');
let text = fs.readFileSync('frontend/src/pages/Users.jsx', 'utf-8');

const actions_u = '<button title="Fund Credits" onClick={() => setFund({ user: u, mode: \'fund\', amount: \'\', note: \'\' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50">\n' +
'                    <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>\n' +
'                  </button>\n' +
'                  <button title="Deduct Credits" onClick={() => setFund({ user: u, mode: \'deduct\', amount: \'\', note: \'\' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow-sm border border-rose-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>\n' +
'                  <button title="DLT Config" onClick={() => setDlt({ user: u, senders: \'\', templates: \'\' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></button>\n' +
'                  <button title="Edit" onClick={() => setEdit({ user: u, pricePerSms: String(u.pricePerSms), name: u.name, companyName: u.companyName, status: u.status })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200/50">\n' +
'                    <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>\n' +
'                  </button>';

const regex = /<Button variant="secondary" className="h-8 px-2.5 text-\[12px\]" onClick=\{\(\) => setFund\(\{ user: u, mode: 'fund', amount: '', note: '' \}\)\}>Fund<\/Button>[\s\S]*?<Button variant="ghost" className="h-8 px-2.5 text-\[12px\]" onClick=\{\(\) => setEdit\(\{ user: u, pricePerSms: String\(u.pricePerSms\), name: u.name, companyName: u.companyName, status: u.status \}\)\}>\s*Edit\s*<\/Button>/g;

text = text.replace(regex, actions_u);
fs.writeFileSync('frontend/src/pages/Users.jsx', text, 'utf-8');
console.log('Users updated!');
