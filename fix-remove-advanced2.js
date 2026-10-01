import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/AppLayout.jsx', 'utf8');

code = code.replace(
  "const isGeneral = ['Summary', 'Campaign Report', 'Delivery Report', 'Advanced Search'].includes",
  "const isGeneral = ['Summary', 'Campaign Report', 'Delivery Report'].includes"
);

fs.writeFileSync('frontend/src/components/AppLayout.jsx', code);
console.log("Success cleaning AppLayout");
