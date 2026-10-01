import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// Replace TABS
code = code.replace(
  "const TABS = ['Summary', 'Delivery Report', 'X-Dropped', 'Campaign Report', 'Credit Report', 'Route Reports', 'Advanced Search', 'API Report', 'Tiny URL Report']",
  "const MAIN_TABS = ['General Reports', 'X-Dropped', 'Credit Report', 'Route Reports', 'Advanced Search', 'API Report', 'Tiny URL Report']\nconst GENERAL_TABS = ['Summary', 'Delivery Report', 'Campaign Report']"
);

// Add mainTab state
code = code.replace(
  "const [tab, setTab] = useState(params.get('userId') ? 'Delivery Report' : params.get('search') ? 'Advanced Search' : 'Summary')",
  "const [mainTab, setMainTab] = useState(params.get('search') ? 'Advanced Search' : 'General Reports')\n  const [tab, setTab] = useState(params.get('userId') ? 'Delivery Report' : 'Summary')"
);

// Update tab rendering logic
code = code.replace(
  "<div className=\"mb-5 overflow-x-auto\"><div className=\"inline-flex min-w-full gap-1 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm sm:min-w-0\">{TABS.map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition ${tab === item ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-ink'}`}>{item}</button>)}</div></div>",
  `<div className="mb-5 overflow-x-auto"><div className="inline-flex min-w-full gap-1 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm sm:min-w-0">{MAIN_TABS.map((item) => <button key={item} onClick={() => { setMainTab(item); if(item === 'General Reports') setTab('Summary'); else setTab(item); }} className={\`whitespace-nowrap rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition \${mainTab === item ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-ink'}\`}>{item}</button>)}</div></div>
      {mainTab === 'General Reports' && (
        <div className="mb-5 overflow-x-auto"><div className="inline-flex min-w-full gap-1 rounded-xl bg-gray-100 p-1 sm:min-w-0">{GENERAL_TABS.map((item) => <button key={item} onClick={() => setTab(item)} className={\`whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-semibold transition \${tab === item ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}\`}>{item}</button>)}</div></div>
      )}`
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
