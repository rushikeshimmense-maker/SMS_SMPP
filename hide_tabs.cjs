const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// The exact string in the file:
const tabsStart = '{/* Tabs */}\n          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-[#f9fafb] px-5 py-3 no-scrollbar shadow-inner">';
const newTabsStart = '{/* Tabs */}\n          {!lockedTab && (\n          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-[#f9fafb] px-5 py-3 no-scrollbar shadow-inner">';

if (content.includes(tabsStart)) {
    content = content.replace(tabsStart, newTabsStart);
    
    // Now we need to find where the TABS.map block ends to close the condition.
    // It ends with:
    //               ))}
    //           </div>
    
    // Let's replace the closing div
    const tabsEnd = '              ))}\n            </div>';
    const newTabsEnd = '              ))}\n            </div>\n          )}';
    
    if (content.includes(tabsEnd)) {
        content = content.replace(tabsEnd, newTabsEnd);
        fs.writeFileSync(path, content);
        console.log('Successfully wrapped tabs in !lockedTab condition.');
    } else {
        console.log('Found start but not end block for tabs.');
    }
} else {
    console.log('Could not find the exact start string for tabs.');
}
