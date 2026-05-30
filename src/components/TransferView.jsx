import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';
import { getContactNames, MEMBERS } from '../constants/members';

const TransferHistoryModal = ({ item, role = 'station', onClose }) => {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await api.getTransferHistories(item.id);
        if (data && data.length > 0) {
          setHistoryList(data.map(d => ({
            timestamp: new Date(d.created_at).toLocaleString('ja-JP'),
            fileName: d.transfer_file_name || `移動書_${item.name}.pdf`
          })));
        } else {
          // Fallback if no new schema data but old metadata exists
          const oldList = item.history_list || [];
          setHistoryList(oldList.length > 0 ? oldList : Array.from({ length: item.history || 0 }).map((_, i) => ({
            timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toLocaleString('ja-JP'),
            fileName: `移動書_${item.name}_v${item.history - i}.pdf`
          })));
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [item.id]);

  const displayList = historyList;

  return (
    <div className="animate-fade" style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      padding: '20px'
    }}>
       <div style={{ 
          width: '500px', backgroundColor: 'white', borderRadius: '24px', 
          display: 'flex', flexDirection: 'column', overflow: 'hidden', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9'
       }}>
          <header style={{ 
            padding: '20px 24px', borderBottom: '1px solid #f1f3f5', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            backgroundColor: 'white'
          }}>
             <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '950', color: '#1e293b' }}>
                   {role === 'agency' ? '移動書 受信履歴' : '移動書 送信履歴'}
                </h3>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>
                   {item.name}
                </div>
             </div>
             <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
          </header>

          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {displayList.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '800', padding: '20px' }}>
                   履歴情報はありません。
                </div>
             ) : (
                displayList.map((entry, idx) => (
                   <div key={idx} style={{ 
                      padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '16px', 
                      border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px'
                   }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ 
                            fontSize: '11px', 
                            color: role === 'agency' ? '#087f5b' : 'var(--tacos-red)', 
                            fontWeight: '900', padding: '2px 8px', borderRadius: '8px', 
                            backgroundColor: role === 'agency' ? '#ebfbee' : 'rgba(230,0,18,0.04)' 
                         }}>
                            {role === 'agency' ? '受信済み' : '送信済み'} v{displayList.length - idx}
                         </span>
                         <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>
                            {entry.timestamp}
                         </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '800' }}>
                         {entry.fileName || `移動書_v${displayList.length - idx}`}
                      </div>
                   </div>
                ))
             )}
          </div>

          <footer style={{ padding: '16px 24px', borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
             <button onClick={onClose} style={{ 
                padding: '10px 24px', borderRadius: '12px', border: '1px solid #e2e8f0',
                backgroundColor: 'white', color: '#475569', fontSize: '13px', fontWeight: '900',
                cursor: 'pointer'
             }}>
                閉じる
             </button>
          </footer>
       </div>
    </div>
  );
};

const TransferView = ({ role = 'station' }) => {
  const [activeCategory, setActiveCategory] = useState('spot'); // 'spot' or 'time'
  const [transfers, setTransfers] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({}); // 行IDごとのアップロード状態
  const [fileData, setFileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      const filtered = (data || []).filter(p => {
        let currentStatus = p.status || 'planning';
        // 放送局回答済み以降のステータスを表示
        return ['revision', 'ordered', 'confirmed', 'completed'].includes(currentStatus);
      });
      
      setTransfers(filtered.map(p => ({
        id: p.id,
        name: p.name,
        sp: p.sponsor_name,
        ag: p.metadata?.ba || '電通',
        period: p.start_date && p.end_date ? `${p.start_date} 〜 ${p.end_date}` : '期間未定',
        status: (p.status === 'ordered' || p.status === 'confirmed' || p.status === 'completed') ? 'completed' : 'pending',
        history: p.metadata?.transfer_history || 0,
        category: p.metadata?.type === 'time' ? 'time' : 'spot',
        transfer_file: p.metadata?.transfer_file,
        transfer_file_name: p.metadata?.transfer_file_name,
        history_list: p.metadata?.transfer_history_list || [],
        contacts: p.metadata?.contacts || {}
      })));
    } catch (e) {
      console.error('Failed to fetch transfers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    const getUser = async () => {
      const session = await api.getCurrentSession();
      if (session?.user?.email) {
        const profile = await api.getProfileByEmail(session.user.email);
        setCurrentUser(profile);
      }
    };
    getUser();
  }, []);

  const triggerFileInput = (id) => {
    const el = document.getElementById(`transfer_file_input_${id}`);
    if (el) el.click();
  };

  const handleFileChange = async (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const publicUrl = await api.uploadTransferFile(file);
      if (publicUrl) {
        setFileData(prev => ({ ...prev, [id]: { data: publicUrl, name: file.name } }));
        setUploadedFiles(prev => ({ ...prev, [id]: true }));
        alert('移動書ファイルをアップロードしました。送信が可能になります。');
      }
    }
  };

  const handleSend = async (id) => {
    try {
      const item = transfers.find(t => t.id === id);
      const fileObj = fileData[id];
      const fileName = fileObj?.name || `移動書_${item.name}.pdf`;

      // 新テーブルに履歴を追加
      await api.addTransferHistory(id, 'global', fileObj?.data, fileName, '', currentUser?.id);

      // 旧互換性・ステータス更新のため metadata も一部更新
      const p = await api.getProjectById(id);
      await api.updateProject(id, {
        status: 'ordered',
        metadata: {
          ...(p?.metadata || {}),
          transfer_file: fileObj?.data,
          transfer_file_name: fileName
        }
      });
      alert(`移動書データを送信しました。`);
      setUploadedFiles(prev => ({ ...prev, [id]: false }));
      fetchTransfers();
    } catch (e) {
      alert('送信に失敗しました。');
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>読み込み中...</div>;

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>移動書管理</h2>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>契約期間内の素材移動と履歴を管理し、代理店へのデータ送付を行います。</p>
      </header>

      {/* カテゴリスライドボタン */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px', width: 'fit-content', marginBottom: '32px' }}>
         {['spot', 'time'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ 
                padding: '10px 32px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                backgroundColor: activeCategory === cat ? 'white' : 'transparent',
                color: activeCategory === cat ? '#1e293b' : '#64748b',
                boxShadow: activeCategory === cat ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {cat === 'spot' ? 'スポット' : 'タイム'}
            </button>
         ))}
      </div>

      <div className="glass-card" style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
            <tr>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>案件名 / SP/AG</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>契約期間</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>局担</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>ステータス</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>履歴</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = transfers.filter(t => t.category === activeCategory);
              const isKyokutanMember = currentUser && MEMBERS.some(m => m.email === currentUser.email && m.isKyokutan);
              const memberId = currentUser ? MEMBERS.find(m => m.email === currentUser.email)?.id : null;

              return filtered
                .filter(t => {
                  if (isKyokutanMember && memberId) {
                    const stationMap = t.contacts?.stationMap || {};
                    return Object.values(stationMap).some(ids => ids.includes(memberId));
                  }
                  return true;
                })
                .map(t => {
                  const isUserKyokutan = isKyokutanMember;
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 24px' }}>
                         <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>{t.sp} / {t.ag}</div>
                         <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '950' }}>{t.name}</div>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: '14px', color: '#444', fontWeight: '800' }}>
                         {t.period}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                         <div style={{ fontSize: '13px', fontWeight: '800', color: '#495057' }}>
                            {getContactNames(t.contacts?.selectedMemberIds)}
                         </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                         <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '950',
                            padding: '6px 12px', borderRadius: '10px', width: 'fit-content',
                            backgroundColor: t.status === 'completed' ? '#ebfbee' : '#fff9db',
                            color: t.status === 'completed' ? '#087f5b' : '#f08c00'
                         }}>
                            {t.status === 'completed' ? <Icons.Check size={14} /> : <Icons.Clock size={14} />}
                            {t.status === 'completed' ? '確認済' : '確認待ち'}
                         </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                         <button 
                            onClick={() => setHistoryModalItem(t)}
                            className="btn-secondary"
                            style={{ 
                               display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', 
                               borderRadius: '10px', fontSize: '13px', fontWeight: '800'
                            }}
                         >
                            <Icons.History size={16} />
                            詳細
                         </button>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                         {role === 'agency' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                               {t.transfer_file ? (
                                  <button 
                                     onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = t.transfer_file;
                                        a.download = t.transfer_file_name || `移動書_${t.name}`;
                                        a.click();
                                     }}
                                     style={{ 
                                        padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '900',
                                        border: '1.5px solid var(--tacos-red)', backgroundColor: 'white', color: 'var(--tacos-red)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                     }}
                                  >
                                     <Icons.Download size={16} /> 確認・DL
                                  </button>
                               ) : (
                                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800' }}>未送付</span>
                               )}
                            </div>
                         ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                               <input 
                                  id={`transfer_file_input_${t.id}`}
                                  type="file" 
                                  style={{ display: 'none' }} 
                                  onChange={(e) => handleFileChange(e, t.id)}
                                />
                               {!isUserKyokutan && (
                                 <>
                                   <button 
                                      onClick={() => triggerFileInput(t.id)}
                                      title="移動書をアップロード"
                                      style={{ 
                                         padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
                                         backgroundColor: uploadedFiles[t.id] ? '#ebfbee' : 'white',
                                         color: uploadedFiles[t.id] ? '#087f5b' : '#64748b',
                                         display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s',
                                         fontWeight: '900', fontSize: '13px'
                                      }}
                                   >
                                      <Icons.Upload size={16} /> 移動書UP
                                   </button>
                                   <button 
                                      disabled={!uploadedFiles[t.id]}
                                      onClick={() => handleSend(t.id)}
                                      style={{ 
                                         padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '900',
                                         border: 'none',
                                         backgroundColor: uploadedFiles[t.id] ? 'var(--tacos-red)' : '#f1f5f9',
                                         color: uploadedFiles[t.id] ? 'white' : '#cbd5e1',
                                         cursor: uploadedFiles[t.id] ? 'pointer' : 'not-allowed',
                                         transition: 'all 0.2s'
                                      }}
                                   >
                                      送信
                                   </button>
                                 </>
                               )}
                            </div>
                         )}
                      </td>
                    </tr>
                  );
                });
            })()}
          </tbody>
        </table>
      </div>

      {historyModalItem && (
         <TransferHistoryModal 
           item={historyModalItem} 
           role={role}
           onClose={() => setHistoryModalItem(null)} 
         />
      )}
    </div>
  );
};

export default TransferView;
