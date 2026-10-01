const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state
const stateRegex = /const \[fund, setFund\] = useState\(null\)/;
if (content.match(stateRegex)) {
    content = content.replace(stateRegex, "const [fund, setFund] = useState(null)\n  const [resetPassUser, setResetPassUser] = useState(null)");
}

// 2. Replace function
const oldFunc = `  async function resetPassword(u) {
    const newPass = window.prompt(\`Enter new password for @\${u.userId}:\`);
    if (!newPass) return;
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { password: newPass } });
      toast('Password updated successfully.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  }`;
const newFunc = `  async function submitResetPassword() {
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
  }`;
if (content.includes(oldFunc)) {
    content = content.replace(oldFunc, newFunc);
}

// 3. Replace OnClicks
content = content.replace(/onClick=\{\(\) => resetPassword\(node\)\}/g, "onClick={() => setResetPassUser({ user: node, password: '' })}");
content = content.replace(/onClick=\{\(\) => resetPassword\(u\)\}/g, "onClick={() => setResetPassUser({ user: u, password: '' })}");

// 4. Add Modal
const fundModalRegex = /<Modal open=\{!!fund\}[\s\S]*?<\/Modal>/;
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
                value={resetPassUser.password}
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
      </Modal>`;

// we insert resetModal after fund Modal
let fundIndex = content.lastIndexOf('</Modal>');
if (fundIndex !== -1) {
    content = content.slice(0, fundIndex + 8) + resetModal + content.slice(fundIndex + 8);
}

fs.writeFileSync(path, content);
console.log('Successfully updated Admin.jsx with custom Reset Password modal');
