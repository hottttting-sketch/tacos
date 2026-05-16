import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Update status mapping logic (Excel & Export)
const oldLabelsPattern = /const statusLabel = \s*\(response\?\.broadcaster_hidden === true \|\| response\?\.agency_hidden === true\) \? '非表示' :\s*\(respStatus === 'registered' \|\| respStatus === 'pending'\) \? '素材待ち' :\s*\(respStatus === 'material_ok' \|\| respStatus === 'rewrites'\) \? 'リライト待ち' :\s*\(respStatus === 'rewrite_ok' \|\| respStatus === 'recordings'\) \? '同録待ち' :\s*p\.status === 'requesting' \? '枠出し待ち' : p\.status;/g;

const newLabelsReplacement = `const statusLabel = 
          p.status === 'cancelled' ? '取消済' :
          (response?.broadcaster_hidden === true || response?.agency_hidden === true) ? '非表示' :
          (respStatus === 'registered' || respStatus === 'pending') ? '素材待ち' :
          (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'リライト待ち' :
          (respStatus === 'rewrite_ok' || respStatus === 'recordings') ? '同録待ち' :
          p.status === 'requesting' ? '枠出し待ち' : p.status;`;

if (oldLabelsPattern.test(content)) {
    content = content.replace(oldLabelsPattern, newLabelsReplacement);
    console.log('Added 取消済 status to Excel/Export logic!');
}

// 2. Align Board View status mapping (though cancelled items are currently filtered out)
// If the user wants '取消済' in '各UI', we should probably allow them in Excel View at least.
// Board View usually filters them out to keep it clean, but I'll ensure the mapping is there if they appear.

// 3. Ensure cancelled projects are not filtered out of Excel View
// Currently they are NOT filtered out in the loop: projects.forEach(p => { ... })
// So they should appear in Excel View now with the correct label.

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Successfully added 取消済 status!');
