const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

const listReplacement = `<div className="text-[12px] text-gray-400 flex items-center gap-2">
                  <span>{u.name} &bull; @{u.userId}</span>
                  {u.parentName && u.parentName !== 'Platform' && (
                    <span className="text-[9.5px] uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">UNDER: {u.parentName}</span>
                  )}
                </div>`;

const searchStrRegex = /<div className="text-\[12px\] text-gray-400">\{u\.name\}[ \t]*@\{u\.userId\}<\/div>/;

if (content.match(searchStrRegex)) {
    content = content.replace(searchStrRegex, listReplacement);
    fs.writeFileSync(path, content);
    console.log("Successfully updated List View indicator.");
} else {
    console.log("Still failed to find List View line via regex");
}
