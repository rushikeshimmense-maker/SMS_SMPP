import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// We need to replace the dropdownHtml and also add the category state logic.
// The current code has the dropdownHtml in it.
const currentHeaderRegex = /<div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>/;

const twoTierHtml = `<div className="mb-6">
        <PageHeader title="Reports" sub="Clear operational reports in one place" />
        
        <div className="mt-4">
          <div className="flex w-full overflow-x-auto rounded-xl bg-gray-100 p-1 sm:w-fit">
            {['Traffic', 'Routing', 'Financials', 'Developer'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  if (cat === 'Traffic') setTab('Summary');
                  else if (cat === 'Routing') setTab('Route Reports');
                  else if (cat === 'Financials') setTab('Credit Report');
                  else if (cat === 'Developer') setTab('Advanced Search');
                }}
                className={\`min-w-[100px] rounded-lg px-4 py-2 text-[13.5px] font-bold transition \${category === cat ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}\`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 border-b border-gray-100">
          <div className="flex gap-6 overflow-x-auto">
            {(category === 'Traffic' ? ['Summary', 'Delivery Report', 'Campaign Report'] :
              category === 'Routing' ? ['Route Reports', 'X-Dropped'] :
              category === 'Financials' ? ['Credit Report'] :
              ['Advanced Search', 'API Report', 'Tiny URL Report']).map(item => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={\`whitespace-nowrap border-b-2 py-2 text-[13.5px] font-bold transition \${tab === item ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-ink'}\`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>`;

if (currentHeaderRegex.test(code)) {
  code = code.replace(currentHeaderRegex, twoTierHtml);
  
  // Also we need to inject the `category` state.
  code = code.replace(
    /const \[tab, setTab\] = useState\(/,
    "const [category, setCategory] = useState(params.get('search') ? 'Developer' : 'Traffic')\n  const [tab, setTab] = useState("
  );
  
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log("Success");
} else {
  console.log("Failed to match current header regex");
}
