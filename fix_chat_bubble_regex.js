import fs from 'fs';

let content = fs.readFileSync('src/components/ChatView.jsx', 'utf8');

const attachmentBlock = `                      {m.text}
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

// Use a regex that is more robust to spacing
const regex = /\{m\.text\}\s*<\/div>/;

if (regex.test(content)) {
    content = content.replace(regex, attachmentBlock);
    fs.writeFileSync('src/components/ChatView.jsx', content, 'utf8');
    console.log('Successfully added attachment block via regex!');
} else {
    console.log('Regex for bubble failed!');
}
