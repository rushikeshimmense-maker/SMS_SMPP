const fs = require('fs');
let text = fs.readFileSync('frontend/src/pages/Admin.jsx', 'utf-8');

const deduct_node = '<button title="Deduct Credits" onClick={() => setFund({ user: node, mode: \'deduct\', amount: \'\', note: \'\' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow-sm border border-rose-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>\n                          <button title="DLT Config" onClick={() => window.location.href=\'/approvals\'} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></button>\n                          ';

text = text.replace(/<button title="Manage Settings" onClick=\{\(\) => setEditor\(\{ user: node, lockedTab: 'settings' \}\)\}/g, deduct_node + '<button title="Manage Settings" onClick={() => setEditor({ user: node, lockedTab: \'settings\' })}');

const deduct_u = '<button title="Deduct Credits" onClick={() => setFund({ user: u, mode: \'deduct\', amount: \'\', note: \'\' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow-sm border border-rose-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>\n                      <button title="DLT Config" onClick={() => window.location.href=\'/approvals\'} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></button>\n                      ';

text = text.replace(/<button title="Manage Settings" onClick=\{\(\) => setEditor\(\{ user: u, lockedTab: 'settings' \}\)\}/g, deduct_u + '<button title="Manage Settings" onClick={() => setEditor({ user: u, lockedTab: \'settings\' })}');

text = text.replace(/title="Fund Wallet"/g, 'title="Fund Credits"');
text = text.replace(/mode: 'credit'/g, 'mode: \'fund\'');

fs.writeFileSync('frontend/src/pages/Admin.jsx', text, 'utf-8');
console.log('Admin icons injected!');
