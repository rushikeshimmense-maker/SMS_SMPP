const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = '<h2 className="text-[17px] font-extrabold tracking-tight text-ink">Edit - @{user.userId}</h2>';
const replacement = '<h2 className="text-[17px] font-extrabold tracking-tight text-ink">{lockedTab === \'settings\' ? \'Settings\' : \'Profile\'} - @{user.userId}</h2>';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated modal header title via exact string match');
} else {
    // try fallback with partial matching
    const fallbackTarget = 'Edit - @{user.userId}';
    if (content.includes(fallbackTarget)) {
        content = content.replace(fallbackTarget, '{lockedTab === \'settings\' ? \'Settings\' : \'Profile\'} - @{user.userId}');
        fs.writeFileSync(path, content);
        console.log('Successfully updated modal header title via partial string match');
    } else {
        console.log('Could not find string');
    }
}
