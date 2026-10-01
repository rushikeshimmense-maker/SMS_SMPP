import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// The dropdown we want to remove:
// <select className={`${inputCls} sm:max-w-[220px]`} disabled><option>Dropped Status Only</option></select>

const regex = /<select className=\{\`\$\{inputCls\} sm:max-w-\[220px\]\`\} disabled><option>Dropped Status Only<\/option><\/select>/;

if (regex.test(code)) {
  code = code.replace(regex, "");
  fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
  console.log('Success removing disabled dropdown');
} else {
  console.log('Failed to find the dropdown string');
}
