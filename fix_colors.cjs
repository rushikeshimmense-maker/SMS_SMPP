const fs = require('fs');
let path = 'src/pages/Settings.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove emojis in the entire file
content = content.replace(/⚡ /g, '');
content = content.replace(/❌ /g, '');
content = content.replace(/⚠️ /g, '');
content = content.replace(/⏳ /g, '');

// 2. Fix the campaign stats row (remove bg colors and text colors)
const oldCampaignStats = `<div className="flex gap-3 text-[11px] whitespace-nowrap">
                              <div className="bg-gray-50 px-2 py-1 rounded">
                                <div className="text-gray-400 uppercase font-bold text-[9px] mb-0.5">Total</div>
                                <div className="font-semibold">{c.total.toLocaleString()}</div>
                              </div>
                              <div className="bg-emerald-50 px-2 py-1 rounded">
                                <div className="text-emerald-600 uppercase font-bold text-[9px] mb-0.5">Deliv</div>
                                <div className="font-bold">{c.delivered.toLocaleString()}</div>
                              </div>
                              <div className="bg-red-50 px-2 py-1 rounded">
                                <div className="text-red-500 uppercase font-bold text-[9px] mb-0.5">Fail</div>
                                <div className="font-bold">{c.failed.toLocaleString()}</div>
                              </div>
                              <div className="bg-amber-50 px-2 py-1 rounded">
                                <div className="text-amber-500 uppercase font-bold text-[9px] mb-0.5">Undel</div>
                                <div className="font-bold">{c.undelivered.toLocaleString()}</div>
                              </div>
                              <div className="bg-blue-50 px-2 py-1 rounded">
                                <div className="text-blue-500 uppercase font-bold text-[9px] mb-0.5">Pend</div>
                                <div className="font-bold">{c.pending.toLocaleString()}</div>
                              </div>
                            </div>`;

const newCampaignStats = `<div className="flex gap-4 text-[11px] whitespace-nowrap">
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

content = content.replace(oldCampaignStats, newCampaignStats);

// 3. Fix the "Cut" button to variant="secondary" instead of primary so it isn't bright red
content = content.replace(
  `variant="primary"\n                                onClick={() => handleApplyCut(c)}\n                                className="h-[28px] px-3 text-[11px]"\n                              >\n                                Cut`,
  `variant="secondary"\n                                onClick={() => handleApplyCut(c)}\n                                className="h-[28px] px-3 text-[11px]"\n                              >\n                                Apply`
);


// 4. Fix overall stats row
const oldOverallStats = `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Total Sent</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center shadow-sm shadow-emerald-100/50">
                      <div className="text-emerald-600 uppercase font-bold text-[10px] tracking-wider mb-1">Delivered</div>
                      <div className="text-[18px] font-black text-emerald-600">{overallStats.delivered.toLocaleString()}</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                      <div className="text-red-500 uppercase font-bold text-[10px] tracking-wider mb-1">Failed</div>
                      <div className="text-[18px] font-black text-red-600">{overallStats.failed.toLocaleString()}</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                      <div className="text-amber-500 uppercase font-bold text-[10px] tracking-wider mb-1">Undelivered</div>
                      <div className="text-[18px] font-black text-amber-600">{overallStats.undelivered.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                      <div className="text-blue-500 uppercase font-bold text-[10px] tracking-wider mb-1">Pending</div>
                      <div className="text-[18px] font-black text-blue-600">{overallStats.pending.toLocaleString()}</div>
                    </div>
                  </div>`;

const newOverallStats = `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Total Sent</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Delivered</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.delivered.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Failed</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.failed.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Undelivered</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.undelivered.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                      <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Pending</div>
                      <div className="text-[18px] font-black text-ink">{overallStats.pending.toLocaleString()}</div>
                    </div>
                  </div>`;

if(content.includes(oldOverallStats)) {
    content = content.replace(oldOverallStats, newOverallStats);
} else {
    console.log("oldOverallStats not found");
}

fs.writeFileSync(path, content);
console.log('Success');
