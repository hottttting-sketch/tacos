import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// The corrupted block pattern
const brokenPattern = /return \{ \s*id: `\${selectedBoardProject\.id}-\${s}`, \s*projectId: selectedBoardProject\.id, \s*name: selectedBoardProject\.name, \s*sponsor: selectedBoardProject\.sponsor_name, \s*\} \s*return \{ \s*id: `\${selectedBoardProject\.id}-\${s}`,/;

const fixedPart = 'return { \n                  id: `${selectedBoardProject.id}-${s}`,';

if (brokenPattern.test(content)) {
    content = content.replace(brokenPattern, fixedPart);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Fixed mapping corruption!');
} else {
    console.log('Broken pattern not found!');
}
