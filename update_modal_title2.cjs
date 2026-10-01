const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<h2 className="text-\[17px\] font-extrabold tracking-tight text-ink">Edit [^<]*<\/h2>/;
const newHeader = `<h2 className="text-[17px] font-extrabold tracking-tight text-ink">{lockedTab === 'settings' ? 'Settings' : 'Profile'} — @{user.userId}</h2>`;

if (content.match(regex)) {
    content = content.replace(regex, newHeader);
    fs.writeFileSync(path, content);
    console.log('Successfully updated modal header title');
} else {
    console.log('Regex did not match for header title');
}
