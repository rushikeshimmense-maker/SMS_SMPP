const fs = require('fs');
let path = 'src/components/UserEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

// I will just replace the exact chunk
const target = `<h2 className="text-[17px] font-extrabold tracking-tight text-ink">{lockedTab === 'settings' ? 'Settings' : 'Profile'} - @{user.userId}</h2>
              <p className="text-[12px] text-gray-400">{user.companyName}  {user.role}</p>`;

const newHeader = `<h2 className="text-[18px] font-extrabold tracking-tight text-ink">
              {lockedTab === 'settings' ? 'Global Settings' : 'Basic Profile'}
            </h2>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">
              {user.companyName} <span className="mx-1.5 text-gray-300">|</span> @{user.userId}
            </p>`;

// Because of the special character, I will use indexOf
let startIndex = content.indexOf('<h2 className="text-[17px] font-extrabold tracking-tight text-ink">');
if (startIndex !== -1) {
    let endIndex = content.indexOf('</p>', startIndex);
    if (endIndex !== -1) {
        let before = content.substring(0, startIndex);
        let after = content.substring(endIndex + 4);
        content = before + newHeader + after;
        fs.writeFileSync(path, content);
        console.log('Successfully updated modal header via index match');
    } else {
        console.log('Could not find </p> after header');
    }
} else {
    console.log('Could not find header start');
}
