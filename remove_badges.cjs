const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// Remove the UNDER badge from List View
content = content.replace(
  /\{u\.parentName && \!\[.*?\]\.includes\(String\(u\.parentName\)\.toLowerCase\(\)\) && u\.parentId !== me\?\.id && \([\s\S]*?UNDER: \{u\.parentName\}[\s\S]*?<\/span>[\s\S]*?\)\}/g,
  ""
);
// Also try catching it with previous regex forms if somehow it didn't match
content = content.replace(
  /\{u\.parentName && .*? && \([\s\S]*?UNDER: \{u\.parentName\}[\s\S]*?<\/span>[\s\S]*?\)\}/g,
  ""
);

// Remove the UNDER badge from Tree View
content = content.replace(
  /\{node\.parentName && \!\[.*?\]\.includes\(String\(node\.parentName\)\.toLowerCase\(\)\) && node\.parentId !== me\?\.id && \([\s\S]*?UNDER: \{node\.parentName\}[\s\S]*?<\/span>[\s\S]*?\)\}/g,
  ""
);
content = content.replace(
  /\{node\.parentName && .*? && \([\s\S]*?UNDER: \{node\.parentName\}[\s\S]*?<\/span>[\s\S]*?\)\}/g,
  ""
);

fs.writeFileSync(file, content);
console.log("Removed UNDER badges entirely");
