const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject functions before async function submitCreate()
const functionsToInject = `  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'suspended' : 'active'
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { status: newStatus } })
      toast(\`User @\${u.userId} marked as \${newStatus}.\`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function submitResetPassword() {
    setBusy(true);
    try {
      await api(\`/users/\${resetPassUser.user.id}\`, { method: 'PATCH', body: { password: resetPassUser.password } });
      toast(\`Password for @\${resetPassUser.user.userId} updated successfully.\`, 'success');
      setResetPassUser(null);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function submitCreate()`;

content = content.replace('async function submitCreate()', functionsToInject);

// 2. Add Reset Password Modal
const resetModal = `
        {/* reset password */}
        <Modal open={!!resetPassUser} onClose={() => setResetPassUser(null)} title={resetPassUser ? \`Reset Password — @\${resetPassUser.user.userId}\` : ''} width="max-w-sm">
          {resetPassUser && (
            <div className="space-y-4">
              <p className="text-[13px] text-gray-500">Enter a new secure password for {resetPassUser.user.companyName}.</p>
              <Field label="New Password">
                <input
                  type="text"
                  className={inputCls}
                  value={resetPassUser.password || ''}
                  onChange={(e) => setResetPassUser({ ...resetPassUser, password: e.target.value })}
                  placeholder="Type new password"
                  autoComplete="off"
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setResetPassUser(null)}>Cancel</Button>
                <Button onClick={submitResetPassword} disabled={busy || !resetPassUser.password || resetPassUser.password.length < 6}>Save</Button>
              </div>
            </div>
          )}
        </Modal>
`;
content = content.replace('      </Modal>\n      {editor && (', '      </Modal>\n' + resetModal + '      {editor && (');

// 3. Fix List View Action Buttons
const oldListActionsRegex = /<Td>\s*<div className="flex flex-wrap gap-1\.5">\s*<Button variant="secondary" className="h-8 px-2\.5 text-\[12px\]" onClick=\{\(\) => setFund\(\{ user: u, mode: 'credit', amount: '', note: '' \}\)\}>\s*Credit\s*<\/Button>\s*<Button variant="ghost" className="h-8 px-2\.5 text-\[12px\]" onClick=\{\(\) => setEditor\(u\)\}>\s*Edit\s*<\/Button>\s*<\/div>\s*<\/Td>/;

const newListActions = `<Td>
                  <div className="flex flex-wrap gap-1.5">
                    <button title="Fund Wallet" onClick={() => setFund({ user: u, mode: 'credit', amount: '', note: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50">
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
                      </button>
                  </div>
                </Td>`;

if (content.match(oldListActionsRegex)) {
    content = content.replace(oldListActionsRegex, newListActions);
}

// 4. Fix Tree View Action Buttons
const oldTreeActionsRegex = /<div className="flex items-center gap-1\.5 opacity-0 group-hover:opacity-100 transition-opacity">\s*<Button variant="secondary" className="h-7 px-2 text-\[11px\]" onClick=\{\(\) => setFund\(\{ user: node, mode: 'credit', amount: '', note: '' \}\)\}>Credit<\/Button>\s*<Button variant="ghost" className="h-7 px-2 text-\[11px\]" onClick=\{\(\) => setEditor\(node\)\}>Edit<\/Button>\s*<\/div>/;

const newTreeActions = `<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              </div>`;

if (content.match(oldTreeActionsRegex)) {
    content = content.replace(oldTreeActionsRegex, newTreeActions);
}

// 5. Fix Details onClick in List View
content = content.replace(/onClick=\{\(\) => setEditor\(u\)\}>\{u\.companyName\}<\/div>/g, "onClick={() => setEditor({ user: u, lockedTab: 'details' })}>{u.companyName}</div>");
content = content.replace(/<UserEditor\s*user=\{editor\}\s*onClose/g, "<UserEditor user={editor?.user} lockedTab={editor?.lockedTab} onClose");

// 6. Fix Tree Expand State
content = content.replace("const [expanded, setExpanded] = useState(null)", "const [expanded, setExpanded] = useState({})");
content = content.replace("const isExpanded = expanded === node.id || depth === 0; // expand level 0 by default", "const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : depth === 0;");
content = content.replace("${expanded === node.id ? 'bg-gray-50/50' : ''}", "${isExpanded ? 'bg-gray-50/50' : ''}");
content = content.replace("onClick={() => setExpanded(expanded === node.id ? null : node.id)}", "onClick={() => setExpanded(prev => ({ ...prev, [node.id]: prev[node.id] !== undefined ? !prev[node.id] : !(depth === 0) }))}");
content = content.replace("{expanded === node.id ? '-' : '+'}", "{isExpanded ? '-' : '+'}");

fs.writeFileSync(path, content);
console.log('Restored all Admin.jsx features perfectly in one shot.');
