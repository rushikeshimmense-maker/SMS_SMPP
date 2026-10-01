const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server', 'index.js');
let content = fs.readFileSync(file, 'utf8');

const impersonateCode = "app.post('/api/users/:id/impersonate', auth, requireRole('superadmin'), (req, res) => {\n  const u = getDb().users.find((x) => x.id === req.params.id)\n  if (!u) return res.status(404).json({ error: 'User not found' })\n  res.json({ token: sign(u, false), user: publicUser(u) })\n})\n\napp.get('/api/users'";

if (!content.includes('/api/users/:id/impersonate')) {
  content = content.replace("app.get('/api/users'", impersonateCode);
  fs.writeFileSync(file, content);
  console.log("Added impersonate API");
}
