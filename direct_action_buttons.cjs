const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// List view Actions cell replacement
const oldListActions = `<Td>
                  <div className="flex flex-wrap gap-1.5">
                    <Button variant="secondary" className="h-8 px-2.5 text-[12px]" onClick={() => setFund({ user: u, mode: 'credit', amount: '', note: '' })}>
                      Credit
                    </Button>
                    <Button variant="ghost" className="h-8 px-2.5 text-[12px]" onClick={() => setEditor(u)}>
                      Edit
                    </Button>
                  </div>
                </Td>`;

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

if (content.includes('Credit') && content.includes('Edit')) {
    content = content.replace(oldListActions, newListActions);
}

// Tree view Actions cell replacement
const oldTreeActions = `<div className="ml-auto flex items-center gap-6">
                              <div className="text-right w-24">
                                <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Balance</div>
                                <div className="font-bold text-[13px] text-ink">{fmtMoney(node.balance)}</div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" className="h-7 px-2 text-[11px]" onClick={() => setFund({ user: node, mode: 'credit', amount: '', note: '' })}>Credit</Button>
                                <Button variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setEditor(node)}>Edit</Button>
                              </div>
                            </div>`;

const newTreeActions = `<div className="ml-auto flex items-center gap-6">
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
                            </div>`;

if (content.includes('Credit') && content.includes('Edit')) {
    content = content.replace(oldTreeActions, newTreeActions);
}

fs.writeFileSync(path, content);
console.log('Restored fully updated action buttons for list and tree');
