const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace {u.parentName && ( with {u.parentName && u.parentName !== me.companyName && u.parentName !== 'Platform' && (
// And {node.parentName && ( with {node.parentName && node.parentName !== me.companyName && node.parentName !== 'Platform' && (

content = content.replace(
  /\{u\.parentName && \(/g,
  "{u.parentName && u.parentName !== me.companyName && u.parentName !== 'Platform' && ("
);

content = content.replace(
  /\{node\.parentName && \(/g,
  "{node.parentName && node.parentName !== me.companyName && node.parentName !== 'Platform' && ("
);

fs.writeFileSync(file, content);
console.log("Updated UNDER badges to hide for top-level/direct clients!");
