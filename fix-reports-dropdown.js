import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

const regexMainTabsArray = /const MAIN_TABS = \[\'General Reports\',[\s\S]*?\]\nconst GENERAL_TABS = \[\'Summary\', \'Delivery Report\', \'Campaign Report\'\]/;
code = code.replace(regexMainTabsArray, "");

const regexMainTabState = /const \[mainTab, setMainTab\] = useState\(params\.get\('search'\) \? 'Advanced Search' : 'General Reports'\)/;
code = code.replace(regexMainTabState, "");

const tabsRenderRegex = /<div className="mb-5 overflow-x-auto"><div className="inline-flex min-w-full gap-1 rounded-2xl border border-gray-100 bg-white p-1\.5 shadow-sm sm:min-w-0">[\s\S]*?<\/div><\/div>\n\s*\{mainTab === 'General Reports' && \(\n\s*<div className="mb-5 overflow-x-auto"><div className="inline-flex min-w-full gap-1 rounded-xl bg-gray-100 p-1 sm:min-w-0">[\s\S]*?<\/div><\/div>\n\s*\)\}/;

const dropdownHtml = `<div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <PageHeader title="Reports" sub="Clear operational reports in one place" />
        </div>
        <div className="w-full sm:w-auto mt-[-10px] sm:mt-0">
          <label className="sr-only">Select Report</label>
          <div className="relative">
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="h-[42px] w-full sm:w-[280px] appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-[14px] font-bold text-ink shadow-sm outline-none transition hover:border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <optgroup label="General Reports">
                <option value="Summary">Summary</option>
                <option value="Delivery Report">Delivery Report</option>
                <option value="Campaign Report">Campaign Report</option>
              </optgroup>
              <optgroup label="Routing & Quality">
                <option value="Route Reports">Route Reports</option>
                <option value="X-Dropped">X-Dropped</option>
              </optgroup>
              <optgroup label="Financials">
                <option value="Credit Report">Credit Report</option>
              </optgroup>
              <optgroup label="Developer & Search">
                <option value="Advanced Search">Advanced Search</option>
                <option value="API Report">API Report</option>
                <option value="Tiny URL Report">Tiny URL Report</option>
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>`;

// First remove the old PageHeader since we include it in the new flex layout
code = code.replace(/<PageHeader title="Reports" sub="Clear operational reports in one place" \/>/, "");

if (tabsRenderRegex.test(code)) {
  code = code.replace(tabsRenderRegex, dropdownHtml);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log("Success");
} else {
  console.log("Failed to match tabs rendering block regex");
}
