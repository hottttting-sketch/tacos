import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Remove the `}` before `case 'slot-management-table':`
content = content.replace(/}\s*case 'slot-management-table':/, "case 'slot-management-table':");

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed slot-management-table brace!');
