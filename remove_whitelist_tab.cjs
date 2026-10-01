const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove from TABS array
content = content.replace(
  "['whitelist', 'Whitelist'],\n",
  ""
);

// 2. Remove from save()
content = content.replace(
  "else if (tab === 'whitelist') body = { profile: { whitelist: white } }\n",
  ""
);
content = content.replace(
  "        else if (tab === 'whitelist') body = { profile: { whitelist: white } }\n",
  ""
);

// 3. Remove rendering block
let startIdx = content.indexOf("{tab === 'whitelist' && (");
let endIdx = content.indexOf("{tab === 'routes' && (");

if (startIdx !== -1 && endIdx !== -1) {
    let before = content.substring(0, startIdx);
    let after = content.substring(endIdx);
    content = before + after;
    fs.writeFileSync(path, content);
    console.log('Successfully removed Whitelist tab');
} else {
    console.log('Failed to find start or end bounds for the whitelist block.');
}
