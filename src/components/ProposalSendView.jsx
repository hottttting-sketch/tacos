import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

import { AnnotationItem } from './RevisionsView';

const ProposalSendView = ({ onNavigateToChat, broadcasterName }) => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentProjects, setSentProjects] = useState({});
  const [broadcasterNameLocal, setBroadcasterNameLocal] = useState(broadcasterName || '札幌テレビ');

  // 改案不可理由入力用のカスタムモーダル状態
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingProp, setRejectingProp] = useState(null);
  const [rejectReason, setRejectReason] = useState('編成上の都合により、これ以上の改案は不可となります。');

  // Annotator states
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [activeStation, setActiveStation] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [memo, setMemo] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [selectedItemForAnnotator, setSelectedItemForAnnotator] = useState(null);

  // 枠明細入力モーダルの状態
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [targetSlotProp, setTargetSlotProp] = useState(null);
  const [slotDetails, setSlotDetails] = useState([]);

  const handleConfirmRevision = async (prop) => {
    const station = broadcasterNameLocal; 
    try {
      const latestRev = await api.getLatestRevision(prop.id, station);
      if (latestRev) {
        setAnnotations(latestRev.annotations || []);
        setMemo(latestRev.memo || '');
        setActiveStation(station);
        setSelectedItemForAnnotator(prop);
        setIsReadOnly(true);
        setShowAnnotator(true);
        return;
      }
    } catch (e) {
      console.warn('Failed to fetch latest revision from DB', e);
    }

    const meta = prop.original?.metadata || {};
    const rev = meta.revisions?.[station];
    if (rev) {
      setAnnotations(rev.annotations || []);
      setMemo(rev.memo || '');
      setActiveStation(station);
      setSelectedItemForAnnotator(prop);
      setIsReadOnly(true);
      setShowAnnotator(true);
    } else {
      alert('改案内容はまだありません。');
    }
  };

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const session = await api.getCurrentSession();
      if (session?.user?.email) {
        const profile = await api.getProfileByEmail(session.user.email);
        setCurrentUser(profile);
      }
    };
    getUser();
  }, []);

  const handleRejectSubmit = async () => {
    if (!rejectingProp || !rejectReason || !currentUser) return;
    
    const prop = rejectingProp;
    const text = `【改案不可連絡】\n理由: ${rejectReason}`;

    try {
      // Send system message to DB
      await api.sendChatMessage(prop.id, currentUser.id, currentUser.name, text, true);

      // Also mark as locked in project metadata
      const projs = await api.getProjects();
      let chatProj = projs.find(p => p.id === prop.id);
      if (chatProj) {
        await api.updateProject(chatProj.id, {
          metadata: {
            ...chatProj.metadata,
            isLocked: true
          }
        });
      }
      
      alert('チャット画面に不可理由を送信しました。');
      setIsRejectModalOpen(false);
      setRejectingProp(null);
      if (onNavigateToChat) {
        onNavigateToChat(prop.name); // Using prop.name as channel identifier for now
      }
    } catch (e) {
      console.error(e);
      alert('送信に失敗しました。');
    }
  };

  const openSlotModal = async (prop) => {
    setTargetSlotProp(prop);
    setIsSlotModalOpen(true);
    try {
      const data = await api.getSlotDetails(prop.id, broadcasterNameLocal);
      const mapped = data.map(s => ({
        id: s.id,
        date: s.broadcast_date,
        startTime: s.start_time.substring(0, 5), // HH:mm
        endTime: s.end_time.substring(0, 5),
        slotId: s.slot_id,
        program: s.program_name
      }));
      setSlotDetails(mapped.length > 0 ? mapped : (prop.original?.metadata?.slotDetails || []));
    } catch (e) {
      setSlotDetails(prop.original?.metadata?.slotDetails || []);
    }
  };

  const handleSaveSlots = async () => {
    if (!targetSlotProp) return;
    try {
      await api.saveSlotDetails(targetSlotProp.id, broadcasterNameLocal, slotDetails);
      
      // バック互換性のために metadata にも保存
      await api.updateProject(targetSlotProp.id, {
        metadata: {
          ...targetSlotProp.original?.metadata,
          slotDetails: slotDetails
        }
      });

      alert('枠明細を保存しました。');
      setIsSlotModalOpen(false);
      fetchProposals();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました。');
    }
  };

  const addSlotRow = () => {
    setSlotDetails([...slotDetails, { id: Date.now(), date: '', startTime: '19:00', endTime: '19:30', slotId: '', program: '' }]);
  };

  const updateSlotRow = (id, field, value) => {
    setSlotDetails(slotDetails.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSlotRow = (id) => {
    setSlotDetails(slotDetails.filter(s => s.id !== id));
  };

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      const station = broadcasterNameLocal;

      // 放送局ごとの個別情報を取得（ファイルパスなど）
      const stationProjects = await api.getProjectStationsByStation(station);
      const stationMap = {};
      stationProjects.forEach(sp => {
        stationMap[sp.project_id] = sp;
      });

      if (data && data.length > 0) {
        const filtered = data.filter(p => {
          let currentStatus = p.status || 'planning';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';
          return currentStatus === 'waiting_for_first_draft' || currentStatus === 'revision';
        });

        const mapped = filtered.map(p => {
          let currentStatus = p.status || 'planning';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';
          const sInfo = stationMap[p.id];
          return {
            id: p.id,
            name: p.name,
            status: currentStatus === 'waiting_for_first_draft' ? '初案待ち' : '改案',
            date: p.created_at ? new Date(p.created_at).toLocaleDateString() : '2026/05/02',
            sponsor: p.sponsor_name,
            agency: p.metadata?.ba || '電通',
            isLocked: p.metadata?.isLocked || false,
            hasFile: !!(sInfo?.proposal_file_path || p.metadata?.proposalFile),
            proposalFileName: sInfo?.proposal_file_name || p.metadata?.proposalFile,
            original: p
          };
        });

        // テスト用：改案確認ボタンの表示確認のためにダミー案件を追加
        const station = broadcasterName || '札幌テレビ';
        const testProp = {
          id: 'test-revision-id',
          name: '【表示確認用】改案確認テストプロジェクト',
          status: '改案',
          date: new Date().toLocaleDateString(),
          sponsor: 'テストスポンサー',
          agency: '開発チーム',
          isLocked: false,
          hasFile: true,
          original: {
            name: '【表示確認用】改案確認テストプロジェクト',
            sponsor_name: 'テストスポンサー',
            metadata: {
              proposalFile: 'test_image.png',
              proposalFileData: [{ 
                name: 'test_image.png', 
                data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' 
              }],
              revisions: {
                [station]: {
                  memo: 'これはテスト用の改案メモです。ボタンの表示確認に使用します。',
                  annotations: [
                    { id: 999, type: 'rect', x: 50, y: 50, width: 200, height: 150, color: '#8b5cf6' },
                    { id: 1000, type: 'text', x: 50, y: 30, text: 'テストアノテーション', color: '#8b5cf6', fontSize: 24 }
                  ],
                  sentAt: new Date().toISOString()
                }
              }
            }
          }
        };
        setProposals([testProp, ...mapped]);
      } else {
        // フォールバック（ダミーデータ）
        const initialProposals = [
          { 
            id: 1, 
            name: 'サントリー プレミアムモルツ 2026夏企画', 
            status: '初案待ち', 
            date: '2026/04/24', 
            sponsor: 'サントリーホールディングス',
            agency: '電通', 
            isLocked: false, 
            hasFile: false,
            original: {
              name: 'サントリー プレミアムモルツ 2026夏企画',
              sponsor_name: 'サントリーホールディングス',
              start_date: '2026/07/01',
              end_date: '2026/08/31',
              area: ['関東', '関西'],
              scale: '3000 GRP',
              tg: 'F2 (35-49歳女性)',
              seconds: '15s',
              ag: '15%'
            }
          },
          { 
            id: 2, 
            name: 'トヨタ 新型SUV プロモーション 進行中', 
            status: '改案', 
            date: '2026/04/25', 
            sponsor: 'トヨタ自動車',
            agency: '博報堂', 
            isLocked: false, 
            hasFile: true,
            original: {
              name: 'トヨタ 新型SUV プロモーション 進行中',
              sponsor_name: 'トヨタ自動車',
              start_date: '2026/09/01',
              end_date: '2026/10/31',
              area: ['全国'],
              scale: '5000 GRP',
              tg: 'All',
              seconds: '30s',
              ag: '15%',
              metadata: {
                proposalFile: 'toyota_suv_plan.pdf',
                proposalFileData: [{ name: 'toyota_suv_plan.pdf', data: 'data:application/pdf;base64,JVBERi0xLjQKJ...' }],
                revisions: {
                  '札幌テレビ': {
                    memo: '素材搬入日の調整をお願いします。15秒版の枠を増やしました。',
                    annotations: [
                      { id: 1, type: 'rect', x: 100, y: 150, width: 200, height: 100, color: '#e11d48' },
                      { id: 2, type: 'text', x: 100, y: 120, text: 'ここを修正してください', color: '#e11d48', fontSize: 20 }
                    ],
                    sentAt: '2026-05-04T12:00:00Z'
                  },
                  'N系': {
                    memo: 'ネットワーク調整後の改案です。ご確認ください。',
                    annotations: [
                      { id: 3, type: 'arrow', x: 300, y: 400, rotation: 0, fontSize: 32, color: '#0ea5e9' }
                    ],
                    sentAt: '2026-05-04T15:00:00Z'
                  }
                }
              }
            }
          }
        ];
        setProposals(initialProposals);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (id) => {
    try {
      await api.updateProject(id, { status: 'revision' });
      alert('初案データを送信しました。改案ステータスに移行します。');
      setSentProjects(prev => ({ ...prev, [id]: true }));
      fetchProposals();
    } catch (e) {
      alert('送信に失敗しました');
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const getStatusStyle = (status) => {
    if (status === '改案') return { bg: '#fff5f5', color: '#fa5252' };
    if (status === '初案待ち') return { bg: '#eef2ff', color: '#4338ca' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>読み込み中...</div>;

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>発注書・初案・改案</h2>
        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>代理店からの発注確認と、各案の送信状況を管理します。</p>
      </header>

      <div style={{ display: 'grid', gap: '12px' }}>
        {proposals.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>表示可能な初案待ち、改案の案件がありません。</div>
        ) : proposals.map(prop => {
          const statusStyle = getStatusStyle(prop.status);
          return (
            <div key={prop.id} className="glass-card" style={{ 
              backgroundColor: 'white', padding: '16px 24px', borderRadius: '18px', border: '1.5px solid #f1f5f9',
              display: 'grid', gridTemplateColumns: '140px 1.5fr 1fr', alignItems: 'center', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', zIndex: 1
            }}>
              
              {/* 1列目: 発注書DL */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                 <button 
                   style={{ 
                     display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px',
                     border: '1.5px solid #ffc9c9', backgroundColor: '#fff5f5', color: 'var(--tacos-red)', 
                     fontSize: '13px', fontWeight: '950', cursor: 'pointer' 
                   }}
                   onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProp(prop);
                      setIsModalOpen(true);
                    }}
                 >
                    <Icons.Download size={16} />
                    発注書DL
                 </button>
              </div>

              {/* 2列目: 案件名とステータス */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontWeight: '950', fontSize: '16px', color: '#1e293b' }}>{prop.name}</span>
                       <span style={{ 
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '950',
                          backgroundColor: statusStyle.bg, color: statusStyle.color
                       }}>
                          {prop.status}
                       </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#94a3b8', fontWeight: '800' }}>
                       <span>{prop.sponsor} / {prop.agency}</span>
                       <span>|</span>
                       <span>最終更新: {prop.date}</span>
                    </div>
                  </div>
              </div>

              {/* 3列目: アクションエリア (改案不可、アップローダー、送信) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', position: 'relative', zIndex: 10 }}>
                  
                  {/* 改案不可ボタン (クリックでチャット連絡) */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setRejectingProp(prop);
                      setIsRejectModalOpen(true);
                    }}
                    style={{ 
                      padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #ffc9c9',
                      backgroundColor: prop.isLocked ? '#fa5252' : 'white', 
                      color: prop.isLocked ? 'white' : '#fa5252',
                      fontSize: '11px', fontWeight: '950', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s', position: 'relative', pointerEvents: 'auto'
                    }}
                  >
                    <Icons.Chat size={14} />
                    改案不可
                  </button>

                  {/* 改案確認ボタン (修正依頼がある場合のみ表示) */}
                  {(() => {
                    const station = broadcasterName || '札幌テレビ';
                    if (prop.original?.metadata?.revisions?.[station]) {
                      return (
                        <button 
                          onClick={() => handleConfirmRevision(prop)}
                          style={{ 
                            padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #8b5cf6',
                            backgroundColor: 'white', color: '#8b5cf6',
                            fontSize: '11px', fontWeight: '950', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <Icons.Edit size={14} />
                          改案確認
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <button 
                    onClick={(e) => { e.stopPropagation(); openSlotModal(prop); }}
                    style={{ 
                      padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                      backgroundColor: 'white', color: '#475569',
                      fontSize: '11px', fontWeight: '950', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#0ea5e9'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <Icons.Table size={14} />
                    枠明細入力
                  </button>

                  <div style={{ height: '24px', width: '1.5px', backgroundColor: '#f1f5f9' }} />

                  {/* アップローダー */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="file" 
                          id={`file-upload-${prop.id}`} 
                          multiple
                          style={{ display: 'none' }} 
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              try {
                                const file = e.target.files[0];
                                const station = broadcasterNameLocal;
                                
                                await api.uploadProposalFile(prop.id, station, file);
                                
                                alert(`ファイル「${file.name}」をアップロードしました。`);
                                setSentProjects(prev => ({ ...prev, [prop.id]: false }));
                                fetchProposals();
                              } catch (err) {
                                console.error(err);
                                alert('アップロードに失敗しました');
                               }
                             }
                           }}
                         />
                        <label 
                          htmlFor={`file-upload-${prop.id}`}
                          style={{ 
                            padding: '10px 20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', 
                            backgroundColor: prop.hasFile ? '#ebfbee' : 'white', color: prop.hasFile ? '#087f5b' : '#475569',
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: '950', transition: 'all 0.2s',
                            boxShadow: prop.hasFile ? 'none' : '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                          title="局案・明細アップロード"
                        >
                           <Icons.Upload size={16} />
                           <span>{prop.hasFile ? '局案・明細UP済' : '局案・明細UP'}</span>
                        </label>
                     </div>
                     {prop.original?.metadata?.proposalFile && (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                         {prop.original.metadata.proposalFile.split(',').map((fileName, fIdx) => (
                           <div key={fIdx} style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <Icons.FileText size={12} />
                             <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }} title={fileName.trim()}>
                               {fileName.trim()}
                             </span>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>

                  {/* 送信ボタン */}
                  {(() => {
                    const isSendDisabled = !prop.hasFile || !!sentProjects[prop.id];
                    return (
                      <button 
                        className={!isSendDisabled ? "btn-primary" : ""} 
                        disabled={isSendDisabled}
                        onClick={() => handleSend(prop.id)}
                        style={{ 
                          padding: '12px 28px', borderRadius: '14px', fontSize: '14px', fontWeight: '900',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          backgroundColor: !isSendDisabled ? 'var(--tacos-red)' : '#e2e8f0',
                          color: !isSendDisabled ? 'white' : '#94a3b8',
                          cursor: !isSendDisabled ? 'pointer' : 'not-allowed',
                          border: 'none',
                          boxShadow: !isSendDisabled ? '0 4px 12px rgba(230,0,18,0.2)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        送信
                      </button>
                    );
                  })()}
              </div>

            </div>
          );
        })}
      </div>

      {isModalOpen && selectedProp && (
        <div className="animate-fade" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '28px', width: '95%', maxWidth: '900px', height: '90vh', maxHeight: '850px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', pointerEvents: 'all' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b' }}>発注書プレビュー</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>×</button>
            </div>

            {/* Modal Body: A scrollable container holding the complete 'A4' style paper design */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', paddingBottom: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', padding: '40px', color: '#000000', fontFamily: '"Noto Sans JP", sans-serif', fontSize: '14px', lineHeight: '1.6', position: 'relative' }}>
                
                {/* No and Date */}
                <div style={{ textAlign: 'right', fontSize: '14px', marginBottom: '10px' }}>
                  <div>No. {selectedProp.original?.id || '20260504001'}</div>
                  <div>発注日：{selectedProp.date || '2026年5月4日'}</div>
                </div>

                {/* Title */}
                <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: 'bold', margin: '0 0 20px 0', letterSpacing: '4px' }}>発 注 書</h1>
                <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', margin: '0 0 24px 0' }}>{selectedProp.station || selectedProp.original?.station || '放送局'} 御中</h2>

                {/* Left greeting & right addressee details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px' }}>下記のとおり、発注致します。</div>
                  </div>
                  <div style={{ textAlign: 'left', fontSize: '14px', width: '220px' }}>
                    <div>社名：{selectedProp.agency || '電通'}</div>
                    <div>〒 105-7001</div>
                    <div>住所：東京都港区東新橋</div>
                    <div>担当：{selectedProp.original?.metadata?.contact_person || '高橋'}</div>
                  </div>
                </div>

                {/* Main 2-column Layout for tables */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
                  {/* Left block (Info grid) */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '110px', backgroundColor: '#333333', color: '#ffffff', padding: '10px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>スポンサー名</td>
                          <td style={{ padding: '10px', border: '1px solid #000', fontSize: '13px' }}>{selectedProp.original?.sponsor_name || '未設定スポンサー'}</td>
                        </tr>
                        <tr>
                          <td style={{ backgroundColor: '#333333', color: '#ffffff', padding: '10px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>案件名</td>
                          <td style={{ padding: '10px', border: '1px solid #000', fontSize: '13px' }}>{selectedProp.original?.name || selectedProp.name}</td>
                        </tr>
                        <tr>
                          <td style={{ backgroundColor: '#333333', color: '#ffffff', padding: '10px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>放送期間</td>
                          <td style={{ padding: '10px', border: '1px solid #000', fontSize: '13px' }}>{selectedProp.original?.start_date || '2026/07/01'} {selectedProp.original?.end_date ? `〜 ${selectedProp.original.end_date}` : ''}</td>
                        </tr>
                        <tr>
                          <td style={{ backgroundColor: '#333333', color: '#ffffff', padding: '10px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>初案〆切</td>
                          <td style={{ padding: '10px', border: '1px solid #000', fontSize: '13px' }}>{selectedProp.original?.metadata?.deadline || '2026/05/20'}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Total Amount Box */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '110px', backgroundColor: '#333333', color: '#ffffff', padding: '12px 10px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #000', textAlign: 'center' }}>発注金額</td>
                          <td style={{ padding: '12px 10px', border: '1px solid #000', fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}>
                            {selectedProp.original?.metadata?.order_amount || '2,000,000'} 円（税別）
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right block: Order Conditions Table */}
                  <div style={{ flex: 1.2 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#333333', color: '#ffffff' }}>
                          <th style={{ width: '140px', padding: '8px', fontSize: '13px', border: '1px solid #000', textAlign: 'center' }}>発注項目</th>
                          <th style={{ padding: '8px', fontSize: '13px', border: '1px solid #000', textAlign: 'center' }}>適用条件</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const baseRows = [
                            { lbl: '発注コスト', val: selectedProp.original?.metadata?.order_cost || '2,000,000 円' },
                            { lbl: '発注PRP', val: selectedProp.original?.metadata?.order_prp || '100 PRP' },
                            { lbl: 'サービスPRP', val: selectedProp.original?.metadata?.service_prp || '10 PRP' },
                            { lbl: '秒数', val: selectedProp.original?.seconds || selectedProp.original?.metadata?.seconds || '15s' }
                          ];
                          const indices = selectedProp.original?.metadata?.indices && Array.isArray(selectedProp.original.metadata.indices)
                            ? selectedProp.original.metadata.indices
                            : (typeof selectedProp.original?.metadata?.indices === 'string'
                                ? selectedProp.original.metadata.indices.split(',').map(s => s.trim())
                                : ['F1', 'M1']
                              );
                          const finalRows = [...baseRows];
                          indices.forEach(idxItem => {
                            if (idxItem) {
                              const label = typeof idxItem === 'object' && idxItem.label ? idxItem.label : String(idxItem);
                              finalRows.push({ lbl: label, val: 'N％' });
                            }
                          });
                          while (finalRows.length < 8) {
                            finalRows.push({ lbl: '', val: '' });
                          }
                          return finalRows.map((row, idx) => (
                            <tr key={idx} style={{ height: '36px' }}>
                              <td style={{ padding: '8px', border: '1px solid #000', fontSize: '13px', fontWeight: 'bold', backgroundColor: row.lbl ? '#fafafa' : '#ffffff' }}>{row.lbl}</td>
                              <td style={{ padding: '8px', border: '1px solid #000', fontSize: '13px' }}>{row.val}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom section (Remarks) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#333333', color: '#ffffff' }}>
                      <th style={{ padding: '8px', fontSize: '13px', border: '1px solid #000', textAlign: 'center' }}>備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: '100px' }}>
                      <td style={{ padding: '12px', border: '1px solid #000', fontSize: '13px', verticalAlign: 'top' }}>
                        <div>期間比：{selectedProp.original?.metadata?.period_ratio || '100%'}</div>
                        <div style={{ marginTop: '8px', color: '#666' }}>{selectedProp.original?.metadata?.remarks || '特記事項なし'}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1.5px solid #f1f5f9', paddingTop: '12px' }}>
              {(() => {
                const station = broadcasterName || '札幌テレビ';
                if (selectedProp.original?.metadata?.revisions?.[station]) {
                  return (
                    <button 
                      onClick={() => {
                        setIsModalOpen(false);
                        handleConfirmRevision(selectedProp);
                      }}
                      style={{ 
                        padding: '10px 24px', borderRadius: '12px', border: '1.5px solid #8b5cf6',
                        backgroundColor: 'white', color: '#8b5cf6',
                        fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <Icons.Edit size={16} />
                      改案確認
                    </button>
                  );
                }
                return null;
              })()}
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}>閉じる</button>
            </div>

          </div>
        </div>
      )}

      {showAnnotator && selectedItemForAnnotator && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button onClick={() => setShowAnnotator(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><Icons.ArrowLeft size={24} /></button>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>書き込み改案の確認 : {activeStation}</h3>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowAnnotator(false)} style={{ height: '40px', padding: '0 24px', borderRadius: '10px', fontSize: '12px', fontWeight: '950', backgroundColor: '#1e293b', color: 'white', border: 'none', cursor: 'pointer' }}>閉じる</button>
            </div>
          </header>
          
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, backgroundColor: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px', overflow: 'auto' }}>
              <div 
                style={{ 
                  width: '100%', height: '6000px', backgroundColor: 'white', position: 'relative', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)', cursor: 'default'
                }}
              >
                {selectedItemForAnnotator.original?.metadata?.proposalFileData ? (() => {
                  const activeFile = selectedItemForAnnotator.original.metadata.proposalFileData[0];
                  const fileUrl = activeFile.data;
                  const isBase64Image = fileUrl.startsWith('data:image/');
                  const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('/pdf') || fileUrl.includes('application/pdf');
                  
                  if (isBase64Image) {
                    return <img src={fileUrl} alt="Proposal" style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', inset: 0, userSelect: 'none', pointerEvents: 'none' }} />;
                  } else if (isPdf) {
                    const pdfUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
                    return <iframe src={pdfUrl} title="Proposal" scrolling="no" style={{ width: '100%', height: '6000px', position: 'absolute', inset: 0, border: 'none', pointerEvents: 'none', overflow: 'hidden' }} />;
                  } else {
                    return <img src={fileUrl} alt="Proposal" style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', inset: 0, userSelect: 'none', pointerEvents: 'none' }} />;
                  }
                })() : (
                  <div style={{ padding: '60px', opacity: 0.8 }}>プレビューファイルがありません</div>
                )}

                {annotations.map((ann) => (
                  <AnnotationItem 
                    key={ann.id} 
                    ann={ann} 
                    onRemove={() => {}} 
                    onUpdate={() => {}} 
                    isReadOnly={true}
                  />
                ))}
              </div>
            </div>

            <div style={{ width: '380px', borderLeft: '1.5px solid #cbd5e1', backgroundColor: 'white', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>修正依頼内容メモ</h4>
                <textarea
                  readOnly={true}
                  style={{ width: '100%', height: '220px', padding: '16px', borderRadius: '16px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none', backgroundColor: '#f8fafc' }}
                  value={memo}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>配置済みのアノテーション</h4>
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {annotations.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>アノテーションがありません</div>
                  ) : (
                    annotations.map((ann) => (
                      <div key={ann.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800' }}>{ann.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.glass-card:hover { transform: translateY(-2px); border-color: #e2e8f0; }`}</style>
      {/* 改案不可理由入力モーダル */}
      {isRejectModalOpen && (
        <div className="animate-modal-backdrop" style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
           <div className="animate-modal-enter" style={{ 
             width: '100%', maxWidth: '480px', backgroundColor: 'white', 
             borderRadius: '32px', padding: '32px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
             border: '1px solid rgba(255,255,255,0.2)'
           }}>
              <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b', marginBottom: '8px' }}>改案不可の連絡</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', fontWeight: '500' }}>
                {rejectingProp?.name} について、これ以上の改案が不可能な理由を入力してください。内容はチャットで代理店に送信されます。
              </p>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '900', color: '#1e293b', display: 'block', marginBottom: '8px' }}>理由・メッセージ</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ 
                    width: '100%', height: '120px', padding: '16px', borderRadius: '16px', 
                    border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none',
                    backgroundColor: '#f8fafc', fontWeight: '500'
                  }}
                  placeholder="理由を入力してください..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '14px', border: '1.5px solid #e2e8f0',
                    backgroundColor: 'white', color: '#64748b', fontSize: '14px', fontWeight: '900', cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleRejectSubmit}
                  style={{ 
                    flex: 2, padding: '12px', borderRadius: '14px', border: 'none',
                    backgroundColor: 'var(--tacos-red)', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                    boxShadow: '0 8px 15px rgba(226, 28, 38, 0.2)'
                  }}
                >
                  不可理由を送信
                </button>
              </div>
           </div>
        </div>
      )}
      {/* 枠明細入力モーダル */}
      {isSlotModalOpen && targetSlotProp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '28px', width: '95%', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b', margin: 0 }}>枠明細データの入力</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>放送日、時間、枠ID、番組名を入力してください。代理店側のスケジュール表に反映されます。</p>
              </div>
              <button onClick={() => setIsSlotModalOpen(false)} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>放送日</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>開始時間</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>終了時間</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>枠ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>番組名</th>
                    <th style={{ padding: '12px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {slotDetails.map((slot) => (
                    <tr key={slot.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>
                        <input type="date" value={slot.date} onChange={(e) => updateSlotRow(slot.id, 'date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="time" value={slot.startTime} onChange={(e) => updateSlotRow(slot.id, 'startTime', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="time" value={slot.endTime} onChange={(e) => updateSlotRow(slot.id, 'endTime', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="text" placeholder="例: S001" value={slot.slotId} onChange={(e) => updateSlotRow(slot.id, 'slotId', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="text" placeholder="例: ニュース7" value={slot.program} onChange={(e) => updateSlotRow(slot.id, 'program', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => removeSlotRow(slot.id)} style={{ border: 'none', background: 'none', color: '#fa5252', cursor: 'pointer' }}><Icons.Trash size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={addSlotRow}
                style={{ 
                  marginTop: '16px', padding: '10px 20px', borderRadius: '12px', border: '1.5px dashed #cbd5e1', 
                  backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: '900', 
                  width: '100%', cursor: 'pointer' 
                }}
              >
                + 枠を追加
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1.5px solid #f1f5f9', paddingTop: '20px' }}>
              <button onClick={() => setIsSlotModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '14px', border: 'none', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}>キャンセル</button>
              <button onClick={handleSaveSlots} style={{ padding: '12px 48px', borderRadius: '14px', border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(230,0,18,0.2)' }}>枠明細を保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalSendView;
