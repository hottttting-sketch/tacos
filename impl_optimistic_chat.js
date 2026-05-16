import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

// Update handleSendMessage to update UI immediately
const oldHandleSend = `    try {
      await api.sendChatMessage(
        projectId, 
        fullProfile?.id, 
        fullProfile?.name || 'あなた', 
        text
      );
      // Messages will be updated via subscription
    } catch (e) {`;

const newHandleSend = `    try {
      const success = await api.sendChatMessage(
        projectId, 
        fullProfile?.id, 
        fullProfile?.name || 'あなた', 
        text
      );
      
      if (success) {
        // 楽観的UI更新: 送信直後に画面上のリストにメッセージを追加
        const newMsg = {
          id: Math.random().toString(36).substr(2, 9),
          sender: fullProfile?.name || 'あなた',
          text: text,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          attachment: null
        };
        setMessages(prev => [...prev, newMsg]);
        
        // 念のため最新の履歴を再取得（Profile Hack同期用）
        const updatedMsgs = await api.getChatMessages(projectId);
        if (updatedMsgs && updatedMsgs.length > 0) {
           // mapDbToUiを通す
           const mapped = updatedMsgs.map(m => {
              const u = mapDbToUi(m);
              // 自分のメッセージ判定を補強
              if (m.user_id === fullProfile?.id) u.isMe = true;
              return u;
           });
           setMessages(mapped);
        }
      }
    } catch (e) {`;

if (content.indexOf(oldHandleSend) !== -1) {
    content = content.replace(oldHandleSend, newHandleSend);
    fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
    console.log('Implemented Optimistic UI for ChatView!');
} else {
    console.log('handleSendMessage block not found!');
}
