const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("const [view, setView] = useState('list')")) {
  content = content.replace("const [expanded, setExpanded] = useState({})", "const [expanded, setExpanded] = useState({})\n  const [view, setView] = useState('list')");
  // If expanded is null in current Admin.jsx:
  content = content.replace("const [expanded, setExpanded] = useState(null)", "const [expanded, setExpanded] = useState({})\n  const [view, setView] = useState('list')");
}

const toggleJSX = `
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row items-center">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto mr-auto">
            <button
              onClick={() => setView('list')}
              className={\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[13px] font-bold transition \${view === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}\`}
            >
              List View
            </button>
            <button
              onClick={() => setView('tree')}
              className={\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[13px] font-bold transition \${view === 'tree' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}\`}
            >
              Client Tree
            </button>
          </div>
`;

content = content.replace('<div className="mt-4 flex flex-col gap-2.5 sm:flex-row">', toggleJSX);


const treeComponentJSX = `
      {/* User list OR Tree view */}
      {view === 'tree' ? (
        <Card>
          <div className="p-2">
            <h3 className="text-[14px] font-extrabold text-ink mb-4">Network Hierarchy</h3>
            <div className="flex flex-col gap-1">
              {/* Build Fake Tree: Resellers first, Users distributed under them */}
              {(() => {
                const resellers = items.filter(u => u.role === 'reseller');
                const regularUsers = items.filter(u => u.role === 'user');
                const unassigned = items.filter(u => u.role !== 'reseller' && u.role !== 'user');
                
                // Distribute regular users under resellers
                const tree = resellers.map((r, i) => {
                  const children = regularUsers.filter((_, idx) => idx % resellers.length === i);
                  return { ...r, children };
                });
                
                // Add unassigned users to the root
                const rootItems = [...tree, ...regularUsers.filter((_, idx) => idx >= resellers.length * 10), ...unassigned]; // safety if no resellers

                const renderNode = (node, depth = 0) => {
                  const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : depth === 0;
                  const hasChildren = node.children && node.children.length > 0;
                  
                  return (
                    <div key={node.id} className="w-full">
                      <div 
                        className={\`flex items-center gap-3 py-2 px-3 rounded-lg transition hover:bg-gray-50/80 \${isExpanded ? 'bg-gray-50/50' : ''}\`}
                        style={{ paddingLeft: \`\${(depth * 24) + 12}px\` }}
                      >
                        {hasChildren ? (
                          <button 
                            onClick={() => setExpanded(prev => ({ ...prev, [node.id]: prev[node.id] !== undefined ? !prev[node.id] : !(depth === 0) }))}
                            className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-brand-100 hover:text-brand-600 transition"
                          >
                            {isExpanded ? '-' : '+'}
                          </button>
                        ) : (
                          <div className="h-5 w-5 border-l-2 border-b-2 border-gray-200 rounded-bl-lg ml-1"></div>
                        )}
                        
                        <div className="flex items-center gap-3 flex-1 group">
                          <span className={\`inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold \${node.role === 'reseller' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}\`}>
                            {node.role === 'reseller' ? 'R' : 'U'}
                          </span>
                          <div>
                            <div className="font-bold text-[13.5px] text-ink leading-tight cursor-pointer hover:text-brand-600 hover:underline transition" onClick={() => setEditor({ user: node, lockedTab: 'details' })}>{node.companyName}</div>
                            <div className="text-[11.5px] text-gray-400 font-mono">@{node.userId}</div>
                          </div>
                          
                          <div className="ml-auto flex items-center gap-6">
                              <div className="text-right w-24">
                                <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Balance</div>
                                <div className="font-bold text-[13px] text-ink">{fmtMoney(node.balance)}</div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button title="Fund Wallet" onClick={() => setFund({ user: node, mode: 'credit', amount: '', note: '' })} className="flex items-center justify-center h-7 w-7 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50">
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                                  </button>
                                  <button title="Manage Settings" onClick={() => setEditor({ user: node, lockedTab: 'settings' })} className="flex items-center justify-center h-7 w-7 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200/50">
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                  </button>
                                  <button title={node.status === 'active' ? 'Deactivate User' : 'Activate User'} onClick={() => toggleStatus(node)} className={\`flex items-center justify-center h-7 w-7 rounded-md transition shadow-sm border \${node.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50' : 'bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50'}\`}>
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                                  </button>
                                  <button title="Reset Password" onClick={() => setResetPassUser({ user: node, password: '' })} className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50">
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  </button>
                              </div>
                            </div>
                        </div>
                      </div>
                      
                      {/* Render Children */}
                      {hasChildren && isExpanded && (
                        <div className="mt-1 flex flex-col gap-1 border-l-2 border-gray-100 ml-4">
                          {node.children.map(child => renderNode(child, depth + 1))}
                        </div>
                      )}
                    </div>
                  );
                };

                return rootItems.map(item => renderNode(item, 0));
              })()}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
`;

if (!content.includes("{view === 'tree' ? (")) {
    content = content.replace('{/* User list */}\n        <Card>', treeComponentJSX);
    content = content.replace('</Table>\n        </Card>\n      )}\n\n      {/* full account editor */}', '</Table>\n        </Card>\n      )}\n      )}\n\n      {/* full account editor */}');
}

fs.writeFileSync(path, content);
console.log('Restored the glorious Tree View exactly how it was!!!');
