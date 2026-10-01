const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix toggleStatus
const oldToggle = `  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'pending' : 'active'
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { status: newStatus } })
      toast(\`User @\${u.userId} marked as \${newStatus}.\`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }`;

const newToggle = `  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'suspended' : 'active'
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { status: newStatus } })
      toast(\`User @\${u.userId} marked as \${newStatus}.\`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }`;

if (content.includes(oldToggle)) {
    content = content.replace(oldToggle, newToggle);
} else {
    console.log('Failed to find old toggleStatus');
}

// 2. Fix resetPassword
const oldReset = `  function resetPassword(u) {
    toast(\`Password reset link sent to @\${u.userId}'s email.\`, 'success')
  }`;

const newReset = `  async function resetPassword(u) {
    const newPass = window.prompt(\`Enter new password for @\${u.userId}:\`);
    if (!newPass) return;
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { password: newPass } });
      toast('Password updated successfully.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  }`;

if (content.includes(oldReset)) {
    content = content.replace(oldReset, newReset);
} else {
    console.log('Failed to find old resetPassword');
}

fs.writeFileSync(path, content);
console.log('Successfully updated Admin.jsx functions');
