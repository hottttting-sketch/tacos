import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Use regex to be more forgiving with whitespace
content = content.replace(/case 'board':\s+if \(role === 'agency' && !selectedBoardProject\) {/, "case 'board': {\n        if (role === 'agency' && !selectedBoardProject) {");

content = content.replace(/case 'excel':\s+const filteredData = \[/, "}\n      case 'excel': {\n        const filteredData = [");

content = content.replace(/case 'bulk-change-cancel':\s+return \(/, "}\n\n      case 'bulk-change-cancel': {\n        return (");

content = content.replace(/case 'copy-project':\s+if \(selectedCopySource\) {/, "}\n\n      case 'copy-project': {\n        if (selectedCopySource) {");

content = content.replace(/case 'slot-registration':\s+if \(!selectedRequest\) {/, "}\n\n      case 'slot-registration': {\n        if (!selectedRequest) {");

content = content.replace(/case 'slot-move-suspended':\s+const slotMoveProjects = projects\.filter\(p => {/, "}\n\n      case 'slot-move-suspended': {\n        const slotMoveProjects = projects.filter(p => {");

content = content.replace(/case 'calendar':\s+return \(/, "}\n\n      case 'calendar': {\n        return (");

content = content.replace(/case 'select-stations':\s+const networks = \['N系', 'J系', 'CX系', 'EX系', 'TX系', '独U'\];/, "}\n\n      case 'select-stations': {\n        const networks = ['N系', 'J系', 'CX系', 'EX系', 'TX系', '独U'];");

content = content.replace(/case 'ba-settings':\s+return \(/, "}\n\n      case 'ba-settings': {\n        return (");

content = content.replace(/case 'manual':\s+return \(/, "}\n\n      case 'manual': {\n        return (");

content = content.replace(/default:\s+return renderDashboard\(\);/, "}\n      default:\n        return renderDashboard();");

// Fix the missing divs
const missingDivsRegex = /([\s\S]*)\)\s*}\)\s*}\s*\)\)\s*}\s*<\/div>/;
// Wait, regex might be too dangerous if it matches wrong place.
// Let's replace the exact line 1904-1907 by looking for `Check size={12}`
const blockToReplace = `                                               <Check size={12} /> 送信
                                            </button>
                                         </div>
                                     </div>
                                   )
                                )}
                      ))}
                   </div>`;

const newBlock = `                                               <Check size={12} /> 送信
                                            </button>
                                         </div>
                                     </div>
                                   )
                                )}
                            </div>
                         </div>
                      ))}
                   </div>`;

content = content.replace(blockToReplace, newBlock);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log("Regex replacements done!");
