const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">[\s\S]*?<\/div>\s*{\/\* Search & controls \*\/}/;

const newCards = `<div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400">Total Users</div>
                <div className="mt-0.5 text-[22px] font-extrabold text-ink">{items.length} <span className="text-[14px] text-gray-400 font-bold">Total</span></div>
              </div>
            </Card>
            
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400">Reseller Accounts</div>
                <div className="mt-0.5 text-[22px] font-extrabold text-ink">{items.filter(u => u.role === 'reseller').length} <span className="text-[14px] text-gray-400 font-bold">Active</span></div>
              </div>
            </Card>
  
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div>
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400">Total Funds</div>
                <div className="mt-0.5 text-[22px] font-extrabold text-ink">{fmtMoney(items.reduce((sum, u) => sum + (u.balance || 0), 0))}</div>
              </div>
            </Card>
  
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              </div>
              <div>
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400">Suspended / Inactive</div>
                <div className="mt-0.5 text-[22px] font-extrabold text-ink">{items.filter(u => u.status !== 'active').length} <span className="text-[14px] text-gray-400 font-bold">Accounts</span></div>
              </div>
            </Card>
          </div>
  
        {/* Search & controls */}`;

if(content.match(regex)) {
    content = content.replace(regex, newCards);
    fs.writeFileSync(path, content);
    console.log("Replaced KPIs in Admin.jsx successfully.");
} else {
    console.log("Still failed to match regex!");
}
