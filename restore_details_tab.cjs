const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const regexToReplace = /<div className="flex-1 overflow-y-auto px-5 py-5">\s*\{tab === 'details' && \(\s*<div className="space-y-5 mb-6">\s*<\/div>\s*\)\}/;

const restoredContent = `<div className="flex-1 overflow-y-auto px-5 py-5">
            {tab === 'details' && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px] mb-6">
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                    <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Basic Profile</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="User ID">
                        <input className={inputCls} value={d.userId || ''} onChange={e => setD({...d, userId: e.target.value})} disabled />
                      </Field>
                      <Field label="Full Name">
                        <input className={inputCls} value={d.name || ''} onChange={e => setD({...d, name: e.target.value})} />
                      </Field>
                      <Field label="Company Name">
                        <input className={inputCls} value={d.companyName || ''} onChange={e => setD({...d, companyName: e.target.value})} />
                      </Field>
                      <Field label="Email Address">
                        <input type="email" className={inputCls} value={d.email || ''} onChange={e => setD({...d, email: e.target.value})} />
                      </Field>
                      <Field label="Base Price (paise/sms)">
                        <input type="number" step="0.01" className={inputCls} value={d.pricePerSms || ''} onChange={e => setD({...d, pricePerSms: e.target.value})} />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="space-y-5 mb-6">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Global Account Settings</h3>
                  </div>
                  <div className="space-y-3">
                    <Toggle on={settings.autoTemplates} onChange={(v) => setSettings({ ...settings, autoTemplates: v })} label="Auto-approve Templates" />
                    <Toggle on={settings.autoSenderIds} onChange={(v) => setSettings({ ...settings, autoSenderIds: v })} label="Auto-approve Sender IDs" />
                    <Toggle on={settings.secureReporting} onChange={(v) => setSettings({ ...settings, secureReporting: v })} label="Secure Reporting (Mask Mobile Numbers)" />
                    <Toggle on={settings.autoDlz} onChange={(v) => setSettings({ ...settings, autoDlz: v })} label="Auto-resolve DLZ" hint="DLZ-linked SMPP clients" />
                  </div>
                </div>
              </div>
            )}`;

if (content.match(regexToReplace)) {
    content = content.replace(regexToReplace, restoredContent);
    fs.writeFileSync(path, content);
    console.log('Restored the missing Details and Settings tabs successfully!');
} else {
    console.log('Regex did not match. Printing a snippet of the current file instead:');
    let snippetStart = content.indexOf('<div className="flex-1 overflow-y-auto px-5 py-5">');
    console.log(content.substring(snippetStart, snippetStart + 300));
}
