const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const webhookRegex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50\/50 px-4 py-3\.5 transition hover:bg-gray-50">\s*<div>\s*<div className="text-\[13\.5px\] font-bold text-ink">Webhook<\/div>/;

const ipValidationBlock = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3.5 transition hover:bg-gray-50">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">IP Validation</div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-[360px]">
                        <input 
                          type="text" 
                          placeholder="e.g. 192.168.1.1, 10.0.0.1" 
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                          value={settings.ipValidation || ''} 
                          onChange={(e) => setSettings({ ...settings, ipValidation: e.target.value })} 
                        />
                        <button type="button" onClick={() => toast('Click Save at the bottom to apply changes.', 'success')} className="rounded-lg bg-gray-800 px-4 py-2 text-[13px] font-bold text-white hover:bg-black transition-colors shrink-0">
                          Save
                        </button>
                      </div>
                    </div>

                    `;

if (content.match(webhookRegex)) {
    content = content.replace(webhookRegex, (match) => {
        return ipValidationBlock + match;
    });
    fs.writeFileSync(path, content);
    console.log('Successfully inserted IP Validation block');
} else {
    console.log('Regex did not match');
}
