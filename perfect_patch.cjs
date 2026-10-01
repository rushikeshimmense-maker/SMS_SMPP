const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. STATES
content = content.replace(
  'const [busy, setBusy] = useState(false)',
  \`const [busy, setBusy] = useState(false)
  const [resetPassUser, setResetPassUser] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [view, setView] = useState('list')\`
);

// 2. FUNCTIONS
const functionsToInject = \`  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'pending' : 'active'
    try {
      await api(\\\`/users/\\\${u.id}\\\`, { method: 'PATCH', body: { status: newStatus } })
      toast(\\\`User @\\\${u.userId} marked as \\\${newStatus}.\\\`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function submitResetPassword() {
    if (!resetPassUser.password) return toast('Enter a new password.', 'error')
    setBusy(true)
    try {
      await api(\\\`/users/\\\${resetPassUser.user.id}\\\`, { method: 'PATCH', body: { password: resetPassUser.password } })
      toast(\\\`Password for @\\\${resetPassUser.user.userId} updated.\\\`, 'success')
      setResetPassUser(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }\`;

content = content.replace(
  'async function submitCreate()',
  functionsToInject + '\\n\\n  async function submitCreate()'
);

// 3. TOGGLE BUTTONS
const toggleButtonsJSX = \`<div className="mt-4 flex flex-col gap-2.5 sm:flex-row items-center">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto mr-auto">
            <button
              onClick={() => setView('list')}
              className={\\\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[13px] font-bold transition \\\${view === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}\\\`}
            >
              List View
            </button>
            <button
              onClick={() => setView('tree')}
              className={\\\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[13px] font-bold transition \\\${view === 'tree' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-ink'}\\\`}
            >
              Client Tree
            </button>
          </div>
          <div className="flex w-full items-center gap-2 rounded-xl bg-white px-4 shadow-sm border border-gray-100 sm:w-[320px]">\`;

content = content.replace(
  '<div className="mt-4 flex flex-col gap-2.5 sm:flex-row">\\r\\n          <div className="flex w-full items-center gap-2 rounded-xl bg-white px-4 shadow-sm border border-gray-100 sm:w-[320px]">',
  toggleButtonsJSX
);

if (content === fs.readFileSync(file, 'utf8')) {
  // Try \n instead of \r\n
  content = content.replace(
    '<div className="mt-4 flex flex-col gap-2.5 sm:flex-row">\\n          <div className="flex w-full items-center gap-2 rounded-xl bg-white px-4 shadow-sm border border-gray-100 sm:w-[320px]">',
    toggleButtonsJSX
  );
}

// 4. ACTION BUTTONS FOR LIST VIEW
const listBtnsRegex = /<Button variant="secondary" className="h-8 px-2\\.5 text-\\[12px\\]" onClick=\{\(\) => setFund\(\{ user: u, mode: 'credit', amount: '', note: '' \}\)\}>[\\s\\S]*?Edit[\\s\\S]*?<\/Button>/;

const newListBtns = \`<button title="Fund Wallet" onClick={() => setFund({ user: u, mode: 'credit', amount: '', note: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50">
                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    </button>
                    <button title="Manage Settings" onClick={() => setEditor({ user: u, lockedTab: 'settings' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200/50">
                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </button>
                    <button title={u.status === 'active' ? 'Deactivate User' : 'Activate User'} onClick={() => toggleStatus(u)} className={\`flex items-center justify-center h-8 w-8 rounded-lg transition shadow-sm border \${u.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50' : 'bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50'}\`}>
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                      </button>
                      <button title="Reset Password" onClick={() => setResetPassUser({ user: u, password: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50">
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </button>\`;

content = content.replace(listBtnsRegex, newListBtns);

// Change {u.companyName} onClick
content = content.replace(
  /onClick=\{\(\) => setEditor\(u\)\}>\{u\.companyName\}<\/div>/g,
  "onClick={() => setEditor({ user: u, lockedTab: 'details' })}>{u.companyName}</div>"
);

// 5. TREE VIEW LOGIC
const treeJSX = \`
      {view === 'tree' ? (
        <Card>
          <div className="p-1">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 rounded-t-xl">
              <div className="flex-1">Account</div>
              <div className="w-24 text-right">Balance</div>
              <div className="w-24 text-right">Rate / SMS</div>
              <div className="w-24">Status</div>
              <div className="w-32 text-right">Actions</div>
            </div>

            {/* Tree Container */}
            <div className="p-2 flex flex-col gap-1">
              {(() => {
                const resellers = items.filter(u => u.role === 'reseller');
                const regularUsers = items.filter(u => u.role === 'user');
                const unassigned = items.filter(u => u.role !== 'reseller' && u.role !== 'user');
                
                // Distribute regular users under resellers
                const tree = resellers.map((r, i) => {
                  const children = regularUsers.filter((_, idx) => idx % (resellers.length || 1) === i);
                  return { ...r, children };
                });
                
                const rootItems = [...tree, ...regularUsers.filter((_, idx) => idx >= (resellers.length * 10)), ...unassigned]; // safety if no resellers
                
                const renderNode = (node, depth = 0) => {
                  const hasChildren = node.children && node.children.length > 0;
                  const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : depth === 0;

                  return (
                    <div key={node.id} className="flex flex-col">
                      <div className="flex items-center gap-4 rounded-xl p-2 transition hover:bg-gray-50/80 group">
                        {/* Expand/Collapse Toggle */}
                        <div className="flex items-center gap-2 flex-1" style={{ paddingLeft: depth * 24 }}>
                          {hasChildren ? (
                            <button
                              onClick={() => setExpanded(prev => ({ ...prev, [node.id]: !isExpanded }))}
                              className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                            >
                              <MiniIcon name={isExpanded ? 'chevron-down' : 'chevron-right'} className="h-4 w-4" />
                            </button>
                          ) : (
                            <div className="w-5" /> // Spacer
                          )}
                          
                          {/* Node Info */}
                          <div className="flex items-center gap-3">
                            <span className={\\\`inline-flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold \\\${ROLE_STYLES[node.role] || 'bg-gray-100 text-gray-600'}\\\`}>
                              {node.role.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-[13.5px] text-ink leading-tight cursor-pointer hover:text-brand-600 hover:underline transition" onClick={() => setEditor({ user: node, lockedTab: 'details' })}>{node.companyName}</div>
                                {node.role === 'reseller' && (
                                  <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Reseller</span>
                                )}
                              </div>
                              <div className="text-[12px] text-gray-400 mt-0.5">@{node.userId} • {node.name}</div>
                            </div>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-right font-mono text-[13px] text-ink font-bold">{fmtMoney(node.balance)}</div>
                          <div className="w-24 text-right text-[13px] text-gray-500">{node.pricePerSms} ¢</div>
                          <div className="w-24">
                            <Chip className={node.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>
                              {node.status}
                            </Chip>
                          </div>
                          
                          {/* Actions */}
                          <div className="w-32 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

                      {/* Render Children */}
                      {hasChildren && isExpanded && (
                        <div className="mt-1 flex flex-col gap-1 border-l-2 border-gray-100 ml-4">
                          {node.children.map(child => renderNode(child, depth + 1))}
                        </div>
                      )}
                    </div>
                  );
                };

                return rootItems.map(node => renderNode(node));
              })()}
            </div>
          </div>
        </Card>
      ) : (
`;

content = content.replace(
  '{/* User list */}\\r\\n      <Card>',
  treeJSX + '\\n      <Card>'
);
if (content === fs.readFileSync(file, 'utf8')) {
  // try \n
  content = content.replace(
    '{/* User list */}\\n      <Card>',
    treeJSX + '\\n      <Card>'
  );
}

// Close the ternary operator after Table Card
content = content.replace(
  '</Table>\\r\\n      </Card>',
  '</Table>\\r\\n      </Card>\\n      )}'
);
if (content === fs.readFileSync(file, 'utf8')) {
  content = content.replace(
    '</Table>\\n      </Card>',
    '</Table>\\n      </Card>\\n      )}'
  );
}

// 6. UserEditor Props
content = content.replace(
  /<UserEditor\\s*user=\{editor\}\\s*onClose/g,
  '<UserEditor user={editor?.user} lockedTab={editor?.lockedTab} onClose'
);

// 7. Reset Password Modal
const resetPassModal = \`<Modal open={!!resetPassUser} onClose={() => setResetPassUser(null)} title={\\\`Reset Password for @\${resetPassUser?.user?.userId}\\\`} width="max-w-md">
        {resetPassUser && (
          <div className="space-y-4">
            <Field label="New Password">
              <input className={inputCls} type="text" value={resetPassUser.password} onChange={(e) => setResetPassUser({ ...resetPassUser, password: e.target.value })} placeholder="Enter new password" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setResetPassUser(null)}>Cancel</Button>
              <Button onClick={submitResetPassword} disabled={busy || !resetPassUser.password}>Save Password</Button>
            </div>
          </div>
        )}
      </Modal>\`;

content = content.replace('{/* full account editor */}', resetPassModal + '\\n\\n      {/* full account editor */}');

fs.writeFileSync(file, content);
console.log('Done!');
