import fs from 'fs';
const lines = fs.readFileSync('board_case.jsx', 'utf8').split('\n');
let openDivs = 0;
lines.forEach((l, i) => {
  const opens = (l.match(/<div/g) || []).length;
  const closes = (l.match(/<\/div>/g) || []).length;
  openDivs += opens - closes;
  if (opens !== closes || openDivs < 0) {
    console.log(`Line ${i+1}: ${opens} opens, ${closes} closes, total open: ${openDivs} -> ${l.trim().substring(0, 50)}`);
  }
});
console.log('Final open divs: ' + openDivs);
