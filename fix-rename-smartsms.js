import fs from 'fs';

// 1. AppLayout.jsx
let appCode = fs.readFileSync('frontend/src/components/AppLayout.jsx', 'utf8');
appCode = appCode.replace(/Tiny URL Report/g, 'Smart SMS');
fs.writeFileSync('frontend/src/components/AppLayout.jsx', appCode);

// 2. Reports.jsx
let reportsCode = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');
reportsCode = reportsCode.replace(/Tiny URL Report/g, 'Smart SMS');
reportsCode = reportsCode.replace(/Tiny URL Click Analytics/g, 'Smart SMS Analytics');

// In Reports.jsx, because of my previous replace logic:
// key={item === 'Smart SMS' ? 'Smart SMS' : item} -> we can simplify it
reportsCode = reportsCode.replace(/key=\{item === 'Smart SMS' \? 'Smart SMS' : item\}/g, 'key={item}');
reportsCode = reportsCode.replace(/\{item === 'Smart SMS' \? 'Smart SMS' : item\}/g, '{item}');

fs.writeFileSync('frontend/src/pages/Reports.jsx', reportsCode);

console.log('Success replacing Tiny URL Report with Smart SMS');
