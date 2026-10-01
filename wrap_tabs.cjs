const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{\/\* Tabs \*\/\}\s*<div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-\[#f9fafb\] px-5 py-3 no-scrollbar shadow-inner">[\s\S]*?\)\)}\s*<\/div>/;

if (content.match(regex)) {
    content = content.replace(regex, (match) => {
        return `{/* Tabs */}\n          {!lockedTab && (\n            ${match.replace('{/* Tabs */}\n', '').trim()}\n          )}`;
    });
    fs.writeFileSync(path, content);
    console.log('Successfully wrapped tabs in !lockedTab condition.');
} else {
    console.log('Regex did not match.');
}
