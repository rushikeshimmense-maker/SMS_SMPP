const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<UserEditor[\s\S]*?user=\{editor\}[\s\S]*?onClose=\{[^}]+\}/;

if (content.match(regex)) {
    content = content.replace(regex, `<UserEditor\n            user={editor.user}\n            lockedTab={editor.lockedTab}\n            onClose={() => setEditor(null)}`);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed UserEditor props in Admin.jsx');
} else {
    console.log('Regex did not match.');
}
