const fs = require('fs');
const path = require('path');

// 1. Fix format.js - fmtMoney becomes credits display (no currency symbol)
const fmtFile = path.join(__dirname, 'src', 'lib', 'format.js');
let fmt = fs.readFileSync(fmtFile, 'utf8');

// Change fmtMoney to show plain number (credits, no ₹ or $)
fmt = fmt.replace(
  "export const fmtMoney = (n) =>\n  `${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`",
  "export const fmtMoney = (n) =>\n  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })"
);

fs.writeFileSync(fmtFile, fmt);
console.log("format.js updated");

// 2. Fix Admin.jsx 
const adminFile = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let admin = fs.readFileSync(adminFile, 'utf8');

// Fix table headers - "Balance" -> "Credits"
admin = admin.replace(
  /'Account', 'Role', 'Balance', 'Rate \/ SMS', 'Status', 'Created', 'Actions'/g,
  "'Account', 'Role', 'Credits', 'Rate / SMS', 'Status', 'Created', 'Actions'"
);

// Fix tree header
admin = admin.replace(
  /\u003cdiv className="flex-1"\u003eAccount\u003c\/div\u003e/g,
  '<div className="flex-1">Account</div>'
);

// Fix Rate/SMS column - change "$0.016" to "0.016 ₹/SMS" style
// Currently showing: ${node.pricePerSms.toFixed(3)} -> ₹{node.pricePerSms.toFixed(3)}
admin = admin.replace(/\$\{node\.pricePerSms\.toFixed\(3\)\}/g, '₹{node.pricePerSms.toFixed(3)}');
admin = admin.replace(/\$\{u\.pricePerSms\.toFixed\(3\)\}/g, '₹{u.pricePerSms.toFixed(3)}');

// Fund modal - "Current balance" text
admin = admin.replace(
  'Current balance: <b className="text-ink">{fmtMoney(fund.user.balance)}</b>',
  'Current credits: <b className="text-ink">{fmtMoney(fund.user.balance)} Cr</b>'
);

// Fund modal title
admin = admin.replace(
  '`Balance - ${fund.user.companyName}`',
  '`Credits - ${fund.user.companyName}`'
);

// Toast messages
admin = admin.replace(
  '`${fund.mode === \'credit\' ? \'Credited\' : \'Debited\'} ${fmtMoney(fund.amount)} ${fund.mode === \'credit\' ? \'to\' : \'from\'} ${fund.user.companyName}.`',
  '`${fund.mode === \'credit\' ? \'Credited\' : \'Debited\'} ${fmtMoney(fund.amount)} credits ${fund.mode === \'credit\' ? \'to\' : \'from\'} ${fund.user.companyName}.`'
);

// Change "Amount (USD)" to "Amount (Credits)"
admin = admin.replace(
  'label="Amount (USD)"',
  'label="Amount (Credits)"'
);

fs.writeFileSync(adminFile, admin);
console.log("Admin.jsx updated");
console.log("Replacements done!");
