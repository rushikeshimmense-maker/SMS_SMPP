import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. Remove from the tab array at the top
code = code.replace(
  "{['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].includes(tab)",
  "{['Summary', 'Campaign Report', 'Delivery Report'].includes(tab)"
);
code = code.replace(
  "{['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].map(item => (",
  "{['Summary', 'Campaign Report', 'Delivery Report'].map(item => ("
);
code = code.replace(
  "{item === 'Advanced Search' ? 'Advanced Search' : item}",
  "{item}"
);

// 2. Remove advanced state and rows
const stateRegex = /const \[advanced, setAdvanced\] = useState\(\{ sender: params\.get\('search'\) \|\| '', mobile: '', status: 'all' \}\)/;
code = code.replace(stateRegex, "");

const advancedRowsRegex = /const advancedRows = useMemo\(\(\) => \{[\s\S]*?\}, \[messages, advanced\]\)/;
code = code.replace(advancedRowsRegex, "");

// 3. Remove Advanced Search rendering block
const advancedSearchUIRegex = /\{tab === 'Advanced Search' && <Card><div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">[\s\S]*?<MessageTable rows=\{advancedRows\} \/><\/Card>\}/;
code = code.replace(advancedSearchUIRegex, "");

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
console.log('Success removing Advanced Search from Reports');
