const fs = require('fs');
let path = 'src/pages/Settings.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix Live Stats Alignment
const oldLiveStats = `<div className="flex gap-4 text-[11px] whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Total</div>
                                <div className="font-semibold text-ink">{c.total.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Deliv</div>
                                <div className="font-semibold text-ink">{c.delivered.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Fail</div>
                                <div className="font-semibold text-ink">{c.failed.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Undel</div>
                                <div className="font-semibold text-ink">{c.undelivered.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Pend</div>
                                <div className="font-semibold text-ink">{c.pending.toLocaleString()}</div>
                              </div>
                            </div>`;

const newLiveStats = `<div className="flex gap-4 text-[11px] whitespace-nowrap">
                              <div className="flex flex-col items-end min-w-[44px]">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Total</div>
                                <div className="font-semibold text-ink">{c.total.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col items-end min-w-[44px]">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Deliv</div>
                                <div className="font-semibold text-ink">{c.delivered.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col items-end min-w-[44px]">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Fail</div>
                                <div className="font-semibold text-ink">{c.failed.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col items-end min-w-[44px]">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Undel</div>
                                <div className="font-semibold text-ink">{c.undelivered.toLocaleString()}</div>
                              </div>
                              <div className="flex flex-col items-end min-w-[44px]">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Pend</div>
                                <div className="font-semibold text-ink">{c.pending.toLocaleString()}</div>
                              </div>
                            </div>`;

if(content.includes(oldLiveStats)) {
    content = content.replace(oldLiveStats, newLiveStats);
}

// 2. Fix Apply Fake DLR Input Group Alignment
const oldCutGroup = `<div className="flex items-center gap-1.5">
                              <select 
                                className="block w-[110px] rounded-md border-0 py-1.5 pl-2 pr-6 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-brand-600 sm:text-[11px] sm:leading-6 font-semibold shadow-sm"
                                value={cutInputs[c.id]?.source || 'auto'}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), source: e.target.value }})}
                                title="Select source to cut from"
                              >
                                <option value="auto">Smart</option>
                                <option value="failed">Failed</option>
                                <option value="undelivered">Undeliv</option>
                                <option value="pending">Pending</option>
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
                                variant="secondary"
                                onClick={() => handleApplyCut(c)}
                                className="h-[28px] px-3 text-[11px]"
                              >
                                Apply
                              </Button>
                            </div>`;

const newCutGroup = `<div className="flex items-center gap-1.5">
                              <select 
                                className="block w-[95px] h-[28px] rounded-md border-0 pl-2 pr-6 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-brand-600 text-[11px] font-semibold shadow-sm"
                                value={cutInputs[c.id]?.source || 'auto'}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), source: e.target.value }})}
                                title="Select source to cut from"
                              >
                                <option value="auto">Smart</option>
                                <option value="failed">Failed</option>
                                <option value="undelivered">Undeliv</option>
                                <option value="pending">Pending</option>
                              </select>
                              <input 
                                type="number" 
                                min="1" 
                                placeholder="Vol..."
                                className="block w-[70px] h-[28px] rounded-md border-0 px-2 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-600 text-[11px] font-semibold shadow-sm"
                                value={cutInputs[c.id]?.amount || ''}
                                onChange={e => setCutInputs({...cutInputs, [c.id]: { ...(cutInputs[c.id] || {}), amount: e.target.value }})}
                              />
                              <Button 
                                variant="secondary"
                                onClick={() => handleApplyCut(c)}
                                className="!h-[28px] px-3 text-[11px] py-0"
                              >
                                Apply
                              </Button>
                            </div>`;

if(content.includes(oldCutGroup)) {
    content = content.replace(oldCutGroup, newCutGroup);
}

fs.writeFileSync(path, content);
console.log('Success');
