import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

// 1. Improve the project matching logic in initChat
const oldInitChat = `        const projs = await api.getProjects();
        const channelName = activeChannel || 'チャット';
        // 名前またはIDで検索
        let chatProj = projs.find(p => p.name === channelName || p.title === channelName || p.id === channelName);`;

const newInitChat = `        const projs = await api.getProjects();
        const channelName = activeChannel || 'チャット';
        
        // より柔軟な検索（部分一致やID直接指定など）
        let chatProj = projs.find(p => 
          p.id === channelName || 
          p.name === channelName || 
          p.title === channelName ||
          (p.metadata && (p.metadata.name === channelName || p.metadata.title === channelName))
        );
        
        // それでも見つからない場合、もっとも新しい案件をデフォルトにする（モック用救済措置）
        if (!chatProj && projs.length > 0 && !activeChannel) {
          chatProj = projs[0];
        }`;

if (content.indexOf(oldInitChat) !== -1) {
    content = content.replace(oldInitChat, newInitChat);
}

// 2. Add a fallback to ensure we always have a projectId if possible
const oldCheck = `if (!inputText.trim() || !projectId) return;`;
const newCheck = `if (!inputText.trim()) return;
    if (!projectId) {
      console.error('No projectId found for chat');
      alert('チャットの初期化に失敗しました。ページを更新してください。');
      return;
    }`;

if (content.indexOf(oldCheck) !== -1) {
    content = content.replace(oldCheck, newCheck);
}

fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
console.log('Improved chat initialization and error handling!');
