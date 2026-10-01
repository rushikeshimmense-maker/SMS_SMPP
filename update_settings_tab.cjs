const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const regexToReplace = /<div className="space-y-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

const replacement = `<div className="space-y-3">
                    <Toggle on={settings.validateSpam} onChange={(v) => setSettings({ ...settings, validateSpam: v })} label="Validate Spam" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3.5 transition hover:bg-gray-50">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">Webhook</div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-[360px]">
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                          value={settings.webhookUrl || ''} 
                          onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })} 
                        />
                        <button type="button" onClick={() => toast('Click Save at the bottom to apply changes.', 'success')} className="rounded-lg bg-gray-800 px-4 py-2 text-[13px] font-bold text-white hover:bg-black transition-colors shrink-0">
                          Save
                        </button>
                      </div>
                    </div>

                    <Toggle on={settings.openSenderId} onChange={(v) => setSettings({ ...settings, openSenderId: v })} label="Open Sender Id" />
                    <Toggle on={settings.openTemplate} onChange={(v) => setSettings({ ...settings, openTemplate: v })} label="Open Template" />
                    <Toggle on={settings.secureReporting} onChange={(v) => setSettings({ ...settings, secureReporting: v })} label="Secure Reporting (Mask Mobile Numbers)" />
                  </div>
                </div>
              </div>
            )}`;

if (content.match(regexToReplace)) {
    content = content.replace(regexToReplace, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated the Settings tab');
} else {
    console.log('Regex did not match. Trying alternative matching...');
    // Fallback logic
    let startIdx = content.indexOf('<div className="space-y-3">');
    let searchRegion = content.indexOf('{tab === \'settings\' && (');
    if (searchRegion !== -1) {
        startIdx = content.indexOf('<div className="space-y-3">', searchRegion);
        let endIdx = content.indexOf('</div>\n              </div>\n            )}', startIdx);
        if (endIdx !== -1) {
            endIdx += 42; // to include the end string
            let before = content.substring(0, startIdx);
            let after = content.substring(endIdx);
            fs.writeFileSync(path, before + replacement + after);
            console.log('Successfully updated via index search');
        } else {
            console.log('End index not found');
        }
    } else {
        console.log('Settings tab start not found');
    }
}
