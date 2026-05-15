import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Close 'ba-settings' before 'manual'
content = content.replace(/case 'manual':/, "}\n      case 'manual':");

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed manual brace!');
