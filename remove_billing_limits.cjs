const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const startStr = '<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">\n                    <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">\n                      <svg className="text-brand-500"';

const endStr = `</div>\n                    </div>\n                  </div>`;

const searchRegex = /<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-\[0_2px_10px_rgba\(0,0,0,0\.03\)\]">\s*<div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">\s*<svg className="text-brand-500"[^>]+>[\s\S]*?<\/svg>\s*<h3 className="text-\[13\.5px\] font-extrabold uppercase tracking-wider text-ink">Billing & Routing Limits<\/h3>\s*<\/div>\s*<div className="space-y-5">\s*<div>\s*<Sub>Credit Deduction Policy<\/Sub>[\s\S]*?<\/div>\s*<div>\s*<Sub>Allowed CIDs \(One per line\)<\/Sub>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

if (content.match(searchRegex)) {
    content = content.replace(searchRegex, '');
    fs.writeFileSync(path, content);
    console.log('Success via regex!');
} else {
    console.log('Regex failed, printing a snippet to debug:');
}
