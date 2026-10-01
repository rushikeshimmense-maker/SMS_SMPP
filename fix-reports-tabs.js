import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

const oldHeaderRegex = /<div className="mb-6"><PageHeader title="Reports" sub="Clear operational reports in one place" \/><\/div>/;

const newHeaderHtml = `<div className="mb-6">
        <PageHeader title="Reports" sub="Clear operational reports in one place" />
        {['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].includes(tab) && (
          <div className="mt-4 border-b border-gray-100">
            <div className="flex gap-6 overflow-x-auto">
              {['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    const newParams = new URLSearchParams(params);
                    newParams.set('tab', item);
                    window.history.pushState({}, '', \`\${window.location.pathname}?\${newParams}\`);
                    // We must force a re-render. We can use setTab if we restore the state.
                    // Actually, setting window.history doesn't trigger useSearchParams re-render.
                    // We need a proper navigate from react-router-dom or we need to add \`setSearchParams\` to the page!
                  }}
                  className={\`whitespace-nowrap border-b-2 py-2 text-[13.5px] font-bold transition \${tab === item ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-ink'}\`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>`;

// Wait, I need `setSearchParams` from `useSearchParams()` instead of `const [params] = useSearchParams()`.
// I will replace `const [params] = useSearchParams()` with `const [params, setSearchParams] = useSearchParams()`
code = code.replace(
  "const [params] = useSearchParams()",
  "const [params, setSearchParams] = useSearchParams()"
);

const newHeaderHtmlWithSearch = `<div className="mb-6">
        <PageHeader title="Reports" sub="Clear operational reports in one place" />
        {['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].includes(tab) && (
          <div className="mt-4 border-b border-gray-100">
            <div className="flex gap-6 overflow-x-auto">
              {['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].map(item => (
                <button
                  key={item}
                  onClick={() => setSearchParams({ tab: item })}
                  className={\`whitespace-nowrap border-b-2 py-2 text-[13.5px] font-bold transition \${tab === item ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-ink'}\`}
                >
                  {item === 'Advanced Search' ? 'Advanced Search' : item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>`;

if (oldHeaderRegex.test(code)) {
  code = code.replace(oldHeaderRegex, newHeaderHtmlWithSearch);
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success Reports');
} else {
  console.log('Failed Reports bounds');
}
