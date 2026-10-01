const fs = require('fs');

// 1. Fix Settings.jsx wrapper
let path = 'src/pages/Settings.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '<div className="-mx-5 -mb-5 overflow-x-auto">',
  '<div className="overflow-x-auto">'
);

fs.writeFileSync(path, content);
console.log('Settings.jsx updated');

// 2. Fix ui.jsx Table and Td to have first:pl-4
let pathUi = 'src/components/ui.jsx';
let contentUi = fs.readFileSync(pathUi, 'utf8');

contentUi = contentUi.replace(
  'className="border-b border-gray-100 pb-3 pr-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-left"',
  'className="border-b border-gray-100 pb-3 pr-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-left first:pl-4"'
);

contentUi = contentUi.replace(
  'className={`border-b border-gray-50 py-3 pr-4 ${className}`}',
  'className={`border-b border-gray-50 py-3 pr-4 first:pl-4 ${className}`}'
);

// We need to also check if we replaced the Table correctly
if (contentUi.includes('first:pl-4')) {
    fs.writeFileSync(pathUi, contentUi);
    console.log('ui.jsx updated');
} else {
    console.log('ui.jsx NOT updated - check replace string');
}
