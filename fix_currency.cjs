const fs = require('fs');
let text = fs.readFileSync('frontend/src/pages/Admin.jsx', 'utf-8');
text = text.replace(/\?\{node\.pricePerSms/g, '₹{node.pricePerSms');
text = text.replace(/\?\{u\.pricePerSms/g, '₹{u.pricePerSms');
fs.writeFileSync('frontend/src/pages/Admin.jsx', text, 'utf-8');
console.log('Fixed question marks in Admin.jsx');
