import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

// Ensure the header title ALWAYS shows the activeChannel prop if it exists
const oldHeaderTitle = `<h3 style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1e293b' }}>{activeChannel || 'チャット'}</h3>`;
const newHeaderTitle = `<h3 style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1e293b' }}>{activeChannel ? activeChannel : 'メッセージ一覧'}</h3>`;

if (content.indexOf(oldHeaderTitle) !== -1) {
    content = content.replace(oldHeaderTitle, newHeaderTitle);
}

// Also ensure the left thread list's first item matches the activeChannel perfectly
const oldThreadName = `<div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{thread.name}</div>`;
const newThreadName = `<div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{thread.name}</div>`;
// This part seems fine but let's make sure the array data is dynamic
content = content.replace(
    /{\s*name:\s*activeChannel\s*\|\|\s*'チャット',/,
    "{ name: activeChannel || 'チャット（案件未選択）',"
);

fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
console.log('Final fix applied to ChatView title rendering!');
