const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Header replacement
const headerRegex = /<h2 className="text-\[17px\] font-extrabold tracking-tight text-ink">\{lockedTab === 'settings' \? 'Settings' : 'Profile'\} - @\{user\.userId\}<\/h2>\s*<p className="text-\[12px\] text-gray-400">\{user\.companyName\}.*?\{user\.role\}<\/p>/;
const newHeader = `<h2 className="text-[18px] font-extrabold tracking-tight text-ink">
              {lockedTab === 'settings' ? 'Global Settings' : 'Basic Profile'}
            </h2>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">
              {user.companyName} <span className="mx-1.5 text-gray-300">|</span> @{user.userId}
            </p>`;

if (content.match(headerRegex)) {
    content = content.replace(headerRegex, newHeader);
    console.log('Successfully updated modal header');
} else {
    console.log('Regex did not match for header');
}

// 2. Modal Wrapper Width
const widthRegex = /sm:max-w-4xl/;
if (content.match(widthRegex)) {
    content = content.replace(widthRegex, "${lockedTab ? 'sm:max-w-2xl' : 'sm:max-w-4xl'}");
    console.log('Successfully updated modal width');
} else {
    console.log('Regex did not match for modal width');
}

// 3. Details Tab Grid
const gridRegex = /className="grid grid-cols-1 gap-5 lg:grid-cols-\[1fr_280px\] mb-6"/;
if (content.match(gridRegex)) {
    content = content.replace(gridRegex, 'className="max-w-3xl mx-auto mb-6"');
    console.log('Successfully updated details tab grid');
} else {
    console.log('Regex did not match for details tab grid');
}

fs.writeFileSync(path, content);
