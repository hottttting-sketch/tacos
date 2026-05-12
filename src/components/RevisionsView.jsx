import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import IndexModal from './IndexModal';
import ServiceModal from './ServiceModal';
import { getContactNames, MEMBERS } from '../constants/members';

const RevisionsView = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStationsForDl, setSelectedStationsForDl] = useState([]);
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [activeStation, setActiveStation] = useState(null);
  const [previewingStation, setPreviewingStation] = useState(null);

  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [progressItemAndStation, setProgressItemAndStation] = useState(null);
  const [activeTab, setActiveTab] = useState('stations');

  // Annotator states
  const [annotations, setAnnotations] = useState([]);
  const [memo, setMemo] = useState('');
  const [tool, setTool] = useState('rect');
  const [isReadOnly, setIsReadOnly] = useState(false);

  // カスタム確認モーダル状態
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, station: '', item: null, type: 'decide' });

  // Chat states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const chatEndRef = React.useRef(null);

  // Slot states
  const [allSlots, setAllSlots] = useState([]);

  // Project Station states (for files, etc)
  const [projectStations, setProjectStations] = useState([]);

  // Station Response states
  const [stationResponses, setStationResponses] = useState([]);

  // Persistent station decision states
  const [decidedStations, setDecidedStations] = useState({});

  useEffect(() => {
    // No longer using localStorage for decidedStations to prevent multi-user inconsistency
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      console.log('[UI:RevisionsView] getProjects result:', data);
      if (data && data.length > 0) {
        const filtered = data.filter(p => {
          let currentStatus = p.status || 'planning';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';
          return currentStatus === 'waiting_for_first_draft' || currentStatus === 'revision' || currentStatus === 'ordered';
        });
        console.log('[UI:RevisionsView] Filtered projects (waiting/revision/ordered):', filtered.length);

        const mergedDecidedStations = {};
        filtered.forEach(p => {
          if (p.metadata?.decidedStations) {
            Object.assign(mergedDecidedStations, p.metadata.decidedStations);
          }
        });
        setDecidedStations(mergedDecidedStations);

        setItems(filtered.map(p => {
          let currentStatus = p.status || 'planning';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';

          // Extract selected stations from metadata or project
          let selectedStations = p.metadata?.selectedStations || p.selectedStations || [];
          if (typeof selectedStations === 'string') {
            selectedStations = selectedStations.split(new RegExp('[、,]')).map(s => s.trim()).filter(Boolean);
          }
          if (!Array.isArray(selectedStations) || selectedStations.length === 0) {
            if (p.metadata?.stationResponses) {
              selectedStations = Object.keys(p.metadata.stationResponses);
            } else {
              selectedStations = ['札幌テレビ', '青森放送', 'ミヤギテレビ'];
            }
          }

          return {
            id: p.id,
            name: p.name,
            sponsor: p.sponsor_name,
            currentType: p.metadata?.type === 'time' ? 'タイム' : 'スポット',
            status: currentStatus,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString() : '2026/05/02',
            isDecided: currentStatus === 'ordered',
            selectedStations,
            metadata: p.metadata || {},
            proposalFile: p.metadata?.proposalFile || p.proposalFile || '',
            proposalFileData: p.metadata?.proposalFileData || p.proposalFileData || null,
            originalProject: p,
            start_date: p.start_date || p.metadata?.periods?.[0]?.start || '',
            end_date: p.end_date || p.metadata?.periods?.[0]?.end || '',
            area: p.metadata?.area || []
          };
        }));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Get current user on mount
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



  // Fetch and subscribe to chat
  useEffect(() => {
    if (activeTab === 'chat' && selectedItem) {
      const fetchChat = async () => {
        const data = await api.getChatMessages(selectedItem.id);
        setMessages(data);
      };
      fetchChat();

      const subscription = api.subscribeToChat(selectedItem.id, (newMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [activeTab, selectedItem]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedItem || !currentUser) return;
    const text = chatInput;
    setChatInput('');
    try {
      await api.sendChatMessage(selectedItem.id, currentUser.id, currentUser.name, text);
    } catch (e) {
      console.error(e);
      alert('送信に失敗しました。');
    }
  };

  // Fetch slots for current project
  useEffect(() => {
    if (selectedItem) {
      const fetchSlots = async () => {
        try {
          const data = await api.getSlotDetails(selectedItem.id);
          setAllSlots(data);
        } catch (e) {
          console.error('Failed to fetch slots', e);
        }
      };
      fetchSlots();

      const fetchProjectStations = async () => {
        try {
          const data = await api.getProjectStations(selectedItem.id);
          setProjectStations(data);
        } catch (e) {
          console.error('Failed to fetch project stations', e);
        }
      };
      fetchProjectStations();

      const fetchStationResponses = async () => {
        try {
          const data = await api.getStationResponses(selectedItem.id);
          setStationResponses(data);
        } catch (e) {
          console.error('Failed to fetch station responses', e);
        }
      };
      fetchStationResponses();
    }
  }, [selectedItem]);

  const handleDownload = (station) => {
    setActiveStation(station);
    setPreviewingStation(station);
  };

  const handleRevision = async (station, confirmMode = false) => {
    try {
      const latestRev = await api.getLatestRevision(selectedItem.id, station);
      
      if (latestRev) {
        setAnnotations(latestRev.annotations || []);
        setMemo(latestRev.memo || '');
      } else {
        const oldRev = selectedItem.originalProject?.metadata?.revisions?.[station];
        if (oldRev) {
          setAnnotations(oldRev.annotations || []);
          setMemo(oldRev.memo || '');
        } else {
          setAnnotations([]);
          setMemo('');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsReadOnly(confirmMode);
    setActiveStation(station);
    setShowAnnotator(true);
  };

  const handleSendRevision = async () => {
    if (!currentUser) {
      alert('ユーザー情報が取得できていません。');
      return;
    }

    try {
      await api.createProjectRevision(selectedItem.id, activeStation, annotations, memo, currentUser.id);

      await api.updateProject(selectedItem.id, { 
        status: 'revision'
      });

      alert('改案を送信しました。放送局に通知されます。');
      fetchItems();
      setShowAnnotator(false);
    } catch (e) {
      console.error(e);
      alert('送信に失敗しました。');
    }
  };

  const handleFinalDecision = (item, station) => {
    const key = `${item.id}_${station}`;
    const type = decidedStations[key] ? 'cancel' : 'decide';
    setConfirmModal({ isOpen: true, station, item, type });
  };

  const executeConfirmAction = async () => {
    const { item, station, type } = confirmModal;
    if (!item || !station) return;

    const key = `${item.id}_${station}`;
    const originalProj = item.originalProject || item;
    const currentMeta = originalProj.metadata || {};
    const currentDecided = currentMeta.decidedStations || {};

    try {
      if (type === 'cancel') {
        const nextDecided = { ...currentDecided };
        delete nextDecided[key];
        const nextMeta = { ...currentMeta, decidedStations: nextDecided };
        await api.updateProject(item.id, { metadata: nextMeta });
        setDecidedStations(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        const nextDecided = { ...currentDecided, [key]: true };
        const nextMeta = { ...currentMeta, decidedStations: nextDecided };
        await api.updateProject(item.id, { metadata: nextMeta });
        setDecidedStations(prev => ({ ...prev, [key]: true }));
      }
      setConfirmModal({ isOpen: false, station: '', item: null, type: 'decide' });
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('操作に失敗しました。');
    }
  };

  const handleBulkDownload = () => {
    if (!selectedItem || !selectedItem.selectedStations || selectedItem.selectedStations.length === 0) return;
    const targets = selectedStationsForDl.length > 0 ? selectedStationsForDl : selectedItem.selectedStations;
    alert(`選択された放送局（${targets.join('、')}）の局案・明細ファイルの一括ダウンロードを開始します。`);
  };

  const handleProgress = (item, station) => {
    const key = `${item.id}_${station}`;
    if (!decidedStations[key]) {
      alert('「決案」が完了していないため、進行できません。');
      return;
    }
    const originalProj = item.originalProject || item;
    setProgressItemAndStation({ item: originalProj, station });
  };

  const handleSaveCorrection = async (editFormData) => {
    if (!editingItem) return;
    try {
      const originalProj = editingItem.originalProject || editingItem;
      const meta = originalProj.metadata || {};
      const updatedMeta = {
        ...meta,
        ...editFormData,
        name: editFormData.name,
        sponsor: editFormData.sponsor_name,
        area: typeof editFormData.area === 'string' ? editFormData.area.split(new RegExp('[、,]')).map(x => x.trim()).filter(Boolean) : editFormData.area,
        takeType: typeof editFormData.takeType === 'string' ? editFormData.takeType.split(new RegExp('[、,]')).map(x => x.trim()).filter(Boolean) : editFormData.takeType
      };

      await api.updateProject(editingItem.id, {
        name: editFormData.name,
        sponsor_name: editFormData.sponsor_name,
        metadata: updatedMeta
      });

      alert('案件情報を訂正しました。');
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました。');
    }
  };

  const addAnnotation = (ann) => setAnnotations([...annotations, ann]);
  const removeAnnotation = (id) => setAnnotations(annotations.filter(a => a.id !== id));
  const updateAnnotation = (id, updates) => setAnnotations(annotations.map(a => a.id === id ? { ...a, ...updates } : a));

  const handleCanvasClick = (e) => {
    if (!tool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newAnn = {
      id: Date.now(),
      type: tool,
      x,
      y,
      width: tool === 'rect' ? 150 : 0,
      height: tool === 'rect' ? 80 : 0,
      text: tool === 'text' ? '' : null,
      color: '#e11d48',
      isNew: true
    };
    addAnnotation(newAnn);
  };

  const getStatusLabelAndColor = (status) => {
    switch (status) {
      case 'waiting_for_first_draft': return { label: '初案待ち', color: '#087f5b', bg: '#ebfbee' };
      case 'revision': return { label: '改案', color: '#991b1b', bg: '#fef2f2' };
      case 'ordered': return { label: '進行済', color: '#495057', bg: '#f1f3f5' };
      default: return { label: '不明', color: '#94a3b8', bg: '#f8fafc' };
    }
  };

  const actionButtonStyle = {
    height: '40px',
    padding: '0 16px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '950',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1.5px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#475569',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    justifyContent: 'center'
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>読み込み中...</div>;

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {selectedItem === null ? (
        <div className="view-container">
          <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>初案・改案・進行管理</h2>
              <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>プロジェクトごとの承認ステータスと修正履歴をリアルタイムで管理します。</p>
            </div>
          </header>

          <div className="glass-card" style={{ padding: '0', borderRadius: '16px', border: '1px solid #e1e4e8', backgroundColor: 'white', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e1e4e8' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase' }}>案件・スポンサー</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase' }}>期間 / エリア</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase' }}>局担</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase' }}>ステータス</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase' }}>訂正</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase', textAlign: 'right' }}>詳細</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                       表示可能な案件（初案待ち、改案、進行済）がありません。
                    </td>
                  </tr>
                ) : items.map(item => {
                  const statusInfo = getStatusLabelAndColor(item.status);
                  return (
                    <tr key={item.id} onClick={() => setSelectedItem(item)} style={{ borderBottom: '1px solid #f1f3f5', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-row">
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '900', marginBottom: '2px' }}>{item.sponsor}</div>
                        <div style={{ fontWeight: '950', color: '#1e293b', fontSize: '15px' }}>{item.name}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#495057' }}>{item.start_date} {item.end_date ? `〜 ${item.end_date}` : ''}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{Array.isArray(item.area) ? item.area.join(', ') : item.area}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#495057' }}>
                          {getContactNames(item.metadata?.contacts?.selectedMemberIds)}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900',
                          backgroundColor: statusInfo.bg, 
                          color: statusInfo.color 
                         }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                            setIsCorrectionOpen(true);
                          }}
                          style={{
                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                            backgroundColor: '#f1f3f5', border: '1px solid #ced4da', color: '#495057', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          訂正
                        </button>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button style={{ border: 'none', background: 'none', color: '#cbd5e1' }}>
                          <Icons.ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="view-container">
          <header style={{ marginBottom: '32px' }}>
            <button 
              onClick={() => setSelectedItem(null)} 
              style={{
                backgroundColor: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '12px', 
                fontWeight: '900', fontSize: '14px', color: '#475569', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', gap: '8px', marginBottom: '16px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              <Icons.ArrowLeft size={16} /> 案件一覧へ戻る
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--tacos-red)', fontWeight: '900', backgroundColor: 'rgba(230,0,18,0.06)', padding: '4px 12px', borderRadius: '20px' }}>
                  {selectedItem.currentType}
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: '950', color: '#1e293b', marginTop: '12px', marginBottom: '6px' }}>{selectedItem.name}</h2>
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>スポンサー: {selectedItem.sponsor}</p>
              </div>
              <button 
                onClick={() => handleBulkDownload()}
                disabled={selectedStationsForDl.length === 0}
                style={{
                  height: '44px', padding: '0 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '900',
                  backgroundColor: selectedStationsForDl.length > 0 ? 'var(--tacos-red)' : '#cbd5e1', 
                  color: 'white', border: 'none', cursor: selectedStationsForDl.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  boxShadow: selectedStationsForDl.length > 0 ? '0 8px 16px rgba(230,0,18,0.2)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: selectedStationsForDl.length > 0 ? 1 : 0.7
                }}
                onMouseEnter={e => { if (selectedStationsForDl.length > 0) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { if (selectedStationsForDl.length > 0) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icons.Download size={18} /> 一括ダウンロード
              </button>
            </div>
          </header>

          <div style={{ display: 'flex', gap: '8px', padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '14px', marginBottom: '24px' }}>
            {['overview', 'stations', 'schedule', 'documents', 'chat'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  backgroundColor: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? '#1e293b' : '#64748b',
                  fontSize: '13px', fontWeight: '950', cursor: 'pointer',
                  boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'overview' ? '概要' : tab === 'stations' ? '局案一覧' : tab === 'schedule' ? 'スケジュール' : tab === 'documents' ? 'ドキュメント' : 'チャット'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '16px' }}>基本情報</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900' }}>期間</div>
                    <div style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b' }}>{selectedItem.original?.start_date || '2026/09/01'} 〜 {selectedItem.original?.end_date || '2026/09/30'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900' }}>予算</div>
                    <div style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b' }}>¥{selectedItem.original?.metadata?.budget || '5,000,000'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900' }}>ターゲット</div>
                    <div style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b' }}>{selectedItem.original?.metadata?.tg || 'F1-F2'}</div>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #f1f5f9', gridColumn: 'span 2' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '16px' }}>特記事項</div>
                <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                  {selectedItem.original?.metadata?.ngItems || '特になし'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stations' && (
            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', width: '50px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStationsForDl.length === (selectedItem.selectedStations || []).length && (selectedItem.selectedStations || []).length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStationsForDl(selectedItem.selectedStations || []);
                          } else {
                            setSelectedStationsForDl([]);
                          }
                        }}
                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569' }}>発注局</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569' }}>局担</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569' }}>ファイル</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '120px' }}>DL</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '140px' }}>改案</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '140px' }}>決案</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '140px' }}>進行</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #f1f5f9' }}>
                  {(selectedItem.selectedStations || [])
                    .filter(station => {
                      const stationMap = selectedItem.metadata?.contacts?.stationMap || {};
                      const isKyokutanMember = currentUser && MEMBERS.some(m => m.email === currentUser.email && m.isKyokutan);
                      const memberId = currentUser ? MEMBERS.find(m => m.email === currentUser.email)?.id : null;
                      if (isKyokutanMember && memberId) {
                        const assignedIds = stationMap[station] || [];
                        return assignedIds.includes(memberId);
                      }
                      return true;
                    })
                    .map((station, idx) => {
                      const decidedKey = `${selectedItem.id}_${station}`;
                      const isDecided = decidedStations[decidedKey];
                      const isKyokutanMember = currentUser && MEMBERS.some(m => m.email === currentUser.email && m.isKyokutan);

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                        <td style={{ padding: '18px 24px', textAlign: 'center', width: '50px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedStationsForDl.includes(station)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStationsForDl([...selectedStationsForDl, station]);
                              } else {
                                setSelectedStationsForDl(selectedStationsForDl.filter(s => s !== station));
                              }
                            }}
                            style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '18px 24px', fontWeight: '900', color: '#1e293b', fontSize: '15px' }}>
                          {station}
                        </td>
                        <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748b', fontWeight: '800' }}>
                          {getContactNames(selectedItem.metadata?.contacts?.selectedMemberIds)}
                        </td>
                        <td style={{ padding: '18px 24px', fontSize: '14px', color: '#475569', fontWeight: '800' }}>
                          {(() => {
                            const responseInfo = stationResponses.find(sr => sr.station_network === station);
                            if (responseInfo?.proposal_file_url) {
                              // URLからファイル名を取得するか、DBに保存された名前があればそれを使う
                              return responseInfo.proposal_file_name || '局案ファイル';
                            }

                            const stationInfo = projectStations.find(ps => ps.station_network === station);
                            if (stationInfo?.proposal_file_name) return stationInfo.proposal_file_name;
                            
                            const meta = selectedItem?.originalProject?.metadata || selectedItem?.metadata || {};
                            const stationFile = meta.stationResponses?.[station]?.proposalFile;
                            return stationFile || meta.proposalFile || '未送信';
                          })()}
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                          <button 
                            onClick={() => {
                              const responseInfo = stationResponses.find(sr => sr.station_network === station);
                              if (responseInfo?.proposal_file_url) {
                                window.open(responseInfo.proposal_file_url, '_blank');
                                return;
                              }

                              const stationInfo = projectStations.find(ps => ps.station_network === station);
                              if (stationInfo?.proposal_file_path) {
                                window.open(stationInfo.proposal_file_path, '_blank');
                              } else {
                                handleDownload(station);
                              }
                            }}
                            style={{ ...actionButtonStyle }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                          >
                            DL
                          </button>
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {!isKyokutanMember && (
                              <button 
                                onClick={() => handleRevision(station)}
                                style={{ ...actionButtonStyle }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                              >
                                <Icons.Edit size={16} /> 改案
                              </button>
                            )}
                            {(() => {
                              const meta = selectedItem?.originalProject?.metadata || selectedItem?.metadata || {};
                              if (meta.revisions?.[station]) {
                                return (
                                  <button 
                                    onClick={() => handleRevision(station, true)}
                                    style={{ ...actionButtonStyle, height: '32px', fontSize: '11px', borderColor: '#8b5cf6', color: '#8b5cf6' }}
                                  >
                                    改案確認
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleFinalDecision(selectedItem, station); }}
                            style={{ 
                              ...actionButtonStyle, 
                              backgroundColor: isDecided ? '#ebfbee' : 'white',
                              borderColor: isDecided ? '#10b981' : '#e2e8f0',
                              color: isDecided ? '#10b981' : '#475569',
                              position: 'relative', zIndex: 5, pointerEvents: 'auto'
                            }}
                            onMouseEnter={e => { if(!isDecided) { e.currentTarget.style.borderColor = 'var(--tacos-red)'; e.currentTarget.style.color = 'var(--tacos-red)'; } }}
                            onMouseLeave={e => { if(!isDecided) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; } }}
                          >
                            <Icons.Check size={16} /> {isDecided ? '決案済み' : '決案'}
                          </button>
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleProgress(selectedItem, station); }}
                            style={{ 
                              ...actionButtonStyle, 
                              backgroundColor: isDecided ? '#1e293b' : '#f1f5f9', 
                              color: isDecided ? 'white' : '#cbd5e1', 
                              border: 'none', 
                              boxShadow: isDecided ? '0 8px 15px rgba(30,41,59,0.2)' : 'none',
                              cursor: isDecided ? 'pointer' : 'not-allowed',
                              opacity: isDecided ? 1 : 0.6,
                              position: 'relative', zIndex: 5, pointerEvents: 'auto'
                            }}
                            onMouseEnter={e => { if(isDecided) { e.currentTarget.style.backgroundColor = '#334155'; } }}
                            onMouseLeave={e => { if(isDecided) { e.currentTarget.style.backgroundColor = '#1e293b'; } }}
                          >
                            <Icons.Dashboard size={16} /> 進行
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="animate-fade" style={{ padding: '20px 0' }}>
              <div style={{ backgroundColor: 'white', border: '1.5px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '24px', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', margin: 0 }}>テレビスポットCMスケジュール表</h3>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '800' }}>放送局から送付された明細データを表示しています</div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: '1000px', padding: '24px' }}>
                    {(() => {
                      const startDate = selectedItem.original?.start_date || '2026-05-10';
                      const endDate = selectedItem.original?.end_date || '2026-05-20';
                      const dates = [];
                      let curr = new Date(startDate);
                      const last = new Date(endDate);
                      while (curr <= last) {
                        dates.push(new Date(curr).toISOString().split('T')[0]);
                        curr.setDate(curr.getDate() + 1);
                      }

                      const hours = Array.from({ length: 20 }, (_, i) => i + 5); // 5時〜24時
                      const slotDetails = allSlots.length > 0 ? allSlots : (selectedItem.original?.metadata?.slotDetails || []);

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${dates.length}, 1fr)`, gap: '1px', backgroundColor: '#f1f5f9', border: '1px solid #f1f5f9' }}>
                          {/* Header */}
                          <div style={{ backgroundColor: '#f8fafc', padding: '12px', textAlign: 'center', fontWeight: '900', fontSize: '12px', color: '#64748b' }}>時間</div>
                          {dates.map(d => {
                            const dateObj = new Date(d);
                            const dayName = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
                            return (
                              <div key={d} style={{ backgroundColor: '#f8fafc', padding: '12px', textAlign: 'center', fontWeight: '900', fontSize: '12px', color: '#1e293b' }}>
                                <div>{d.split('-').slice(1).join('/')}</div>
                                <div style={{ color: dayName === '土' ? '#228be6' : dayName === '日' ? '#fa5252' : '#64748b' }}>({dayName})</div>
                              </div>
                            );
                          })}

                          {/* Grid Rows */}
                          {hours.map(h => (
                            <React.Fragment key={h}>
                              <div style={{ backgroundColor: 'white', padding: '10px', textAlign: 'right', fontWeight: '800', fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                                {h}:00
                              </div>
                              {dates.map(d => {
                                const slotsAtTime = slotDetails.filter(s => {
                                  const sDate = s.broadcast_date || s.date;
                                  if (sDate !== d) return false;
                                  const sStartTime = s.start_time || s.startTime;
                                  const startH = parseInt(sStartTime.split(':')[0]);
                                  return startH === h;
                                });

                                return (
                                  <div key={`${d}-${h}`} style={{ backgroundColor: 'white', padding: '8px', minHeight: '60px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                                    {slotsAtTime.map((s, idx) => (
                                      <div key={idx} style={{ 
                                        backgroundColor: '#e7f5ff', border: '1px solid #74c0fc', borderRadius: '6px', 
                                        padding: '4px 8px', marginBottom: '4px', fontSize: '10px', fontWeight: '900', color: '#1864ab',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                      }}>
                                        <div style={{ color: '#1e293b', marginBottom: '2px' }}>{s.start_time || s.startTime} - {s.end_time || s.endTime}</div>
                                        <div style={{ color: 'var(--tacos-red)', fontSize: '11px' }}>ID: {s.slot_id || s.slotId}</div>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.program_name || s.program}</div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', padding: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: '950', color: '#1e293b', marginBottom: '20px' }}>共有ドキュメント</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {['発注書_最終案.pdf', '放送プラン明細_20260901.pdf', '素材進行表_決定稿.xlsx'].map((file, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', border: '1.5px solid #f8fafc', backgroundColor: '#fcfdfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icons.FileText size={20} color="#0ea5e9" />
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{file}</span>
                    </div>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }}>
                      ダウンロード
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', height: '540px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px', fontWeight: '800' }}>
                    メッセージはありません。
                  </div>
                ) : messages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  const isSystem = msg.is_system;

                  if (isSystem) {
                    return (
                      <div key={msg.id || idx} style={{ alignSelf: 'center', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', color: '#64748b', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                        {msg.message_text}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id || idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', padding: '0 4px' }}>{msg.sender_name || '不明なユーザー'}</div>
                      <div style={{ 
                        padding: '12px 18px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                        backgroundColor: isMe ? 'var(--tacos-red)' : 'white', color: isMe ? 'white' : '#1e293b', 
                        fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        border: isMe ? 'none' : '1.5px solid #f1f5f9'
                      }}>
                        {msg.message_text}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: '20px', borderTop: '1.5px solid #f1f5f9', display: 'flex', gap: '12px', backgroundColor: 'white' }}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
                  placeholder="メッセージを入力..." 
                  style={{ flex: 1, padding: '14px 20px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '14px', fontWeight: '600' }} 
                />
                <button 
                  onClick={handleSendMessage}
                  style={{ padding: '0 24px', borderRadius: '16px', backgroundColor: '#1e293b', color: 'white', border: 'none', fontWeight: '950', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                >
                  送信
                </button>
              </div>
            </div>
          )}

      {showAnnotator && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button onClick={() => setShowAnnotator(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><Icons.ArrowLeft size={24} /></button>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>書き込み改案 : {activeStation}</h3>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isReadOnly && (
                <>
                  <button onClick={() => setTool('rect')} style={{ ...actionButtonStyle, backgroundColor: tool === 'rect' ? '#f1f5f9' : 'white' }}><Icons.Edit size={16} /> 修正枠</button>
                  <button onClick={() => setTool('text')} style={{ ...actionButtonStyle, backgroundColor: tool === 'text' ? '#f1f5f9' : 'white' }}><Icons.FileText size={16} /> テキスト</button>
                  <button onClick={() => setTool('arrow')} style={{ ...actionButtonStyle, backgroundColor: tool === 'arrow' ? '#f1f5f9' : 'white' }}><Icons.ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /> 矢印</button>
                  <button onClick={handleSendRevision} style={{ ...actionButtonStyle, backgroundColor: 'var(--tacos-red)', color: 'white', border: 'none' }}>改案送信</button>
                </>
              )}
              {isReadOnly && (
                <button onClick={() => setShowAnnotator(false)} style={{ ...actionButtonStyle, backgroundColor: '#1e293b', color: 'white', border: 'none' }}>閉じる</button>
              )}
            </div>
          </header>
          
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Canvas container */}
            <div style={{ flex: 1, backgroundColor: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px', overflow: 'auto' }}>
              {/* Virtual PDF Canvas */}
              <div 
                id="pdf-canvas" onClick={!isReadOnly ? handleCanvasClick : undefined}
                style={{ 
                  width: '100%', height: '6000px', backgroundColor: 'white', position: 'relative', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)', cursor: !isReadOnly ? 'crosshair' : 'default', pointerEvents: 'all'
                }}
              >
                {tool && !isReadOnly && <div id="annotator-overlay" onClick={handleCanvasClick} style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'transparent', pointerEvents: 'all' }} />}
                {/* File display */}
                {items.find(i => i.id === selectedItem.id)?.proposalFileData ? (() => {
                  const activeFile = items.find(i => i.id === selectedItem.id).proposalFileData[0];
                  const fileUrl = activeFile.data;
                  const isBase64Image = fileUrl.startsWith('data:image/');
                  const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('/pdf') || fileUrl.includes('application/pdf');
                  const isHttpUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
                  const isSvgData = fileUrl.startsWith('data:image/svg');
                  
                  if (isBase64Image || isSvgData) {
                    return <img src={fileUrl} alt="Proposal" style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', inset: 0, userSelect: 'none', pointerEvents: 'none' }} />;
                  } else if (isHttpUrl || isPdf) {
                    const pdfUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
                    return <iframe src={pdfUrl} title="Proposal" scrolling="no" style={{ width: '100%', height: '6000px', position: 'absolute', inset: 0, border: 'none', pointerEvents: tool ? 'none' : 'auto', overflow: 'hidden' }} />;
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
                    onRemove={removeAnnotation} 
                    onUpdate={updateAnnotation} 
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </div>

            {/* Side Panel */}
            <div style={{ width: '380px', borderLeft: '1.5px solid #cbd5e1', backgroundColor: 'white', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>修正依頼内容メモ</h4>
                <textarea
                  readOnly={isReadOnly}
                  style={{ width: '100%', height: '220px', padding: '16px', borderRadius: '16px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none', backgroundColor: isReadOnly ? '#f8fafc' : 'white' }}
                  placeholder={isReadOnly ? "修正指示はありません" : "修正指示を入力してください"}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
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
                        {!isReadOnly && (
                          <button onClick={() => removeAnnotation(ann.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>&times;</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 進行管理詳細モーダル (進行表) */}
      {progressItemAndStation && (
        <ProgressScheduleModal 
          station={progressItemAndStation.station} 
          item={progressItemAndStation.item} 
          onClose={() => setProgressItemAndStation(null)} 
        />
      )}

      {/* 決案確認モーダル */}
      {confirmModal.isOpen && (
        <div className="animate-modal-backdrop" style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
           <div className="animate-modal-enter" style={{ 
             width: '100%', maxWidth: '400px', backgroundColor: 'white', 
             borderRadius: '32px', padding: '32px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
             textAlign: 'center'
           }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: confirmModal.type === 'decide' ? '#ebfbee' : '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                color: confirmModal.type === 'decide' ? '#10b981' : '#ef4444'
              }}>
                <Icons.Check size={32} />
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b', marginBottom: '12px' }}>
                {confirmModal.type === 'decide' ? '決案の確認' : '決案解除の確認'}
              </h3>
              
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', fontWeight: '500', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {confirmModal.station} を{confirmModal.type === 'decide' ? '現在案で「決案」としますか？\n決案後は進行管理が可能になります。' : '「決案」を解除しますか？'}
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setConfirmModal({ ...confirmModal, isOpen: false }); }}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '14px', border: '1.5px solid #e2e8f0',
                    backgroundColor: 'white', color: '#64748b', fontSize: '14px', fontWeight: '900', cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); executeConfirmAction(); }}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
                    backgroundColor: confirmModal.type === 'decide' ? '#10b981' : '#ef4444', 
                    color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                    boxShadow: confirmModal.type === 'decide' ? '0 8px 15px rgba(16, 185, 129, 0.2)' : '0 8px 15px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  確定する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    </div>
  );
};

/* --- ファイルプレビュー・ダウンロード・印刷モーダル --- */
const FilePreviewDownloadPrintModal = ({ station, proposalFile, proposalFileData, onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const activeFile = proposalFileData && proposalFileData[selectedFileIndex];
  const fileType = activeFile?.data?.split(';')[0]?.split(':')[1] || '';

  const handlePrint = () => {
    if (!activeFile?.data) {
      alert('プレビューするファイルがありません。');
      return;
    }
    const win = window.open();
    if (!win) {
      alert('ポップアップがブロックされました。');
      return;
    }
    if (fileType.startsWith('image/')) {
      win.document.write(`<img src="${activeFile.data}" style="max-width:100%;" onload="window.print();window.close();"/>`);
    } else {
      win.document.write(`<iframe src="${activeFile.data}" style="width:100%;height:100%;border:none;" onload="window.print();"></iframe>`);
    }
    win.document.close();
  };

  const handleDownload = () => {
    if (!activeFile?.data) {
      alert('プレビューするファイルがありません。');
      return;
    }
    const a = document.createElement('a');
    a.href = activeFile.data;
    a.download = activeFile.name || `${station}_局案_明細書`;
    a.click();
  };

  return (
    <div className="animate-fade" style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '40px'
    }}>
       <div style={{ 
         width: '860px', maxHeight: '90vh', backgroundColor: 'white', 
         borderRadius: '32px', display: 'flex', flexDirection: 'column', 
         overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
         border: '1px solid rgba(255,255,255,0.2)'
       }}>
          <header style={{ 
            padding: '24px 32px', borderBottom: '1px solid #f1f3f5', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            backgroundColor: 'white'
          }}>
             <div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>ファイルプレビュー</div>
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{station} の局案・明細書</h3>
             </div>
             <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
          </header>
          
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
             <div style={{ 
               backgroundColor: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', 
               padding: '32px', minHeight: '320px', display: 'flex', flexDirection: 'column', gap: '20px',
               boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
             }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                   <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>対象ファイル:</div>
                   {proposalFile ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                        {proposalFile.split(',').map((f, i) => (
                           <div key={i} style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Icons.FileText size={16} color="#0ea5e9" /> {f.trim()}
                           </div>
                        ))}
                     </div>
                   ) : (
                     <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', fontWeight: '800' }}>
                        {station}_局案_明細書.pdf
                     </div>
                   )}
                </div>
                
                {proposalFileData && proposalFileData.length > 0 ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, width: '100%', height: '100%' }}>
                      {proposalFileData.length > 1 && (
                         <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {proposalFileData.map((f, i) => (
                               <button
                                  key={i}
                                  onClick={() => setSelectedFileIndex(i)}
                                  style={{
                                     padding: '6px 14px',
                                     borderRadius: '8px',
                                     border: '1.5px solid',
                                     borderColor: selectedFileIndex === i ? 'var(--tacos-red)' : '#cbd5e1',
                                     backgroundColor: selectedFileIndex === i ? 'var(--tacos-red)' : 'white',
                                     color: selectedFileIndex === i ? 'white' : '#475569',
                                     fontSize: '12px',
                                     fontWeight: '900',
                                     cursor: 'pointer'
                                  }}
                               >
                                  {f.name}
                               </button>
                            ))}
                         </div>
                      )}

                      <div style={{ flex: 1, minHeight: '340px', backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex' }}>
                         {fileType.startsWith('image/') ? (
                            <img src={activeFile.data} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} alt={activeFile.name} />
                         ) : fileType.includes('pdf') ? (
                            <iframe src={`${activeFile.data}#toolbar=0&navpanes=0&scrollbar=0`} style={{ width: '100%', height: '100%', border: 'none' }} title={activeFile.name} />
                         ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#64748b', gap: '12px' }}>
                               <Icons.FileText size={48} color="#94a3b8" />
                               <div style={{ fontSize: '13px', fontWeight: '800' }}>プレビュー非対応のファイル形式です</div>
                            </div>
                         )}
                      </div>
                   </div>
                ) : (
                   <div style={{ flex: 1, backgroundColor: '#fcfdfe', border: '1px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px', fontWeight: '800', padding: '40px', textAlign: 'center' }}>
                      <div>
                        <Icons.FileText size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                        <div>プレビューファイルはありません</div>
                      </div>
                   </div>
                )}
             </div>
          </div>
          
          <footer style={{ padding: '24px 32px', borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'flex-end', gap: '16px', backgroundColor: '#fafbfc' }}>
             <button onClick={() => { alert('ファイルを印刷します'); }} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e1e4e8', backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.FileText size={16} /> 印刷
             </button>
             <button onClick={() => { alert('ダウンロードを開始しました'); }} style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Download size={16} /> ダウンロード
             </button>
          </footer>
       </div>
    </div>
  );
};

/* --- 進行表モーダル (テレビスポットCMスケジュール表) --- */
const ProgressScheduleModal = ({ station, item, onClose }) => {
  const [remarks, setRemarks] = useState('');
  const [sending, setSending] = useState(false);

  // 放送期間の解析と週の生成ヘルパー
  const generateWeeksFromRange = (start, end) => {
    const startDate = start ? new Date(start) : new Date('2026-09-01');
    const endDate = end ? new Date(end) : new Date('2026-09-30');
    
    // 開始日を含む週の月曜日を探す
    const firstDay = new Date(startDate);
    const dayOfWeek = firstDay.getDay(); // 0:日, 1:月...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const current = new Date(firstDay);
    current.setDate(firstDay.getDate() + diffToMonday);

    const generatedWeeks = [];
    let weekIdx = 1;
    
    // 終了日をカバーするまで、最低4週間分生成
    while (current <= endDate || generatedWeeks.length < 4) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(current);
        const isWithin = d >= startDate && d <= endDate;
        weekDays.push({
          date: isWithin ? `${d.getMonth() + 1}/${d.getDate()}` : '',
          day: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()],
          key: d.toISOString().split('T')[0] // 保存用の固定キー
        });
        current.setDate(current.getDate() + 1);
      }
      generatedWeeks.push({ title: `${weekIdx}週目`, days: weekDays });
      weekIdx++;
      if (weekIdx > 12) break; // 最大12週間（約3ヶ月）に制限
    }
    return generatedWeeks;
  };

  const weeks = useMemo(() => {
    // item is already the unwrapped project object from handleProgress
    const start = item?.start_date;
    const end = item?.end_date;
    return generateWeeksFromRange(start, end);
  }, [item]);

  const [form, setForm] = useState(() => {
    const originalProj = item?.originalProject || item;
    const start = originalProj?.start_date || '2026-09-01';
    const end = originalProj?.end_date || '2026-09-30';
    
    const defaultForm = {
      stationName: station || '',
      contractNumber: '',
      sponsorName: item?.sponsor || '',
      contractName: item?.name || '',
      broadcastPeriod: `${start.replace(new RegExp('-', 'g'), '/')} 〜 ${end.replace(new RegExp('-', 'g'), '/')}`,
      broadcastCount: '',
      agency: item?.originalProject?.metadata?.ba || '電通',
      contact: '',
      email: '',
      materials: [
        { abbr: '', content: '', seconds: '', code: '', inSend: '', type: '', memo: '' },
        { abbr: '', content: '', seconds: '', code: '', inSend: '', type: '', memo: '' },
        { abbr: '', content: '', seconds: '', code: '', inSend: '', type: '', memo: '' },
        { abbr: '', content: '', seconds: '', code: '', inSend: '', type: '', memo: '' }
      ],
      weeks: {}
    };

    const existing = item?.originalProject?.metadata?.progressSchedules?.[station];
    if (existing) {
      if (existing.remarks) setRemarks(existing.remarks);
      return { ...defaultForm, ...existing };
    }
    return defaultForm;
  });

  const handleSend = async () => {
    setSending(true);
    try {
      const originalProj = item.originalProject || item;
      const currentMeta = originalProj.metadata || {};
      const progressSchedules = currentMeta.progressSchedules || {};
      progressSchedules[station] = { ...form, remarks };

      const updatedMeta = { ...currentMeta, progressSchedules };
      await api.updateProject(item.id, { metadata: updatedMeta });

      alert('進行表を送信しました。');
      setSending(false);
      onClose();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました。');
      setSending(false);
    }
  };

  const headerCellStyle = {
    padding: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    fontWeight: 'bold',
    fontSize: '12px',
    color: '#334155',
    textAlign: 'center'
  };

  const dataCellStyle = {
    padding: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'white',
    fontSize: '11px',
    color: '#334155'
  };

  const inputStyle = {
    width: '100%',
    border: 'none',
    outline: 'none',
    padding: '4px',
    fontSize: '11px',
    textAlign: 'center'
  };

  return (
    <div className="animate-fade" style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '20px'
    }}>
       <div style={{ 
         width: '1240px', height: '96vh', backgroundColor: 'white', 
         borderRadius: '32px', display: 'flex', flexDirection: 'column', 
         overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
         border: '1px solid rgba(255,255,255,0.2)'
       }}>
          <header style={{ 
            padding: '20px 32px', borderBottom: '1px solid #f1f3f5', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            backgroundColor: 'white', zIndex: 10
          }}>
             <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>進行管理画面</div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>テレビスポットCMスケジュール表</h3>
             </div>
             <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: '#64748b' }}>×</button>
          </header>

          <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', backgroundColor: '#f1f5f9' }}>
             {/* Printable Paper Canvas container */}
             <div style={{ 
               backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid #cbd5e1',
               padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', width: '100%', minHeight: '1000px',
               display: 'flex', flexDirection: 'column', gap: '24px'
             }}>
                
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                   <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '0.1em', color: '#1e293b' }}>
                      テレビスポットCMスケジュール表
                   </h2>
                </div>

                {/* Top header information grid with Left and Right tables */}
                <div style={{ display: 'flex', gap: '24px', width: '100%', marginBottom: '16px' }}>
                   {/* Left Side Table */}
                   <div style={{ flex: 1 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                         <tbody>
                            <tr>
                               <td style={{ ...headerCellStyle, width: '20%', height: '36px' }}>放送局</td>
                               <td style={{ ...dataCellStyle, width: '30%' }}>
                                  <input style={inputStyle} value={form.stationName || ''} onChange={e => setForm({ ...form, stationName: e.target.value })} />
                               </td>
                               <td style={{ ...headerCellStyle, width: '20%' }}>契約番号</td>
                               <td style={{ ...dataCellStyle, width: '30%' }}>
                                  <input style={inputStyle} placeholder="自動生成" value={form.contractNumber || ''} onChange={e => setForm({ ...form, contractNumber: e.target.value })} />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>広告主</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} value={form.sponsorName || ''} onChange={e => setForm({ ...form, sponsorName: e.target.value })} />
                               </td>
                               <td style={headerCellStyle}>契約名</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} value={form.contractName || ''} onChange={e => setForm({ ...form, contractName: e.target.value })} />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>放送期間</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="9/1 〜 9/30" value={form.broadcastPeriod || ''} onChange={e => setForm({ ...form, broadcastPeriod: e.target.value })} />
                               </td>
                               <td style={headerCellStyle}>放送本数</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="本数" value={form.broadcastCount || ''} onChange={e => setForm({ ...form, broadcastCount: e.target.value })} />
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>

                   {/* Right Side Table */}
                   <div style={{ width: '38%' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                         <tbody>
                            <tr>
                               <td style={{ ...headerCellStyle, width: '30%', height: '36px' }}>広告会社</td>
                               <td style={{ ...dataCellStyle, width: '70%' }}>
                                  <input style={inputStyle} placeholder="広告会社名" value={form.agency || ''} onChange={e => setForm({ ...form, agency: e.target.value })} />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>担当</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="担当者名" value={form.contact || ''} onChange={e => setForm({ ...form, contact: e.target.value })} />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>メール</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="contact@example.com" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Sub Material Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                   <thead>
                      <tr>
                         <th style={{ ...headerCellStyle, width: '8%' }}>略号</th>
                         <th style={{ ...headerCellStyle, width: '28%' }}>商品名・素材内容</th>
                         <th style={{ ...headerCellStyle, width: '10%' }}>秒数</th>
                         <th style={{ ...headerCellStyle, width: '16%' }}>10桁コード</th>
                         <th style={{ ...headerCellStyle, width: '14%' }}>在・送</th>
                         <th style={{ ...headerCellStyle, width: '12%' }}>素材種別</th>
                         <th style={{ ...headerCellStyle, width: '12%' }}>メモ</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(form.materials || []).map((m, i) => (
                         <tr key={i}>
                            <td style={dataCellStyle}>
                               <input style={inputStyle} value={m.abbr || ''} onChange={e => {
                                  const next = [...form.materials];
                                  next[i].abbr = e.target.value;
                                  setForm({ ...form, materials: next });
                               }} />
                            </td>
                            <td style={dataCellStyle}>
                               <input style={{ ...inputStyle, textAlign: 'left' }} value={m.content || ''} onChange={e => {
                                  const next = [...form.materials];
                                  next[i].content = e.target.value;
                                  setForm({ ...form, materials: next });
                               }} />
                            </td>
                            <td style={dataCellStyle}>
                               <input style={inputStyle} value={m.seconds || ''} onChange={e => {
                                  const next = [...form.materials];
                                  next[i].seconds = e.target.value;
                                  setForm({ ...form, materials: next });
                               }} />
                            </td>
                            <td style={dataCellStyle}>
                               <input style={inputStyle} value={m.code || ''} onChange={e => {
                                  const next = [...form.materials];
                                  next[i].code = e.target.value;
                                  setForm({ ...form, materials: next });
                               }} />
                            </td>
                            <td style={dataCellStyle}>
                               <select 
                                  style={{ width: '100%', border: 'none', fontSize: '11px', textAlign: 'center', cursor: 'pointer' }}
                                  value={m.inSend || ''}
                                  onChange={e => {
                                     const next = [...form.materials];
                                     next[i].inSend = e.target.value;
                                     setForm({ ...form, materials: next });
                                  }}
                               >
                                  <option value="">選択</option>
                                  <option value="在">在</option>
                                  <option value="送">送</option>
                               </select>
                            </td>
                            <td style={dataCellStyle}>
                               <input style={inputStyle} value={m.type || ''} onChange={e => {
                                  const next = [...form.materials];
                                  next[i].type = e.target.value;
                                  setForm({ ...form, materials: next });
                               }} />
                            </td>
                            <td style={dataCellStyle}>
                               <input style={inputStyle} value={m.memo || ''} onChange={e => {
                                  const next = [...form.materials];
                                  next[i].memo = e.target.value;
                                  setForm({ ...form, materials: next });
                               }} />
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>

                {/* Weeks grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   {weeks.map((week, wIdx) => (
                      <div key={wIdx}>
                         <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>{week.title}</div>
                         <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                            <thead>
                               <tr>
                                  {week.days.map((day, dIdx) => (
                                     <th key={dIdx} style={{ ...headerCellStyle, width: '14.28%', backgroundColor: day.day === '日' ? '#fff1f2' : (day.day === '土' ? '#eff6ff' : '#f8fafc'), color: day.day === '日' ? '#e11d48' : (day.day === '土' ? '#2563eb' : '#334155') }}>
                                        {day.date && `${day.date} (${day.day})`}
                                     </th>
                                  ))}
                               </tr>
                            </thead>
                            <tbody>
                               <tr>
                                  {week.days.map((day, dIdx) => (
                                     <td key={dIdx} style={{ ...dataCellStyle, height: '140px', verticalAlign: 'top', padding: '2px', backgroundColor: day.date ? 'white' : '#f8fafc' }}>
                                        {day.date && (
                                           <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                              {/* Column headers for mini block */}
                                              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', borderBottom: '1px solid #cbd5e1', fontSize: '9px', fontWeight: 'bold', color: '#64748b', textAlign: 'center', paddingBottom: '2px', paddingTop: '1px' }}>
                                                 <div>放送時間</div>
                                                 <div>PT/SB</div>
                                                 <div>秒数</div>
                                                 <div>略号</div>
                                              </div>
                                              {/* Rows within each day */}
                                              {[1, 2, 3, 4].map(r => {
                                                 const keyPrefix = `${wIdx}_${dIdx}_${r}`;
                                                 return (

                                                    <div key={r} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', borderBottom: r === 4 ? 'none' : '1px solid #f1f5f9', flex: 1 }}>
                                                       <input style={{ ...inputStyle, fontSize: '10px' }} value={form.weeks[`${keyPrefix}_time`] || ''} onChange={e => setForm({ ...form, weeks: { ...form.weeks, [`${keyPrefix}_time`]: e.target.value } })} />
                                                       <input style={{ ...inputStyle, fontSize: '10px' }} value={form.weeks[`${keyPrefix}_ptsb`] || ''} onChange={e => setForm({ ...form, weeks: { ...form.weeks, [`${keyPrefix}_ptsb`]: e.target.value } })} />
                                                       <input style={{ ...inputStyle, fontSize: '10px' }} value={form.weeks[`${keyPrefix}_sec`] || ''} onChange={e => setForm({ ...form, weeks: { ...form.weeks, [`${keyPrefix}_sec`]: e.target.value } })} />
                                                       <input style={{ ...inputStyle, fontSize: '10px' }} value={form.weeks[`${keyPrefix}_abbr`] || ''} onChange={e => setForm({ ...form, weeks: { ...form.weeks, [`${keyPrefix}_abbr`]: e.target.value } })} />
                                                    </div>
                                                 );
                                              })}
                                           </div>
                                        )}
                                     </td>
                                  ))}
                               </tr>
                            </tbody>
                         </table>
                      </div>
                   ))}
                </div>

                {/* Additional Memo */}
                <div style={{ marginTop: '16px' }}>
                   <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>特記事項 / 連絡メモ</div>
                   <textarea 
                     style={{ width: '100%', minHeight: '80px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', resize: 'none' }}
                     placeholder="特記事項や修正指示、スケジュールに関する連絡事項があれば入力してください"
                     value={remarks}
                     onChange={e => setRemarks(e.target.value)}
                   />
                </div>
             </div>
          </div>

          {/* Footer controls */}
          <footer style={{ padding: '24px 32px', borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'flex-end', gap: '16px', backgroundColor: '#fafbfc' }}>
             <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e1e4e8', backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
                キャンセル
             </button>
             <button onClick={handleSend} disabled={sending} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', fontSize: '14px', fontWeight: '900', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: sending ? 0.8 : 1, boxShadow: '0 4px 12px rgba(230,0,18,0.2)' }}>
                <Icons.Send size={16} /> {sending ? '送信中...' : '進行表を送信'}
             </button>
          </footer>
       </div>
    </div>
  );
};

/* --- Annotation Item with Drag, Resize & Inline Edit --- */
export const AnnotationItem = ({ ann, onRemove, onUpdate, isReadOnly }) => {
  const [pos, setPos] = useState({ x: ann.x, y: ann.y });
  const [size, setSize] = useState({ 
    width: ann.width || 120, 
    height: ann.height || 60, 
    fontSize: ann.fontSize || (ann.type === 'arrow' ? 32 : 20) 
  });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0, w: 0, h: 0, ax: 0, ay: 0, fs: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(ann.text || '');

  useEffect(() => {
    setPos({ x: ann.x, y: ann.y });
    setSize({
      width: ann.width || 120,
      height: ann.height || 60,
      fontSize: ann.fontSize || (ann.type === 'arrow' ? 32 : 20)
    });
    setText(ann.text || '');
  }, [ann]);

  useEffect(() => {
    if (ann.isNew) {
      setIsEditing(true);
      onUpdate(ann.id, { isNew: false });
    }
  }, [ann.isNew, ann.id, onUpdate]);

  const handleMouseDown = (e, action) => {
    e.stopPropagation();
    if (isReadOnly) return;
    if (action === 'move') {
      setDragging(true);
      setStart({ x: e.clientX, y: e.clientY, ax: pos.x, ay: pos.y });
    } else if (action === 'resize') {
      setResizing(true);
      setStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height, fs: size.fontSize });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        setPos({ x: start.ax + dx, y: start.ay + dy });
      } else if (resizing) {
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (ann.type === 'rect') {
          setSize({ ...size, width: Math.max(40, start.w + dx), height: Math.max(30, start.h + dy) });
        } else {
          setSize({ ...size, fontSize: Math.max(12, start.fs + dx / 6) });
        }
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);
        onUpdate(ann.id, { x: pos.x, y: pos.y });
      } else if (resizing) {
        setResizing(false);
        onUpdate(ann.id, { ...size });
      }
    };

    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, start, pos, size, ann, onUpdate]);

  const handleTextChange = (newText) => {
    setText(newText);
    onUpdate(ann.id, { text: newText });
  };

  const removeStyle = {
    position: 'absolute', top: '-12px', right: '-12px',
    backgroundColor: '#1e293b', color: 'white', border: 'none',
    width: '18px', height: '18px', borderRadius: '50%', fontSize: '11px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', zIndex: 12
  };

  const resizeHandleStyle = {
    position: 'absolute', bottom: '-4px', right: '-4px',
    width: '12px', height: '12px', backgroundColor: ann.color || '#e11d48',
    border: '2px solid white', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 12
  };

  if (ann.type === 'rect') {
    return (
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: `${pos.y}px`, left: `${pos.x}px`,
          border: `8px solid ${ann.color || '#e11d48'}`, width: `${size.width}px`, height: `${size.height}px`,
          borderRadius: '4px', pointerEvents: 'auto', zIndex: 10, cursor: isReadOnly ? 'default' : 'move',
          boxSizing: 'border-box'
        }}
      >
        {isReadOnly && <div style={{ position: 'absolute', inset: 0, border: `8px solid ${ann.color || '#e11d48'}`, borderRadius: '4px', opacity: 0.1 }} />}
        {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onRemove(ann.id); }} style={removeStyle}>&times;</button>}
        {!isReadOnly && <div onMouseDown={(e) => handleMouseDown(e, 'resize')} style={resizeHandleStyle} />}
      </div>
    );
  }

  if (ann.type === 'text') {
    return (
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onClick={(e) => { e.stopPropagation(); if (!isReadOnly) setIsEditing(true); }}
        style={{
          position: 'absolute', top: `${pos.y}px`, left: `${pos.x}px`,
          color: ann.color || '#e11d48', fontSize: `${size.fontSize}px`, fontWeight: '900',
          pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
          zIndex: 10, cursor: isReadOnly ? 'default' : 'move', minWidth: '100px', userSelect: 'none'
        }}
      >
        {isEditing && !isReadOnly ? (
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onBlur={() => { setIsEditing(false); handleTextChange(text); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditing(false); handleTextChange(text); } }}
            style={{ fontSize: `${size.fontSize}px`, color: ann.color || '#e11d48', fontWeight: '900', border: 'none', borderBottom: `2px solid ${ann.color || '#e11d48'}`, backgroundColor: 'transparent', outline: 'none', padding: 0, margin: 0, width: '160px' }}
          />
        ) : (
          <span>{text || 'テキストを入力'}</span>
        )}
        {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onRemove(ann.id); }} style={{ ...removeStyle, top: '-8px', right: '-18px' }}>&times;</button>}
        {!isReadOnly && <div onMouseDown={(e) => handleMouseDown(e, 'resize')} style={{ ...resizeHandleStyle, bottom: '-4px', right: '-4px' }} />}
      </div>
    );
  }

  if (ann.type === 'arrow') {
    return (
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: `${pos.y}px`, left: `${pos.x}px`,
          pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
          zIndex: 10, cursor: isReadOnly ? 'default' : 'move', userSelect: 'none'
        }}
      >
        <span style={{ fontSize: `${size.fontSize}px`, color: ann.color || '#e11d48', fontWeight: 'bold', lineHeight: 1, display: 'inline-block', transform: `rotate(${ann.rotation || 0}deg)`, transition: 'transform 0.2s' }}>➔</span>
        {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onRemove(ann.id); }} style={{ ...removeStyle, top: '-8px', right: '-18px' }}>&times;</button>}
        {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onUpdate(ann.id, { rotation: ((ann.rotation || 0) + 90) % 360 }); }} style={{ ...removeStyle, top: '-8px', right: '4px', backgroundColor: '#0ea5e9' }}>↺</button>}
        {!isReadOnly && <div onMouseDown={(e) => handleMouseDown(e, 'resize')} style={{ ...resizeHandleStyle, bottom: '-4px', right: '-4px' }} />}
      </div>
    );
  }

  return null;
};

export default RevisionsView;
