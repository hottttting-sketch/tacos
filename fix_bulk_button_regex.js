import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Target the col.items.length > 0 condition wrapping the button
content = content.replace(
  /\{col\.items\.length > 0 && \(\s*<button([\s\S]*?)<\/button>\s*\)\}/,
  "<button$1</button>"
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Successfully removed length condition!');
