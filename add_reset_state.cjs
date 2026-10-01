const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('setResetPassUser')) {
    content = content.replace("const [busy, setBusy]", "const [resetPassUser, setResetPassUser] = useState(null)\n  const [busy, setBusy]");
    fs.writeFileSync(path, content);
    console.log("Added resetPassUser state to Admin.jsx");
}
