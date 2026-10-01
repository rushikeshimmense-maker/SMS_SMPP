import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/LoginForm.jsx', 'utf8');

const regex = /<input\s+type="text"\s+placeholder="E\.g\., What is your pet's name\?"\s+value=\{security\.question\}[\s\S]*?\/>/;

const newSelect = `<select
                    value={security.question}
                    onChange={(e) => { setSecurity({ ...security, question: e.target.value }); setErrors({}) }}
                    className="h-[56px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] leading-[20px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-gray-400 appearance-none bg-no-repeat"
                    style={{ backgroundPosition: 'right 16px center', backgroundImage: \`url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")\` }}
                  >
                    <option value="" disabled>Select a security question</option>
                    <option value="What is your favorite color?">What is your favorite color?</option>
                    <option value="What is your pet's name?">What is your pet's name?</option>
                    <option value="In what city were you born?">In what city were you born?</option>
                  </select>`;

if (regex.test(code)) {
  code = code.replace(regex, newSelect);
  fs.writeFileSync('frontend/src/components/LoginForm.jsx', code);
  console.log("Success");
} else {
  console.log("Failed to match regex");
}
