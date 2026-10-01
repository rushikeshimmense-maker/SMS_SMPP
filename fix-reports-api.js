import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');
code = code.replace("api('/messages')", "api('/messages?pageSize=5000')");
fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
console.log('Replaced pageSize');
