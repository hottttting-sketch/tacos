import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

// 1. Update the default channel name and header title
content = content.replaceAll('サントリープレミアムモルツ夏企画', 'チャット');

// 2. Improve ChatView initialization logic to be more resilient
const oldInitChat = `        const projs = await api.getProjects();
        const channelName = activeChannel || 'チャット';
        let chatProj = projs.find(p => p.name === channelName);`;

const newInitChat = `        const projs = await api.getProjects();
        const channelName = activeChannel || 'チャット';
        // 名前またはIDで検索
        let chatProj = projs.find(p => p.name === channelName || p.title === channelName || p.id === channelName);`;

if (content.indexOf(oldInitChat) !== -1) {
    content = content.replace(oldInitChat, newInitChat);
}

// 3. Update thread list mock to use activeChannel if provided
const oldThreadList = `{ name: activeChannel || 'チャット', last: '修正案をお送りしました。', time: '15:30', unread: 2 },`;
const newThreadList = `{ name: activeChannel || 'チャット', last: '最新のメッセージを確認してください。', time: '現在', unread: 0 },`;

if (content.indexOf(oldThreadList) !== -1) {
    content = content.replace(oldThreadList, newThreadList);
}

fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
console.log('Successfully updated ChatView titles and logic!');
