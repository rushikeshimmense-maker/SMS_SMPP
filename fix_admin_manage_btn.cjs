const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the tree view manage button and companyName
content = content.replace(
  '<div className="font-bold text-[13.5px] text-ink leading-tight">{node.companyName}</div>',
  '<div className="font-bold text-[13.5px] text-ink leading-tight cursor-pointer hover:text-brand-600 hover:underline transition" onClick={() => setEditor(node)}>{node.companyName}</div>'
);

content = content.replace(
  '<Button variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setEditor(node)}>Manage</Button>',
  ''
);

// 2. Update the table manage button and companyName
content = content.replace(
  '<div className="font-bold text-ink">{u.companyName}</div>',
  '<div className="font-bold text-ink cursor-pointer hover:text-brand-600 hover:underline transition" onClick={() => setEditor(u)}>{u.companyName}</div>'
);

content = content.replace(
  '<Button variant="ghost" className="h-8 px-2.5 text-[12px]" onClick={() => setEditor(u)}>\n                      Manage\n                    </Button>',
  ''
);

fs.writeFileSync(path, content);
console.log('Successfully moved editor trigger to username and removed Manage buttons.');
