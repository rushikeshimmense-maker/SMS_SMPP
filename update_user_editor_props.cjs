const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update props
content = content.replace(
  'export default function UserEditor({ user, onClose, onSaved, inline }) {',
  'export default function UserEditor({ user, onClose, onSaved, inline, lockedTab }) {'
);

// Update initial state
content = content.replace(
  "const [tab, setTab] = useState('details')",
  "const [tab, setTab] = useState(lockedTab || 'details')"
);

// Hide tabs if lockedTab is present
// Find <div className="border-b border-gray-100 px-5">
const tabsRegex = /<div className="border-b border-gray-100 px-5">/;
content = content.replace(
  tabsRegex,
  "{!lockedTab && (\n          <div className=\"border-b border-gray-100 px-5\">"
);

// Close the conditional block after the tabs div
// The div ends with:
//               ))}
//             </div>
//           </div>
const closeTabsRegex = /\)\)}\n\s*<\/div>\n\s*<\/div>/;
content = content.replace(
  closeTabsRegex,
  "))}\n            </div>\n          </div>\n          )}"
);

fs.writeFileSync(path, content);
console.log('Successfully updated UserEditor.jsx to support lockedTab');
