import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const target = `             }
               return { 
                 id: \`\${selectedBoardProject.id}-\${s}\`, 
                 projectId: selectedBoardProject.id,
                 name: selectedBoardProject.name, 
                 sponsor: selectedBoardProject.sponsor_name, 
             }
               return { `;

const replacement = `             }
               return { `;

if (content.indexOf(target) !== -1) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Fixed mapping corruption with exact match!');
} else {
    console.log('Target string not found!');
}
