const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace {u.parentName && u.parentName !== me.companyName && u.parentName !== 'Platform' && (
content = content.replace(
  /\{u\.parentName && u\.parentName !== me\.companyName && u\.parentName !== 'Platform' && \(/g,
  "{u.parentName && String(u.parentName).toLowerCase() !== 'nexora operations' && String(u.parentName).toLowerCase() !== 'platform' && u.parentId !== me?.id && ("
);

// Replace {node.parentName && node.parentName !== me.companyName && node.parentName !== 'Platform' && (
content = content.replace(
  /\{node\.parentName && node\.parentName !== me\.companyName && node\.parentName !== 'Platform' && \(/g,
  "{node.parentName && String(node.parentName).toLowerCase() !== 'nexora operations' && String(node.parentName).toLowerCase() !== 'platform' && node.parentId !== me?.id && ("
);

fs.writeFileSync(file, content);
console.log("Updated condition to safely catch Nexora Operations directly");
