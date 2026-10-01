import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/UserEditor.jsx', 'utf8');

// Replace the options in UserEditor
code = code.replace(
  /<option value="What is your pet's name\?">What is your pet's name\?<\/option>[\s\S]*?<option value="What was the make of your first car\?">What was the make of your first car\?<\/option>/,
  `<option value="What is your favorite color?">What is your favorite color?</option>
                          <option value="What is your pet's name?">What is your pet's name?</option>
                          <option value="In what city were you born?">In what city were you born?</option>`
);

fs.writeFileSync('frontend/src/components/UserEditor.jsx', code);
