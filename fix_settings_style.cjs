const fs = require('fs');
let path = 'src/pages/Settings.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Redesign campaign-wise Apply Fake DLR
let oldCampaignGroupRegex = /<div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all w-\[240px\]">[\s\S]*?<\/div>/;

let newCampaignGroup = `<div className="flex items-center gap-1.5">
                              <select 
                                className="block w-[110px] rounded-md border-0 py-1.5 pl-2 pr-6 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-brand-600 sm:text-[11px] sm:leading-6 font-semibold shadow-sm"
                                value={cutInputs[c.id]?.source || 'auto'}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), source: e.target.value }})}
                                title="Select source to cut from"
                              >
                                <option value="auto">⚡ Smart</option>
                                <option value="failed">❌ Failed</option>
                                <option value="undelivered">⚠️ Undeliv</option>
                                <option value="pending">⏳ Pending</option>
                              </select>
                              <input 
                                type="number" 
                                min="1" 
                                placeholder="Vol..."
                                className="block w-[70px] rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-600 sm:text-[11px] sm:leading-6 font-semibold shadow-sm"
                                value={cutInputs[c.id]?.amount || ''}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), amount: e.target.value }})}
                              />
                              <Button 
                                variant="primary"
                                onClick={() => handleApplyCut(c)}
                                className="h-[28px] px-3 text-[11px]"
                              >
                                Cut
                              </Button>
                            </div>`;


// 2. Redesign Overall mode 'Apply Global Fake DLR'
let oldGlobalGroupRegex = /<div className="flex items-center rounded-xl border-2 border-brand-100 bg-white shadow-sm overflow-hidden focus-within:border-brand-500 transition-all w-full max-w-lg">[\s\S]*?<\/div>/;

let newGlobalGroup = `<div className="flex flex-wrap items-end gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 w-full max-w-2xl">
                      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] max-w-[250px]">
                        <label className="text-[12px] font-bold text-gray-700">Source to Cut From</label>
                        <select 
                          className={inputCls}
                          value={globalCut.source}
                          onChange={e => setGlobalCut({...globalCut, source: e.target.value})}
                        >
                          <option value="auto">⚡ Smart Cut (Distribute)</option>
                          <option value="failed">❌ From Failed</option>
                          <option value="undelivered">⚠️ From Undelivered</option>
                          <option value="pending">⏳ From Pending</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1 min-w-[150px] max-w-[250px]">
                        <label className="text-[12px] font-bold text-gray-700">Volume to Convert</label>
                        <input 
                          type="number" 
                          min="1" 
                          placeholder="e.g. 5000"
                          className={inputCls}
                          value={globalCut.amount}
                          onChange={e => setGlobalCut({...globalCut, amount: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleApplyGlobalCut}
                        className="mb-0.5 h-[38px] px-6"
                      >
                        Process Cut
                      </Button>
                    </div>`;


content = content.replace(oldCampaignGroupRegex, newCampaignGroup);
content = content.replace(oldGlobalGroupRegex, newGlobalGroup);

// 3. Responsive grid for the cards
let oldGrid = 'className="grid grid-cols-5 gap-4 mb-8"';
let newGrid = 'className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8"';
content = content.replace(oldGrid, newGrid);

fs.writeFileSync(path, content);
console.log('Success');
