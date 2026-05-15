import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// We need to close 'select-stations' and open 'ba-settings' properly
content = content.replace(/case 'ba-settings':\s+const agencyOrgs =/, "}\n      case 'ba-settings': {\n        const agencyOrgs =");

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed ba-settings!');
