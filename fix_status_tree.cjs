const fs = require('fs');

// 1. Update Backend (server/index.js)
let serverPath = 'server/index.js';
let serverContent = fs.readFileSync(serverPath, 'utf8');

const oldStatusRegex = /if \(status\) u\.status = status === 'suspended' \? 'suspended' : 'active'/;
const newStatusLogic = `if (status) {
      const newStatus = status === 'suspended' ? 'suspended' : 'active'
      if (u.status !== newStatus) {
        u.status = newStatus
        const scope = subtreeIds(u)
        for (const child of getDb().users) {
          if (scope.has(child.id)) child.status = newStatus
        }
      }
    }`;

if (serverContent.match(oldStatusRegex)) {
    serverContent = serverContent.replace(oldStatusRegex, newStatusLogic);
    fs.writeFileSync(serverPath, serverContent);
    console.log('Successfully updated backend status cascading');
} else {
    console.log('Failed to find status logic in backend');
}

// 2. Update Frontend (Admin.jsx)
let adminPath = 'src/pages/Admin.jsx';
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Change `const [expanded, setExpanded] = useState(null)` to `useState({})`
const oldExpandedState = "const [expanded, setExpanded] = useState(null)";
if (adminContent.includes(oldExpandedState)) {
    adminContent = adminContent.replace(oldExpandedState, "const [expanded, setExpanded] = useState({})");
}

// Update the renderNode expand logic
const oldExpandLogic = "const isExpanded = expanded === node.id || depth === 0; // expand level 0 by default";
const newExpandLogic = "const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : depth === 0;";
if (adminContent.includes(oldExpandLogic)) {
    adminContent = adminContent.replace(oldExpandLogic, newExpandLogic);
}

// Update the button styling condition for expanded
const oldBtnClass = "${expanded === node.id ? 'bg-gray-50/50' : ''}";
const newBtnClass = "${isExpanded ? 'bg-gray-50/50' : ''}";
if (adminContent.includes(oldBtnClass)) {
    adminContent = adminContent.replace(oldBtnClass, newBtnClass);
}

// Update the onClick and icon for the button
const oldOnClick = "onClick={() => setExpanded(expanded === node.id ? null : node.id)}";
const newOnClick = "onClick={() => setExpanded(prev => ({ ...prev, [node.id]: prev[node.id] !== undefined ? !prev[node.id] : !(depth === 0) }))}";
if (adminContent.includes(oldOnClick)) {
    adminContent = adminContent.replace(oldOnClick, newOnClick);
}

const oldIcon = "{expanded === node.id ? '-' : '+'}";
const newIcon = "{isExpanded ? '-' : '+'}";
if (adminContent.includes(oldIcon)) {
    adminContent = adminContent.replace(oldIcon, newIcon);
}

fs.writeFileSync(adminPath, adminContent);
console.log('Successfully updated Admin.jsx tree expand logic');
