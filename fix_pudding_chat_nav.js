import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Replace internal setActiveChatChannel with external onNavigateToChat
const oldBoardChat = "onClick={(e) => { e.stopPropagation(); setActiveChatChannel(item.name); setActiveTab('chat'); }}";
const newBoardChat = "onClick={(e) => { e.stopPropagation(); if (typeof onNavigateToChat === 'function') { onNavigateToChat(item.name); } else { setActiveChatChannel(item.name); setActiveTab('chat'); } }}";

if (content.indexOf(oldBoardChat) !== -1) {
    content = content.replace(oldBoardChat, newBoardChat);
}

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Successfully fixed chat navigation in Board View!');
