import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

content = content.replace(
  /const isHidden = response\?\.broadcaster_hidden === true;/,
  "const isHidden = response?.broadcaster_hidden === true || response?.agency_hidden === true;"
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed broadcaster UI hide logic!');
