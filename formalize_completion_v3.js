import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const targetStr = "if (confirm('この案件を非表示にしますか？'))";
const replacement = "if (confirm('この案件を完了し、非表示にしますか？'))";

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    
    // Also insert the status update call
    const insertAfter = "try {";
    const statusUpdateCall = "\n                                                // 正式にステータスを完了（completed）に更新\n                                                await api.updateProjectStatus(item.projectId || item.id, 'completed');\n";
    
    // We need to be careful to only replace the one inside the Hide button logic
    // I'll search for the whole block again but with flexible whitespace
    const hideBlockRegex = /if \(confirm\('この案件を完了し、非表示にしますか？'\)\) \{\s*try \{/;
    content = content.replace(hideBlockRegex, "if (confirm('この案件を完了し、非表示にしますか？')) {\n                                              try {\n                                                // 正式にステータスを完了（completed）に更新\n                                                await api.updateProjectStatus(item.projectId || item.id, 'completed');");

    // Also update the alert
    content = content.replace("alert('案件を非表示にしました。');", "alert('案件を完了し、非表示にしました。');");

    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Successfully formalized project completion with flexible search!');
} else {
    console.log('Target string not found!');
}
