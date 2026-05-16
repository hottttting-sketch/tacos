import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

const mapDbToUiLogic = `const mapDbToUi = (m) => {
    let text = m.message || m.message_text || '';
    let attachment = null;

    // メッセージ本文から添付ファイルを抽出（フォールバック形式）
    if (text.includes('[ATTACHMENT:')) {
      const parts = text.split('[ATTACHMENT:');
      text = parts[0];
      try {
        const jsonStr = parts[1].split(']')[0];
        attachment = JSON.parse(jsonStr);
      } catch (e) {
        console.warn('Failed to parse attachment JSON', e);
      }
    }

    // カラム形式の添付ファイルがある場合はそちらを優先
    if (m.attachment_url) {
      attachment = {
        url: m.attachment_url,
        name: m.attachment_name,
        type: m.attachment_type
      };
    }

    return {
      id: m.id,
      sender: m.user_name || m.sender_name,
      text: text,
      time: formatTime(m.created_at),
      isMe: (m.user_id || m.sender_id) === fullProfile?.id,
      isSystem: m.is_system,
      attachment: attachment
    };
  };`;

const pattern = /const mapDbToUi = \(m\) => \{[\s\S]*?attachment: m\.attachment_url \? \{[\s\S]*?\} : null\s*\}\);/;

if (pattern.test(content)) {
    content = content.replace(pattern, mapDbToUiLogic);
    fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
    console.log('Successfully updated ChatView.jsx to parse attachment fallback!');
} else {
    // Try another pattern if the first one fails
    console.log('mapDbToUi pattern not found!');
}
