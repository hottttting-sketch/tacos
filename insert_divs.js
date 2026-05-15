import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');
const lines = content.split('\n');

lines.splice(1905, 0, '                            </div>\n                         </div>');

fs.writeFileSync('src/components/PuddingView.jsx', lines.join('\n'), 'utf8');
console.log('Inserted missing divs!');
