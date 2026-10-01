import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/UserEditor.jsx', 'utf8');

const newSecurityHtml = `                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mt-6">
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <svg className="text-brand-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Security Configuration</h3>
                      </div>
                      {(config.securityQuestion || config.securityAnswer) && (
                        <button type="button" onClick={() => {
                          if (window.confirm('Are you sure you want to reset the security credentials? The user will be asked to set them up again on next login.')) {
                            setConfig({ ...config, securityQuestion: '', securityAnswer: '', _revealAnswer: false });
                          }
                        }} className="rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100">
                          Reset Credentials
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[13px] text-gray-500">As an admin, you can reveal the client's answer if they forgot it, or reset it completely so they can set a new one on their next login. You cannot set an answer on their behalf.</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Current Security Question">
                          <input className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2.5 text-[13px] text-gray-500 outline-none cursor-not-allowed font-medium" value={config.securityQuestion || 'Not set up yet.'} disabled />
                        </Field>
                        <Field label="Current Answer">
                          <div className="relative">
                            <input type={config._revealAnswer ? 'text' : 'password'} className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2.5 text-[13px] text-gray-500 outline-none cursor-not-allowed pr-10 font-medium" value={config.securityAnswer || ''} disabled placeholder={config.securityQuestion ? "Hidden..." : "N/A"} />
                            {config.securityAnswer && (
                              <button type="button" onClick={() => setConfig({ ...config, _revealAnswer: !config._revealAnswer })} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                                {config._revealAnswer ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                              </button>
                            )}
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>
`;

let parts = code.split('<h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-ink">Security Configuration</h3>');
if (parts.length === 2) {
  let before = parts[0];
  // go back to the start of the div
  const divStart = before.lastIndexOf('<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] \nmt-6">');
  const divStartFallback = before.lastIndexOf('<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]');
  
  const actualStart = divStart !== -1 ? divStart : divStartFallback;
  
  if (actualStart !== -1) {
    let finalBefore = before.substring(0, actualStart);
    let after = parts[1];
    
    // find the end of the block in `after`
    // it ends with:
    //                 </div>
    //               </div>
    //             </div>
    
    // We can just find the start of the next tab `tab === 'routes'`
    const endBlockIndex = after.indexOf("{tab === 'routes'");
    if (endBlockIndex !== -1) {
       // we also need to strip everything up to {tab === 'routes'
       // But wait, there is `</div>` closing tags before `{tab === 'routes'`. 
       // In my previous replacement I just injected BEFORE `{tab === 'routes'` so the old block is still there!
       // Oh, wait, in my previous replacement I actually did this:
       // `code = code.replace(regexRoutes, "\n" + securityHtml + "\n$1");`
       // Which means I ADDED it.
       // Yes! The old one was just left alone, wait no. I had replaced the old one?
       
       // I'll just remove the whole thing from actualStart to endBlockIndex.
       const finalAfter = after.substring(endBlockIndex);
       
       const newCode = finalBefore + newSecurityHtml + "\n\n              " + finalAfter;
       fs.writeFileSync('frontend/src/components/UserEditor.jsx', newCode);
       console.log("Success by splitting");
    }
  }
}

