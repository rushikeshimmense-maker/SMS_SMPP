import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/UserEditor.jsx', 'utf8');

// 1. Remove Configuration from TABS
code = code.replace(
  "  ['configuration', 'Configuration'],\n",
  ""
);

// 2. Remove configuration body logic
code = code.replace(
  "else if (tab === 'configuration') body = { profile: { config: { securityQuestion: config.securityQuestion, securityAnswer: config.securityAnswer } } }\n        ",
  ""
);

// 3. Move the UI to the 'settings' tab. We need to find the settings tab and append our Security Configuration block to it.
const securityHtml = `
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mt-6">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Security Configuration</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[13px] text-gray-500">Reset or reveal the client's Security Question and Answer. The client will be asked this on their first login or when resetting their password.</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Security Question">
                        <select className={inputCls} value={config.securityQuestion || ''} onChange={(e) => setConfig({ ...config, securityQuestion: e.target.value })}>
                          <option value="">-- Not set --</option>
                          <option value="What is your pet's name?">What is your pet's name?</option>
                          <option value="In what city were you born?">In what city were you born?</option>
                          <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                          <option value="What high school did you attend?">What high school did you attend?</option>
                          <option value="What was the make of your first car?">What was the make of your first car?</option>
                        </select>
                      </Field>
                      <Field label="Security Answer">
                        <div className="relative">
                          <input type={config._revealAnswer ? 'text' : 'password'} className={inputCls + " pr-10"} value={config.securityAnswer || ''} onChange={(e) => setConfig({ ...config, securityAnswer: e.target.value })} placeholder="Answer..." />
                          <button type="button" onClick={() => setConfig({ ...config, _revealAnswer: !config._revealAnswer })} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                            {config._revealAnswer ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                          </button>
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>`;

// Let's first remove the entire configuration tab chunk.
const configRegex = /\{tab === 'configuration' && \([\s\S]*?\n            \)\}/;
code = code.replace(configRegex, '');

// Now inject the security config into the settings tab
const settingsEndRegex = /(<Toggle on=\{settings\.autoDlz\} onChange=\{\(v\) => setSettings\(\{ \.\.\.settings, autoDlz: v \}\)\} label="Auto-DLZ Approval" \/>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;

code = code.replace(settingsEndRegex, '$1\n' + securityHtml);

// And also we need to update the save logic so that if tab==='settings', it also sends the config.
code = code.replace(
  "else if (tab === 'settings') body = { profile: { settings } }",
  "else if (tab === 'settings') body = { profile: { settings, config: { securityQuestion: config.securityQuestion, securityAnswer: config.securityAnswer } } }"
)

fs.writeFileSync('frontend/src/components/UserEditor.jsx', code);
