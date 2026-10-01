import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/AppLayout.jsx', 'utf8');

// Find the problematic piece:
//       ]
//     }) => (
//                   <NavLink
//                     key={to}
// ...
//                 ))}

const toReplace = `      ]
    }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      \`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${
                        isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }\`
                    }
                  >
                    {label}
                  </NavLink>
                ))}`;

code = code.replace(toReplace, "");
fs.writeFileSync('frontend/src/components/AppLayout.jsx', code);
