const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /opacity-0 group-hover:opacity-100 transition-opacity/g,
  ""
);

fs.writeFileSync(file, content);
console.log("Removed hover opacity from tree view actions");
