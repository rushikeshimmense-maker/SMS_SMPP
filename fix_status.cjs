const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace pending with suspended in Admin.jsx toggleStatus
content = content.replace(
  "const newStatus = u.status === 'active' ? 'pending' : 'active'",
  "const newStatus = u.status === 'active' ? 'suspended' : 'active'"
);

// Replace Pending with Suspended in Chip display
content = content.replace(
  /<Chip status=\{node\.status === 'active' \? 'Active' : 'Pending'\}>/g,
  "<Chip status={node.status === 'active' ? 'Active' : 'Suspended'}>"
);

content = content.replace(
  /<Chip status=\{u\.status === 'active' \? 'Active' : 'Pending'\}>/g,
  "<Chip status={u.status === 'active' ? 'Active' : 'Suspended'}>"
);

fs.writeFileSync(file, content);
console.log("Updated toggleStatus to use suspended");
