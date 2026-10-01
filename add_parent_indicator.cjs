const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Tree View
const treeUserIdRegex = /<div className="text-\[11\.5px\] text-gray-400 font-mono">@\{node\.userId\}<\/div>/;
const treeReplacement = `<div className="text-[11.5px] text-gray-400 font-mono flex items-center gap-2">
                              <span>@{node.userId}</span>
                              {node.parentName && node.parentName !== 'Platform' && (
                                <span className="text-[9.5px] font-sans uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {node.parentName}</span>
                              )}
                            </div>`;

if (content.match(treeUserIdRegex)) {
    content = content.replace(treeUserIdRegex, treeReplacement);
} else {
    console.log("Failed to find Tree View userId");
}

// 2. Update List View
const listUserIdRegex = /<div className="text-\[12px\] text-gray-400">\{u\.name\}   @\{u\.userId\}<\/div>/;
const listReplacement = `<div className="text-[12px] text-gray-400 flex items-center gap-2">
                  <span>{u.name} &bull; @{u.userId}</span>
                  {u.parentName && u.parentName !== 'Platform' && (
                    <span className="text-[9.5px] uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {u.parentName}</span>
                  )}
                </div>`;

if (content.match(listUserIdRegex)) {
    content = content.replace(listUserIdRegex, listReplacement);
} else {
    console.log("Failed to find List View userId");
}

fs.writeFileSync(path, content);
console.log("Successfully added parentName indicator to views.");
