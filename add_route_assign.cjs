const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<Toggle on=\{settings.secureReporting\} onChange=\{\(v\) => setSettings\(\{ \.\.\.settings, secureReporting: v \}\)\} label="Secure Reporting \(Mask Mobile Numbers\)" \/>/g;

const routeAssignmentBlock = `<Toggle on={settings.secureReporting} onChange={(v) => setSettings({ ...settings, secureReporting: v })} label="Secure Reporting (Mask Mobile Numbers)" />
                    
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-4 transition hover:bg-gray-50">
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">Route Assignment</div>
                        <div className="text-[11.5px] text-gray-400 mt-0.5">Select one or more routes to assign to this account</div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {ROUTE_OPTIONS.map(route => {
                          const isSelected = (settings.assignedRoutes || []).includes(route);
                          return (
                            <label key={route} className={\`flex items-center gap-2 rounded-lg border px-3 py-1.5 cursor-pointer transition \${isSelected ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}\`}>
                              <input type="checkbox" className="hidden" checked={!!isSelected} onChange={(e) => {
                                const arr = settings.assignedRoutes || [];
                                if (e.target.checked) setSettings({ ...settings, assignedRoutes: [...arr, route] });
                                else setSettings({ ...settings, assignedRoutes: arr.filter(r => r !== route) });
                              }} />
                              <div className={\`w-3.5 h-3.5 rounded flex items-center justify-center border \${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}\`}>
                                {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="text-[12.5px] font-bold">{route}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>`;

if (content.match(regex)) {
    content = content.replace(regex, routeAssignmentBlock);
    fs.writeFileSync(path, content);
    console.log('Successfully added route assignment multi-select block.');
} else {
    console.log('Regex did not match.');
}
