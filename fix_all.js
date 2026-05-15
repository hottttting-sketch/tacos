import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Fix missing closing divs in the board items loop
const missingDivsTarget = `                                   )
                                )}
                      ))}
                   </div>`;

const missingDivsReplacement = `                                   )
                                )}
                            </div>
                         </div>
                      ))}
                   </div>`;

content = content.replace(missingDivsTarget, missingDivsReplacement);

// 2. Wrap case blocks in braces to fix Identifier collision syntax error
const casesToWrap = [
  { start: `case 'board':\n        if (role === 'agency' && !selectedBoardProject) {`, replacement: `case 'board': {\n        if (role === 'agency' && !selectedBoardProject) {` },
  { start: `case 'excel':\n        const filteredData = [`, replacement: `}\n        case 'excel': {\n        const filteredData = [` },
  { start: `case 'bulk-change-cancel':\n        return (`, replacement: `}\n\n      case 'bulk-change-cancel': {\n        return (` },
  { start: `case 'copy-project':\n        if (selectedCopySource) {`, replacement: `}\n\n      case 'copy-project': {\n        if (selectedCopySource) {` },
  { start: `case 'slot-registration':\n        if (!selectedRequest) {`, replacement: `}\n\n\n      case 'slot-registration': {\n        if (!selectedRequest) {` },
  { start: `case 'slot-move-suspended':\n        const slotMoveProjects = projects.filter(p => {`, replacement: `}\n\n      case 'slot-move-suspended': {\n        const slotMoveProjects = projects.filter(p => {` },
  { start: `case 'calendar':\n        return (`, replacement: `}\n\n      case 'calendar': {\n        return (` },
  { start: `case 'select-stations':\n        const networks = ['N系', 'J系', 'CX系', 'EX系', 'TX系', '独U'];`, replacement: `}\n\n      case 'select-stations': {\n        const networks = ['N系', 'J系', 'CX系', 'EX系', 'TX系', '独U'];` },
  { start: `case 'ba-settings':\n        return (`, replacement: `}\n\n      case 'ba-settings': {\n        return (` },
  { start: `case 'manual':\n        return (`, replacement: `}\n\n      case 'manual': {\n        return (` },
  { start: `      default:\n        return renderDashboard();`, replacement: `}\n      default:\n        return renderDashboard();` }
];

casesToWrap.forEach(c => {
  content = content.replace(c.start, c.replacement);
});

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed JSX tags and switch case scopes!');
