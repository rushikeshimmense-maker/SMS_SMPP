const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

const listReplacement = `<div className="text-[12px] text-gray-400 flex items-center gap-2">
                  <span>{u.name} &bull; @{u.userId}</span>
                  {u.parentName && u.parentName !== 'Platform' && (
                    <span className="text-[9.5px] uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {u.parentName}</span>
                  )}
                </div>`;

let lines = content.split('\n');
let modified = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('text-gray-400') && lines[i].includes('{u.name}') && lines[i].includes('{u.userId}')) {
        lines[i] = listReplacement;
        modified = true;
        break;
    }
}

const treeReplacement = `<div className="text-[11.5px] text-gray-400 font-mono flex items-center gap-2">
                              <span>@{node.userId}</span>
                              {node.parentName && node.parentName !== 'Platform' && (
                                <span className="text-[9.5px] font-sans uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {node.parentName}</span>
                              )}
                            </div>`;

let treeModified = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('text-[11.5px] text-gray-400 font-mono') && lines[i].includes('{node.userId}')) {
        lines[i] = treeReplacement;
        treeModified = true;
        break;
    }
}

if (modified || treeModified) {
    fs.writeFileSync(path, lines.join('\n'));
    console.log("Successfully replaced Tree/List View lines.");
}
