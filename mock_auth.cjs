const fs = require('fs');
let path = 'src/lib/auth.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/api\('\/auth\/me'\)[\s\S]*?\.finally\(\(\) => \{\s*if \(alive\) setBooting\(false\)\s*\}\)/, `
    setUser({ id: 'mock', userId: 'admin', role: 'superadmin', name: 'Mock Admin', companyName: 'Mock Company' });
    setBooting(false);
`);

fs.writeFileSync(path, content);
console.log("Mocked auth");
