import sys
import re

with open('frontend/src/pages/Users.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'const \[fund, setFund\] = useState\(null\)(.*)', r'const [fund, setFund] = useState(null)\1\n  const [resetPassUser, setResetPassUser] = useState(null)', text)
text = re.sub(r'const \{ user: me \} = useAuth\(\)', 'const { user: me, impersonate } = useAuth()', text)

funcs = """
  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'suspended' : 'active'
    try {
      await api('/users/' + u.id, { method: 'PATCH', body: { status: newStatus } })
      toast(`User @${u.userId} marked as ${newStatus}.`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function loginAsUser(u) {
    if (!confirm(`Are you sure you want to login as @${u.userId}?`)) return
    try {
      const res = await api('/users/' + u.id + '/impersonate', { method: 'POST' })
      impersonate(res.token, res.user)
      window.location.href = '/'
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function submitResetPassword() {
    if (!resetPassUser.password) return toast('Enter a new password.', 'error')
    setBusy(true)
    try {
      await api('/users/' + resetPassUser.user.id, { method: 'PATCH', body: { password: resetPassUser.password } })
      toast(`Password for @${resetPassUser.user.userId} updated.`, 'success')
      setResetPassUser(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }
"""
text = text.replace('async function submitFund()', funcs + '\n  async function submitFund()')

icons = """<button title="Fund Credits" onClick={() => setFund({ user: u, mode: 'fund', amount: '', note: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm border border-emerald-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg></button>
                  <button title="Manage Settings" onClick={() => setEdit({ user: u, pricePerSms: String(u.pricePerSms), name: u.name, companyName: u.companyName, status: u.status })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
                  <button title={u.status === "active" ? "Deactivate User" : "Activate User"} onClick={() => toggleStatus(u)} className={"flex items-center justify-center h-8 w-8 rounded-lg transition shadow-sm border " + (u.status === "active" ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50" : "bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50")}><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg></button>
                  <button title="Reset Password" onClick={() => setResetPassUser({ user: u, password: '' })} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></button>
                  <button title="Login as User" onClick={() => loginAsUser(u)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition shadow-sm border border-orange-100/50"><svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg></button>"""

text = re.sub(r'<div className="flex flex-wrap gap-1\.5">[\s\S]*?</div>', '<div className="flex items-center gap-1.5">\n' + icons + '\n                </div>', text)

fundModal = """      <Modal open={!!fund} onClose={() => setFund(null)} title={fund ? `Credits - ${fund.user.companyName}` : ''} width="max-w-md">
        {fund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['fund', 'deduct'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFund({ ...fund, mode: k })}
                  className={`rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition ${
                    fund.mode === k ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {k === 'fund' ? 'Credit Wallet' : 'Deduct Credits'}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[#fafbfc] p-3.5 text-[13px] text-gray-500">
              Current balance: <b className="text-ink">{fmtMoney(fund.user.balance)}</b>
              {me.role !== 'superadmin' && <> &mdash; Your balance: <b className="text-ink">{fmtMoney(me.balance)}</b></>}
            </div>
            <Field label="Amount (Credits)">
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
      </Modal>"""

text = re.sub(r'<Modal open=\{\!\!fund\}[\s\S]*?</Modal>', fundModal, text)

resetModal = """      <Modal open={!!resetPassUser} onClose={() => setResetPassUser(null)} title={resetPassUser ? `Reset password - ${resetPassUser.user.userId}` : ''} width="max-w-md">
        {resetPassUser && (
          <div className="space-y-4">
            <div className="text-[13px] text-gray-500 mb-2">Assign a new password for <b className="text-ink">{resetPassUser.user.companyName}</b>.</div>
            <Field label="New password">
              <input className={inputCls} value={resetPassUser.password} onChange={(e) => setResetPassUser({ ...resetPassUser, password: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setResetPassUser(null)}>Cancel</Button>
              <Button onClick={submitResetPassword} disabled={busy || !resetPassUser.password}>Update</Button>
            </div>
          </div>
        )}
      </Modal>"""

text = re.sub(r'\{/\* edit \*/\}', resetModal + '\n\n      {/* edit */}', text)

with open('frontend/src/pages/Users.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Users patched!')
