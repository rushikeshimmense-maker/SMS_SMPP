import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. We must replace the whole two-tier tabs HTML with just the PageHeader.
const twoTierHtmlRegex = /<div className="mb-6">\s*<PageHeader title="Reports" sub="Clear operational reports in one place" \/>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

if (twoTierHtmlRegex.test(code)) {
  code = code.replace(twoTierHtmlRegex, `<div className="mb-6"><PageHeader title="Reports" sub="Clear operational reports in one place" /></div>`);
} else {
  console.log("Failed to remove two-tier HTML");
}

// 2. The `tab` logic in Reports.jsx should read from searchParams and default to Summary.
code = code.replace(
  "const [category, setCategory] = useState(params.get('search') ? 'Developer' : 'Traffic')\n  const [tab, setTab] = useState(params.get('userId') ? 'Delivery Report' : 'Summary')",
  "const tab = params.get('tab') || (params.get('userId') ? 'Delivery Report' : 'Summary')"
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
