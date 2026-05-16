import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const ChatView = ({ activeChannel, fullProfile }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [projectId, setProjectId] = useState(null);
    const scrollRef = useRef(null);
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
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

    const mapDbToUi = (m) => {
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
  };

  useEffect(() => {
    let subscription = null;

    const initChat = async () => {
      try {
        const projs = await api.getProjects();
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
        }
        
        if (chatProj) {
          setProjectId(chatProj.id);
          const dbMsgs = await api.getChatMessages(chatProj.id);
          setMessages(dbMsgs.map(mapDbToUi));

          // Real-time subscription
          subscription = api.subscribeToChat(chatProj.id, (newMsg) => {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, mapDbToUi(newMsg)];
            });
          });
        } else {
          // Fallback if project not found
          setMessages([]);
        }
      } catch (e) {
        console.error('Chat init failed:', e);
      }
    };

    initChat();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [activeChannel, fullProfile?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!projectId) {
      console.error('No projectId found for chat');
      alert('チャットの初期化に失敗しました。ページを更新してください。');
      return;
    }

    const text = inputText;
    setInputText('');

    try {
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
    } catch (e) {
      console.error('Send message failed:', e);
      alert('送信に失敗しました。');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Thread List */}
      <div style={{ width: '360px', backgroundColor: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
           <h3 style={{ fontWeight: '900', fontSize: '1.25rem', marginBottom: '1.25rem', color: '#1e293b' }}>メッセージ</h3>
           <div style={{ position: 'relative' }}>
             <Icons.Board size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
                placeholder="スレッドを検索..." 
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontWeight: '600', outline: 'none' }} 
             />
           </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
           {[
             { name: activeChannel || 'チャット（案件未選択）', last: '最新のメッセージを確認してください。', time: '現在', unread: 0 },
             { name: 'トヨタ新型SUVプロモーション', last: '移動書をご確認ください。', time: '昨日', unread: 0 }
           ].map((thread, i) => (
             <div key={i} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f8fafc', cursor: 'pointer', backgroundColor: i === 0 ? '#f0f9ff' : 'transparent', transition: 'background-color 0.2s' }} className="hover-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                   <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{thread.name}</div>
                   <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>{thread.time}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{thread.last}</div>
                   {thread.unread > 0 && (
                     <div style={{ backgroundColor: 'var(--tacos-red)', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '10px' }}>{thread.unread}</div>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <header style={{ padding: '1.25rem 2rem', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconWrapper size={40} color="#eef2ff" iconColor="#4338ca"><Icons.Chat /></IconWrapper>
              <h3 style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1e293b' }}>{activeChannel ? activeChannel : 'メッセージ一覧'}</h3>
           </div>
           <button style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icons.Settings size={20} /></button>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollBehavior: 'smooth' }}>
           {messages.map(m => (
             <div key={m.id} style={{ 
               alignSelf: m.isMe ? 'flex-end' : m.isSystem ? 'center' : 'flex-start',
               maxWidth: m.isSystem ? '100%' : '75%'
             }}>
               {m.isSystem ? (
                 <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#e2e8f0', padding: '6px 16px', borderRadius: '20px', fontWeight: '700' }}>                      {m.text}
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
                    </div>
               ) : (
                 <>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', textAlign: m.isMe ? 'right' : 'left', fontWeight: '700' }}>{m.sender} • {m.time}</div>
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
                   </div>
                 </>
               )}
             </div>
           ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem 2rem', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
           <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
              <button 
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
              />
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}
              />
              <button 
                onClick={handleSendMessage}
                className="btn-primary" 
                style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <Icons.Send size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
