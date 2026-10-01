import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// Add isReseller after isStaff
code = code.replace(
  "const isStaff = me?.role === 'superadmin' || me?.role === 'reseller'",
  "const isStaff = me?.role === 'superadmin' || me?.role === 'reseller'\n  const isReseller = me?.role === 'reseller'"
);

// Update tab lists to hide X-Dropped for resellers
// The tab array shown in the tab bar
code = code.replace(
  "['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS'].includes(tab)",
  "(isReseller ? ['Summary', 'Campaign Report', 'Delivery Report', 'API Report', 'Smart SMS'] : ['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS']).includes(tab)"
);

code = code.replace(
  "['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS'].map(item =>",
  "(isReseller ? ['Summary', 'Campaign Report', 'Delivery Report', 'API Report', 'Smart SMS'] : ['Summary', 'Campaign Report', 'Delivery Report', 'X-Dropped', 'API Report', 'Smart SMS']).map(item =>"
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
console.log('Done: isReseller added, X-Dropped hidden from reseller tabs');
