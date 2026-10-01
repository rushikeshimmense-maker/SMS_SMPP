const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace chevron with plus/minus
content = content.replace(
  /<MiniIcon name=\{isExpanded \? 'chevron-down' : 'chevron-right'\} className="h-4 w-4" \/>/g,
  '<MiniIcon name={isExpanded ? \'minus\' : \'plus\'} className="h-4 w-4" />'
);

fs.writeFileSync(file, content);
console.log("Updated Admin.jsx to use plus/minus");
