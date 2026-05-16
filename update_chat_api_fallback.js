import fs from 'fs';

let content = fs.readFileSync('src/utils/api.js', 'utf8');

const sendChatMessageLogic = `  sendChatMessage: async (projectId, userId, name, text, attachment = null) => {
    // 添付ファイルがある場合、メッセージ本文の末尾にJSON形式で埋め込む（カラム未定義時のフォールバック用）
    let finalMessage = text;
    if (attachment) {
      const attachmentJson = JSON.stringify({
        url: attachment.url,
        name: attachment.name,
        type: attachment.type
      });
      finalMessage = \`\${text}[ATTACHMENT:\${attachmentJson}]\`;
    }

    const payload = { 
      project_id: projectId, 
      user_id: userId, 
      user_name: name, 
      message: finalMessage 
    };
    
    // カラムが存在する場合のために個別のフィールドもセットしておく
    if (attachment) {
      payload.attachment_url = attachment.url;
      payload.attachment_name = attachment.name;
      payload.attachment_type = attachment.type;
    }

    try {
      await supabase.from('project_chats').insert([payload]);
    } catch (e) {
      console.warn('[API] sendChatMessage failed to insert with attachment columns, retrying without them...', e);
      // カラムエラーの場合、メッセージ本文のみで再試行（フォールバック済み）
      delete payload.attachment_url;
      delete payload.attachment_name;
      delete payload.attachment_type;
      await supabase.from('project_chats').insert([payload]);
    }
    return true;
  },`;

const pattern = /sendChatMessage: async \(projectId, userId, name, text, attachment = null\) => \{[\s\S]*?\},/;

if (pattern.test(content)) {
    content = content.replace(pattern, sendChatMessageLogic);
    fs.writeFileSync('src/utils/api.js', content, 'utf8');
    console.log('Successfully updated api.js with chat attachment fallback!');
} else {
    console.log('sendChatMessage pattern not found!');
}
