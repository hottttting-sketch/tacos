const fs = require('fs');
const file = 'c:\\Users\\hotta_yoshihiko2\\.gemini\\antigravity\\scratch\\tabasco\\src\\components\\PuddingView.jsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);
const fixed = lines.map(line => {
  if (line.includes('isOADate ? "依頼期間内')) {
    return '                  {isOADate ? `依頼期間内（${selectedRequest?.start_date} 〜 ${selectedRequest?.end_date}）の日付のみ選択可能です。` : (isRewriteDeadline ? (selectedRequest?.metadata?.recording_date ? `収録日（${selectedRequest.metadata.recording_date}）以前の日付を選択してください。` : "修正稿〆切日を選択してください") : `素材搬入開始（${selectedRequest?.metadata?.material_start_date || selectedRequest?.metadata?.material_deadline}）以降の日付のみ選択可能です。`)}';
  }
  return line;
});
fs.writeFileSync(file, fixed.join('\n'), 'utf8');
console.log('File patched successfully');
