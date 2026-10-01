const fs = require('fs');
let path = 'src/components/DateRangePicker.jsx';
let content = fs.readFileSync(path, 'utf8');

// The output wrote {\` instead of {` because of my write_to_file escape
content = content.replace(/\{\\`flex/g, "{`flex");
content = content.replace(/100'\}\\\`\}/g, "100'}`} "); // Just replace all instances
content = content.replace(/\\`/g, "`");

fs.writeFileSync(path, content);
console.log('Fixed backticks.');
