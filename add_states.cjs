const fs = require('fs');
let path = 'src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const [view, setView]')) {
    content = content.replace("const [busy, setBusy] = useState(false)", "const [busy, setBusy] = useState(false)\n  const [expanded, setExpanded] = useState({})\n  const [view, setView] = useState('list')");
    fs.writeFileSync(path, content);
    console.log("Added expanded and view states to Admin.jsx");
} else {
    console.log("Already has view state");
}
