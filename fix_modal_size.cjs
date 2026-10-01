const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="flex h-\[94vh\] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-\[88vh\] \$\{lockedTab \? 'sm:max-w-2xl' : 'sm:max-w-4xl'\} sm:rounded-2xl">/;
const newWrapper = `<div className={\`flex w-full flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl max-h-[95vh] \${lockedTab ? 'sm:max-w-2xl h-auto' : 'sm:h-[88vh] sm:max-w-4xl'}\`}>`;

if (content.match(regex)) {
    content = content.replace(regex, newWrapper);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed modal sizing classes');
} else {
    console.log('Regex did not match for modal sizing classes');
}
