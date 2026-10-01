const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add login to useAuth
content = content.replace(
  'const { user: me } = useAuth()',
  'const { user: me, login } = useAuth()'
);

// 2. Add loginAsUser function
const func = "\n  async function loginAsUser(u) {\n    if (!confirm('Are you sure you want to login as @' + u.userId + '?')) return\n    try {\n      const res = await api('/users/' + u.id + '/impersonate', { method: 'POST' })\n      login(res.token, false, res.user)\n      window.location.href = '/'\n    } catch (e) {\n      toast(e.message, 'error')\n    }\n  }\n";

if (!content.includes('loginAsUser')) {
  content = content.replace('  const blankCreate', func + '  const blankCreate');
}

// 3. Add button to List view (after Reset Password)
const listBtn = '\n                    <button title="Login as User" onClick={() => loginAsUser(u)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition shadow-sm border border-orange-100/50">\n                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>\n                    </button>';

// The regex for the Reset Password button in List View (it uses `user: u`)
const listResetRegex = /<button title="Reset Password" onClick=\{\(\) => setResetPassUser\(\{ user: u, password: '' \}\)\} className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100\/50">[\s\S]*?<\/button>/;

content = content.replace(listResetRegex, match => match + listBtn);

// 4. Add button to Tree view (uses `user: node`)
const treeBtn = '\n                            <button title="Login as User" onClick={() => loginAsUser(node)} className="flex items-center justify-center h-7 w-7 rounded-md bg-orange-50 text-orange-500 hover:bg-orange-100 transition shadow-sm border border-orange-100/50">\n                              <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>\n                            </button>';

const treeResetRegex = /<button title="Reset Password" onClick=\{\(\) => setResetPassUser\(\{ user: node, password: '' \}\)\} className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 text-blue-500 hover:bg-blue-100 transition shadow-sm border border-blue-100\/50">[\s\S]*?<\/button>/;

content = content.replace(treeResetRegex, match => match + treeBtn);

fs.writeFileSync(file, content);
console.log("Added login buttons!");
