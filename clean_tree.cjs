const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// The file doesn't have UNDER because it failed to match. 
// Let's just forcefully replace anything that looks like the bad indicator back to normal.
// Actually, if it currently says `<div className="text-[12px] text-gray-400">{u.name}   @{u.userId}</div>`
// Then it IS already exactly like before for the List View!

// What about Tree View?
const treeRegex = /<div className="text-\[11\.5px\] text-gray-400 font-mono flex items-center gap-2">[\s\S]*?<\/div>/;
if (content.match(treeRegex)) {
    content = content.replace(treeRegex, '<div className="text-[11.5px] text-gray-400 font-mono">@{node.userId}</div>');
}

fs.writeFileSync(path, content);
console.log('Cleaned up Tree View');
