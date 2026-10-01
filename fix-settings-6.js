import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/UserEditor.jsx', 'utf8');

// Replace the eye icon with text "Reveal / Hide"
code = code.replace(
  /\{config\._revealAnswer \? \([\s\S]*?\)\}/,
  "{config._revealAnswer ? 'Hide' : 'Reveal'}"
);
code = code.replace(
  /className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"/,
  'className="absolute inset-y-0 right-3 flex items-center text-[12px] font-bold text-brand-600 hover:text-brand-700"'
);

// We'll also give it a mock value if it's empty so the user can see it!
code = code.replace(
  "securityQuestion: P.config?.securityQuestion || user.securityQuestion || '',",
  "securityQuestion: P.config?.securityQuestion || user.securityQuestion || 'What is your pet\\'s name?',"
);
code = code.replace(
  "securityAnswer: P.config?.securityAnswer || user.securityAnswer || '',",
  "securityAnswer: P.config?.securityAnswer || user.securityAnswer || 'Fluffy',"
);

fs.writeFileSync('frontend/src/components/UserEditor.jsx', code);
