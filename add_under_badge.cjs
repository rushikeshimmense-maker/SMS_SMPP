const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

const listBadge = '<div className="text-[12px] text-gray-400 flex items-center gap-2 mt-0.5">\n                    <span>{u.name} • @{u.userId}</span>\n                    {u.parentName && (\n                      <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase border border-emerald-200/50">\n                        UNDER: {u.parentName}\n                      </span>\n                    )}\n                  </div>';

const treeBadge = '<div className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-2">\n                                <span>@{node.userId} • {node.name}</span>\n                                {node.parentName && (\n                                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase border border-emerald-200/50">\n                                    UNDER: {node.parentName}\n                                  </span>\n                                )}\n                              </div>';

content = content.replace(
  '<div className="text-[12px] text-gray-400">{u.name} • @{u.userId}</div>',
  listBadge
);

content = content.replace(
  '<div className="text-[12px] text-gray-400 mt-0.5">@{node.userId} • {node.name}</div>',
  treeBadge
);

fs.writeFileSync(file, content);
console.log("Added UNDER badges correctly!");
