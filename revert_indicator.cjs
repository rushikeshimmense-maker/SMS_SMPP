const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// Undo List View
const listReplacement = `<div className="text-[12px] text-gray-400 flex items-center gap-2">
                  <span>{u.name} &bull; @{u.userId}</span>
                  {u.parentName && u.parentName !== 'Platform' && (
                    <span className="text-[9.5px] uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {u.parentName}</span>
                  )}
                </div>`;
const listOriginal = `<div className="text-[12px] text-gray-400">{u.name} \u2022 @{u.userId}</div>`;

if (content.includes('UNDER: {u.parentName}')) {
    content = content.replace(listReplacement, listOriginal);
}

// Undo Tree View
const treeReplacement = `<div className="text-[11.5px] text-gray-400 font-mono flex items-center gap-2">
                              <span>@{node.userId}</span>
                              {node.parentName && node.parentName !== 'Platform' && (
                                <span className="text-[9.5px] font-sans uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {node.parentName}</span>
                              )}
                            </div>`;
const treeOriginal = `<div className="text-[11.5px] text-gray-400 font-mono">@{node.userId}</div>`;

if (content.includes('UNDER: {node.parentName}')) {
    content = content.replace(treeReplacement, treeOriginal);
}

fs.writeFileSync(path, content);
console.log('Reverted indicators');
