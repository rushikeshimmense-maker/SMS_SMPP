const fs = require('fs');
let path = 'src/pages/Settings.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update INITIAL_RULES
content = content.replace(
  ", source: 'Failed + Undelivered', status: 'Active'",
  ", status: 'Active'"
);
content = content.replace(
  ", source: 'Pending + Failed', status: 'Paused'",
  ", status: 'Paused'"
);

// 2. Update setNewRule initial state
content = content.replace(
  "source: 'Failed + Undelivered', protocol: 'All Sources'",
  "protocol: 'All Sources'"
);

// 3. Update Table headers
content = content.replace(
  "headers={['Target User', 'Traffic Source', 'Condition', 'Action (Cut %)', 'Source To Cut', 'Status', 'Actions']}",
  "headers={['Target User', 'Traffic Source', 'Condition', 'Action (Cut %)', 'Status', 'Actions']}"
);

// 4. Update Table body
content = content.replace(
  /<Td className="text-\[13px\] text-gray-500">\{r\.source\}<\/Td>\s*/g,
  ""
);

// 5. Update Modal fields
const modalFieldRegex = /<Field label="Prioritize Source">[\s\S]*?<\/Field>/;
content = content.replace(modalFieldRegex, "");

fs.writeFileSync(path, content);
console.log('Success');
