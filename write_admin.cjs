const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');

const newAdmin = `import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { fmtDate, fmtMoney } from '../lib/format.js'
import { Button, Card, Chip, Field, inputCls, Modal, Table, Td } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { MiniIcon } from '../components/Icons.jsx'
import UserEditor from '../components/UserEditor.jsx'
import { PageHeader } from '../components/AppLayout.jsx'

const ROLE_STYLES = {
  superadmin: 'bg-rose-50 text-rose-600',
  reseller: 'bg-violet-50 text-violet-600',
  user: 'bg-emerald-50 text-emerald-600',
}

export default function Admin() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [fund, setFund] = useState(null)
  const [editor, setEditor] = useState(null)
  const [create, setCreate] = useState(null)
  const [resetPassUser, setResetPassUser] = useState(null)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [view, setView] = useState('list')

  const load = () =>
    api(\`/users?role=\${roleFilter}&search=\${search}\`).then((d) => setItems(d.items || []))

  useEffect(() => {
    load()
  }, [roleFilter])

  if (me?.role !== 'superadmin') return <Navigate to="/profile" replace />

  const blankCreate = { userId: '', role: 'user', name: '', companyName: '', email: '', password: '', pricePerSms: 0.015, initialFund: 0 }

  async function submitFund() {
    setBusy(true)
    try {
      const endpoint = fund.mode === 'credit' ? 'fund' : 'deduct'
      await api(\`/users/\${fund.user.id}/\${endpoint}\`, {
        method: 'POST',
        body: { amount: +fund.amount, note: fund.note },
      })
      toast(\`\${fund.mode === 'credit' ? 'Credited' : 'Debited'} \${fmtMoney(fund.amount)} \${fund.mode === 'credit' ? 'to' : 'from'} \${fund.user.companyName}.\`, 'success')
      setFund(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'pending' : 'active'
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { status: newStatus } })
      toast(\`User @\${u.userId} marked as \${newStatus}.\`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function submitResetPassword() {
    if (!resetPassUser.password) return toast('Enter a new password.', 'error')
    setBusy(true)
    try {
      await api(\`/users/\${resetPassUser.user.id}\`, { method: 'PATCH', body: { password: resetPassUser.password } })
      toast(\`Password for @\${resetPassUser.user.userId} updated.\`, 'success')
      setResetPassUser(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitCreate() {
    setBusy(true)
    try {
      const r = await api('/users', {
        method: 'POST',
        body: { ...create, pricePerSms: +create.pricePerSms, initialFund: +create.initialFund || 0 },
      })
      toast(\`Account "\${r.user.userId}" created.\`, 'success')
      setCreate(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Manage Users" sub="Create, fund, edit and manage every account on the platform" />

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[['all', 'All Users'], ['reseller', 'Resellers'], ['user', 'Clients']].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setRoleFilter(k)}
                className={\`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition \${
                  roleFilter === k ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }\`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        
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
          <div className="relative sm:max-w-[380px] sm:flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MiniIcon name="search" className="h-[18px] w-[18px]" />
            </span>
            <input
              className={\`\${inputCls} pl-10\`}
              placeholder="Search by Username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={load}>
            <MiniIcon name="search" className="h-[16px] w-[16px]" /> Search
          </Button>
          <Button variant="secondary" onClick={() => setCreate({ ...blankCreate })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20c1.4-3.2 4-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
              <path d="M18 8v6M15 11h6" />
            </svg>
            Add New User
          </Button>
        </div>
      </Card>

      {/* User list */}
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
                            <span className={\`inline-flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold \${ROLE_STYLES[node.role] || 'bg-gray-100 text-gray-600'}\`}>
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
                          <div className="w-24 text-right text-[13px] text-gray-500">{node.pricePerSms} &cent;</div>
                          <div className="w-24">
                            <Chip status={node.status === 'active' ? 'Active' : 'Pending'}>{node.status}</Chip>
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
        <Card>
          <Table headers={['Account', 'Role', 'Balance', 'Rate / SMS', 'Status', 'Created', 'Actions']}>
            {items.map((u) => (
              <tr key={u.id} className="transition hover:bg-gray-50/60">
                <Td>
                  <div className="font-bold text-ink cursor-pointer hover:text-brand-600 hover:underline transition" onClick={() => setEditor({ user: u, lockedTab: 'details' })}>{u.companyName}</div>
                  <div className="text-[12px] text-gray-400">{u.name} • @{u.userId}</div>
                </Td>
                <Td>
                  <span className={\`inline-flex rounded-full px-2.5 py-[3px] text-[11.5px] font-bold capitalize \${ROLE_STYLES[u.role]}\`}>
                    {u.role}
                  </span>
                </Td>
                <Td className="font-bold text-ink">{fmtMoney(u.balance)}</Td>
                <Td>\${u.pricePerSms.toFixed(3)}</Td>
                <Td><Chip status={u.status === 'active' ? 'Active' : 'Pending'}>{u.status}</Chip></Td>
                <Td>{fmtDate(u.createdAt)}</Td>
                <Td>
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
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* fund / deduct */}
      <Modal open={!!fund} onClose={() => setFund(null)} title={fund ? \`Balance - \${fund.user.companyName}\` : ''} width="max-w-md">
        {fund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[['credit', 'Credit'], ['debit', 'Debit']].map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFund({ ...fund, mode: k })}
                  className={\`rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition \${
                    fund.mode === k ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }\`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[#fafbfc] p-3.5 text-[13px] text-gray-500">
              Current balance: <b className="text-ink">{fmtMoney(fund.user.balance)}</b>
            </div>
            <Field label="Amount (USD)">
              <input type="number" min="0" step="0.01" className={inputCls} value={fund.amount}
                onChange={(e) => setFund({ ...fund, amount: e.target.value })} placeholder="0.00" />
            </Field>
            <Field label="Note">
              <input className={inputCls} value={fund.note} onChange={(e) => setFund({ ...fund, note: e.target.value })} placeholder="e.g. Wallet top-up" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setFund(null)}>Cancel</Button>
              <Button onClick={submitFund} disabled={busy || !+fund.amount}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* reset pass */}
      <Modal open={!!resetPassUser} onClose={() => setResetPassUser(null)} title={\`Reset Password for @\${resetPassUser?.user?.userId}\`} width="max-w-md">
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
      </Modal>

      {/* full account editor */}
      {editor && (
        <UserEditor
          user={editor?.user}
          lockedTab={editor?.lockedTab}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null)
            load()
          }}
        />
      )}

      {/* create */}
      <Modal open={!!create} onClose={() => setCreate(null)} title="Add New User" width="max-w-lg">
        {create && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="User ID (login)">
                <input className={inputCls} value={create.userId} onChange={(e) => setCreate({ ...create, userId: e.target.value.toLowerCase() })} placeholder="e.g. acme01" />
              </Field>
              <Field label="Account type">
                <select className={inputCls} value={create.role} onChange={(e) => setCreate({ ...create, role: e.target.value })}>
                  <option value="user">User (SMS client)</option>
                  <option value="reseller">Reseller</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Contact name">
                <input className={inputCls} value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} placeholder="Jane Doe" />
              </Field>
              <Field label="Company">
                <input className={inputCls} value={create.companyName} onChange={(e) => setCreate({ ...create, companyName: e.target.value })} placeholder="Acme Pvt Ltd" />
              </Field>
            </div>
            <Field label="Email">
              <input className={inputCls} type="email" value={create.email} onChange={(e) => setCreate({ ...create, email: e.target.value })} placeholder="ops@acme.com" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Password">
                <input className={inputCls} value={create.password} onChange={(e) => setCreate({ ...create, password: e.target.value })} />
              </Field>
              <Field label="Rate / SMS">
                <input className={inputCls} type="number" step="0.001" value={create.pricePerSms} onChange={(e) => setCreate({ ...create, pricePerSms: e.target.value })} />
              </Field>
              <Field label="Initial funding">
                <input className={inputCls} type="number" min="0" value={create.initialFund} onChange={(e) => setCreate({ ...create, initialFund: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCreate(null)}>Cancel</Button>
              <Button onClick={submitCreate} disabled={busy || !create.userId || !create.name || !create.password}>Create account</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
`;

fs.writeFileSync(file, newAdmin);
console.log("Written completely new Admin.jsx!");
