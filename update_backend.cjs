const fs = require('fs');
let path = 'server/index.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /const \{ status, pricePerSms, name, companyName, email, userId, profile \} = req\.body \|\| \{\}/;
const replacement = `const { status, pricePerSms, name, companyName, email, userId, profile, role, password } = req.body || {}
    if (password) u.passwordHash = bcrypt.hashSync(String(password), 10)
    if (role && req.user.role === 'superadmin' && u.role !== 'superadmin') u.role = role === 'reseller' ? 'reseller' : 'user'`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated PATCH /users/:id to support password and role');
} else {
    console.log('Regex did not match');
}
