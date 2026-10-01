import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');
const start = code.indexOf("{tab === 'Smart SMS'");
console.log(code.substring(start, start + 1200));
