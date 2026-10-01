import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

// 1. Filter tabs based on role - hide X-Dropped from resellers
// Find the isStaff definition to understand auth
const hasIsReseller = code.includes('isReseller');
console.log('hasIsReseller:', hasIsReseller);

// Check what auth variables exist  
const authLine = code.match(/const \{[^}]+\} = useAuth\(\)/);
console.log('Auth line:', authLine?.[0]);
