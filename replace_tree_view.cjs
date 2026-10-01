const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

const oldTreeStart = `        {view === 'tree' ? (
          <Card>
            <div className="p-1">
              {/* Header */}`;
const oldTreeEnd = `                  return rootItems.map(node => renderNode(node));
                })()}
              </div>
            </div>
          </Card>
        ) : (`;

const startIndex = content.indexOf(oldTreeStart);
const endIndex = content.indexOf(oldTreeEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newTreeCode = `        {view === 'tree' ? (
          <Card>
            <Table headers={['Account', 'Role', 'Balance', 'Rate / SMS', 'Status', 'Created', 'Actions']}>
              {(() => {
                const resellers = items.filter(u => u.role === 'reseller');
                const regularUsers = items.filter(u => u.role === 'user');
                const unassigned = items.filter(u => u.role !== 'reseller' && u.role !== 'user');
                
                const tree = resellers.map((r, i) => {
                  const children = regularUsers.filter((_, idx) => idx % (resellers.length || 1) === i);
                  return { ...r, children };
                });
                
                const rootItems = [...tree, ...regularUsers.filter((_, idx) => idx >= (resellers.length * 10)), ...unassigned];
                
                const renderNode = (node, depth = 0) => {
                  const hasChildren = node.children && node.children.length > 0;
                  const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : depth === 0;

                  const row = (
                    <tr key={node.id} className="transition hover:bg-gray-50/60">
                      <Td>
                        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 }}>
                          {hasChildren ? (
                            <button
                              onClick={() => setExpanded(prev => ({ ...prev, [node.id]: !isExpanded }))}
                              className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                            >
                              <MiniIcon name={isExpanded ? 'minus' : 'plus'} className="h-4 w-4" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}
                          <span className={\`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold \${ROLE_STYLES[node.role] || 'bg-gray-100 text-gray-600'}\`}>
                            {node.role.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-[13.5px] text-ink leading-tight cursor-pointer hover:text-brand-600 hover:underline transition truncate" onClick={() => setEditor({ user: node, lockedTab: 'details' })}>{node.companyName}</div>
                            <div className="text-[12px] text-gray-400 mt-0.5 truncate">
                              <span>{node.name} • @{node.userId}</span>
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className={\`inline-flex rounded-full px-2.5 py-[3px] text-[11.5px] font-bold capitalize \${ROLE_STYLES[node.role]}\`}>
                          {node.role}
                        </span>
                      </Td>
                      <Td className="font-bold text-ink">{fmtMoney(node.balance)}</Td>
                      <Td>{node.pricePerSms} &cent;</Td>
                      <Td>
                        <Chip status={node.status === 'active' ? 'Active' : 'Suspended'}>{node.status}</Chip>
                      </Td>
                      <Td className="text-gray-400 whitespace-nowrap">{fmtDate(node.createdAt)}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          <button title="Fund Wallet" onClick={() => setFund({ user: node, mode: 'credit', amount: '', note: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50">
                            <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                          </button>
                          <button title="Manage Settings" onClick={() => setEditor({ user: node, lockedTab: 'settings' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200/50">
                            <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                          </button>
                          <button title={node.status === 'active' ? 'Deactivate User' : 'Activate User'} onClick={() => toggleStatus(node)} className={\`flex items-center justify-center h-8 w-8 rounded-lg transition shadow-sm border \${node.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50' : 'bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50'}\`}>
                            <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                          </button>
                          <button title="Reset Password" onClick={() => setResetPassUser({ user: node, password: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50">
                            <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          </button>
                          <button title="Login as User" onClick={() => loginAsUser(node)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition shadow-sm border border-orange-100/50">
                            <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                  
                  let rows = [row];
                  if (hasChildren && isExpanded) {
                    node.children.forEach(child => {
                      rows = rows.concat(renderNode(child, depth + 1));
                    });
                  }
                  return rows;
                };

                return rootItems.flatMap(node => renderNode(node, 0));
              })()}
            </Table>
          </Card>
        ) : (`;

  const finalCode = content.substring(0, startIndex) + newTreeCode + content.substring(endIndex + oldTreeEnd.length);
  fs.writeFileSync(file, finalCode);
  console.log("Successfully replaced Tree view with Table format!");
} else {
  console.error("Could not find start/end bounds for Tree view");
}
