import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Remove the `}` before `default:`
content = content.replace(/}\s*default:/, "default:");

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed default brace!');
