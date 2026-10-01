const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// I already added {!lockedTab && ( at the start in the previous script!
// Let me verify and add the closing parenthesis.
const tabsEndRegex = /\)\)}\n\s*<\/div>/;

if (content.includes('!lockedTab')) {
    // If it hasn't been closed properly
    if (!content.includes('))}\n            </div>\n          )}')) {
        content = content.replace(tabsEndRegex, '))}\n            </div>\n          )}');
        fs.writeFileSync(path, content);
        console.log('Successfully closed the condition');
    } else {
        console.log('Already closed');
    }
} else {
    console.log('Start condition not found');
}
