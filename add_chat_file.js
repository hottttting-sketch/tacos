import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

// 1. Update mapDbToUi
content = content.replace(
    /const mapDbToUi = \(m\) => \(\{[\s\S]*?\}\);/,
    `const mapDbToUi = (m) => ({
    id: m.id,
    sender: m.user_name || m.sender_name,
    text: m.message || m.message_text,
    time: formatTime(m.created_at),
    isMe: (m.user_id || m.sender_id) === fullProfile?.id,
    isSystem: m.is_system,
    attachment: m.attachment_url ? {
      url: m.attachment_url,
      name: m.attachment_name,
      type: m.attachment_type
    } : null
  });`
);

// 2. Add file input ref and handler
const refAndHandler = `  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileAttach = async (e) => {
    const file = e.target.files[0];
    if (!file || !projectId) return;

    try {
      const res = await api.uploadAttachment(file);
      await api.sendChatMessage(
        projectId,
        fullProfile?.id,
        fullProfile?.name || 'あなた',
        '', // メッセージテキストは空
        { url: res.url, name: res.name, type: res.type }
      );
    } catch (err) {
      console.error('File upload failed:', err);
      alert('ファイルのアップロードに失敗しました。');
    }
  };`;

content = content.replace(
    /const scrollRef = useRef\(null\);/,
    refAndHandler
);

// 3. Update the attachment button
content = content.replace(
    /<button style=\{\{ border: 'none', background: 'none', color: '#94a3b8', padding: '8px', cursor: 'pointer' \}\}><Icons\.Link size=\{20\} \/><\/button>/,
    `<button 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: 'none', background: 'none', color: '#94a3b8', padding: '8px', cursor: 'pointer', transition: 'color 0.2s' }} 
                className="hover-icon"
              >
                <Icons.Link size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileAttach} 
              />`
);

// 4. Update the message bubble to show attachments
const attachmentJSX = `
                    <div style={{ 
                      padding: '1rem 1.25rem', borderRadius: '20px', 
                      backgroundColor: m.isMe ? 'var(--tacos-red)' : 'white', 
                      color: m.isMe ? 'white' : '#1e293b',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      border: m.isMe ? 'none' : '1.5px solid #f1f3f5',
                      fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.5',
                      borderBottomRightRadius: m.isMe ? '4px' : '20px',
                      borderBottomLeftRadius: m.isMe ? '20px' : '4px'
                    }}>
                      {m.text}
                      {m.attachment && (
                        <div style={{ 
                          marginTop: m.text ? '12px' : '0',
                          padding: '12px',
                          backgroundColor: m.isMe ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: m.isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0'
                        }}>
                          <Icons.FileText size={24} color={m.isMe ? 'white' : '#64748b'} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.attachment.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                              {m.attachment.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                            </div>
                          </div>
                          <a 
                            href={m.attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download={m.attachment.name}
                            style={{ 
                              color: m.isMe ? 'white' : '#4338ca',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Icons.Download size={18} />
                          </a>
                        </div>
                      )}
                    </div>`;

content = content.replace(
    /<div style=\{\{ \s*padding: '1rem 1\.25rem',[\s\S]*?borderBottomLeftRadius: m\.isMe \? '20px' : '4px' \s*\}\}>\s*\{m\.text\}\s*<\/div>/,
    attachmentJSX
);

fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
console.log('Added file attachment support to ChatView!');
