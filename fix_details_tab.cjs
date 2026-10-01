const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update d state initialization
const dStateRegex = /const \[d, setD\] = useState\(\{[\s\S]*?pricePerSms: String\(user\.pricePerSms\),\n\s*\}\)/;
if (content.match(dStateRegex)) {
    content = content.replace(dStateRegex, `const [d, setD] = useState({
    userId: user.userId, name: user.name, companyName: user.companyName,
    email: user.email || '', pricePerSms: String(user.pricePerSms), role: user.role,
  })`);
} else {
    console.log('Regex for d state did not match');
}

// 2. Update save() method
const saveRegex = /if \(tab === 'details'\) body = \{ userId: d\.userId, name: d\.name, companyName: d\.companyName, email: d\.email, pricePerSms: \+d\.pricePerSms, profile: \{ details \} \}/;
if (content.match(saveRegex)) {
    content = content.replace(saveRegex, `if (tab === 'details') body = { userId: d.userId, name: d.name, companyName: d.companyName, email: d.email, pricePerSms: +d.pricePerSms, role: d.role, profile: { details } }`);
} else {
    console.log('Regex for save() did not match');
}

// 3. Add fields to Basic Profile UI
const basePriceRegex = /<Field label="Base Price \(paise\/sms\)">\s*<input type="number" step="0\.01" className=\{inputCls\} value=\{d\.pricePerSms \|\| ''\} onChange=\{e => setD\(\{\.\.\.d, pricePerSms: e\.target\.value\}\)\} \/>\s*<\/Field>/;

const newFields = `<Field label="Base Price (paise/sms)">
                          <input type="number" step="0.01" className={inputCls} value={d.pricePerSms || ''} onChange={e => setD({...d, pricePerSms: e.target.value})} />
                        </Field>
                        <Field label="Account Role">
                          <select className={inputCls} value={d.role || 'user'} onChange={e => setD({...d, role: e.target.value})} disabled={user.role === 'reseller'}>
                            {user.role === 'reseller' ? (
                              <option value="reseller">Reseller</option>
                            ) : (
                              <>
                                <option value="user">User</option>
                                <option value="reseller">Reseller (Upgrade)</option>
                              </>
                            )}
                          </select>
                        </Field>
                        <Field label="Assigned Routes">
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {(settings.assignedRoutes && settings.assignedRoutes.length > 0) ? settings.assignedRoutes.map(r => (
                              <span key={r} className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-100">
                                {r}
                              </span>
                            )) : (
                              <span className="text-[12px] text-gray-400">No routes assigned yet</span>
                            )}
                          </div>
                        </Field>`;

if (content.match(basePriceRegex)) {
    content = content.replace(basePriceRegex, newFields);
} else {
    console.log('Regex for UI fields did not match');
}

fs.writeFileSync(path, content);
console.log('Successfully applied Details updates.');
