const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change <UserEditor user={editor} to <UserEditor user={editor.user} lockedTab={editor.lockedTab}
content = content.replace(
  '<UserEditor\n            user={editor}\n            onClose={() => setEditor(null)}',
  '<UserEditor\n            user={editor.user}\n            lockedTab={editor.lockedTab}\n            onClose={() => setEditor(null)}'
);

// 2. Change setEditor(node) in tree view
content = content.replace(
  'onClick={() => setEditor(node)}>{node.companyName}',
  'onClick={() => setEditor({ user: node, lockedTab: \'details\' })}>{node.companyName}'
);

content = content.replace(
  'onClick={() => setEditor(node)} className="flex items-center justify-center h-7 w-7 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800',
  'onClick={() => setEditor({ user: node, lockedTab: \'settings\' })} className="flex items-center justify-center h-7 w-7 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
);

// 3. Change setEditor(u) in list view
content = content.replace(
  'onClick={() => setEditor(u)}>{u.companyName}',
  'onClick={() => setEditor({ user: u, lockedTab: \'details\' })}>{u.companyName}'
);

content = content.replace(
  'onClick={() => setEditor(u)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800',
  'onClick={() => setEditor({ user: u, lockedTab: \'settings\' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
);

fs.writeFileSync(path, content);
console.log('Successfully updated setEditor triggers in Admin.jsx');
