import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Target the specific currentStatus logic for agency
content = content.replace(
  /else if \(resp\.status === 'rewrite_ok' \|\| resp\.status === 'recordings'\) currentStatus = 'recordings';\s*}/,
  "else if (resp.status === 'rewrite_ok' || resp.status === 'recordings') currentStatus = 'recordings';\n                \n                if (resp.response_data?.agency_hidden === true) currentStatus = 'completed';\n             }"
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed agency_hidden mapping!');
