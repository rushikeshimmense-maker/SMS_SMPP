const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = `<UserEditor
          user={editor}
          onClose={() => setEditor(null)}`;
          
const newStr = `<UserEditor
          user={editor?.user}
          lockedTab={editor?.lockedTab}
          onClose={() => setEditor(null)}`;

if (content.includes('user={editor}')) {
    content = content.replace(oldStr, newStr);
    
    // Also try another indentation
    const oldStr2 = `<UserEditor
            user={editor}
            onClose={() => setEditor(null)}`;
            
    const newStr2 = `<UserEditor
            user={editor?.user}
            lockedTab={editor?.lockedTab}
            onClose={() => setEditor(null)}`;
    
    content = content.replace(oldStr2, newStr2);
    
    fs.writeFileSync(path, content);
    console.log("Fixed UserEditor props");
}
