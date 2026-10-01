const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace {u.parentName && String(u.parentName)... with array includes
content = content.replace(
  /\{u\.parentName && String\(u\.parentName\)\.toLowerCase\(\) !== 'nexora operations' && String\(u\.parentName\)\.toLowerCase\(\) !== 'platform' && u\.parentId !== me\?\.id && \(/g,
  "{u.parentName && !['nexora operations', 'platform', 'nexora enterprise'].includes(String(u.parentName).toLowerCase()) && u.parentId !== me?.id && ("
);

content = content.replace(
  /\{node\.parentName && String\(node\.parentName\)\.toLowerCase\(\) !== 'nexora operations' && String\(node\.parentName\)\.toLowerCase\(\) !== 'platform' && node\.parentId !== me\?\.id && \(/g,
  "{node.parentName && !['nexora operations', 'platform', 'nexora enterprise'].includes(String(node.parentName).toLowerCase()) && node.parentId !== me?.id && ("
);

// Fallback if previous replacement didn't match (for some reason)
content = content.replace(
  /\{u\.parentName && u\.parentName !== me\.companyName && u\.parentName !== 'Platform' && \(/g,
  "{u.parentName && !['nexora operations', 'platform', 'nexora enterprise'].includes(String(u.parentName).toLowerCase()) && u.parentId !== me?.id && ("
);

content = content.replace(
  /\{node\.parentName && node\.parentName !== me\.companyName && node\.parentName !== 'Platform' && \(/g,
  "{node.parentName && !['nexora operations', 'platform', 'nexora enterprise'].includes(String(node.parentName).toLowerCase()) && node.parentId !== me?.id && ("
);

fs.writeFileSync(file, content);
console.log("Updated condition with includes logic");
