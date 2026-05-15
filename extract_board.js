import fs from 'fs';
const lines = fs.readFileSync('src/components/PuddingView.jsx', 'utf8').split('\n');
fs.writeFileSync('board_case.jsx', lines.slice(1447, 1912).join('\n'));
