import fs from 'fs';
const code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');
const start = code.indexOf("{tab === 'X-Dropped'");
console.log(code.substring(start, start + 1000));
