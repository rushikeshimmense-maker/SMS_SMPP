import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

const oldTabsRegex = /\{?\['Summary', 'Campaign Report', 'Delivery Report'\]\.includes\(tab\) && \(\s*<div className="mt-4 border-b border-gray-100">\s*<div className="flex gap-6 overflow-x-auto">\s*\{?\['Summary', 'Campaign Report', 'Delivery Report'\]\.map\(item => \(/;

const newTabsHtml = `{['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Tiny URL Report'].includes(tab) && (
          <div className="mt-4 border-b border-gray-100">
            <div className="flex gap-6 overflow-x-auto">
              {['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Tiny URL Report'].map(item => (`;

if (oldTabsRegex.test(code)) {
  code = code.replace(oldTabsRegex, newTabsHtml);
} else {
  // alternative matching just in case
  code = code.replace(
    "{['Summary', 'Campaign Report', 'Delivery Report'].includes(tab)",
    "{['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Tiny URL Report'].includes(tab)"
  );
  code = code.replace(
    "{['Summary', 'Campaign Report', 'Delivery Report'].map(item => (",
    "{['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Tiny URL Report'].map(item => ("
  );
}

code = code.replace(
  "{item}",
  "{item === 'Tiny URL Report' ? 'Smart SMS' : item}"
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
console.log('Success adding tabs to Reports');
