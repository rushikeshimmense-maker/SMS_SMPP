const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// The exact string in the file:
const manageStr = `<Button variant="ghost" className="h-8 px-2.5 text-[12px]" onClick={() => setEditor(u)}>
                      Manage
                    </Button>`;

if (content.includes(manageStr)) {
    content = content.replace(manageStr, '');
    fs.writeFileSync(path, content);
    console.log('Successfully removed Manage button from Admin.jsx');
} else {
    console.log('Could not find exact string for Manage button.');
    // fallback regex
    const manageRegex = /<Button variant="ghost" className="h-8 px-2\.5 text-\[12px\]" onClick=\{\(\) => setEditor\(u\)\}>\s*Manage\s*<\/Button>/;
    if (content.match(manageRegex)) {
        content = content.replace(manageRegex, '');
        fs.writeFileSync(path, content);
        console.log('Successfully removed Manage button using regex');
    }
}
