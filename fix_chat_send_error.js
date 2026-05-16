import fs from 'fs';

let content = fs.readFileSync('src/utils/api.js', 'utf8');

// Correct the error handling in sendChatMessage
const oldSendLogic = `    try {
      await supabase.from('project_chats').insert([payload]);
    } catch (e) {
      console.warn('[API] sendChatMessage failed to insert with attachment columns, retrying without them...', e);
      // カラムエラーの場合、メッセージ本文のみで再試行（フォールバック済み）
      delete payload.attachment_url;
      delete payload.attachment_name;
      delete payload.attachment_type;
      await supabase.from('project_chats').insert([payload]);
    }`;

const newSendLogic = `    // Supabaseのinsertはエラーをthrowしないため、戻り値で判定する
    const { error } = await supabase.from('project_chats').insert([payload]);
    
    if (error) {
      console.warn('[API] sendChatMessage primary insert failed, retrying with fallback...', error.message);
      // カラムが存在しないなどのエラーの場合、基本フィールドのみで再試行
      const fallbackPayload = {
        project_id: projectId,
        user_id: userId,
        user_name: name,
        message: payload.message
      };
      const { error: error2 } = await supabase.from('project_chats').insert([fallbackPayload]);
      if (error2) {
        console.error('[API] sendChatMessage fallback failed:', error2.message);
        throw new Error(error2.message);
      }
    }`;

if (content.indexOf(oldSendLogic) !== -1) {
    content = content.replace(oldSendLogic, newSendLogic);
    fs.writeFileSync('src/utils/api.js', content, 'utf8');
    console.log('Successfully fixed chat send logic and error handling!');
} else {
    console.log('Send logic block not found!');
}
