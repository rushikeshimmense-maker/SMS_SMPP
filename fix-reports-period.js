import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

code = code.replace(
  "const [period, setPeriod] = useState('today')",
  "const [period, setPeriod] = useState('month')"
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
