const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject functions before getRefundAmount
const functionsToInject = `  async function toggleStatus(u) {
    const newStatus = u.status === 'active' ? 'pending' : 'active'
    try {
      await api(\`/users/\${u.id}\`, { method: 'PATCH', body: { status: newStatus } })
      toast(\`User @\${u.userId} marked as \${newStatus}.\`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  function resetPassword(u) {
    toast(\`Password reset link sent to @\${u.userId}'s email.\`, 'success')
  }

  async function submitCreate()`;

if (content.includes('async function submitCreate()')) {
    content = content.replace('async function submitCreate()', functionsToInject);
    console.log('Injected functions');
} else {
    console.log('Could not find getRefundAmount');
}

// 2. Add buttons to List View
// Search for the end of the Manage Settings button in List View
const listSettingsBtnRegex = /(<button title="Manage Settings" onClick=\{\(\) => setEditor\(\{ user: u, lockedTab: 'settings' \}\)\} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200\/50">[\s\S]*?<\/button>)/g;

const newListBtns = `$1
                      <button title={u.status === 'active' ? 'Deactivate User' : 'Activate User'} onClick={() => toggleStatus(u)} className={\`flex items-center justify-center h-8 w-8 rounded-lg transition shadow-sm border \${u.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50' : 'bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50'}\`}>
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                      </button>
                      <button title="Reset Password" onClick={() => resetPassword(u)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50">
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </button>`;

if (content.match(listSettingsBtnRegex)) {
    content = content.replace(listSettingsBtnRegex, (match, p1) => {
        // Need to make sure we replace the list one and tree one correctly
        if (p1.includes('user: u')) {
            return newListBtns.replace('$1', p1);
        }
        return match;
    });
    console.log('Replaced list buttons');
}

// 3. Add buttons to Tree View
const treeSettingsBtnRegex = /(<button title="Manage Settings" onClick=\{\(\) => setEditor\(\{ user: node, lockedTab: 'settings' \}\)\} className="flex items-center justify-center h-7 w-7 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200\/50">[\s\S]*?<\/button>)/g;

const newTreeBtns = `$1
                                  <button title={node.status === 'active' ? 'Deactivate User' : 'Activate User'} onClick={() => toggleStatus(node)} className={\`flex items-center justify-center h-7 w-7 rounded-md transition shadow-sm border \${node.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-100/50' : 'bg-green-50 text-green-500 hover:bg-green-100 border-green-100/50'}\`}>
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                                  </button>
                                  <button title="Reset Password" onClick={() => resetPassword(node)} className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100/50">
                                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  </button>`;

if (content.match(treeSettingsBtnRegex)) {
    content = content.replace(treeSettingsBtnRegex, (match, p1) => {
        if (p1.includes('user: node')) {
            return newTreeBtns.replace('$1', p1);
        }
        return match;
    });
    console.log('Replaced tree buttons');
}

fs.writeFileSync(path, content);
