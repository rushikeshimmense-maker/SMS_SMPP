const fs = require('fs');
let path = 'src/pages/SmppCenter.jsx';
let content = fs.readFileSync(path, 'utf8');

const newStopButton = `{/* Stop connection */}
                          <button onClick={(e) => { e.stopPropagation(); }} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 shadow-sm transition" title="Stop connection">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>
                          </button>`;

const fallbackOld = `<button onClick={(e) => { e.stopPropagation(); handleView(acc); }} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 shadow-sm transition" title="Live connections">`;

if (content.includes(fallbackOld)) {
    let startIndex = content.indexOf(fallbackOld);
    // Rewind slightly to catch the {/* Live connections */} comment
    let commentIndex = content.lastIndexOf('{/* Live connections */}', startIndex);
    if (commentIndex !== -1 && commentIndex > startIndex - 100) {
        startIndex = commentIndex;
    }
    let endIndex = content.indexOf('</button>', startIndex) + 9;
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex);
    fs.writeFileSync(path, before + newStopButton + after);
    console.log('Success via string splice');
} else {
    console.log('Target string not found.');
}
