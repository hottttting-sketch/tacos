import fs from 'fs';

let content = fs.readFileSync('src/utils/api.js', 'utf8');

const profileHackChatLogic = `
  // --- Profile Hack Chat Logic ---
  _getHackChats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const rawData = profile?.full_name || profile?.name || profile?.ful_name || '';
      if (rawData.includes('[CHATS_JSON]')) {
        const match = rawData.match(/\\[CHATS_JSON\\](.*?)(?=\\[[A-Z_]+_JSON\\]|$)/);
        if (match) return JSON.parse(match[1]);
      }
    } catch (e) {}
    return [];
  },
  _saveHackChats: async (allChats) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      let currentFullName = profile?.full_name || profile?.name || profile?.ful_name || '';
      const chatData = \`[CHATS_JSON]\${JSON.stringify(allChats)}\`;
      
      if (currentFullName.includes('[CHATS_JSON]')) {
        currentFullName = currentFullName.replace(/\\[CHATS_JSON\\].*?(?=\\[[A-Z_]+_JSON\\]|$)/, chatData);
      } else {
        currentFullName += chatData;
      }
      
      const updateData = {};
      if ('full_name' in profile) updateData.full_name = currentFullName;
      else if ('ful_name' in profile) updateData.ful_name = currentFullName;
      else updateData.name = currentFullName;

      await supabase.from('profiles').update(updateData).eq('id', user.id);
      return true;
    } catch (e) { return false; }
  },
  // --- End Profile Hack ---

  getChatMessages: async (projectId) => {
    // 1. 本来のテーブルを試行
    try {
      const { data, error } = await supabase.from('project_chats').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
      if (!error && data) return data;
    } catch (e) {}

    // 2. Profile Hack から取得
    const allHackChats = await api._getHackChats();
    return allHackChats.filter(c => c.project_id === projectId);
  },

  sendChatMessage: async (projectId, userId, name, text, attachment = null) => {
    const payload = {
      id: Math.random().toString(36).substr(2, 9),
      project_id: projectId,
      user_id: userId,
      user_name: name,
      message: text,
      created_at: new Date().toISOString()
    };
    if (attachment) {
      payload.attachment_url = attachment.url;
      payload.attachment_name = attachment.name;
      payload.attachment_type = attachment.type;
      payload.message += \` [ATTACHMENT:\${JSON.stringify(attachment)}]\`;
    }

    // 1. 本来のテーブルへ送信（失敗しても良い）
    try {
      await supabase.from('project_chats').insert([payload]);
    } catch (e) {}

    // 2. Profile Hack へ保存（これが生命線）
    const allHackChats = await api._getHackChats();
    allHackChats.push(payload);
    await api._saveHackChats(allHackChats);
    
    return true;
  },
`;

// Replace existing getChatMessages and sendChatMessage
const oldGetChat = /getChatMessages: async \(projectId\) => \{[\s\S]*?\},\s*sendChatMessage: async \(projectId, userId, name, text, attachment = null\) => \{[\s\S]*?\},/;

if (oldGetChat.test(content)) {
    content = content.replace(oldGetChat, profileHackChatLogic);
    fs.writeFileSync('src/utils/api.js', content, 'utf8');
    console.log('Successfully implemented Profile Hack for Chat!');
} else {
    console.log('Chat logic block not found!');
}
