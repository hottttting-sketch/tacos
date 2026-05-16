import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Update status mapping function/logic used in Excel View and Export
// We need to replace it in two places: handleExportExcel and case 'excel'

const oldLabelsPattern = /const statusLabel = \s*\(response\?\.broadcaster_hidden === true \|\| response\?\.agency_hidden === true\) \? '完了' :\s*\(respStatus === 'registered' \|\| respStatus === 'pending'\) \? '素材待ち' :\s*\(respStatus === 'material_ok' \|\| respStatus === 'rewrites'\) \? '修正稿待ち' :\s*\(respStatus === 'rewrite_ok' \|\| respStatus === 'recordings'\) \? '同録待ち' :\s*p\.status === 'requesting' \? '枠出し待ち' : p\.status;/g;

const newLabelsReplacement = `const statusLabel = 
          (response?.broadcaster_hidden === true || response?.agency_hidden === true) ? '非表示' :
          (respStatus === 'registered' || respStatus === 'pending') ? '素材待ち' :
          (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'リライト待ち' :
          (respStatus === 'rewrite_ok' || respStatus === 'recordings') ? '同録待ち' :
          p.status === 'requesting' ? '枠出し待ち' : p.status;`;

if (oldLabelsPattern.test(content)) {
    content = content.replace(oldLabelsPattern, newLabelsReplacement);
    console.log('Updated status labels in Excel/Export logic!');
}

// 2. Update Board View status mapping labels
// Look for lines 1575-1579
const boardStatusPattern = /status: isHidden \? 'completed' :\s*\(respStatus === 'registered' \|\| respStatus === 'pending'\) \? 'materials' :\s*\(respStatus === 'material_ok' \|\| respStatus === 'rewrites'\) \? 'rewrites' :\s*\(respStatus === 'rewrite_ok' \|\| respStatus === 'recordings'\) \? 'recordings' :\s*p\.status === 'requesting' \? 'slots' : p\.status,/;

// Note: Board View uses internal keys like 'materials', 'rewrites'. 
// We should check if we need to change those or just the column titles.
// The user wants the LABELS to be unified.

// 3. Update Board Column Titles
content = content.replace("title: 'リライト待ち'", "title: 'リライト待ち'"); // already same
// Wait, '修正稿待ち' was not used in titles.

// I'll check if there are any '修正稿待ち' left in the file.
content = content.replaceAll('修正稿待ち', 'リライト待ち');
content = content.replaceAll("'完了'", "'非表示'");

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Unified all status labels!');
