import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/AppLayout.jsx', 'utf8');

// 1. Update isGeneral
const isGeneralRegex = /const isGeneral = \['Summary', 'Campaign Report', 'Delivery Report'\]\.includes/;
code = code.replace(
  isGeneralRegex,
  "const isGeneral = ['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Tiny URL Report'].includes"
);

// 2. Remove the 3 links
const xDroppedRegex = /<Link to="\/reports\?tab=X-Dropped"[\s\S]*?<\/Link>\s*/;
code = code.replace(xDroppedRegex, "");

const apiReportRegex = /<Link to="\/reports\?tab=API Report"[\s\S]*?<\/Link>\s*/;
code = code.replace(apiReportRegex, "");

const tinyUrlReportRegex = /<Link to="\/reports\?tab=Tiny URL Report"[\s\S]*?<\/Link>\s*/;
code = code.replace(tinyUrlReportRegex, "");

fs.writeFileSync('frontend/src/components/AppLayout.jsx', code);
console.log('Success removing tabs from AppLayout');
