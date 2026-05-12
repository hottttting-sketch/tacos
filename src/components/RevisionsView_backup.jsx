import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import IndexModal from './IndexModal';
import ServiceModal from './ServiceModal';

const RevisionsView = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [activeStation, setActiveStation] = useState(null);
  const [previewingStation, setPreviewingStation] = useState(null);

  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [progressItemAndStation, setProgressItemAndStation] = useState(null);

  // Persistent station decision states
  const [decidedStations, setDecidedStations] = useState(() => {
    const saved = localStorage.getItem('tacos_decided_stations');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tacos_decided_stations', JSON.stringify(decidedStations));
  }, [decidedStations]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      if (data && data.length > 0) {
        const filtered = data.filter(p => {
          let currentStatus = p.status || 'planning';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';
          return currentStatus === 'waiting_for_first_draft' || currentStatus === 'revision' || currentStatus === 'ordered';
        });

        setItems(filtered.map(p => {
          let currentStatus = p.status || 'planning';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';

          // Extract selected stations from metadata or project
          let selectedStations = p.metadata?.selectedStations || p.selectedStations || [];
          if (typeof selectedStations === 'string') {
            selectedStations = selectedStations.split(/[、,]/).map(s => s.trim()).filter(Boolean);
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
            originalProject: p
          };
        }));
      } else {
        // Fallback dummy data
        const initialItems = [
          { id: 'm1', name: 'サントリー　新商品キャンペーン', sponsor: 'サントリー', currentType: 'スポット', status: 'waiting_for_first_draft', date: '2026/05/02', isDecided: false, selectedStations: ['札幌テレビ', '青森放送', 'ミヤギテレビ'] },
          { id: 'm2', name: '日産　セレナ　決算セール', sponsor: '日産自動車', currentType: 'スポット', status: 'ordered', date: '2026/05/02', isDecided: true, selectedStations: ['東京放送', 'フジテレビ', '日本テレビ'] },
          { id: 'm3', name: '味の素　冷凍食品シリーズ', sponsor: '味の素', currentType: 'タイム', status: 'revision', date: '2026/05/02', isDecided: false, selectedStations: ['関西テレビ', '読売テレビ', '毎日放送'] }
        ];
        const localFormat = initialItems.map(item => ({
          id: item.id,
          name: item.name,
          sponsor_name: item.sponsor,
          status: item.status,
          created_at: new Date(item.date).toISOString(),
          metadata: { type: item.currentType === 'タイム' ? 'time' : 'spot', selectedStations: item.selectedStations }
        }));
        localStorage.setItem('tacos_local_projects', JSON.stringify(localFormat));
        setItems(initialItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDownload = (station) => {
    setActiveStation(station);
    setPreviewingStation(true);
  };

  const handleRevision = (station) => {
    setActiveStation(station);
    setShowAnnotator(true);
  };

  const handleFinalDecision = (item, station) => {
    const key = `${item.id}_${station}`;
    if (decidedStations[key]) {
      if (window.confirm(`${station} の決案を解除しますか？`)) {
        setDecidedStations(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    } else {
      if (window.confirm(`${station} を現在案で「決案」としますか？\n決案後は進行管理が可能になります。`)) {
        setDecidedStations(prev => ({ ...prev, [key]: true }));
      }
    }
  };

  const handleProgress = (item, station) => {
    const key = `${item.id}_${station}`;
    if (!decidedStations[key]) {
      alert('「決案」が完了していないため、進行できません。');
      return;
    }
    setProgressItemAndStation({ item, station });
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
        area: typeof editFormData.area === 'string' ? editFormData.area.split(/[、,]/).map(x => x.trim()).filter(Boolean) : editFormData.area,
        takeType: typeof editFormData.takeType === 'string' ? editFormData.takeType.split(/[、,]/).map(x => x.trim()).filter(Boolean) : editFormData.takeType
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
        <>
          <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>初案・改案・進行管理</h2>
              <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>プロジェクトごとの承認ステータスと修正履歴をリアルタイムで管理します。</p>
            </div>
          </header>

          <div style={{ display: 'grid', gap: '20px' }}>
            {items.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>
                表示可能な案件（初案待ち、改案、進行済）がありません。
              </div>
            ) : items.map(item => {
              const statusInfo = getStatusLabelAndColor(item.status);
              return (
                <div 
                  key={item.id} 
                  className="revision-card" 
                  onClick={() => setSelectedItem(item)}
                  style={{ 
                    backgroundColor: 'white', padding: '28px', borderRadius: '28px', 
                    border: '1.5px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.3s ease', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    <div>
                      <div style={{ fontWeight: '950', color: '#1e293b', fontSize: '18px', marginBottom: '8px' }}>{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '950', 
                          color: statusInfo.color, backgroundColor: statusInfo.bg, padding: '4px 12px', borderRadius: '20px' 
                        }}>
                          <Icons.Clock size={14} />
                          <span>{statusInfo.label} : {item.currentType}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>提案日: {item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        setIsCorrectionOpen(true);
                      }}
                      style={{ ...actionButtonStyle, border: '1.5px solid #0ea5e9', color: '#0ea5e9', backgroundColor: 'white', padding: '0 20px', height: '44px', borderRadius: '12px', fontSize: '13px' }}
                    >
                      <Icons.Edit size={16} /> 訂正
                    </button>
                    <div style={{ color: '#0ea5e9', fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      発注局一覧を表示する <Icons.ArrowLeft style={{ transform: 'rotate(180deg)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
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
            </div>
          </header>

          <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569' }}>発注局</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '120px' }}>DL</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '140px' }}>改案</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '140px' }}>決案</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '950', color: '#475569', textAlign: 'center', width: '140px' }}>進行</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #f1f5f9' }}>
                {(selectedItem.selectedStations || []).map((station, idx) => {
                  const decidedKey = `${selectedItem.id}_${station}`;
                  const isDecided = decidedStations[decidedKey];

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                      <td style={{ padding: '18px 24px', fontWeight: '900', color: '#1e293b', fontSize: '15px' }}>
                        {station}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDownload(station)}
                          style={{ ...actionButtonStyle }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                        >
                          DL
                        </button>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleRevision(station)}
                          style={{ ...actionButtonStyle }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                        >
                          <Icons.Edit size={16} /> 改案
                        </button>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleFinalDecision(selectedItem, station)}
                          style={{ 
                            ...actionButtonStyle, 
                            backgroundColor: isDecided ? '#ebfbee' : 'white',
                            borderColor: isDecided ? '#10b981' : '#e2e8f0',
                            color: isDecided ? '#10b981' : '#475569'
                          }}
                          onMouseEnter={e => { if(!isDecided) { e.currentTarget.style.borderColor = 'var(--tacos-red)'; e.currentTarget.style.color = 'var(--tacos-red)'; } }}
                          onMouseLeave={e => { if(!isDecided) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; } }}
                        >
                          <Icons.Check size={16} /> {isDecided ? '決案済み' : '決案'}
                        </button>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleProgress(selectedItem, station)}
                          style={{ 
                            ...actionButtonStyle, 
                            backgroundColor: isDecided ? '#1e293b' : '#f1f5f9', 
                            color: isDecided ? 'white' : '#cbd5e1', 
                            border: 'none', 
                            boxShadow: isDecided ? '0 8px 15px rgba(30,41,59,0.2)' : 'none',
                            cursor: isDecided ? 'pointer' : 'not-allowed',
                            opacity: isDecided ? 1 : 0.6
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
        </>
      )}

      <style>{`
        .revision-card:hover {
          border-color: #e2e8f0 !important;
          box-shadow: 0 15px 35px -10px rgba(0,0,0,0.08) !important;
          transform: translateY(-2px);
        }
        .hover-row:hover {
          background-color: #fafbfc;
        }
      `}</style>

      {previewingStation && (
         <FilePreviewDownloadPrintModal
           station={activeStation}
           proposalFile={selectedItem?.originalProject?.metadata?.proposalFile}
           onClose={() => setPreviewingStation(null)}
         />
      )}

      {showAnnotator && (
         <RevisionAnnotatorModal 
           station={activeStation} 
           proposalFile={selectedItem?.originalProject?.metadata?.proposalFile}
           onClose={() => setShowAnnotator(false)} 
           onSave={async () => {
             alert(`${activeStation} の改案内容を送信しました。`);
             setShowAnnotator(false);
             fetchItems();
           }}
         />
      )}

      <CorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => { setIsCorrectionOpen(false); setEditingItem(null); }}
        project={editingItem}
        onSave={handleSaveCorrection}
      />

      {progressItemAndStation && (
        <ProgressScheduleModal
          station={progressItemAndStation.station}
          item={progressItemAndStation.item}
          onClose={() => setProgressItemAndStation(null)}
        />
      )}
    </div>
  );
};

/* --- 案件情報訂正モーダル (プランニング・発注画面ベース) --- */
const CorrectionModal = ({ isOpen, onClose, project, onSave }) => {
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    sponsor_name: '',
    start_date: '',
    end_date: '',
    area: '',
    takeType: '',
    scale: '',
    tg: '',
    seconds: '',
    ag: '',
    ngItems: '',
    deadline: '',
    periods: [{ start: '', end: '' }],
    indices: [],
    serviceShares: [],
    // ヒアリング事項
    checkPersonalAllCost: false,
    checkRefPrice: false,
    checkAUnitPrice: false,
    checkAG: false,
    checkUpperLimit: false,
    checkBias: false,
    checkHouseholdCost: false,
    checkUnitPrice: false,
    checkStraightPub: false,
    checkInterviewPub: false,
    checkTalkPub: false,
    checkPrePub: false,
    checkProgramIntegration: false,
    checkPlanning: false,
    checkProposal: false,
    customHearingItems: [],
    planningDetails: ''
  });

  useEffect(() => {
    if (project && isOpen) {
      const originalProj = project.originalProject || project;
      const meta = originalProj.metadata || {};
      const hearing = meta.hearingItems || originalProj.hearingItems || {};

      setEditFormData({
        name: originalProj.name || project.name || '',
        sponsor_name: originalProj.sponsor_name || project.sponsor || '',
        start_date: originalProj.start_date || meta.start_date || '',
        end_date: originalProj.end_date || meta.end_date || '',
        area: originalProj.area && Array.isArray(originalProj.area) ? originalProj.area.join(', ') : (meta.area ? (Array.isArray(meta.area) ? meta.area.join(', ') : meta.area) : ''),
        takeType: originalProj.takeType && Array.isArray(originalProj.takeType) ? originalProj.takeType.join(', ') : (meta.takeType ? (Array.isArray(meta.takeType) ? meta.takeType.join(', ') : meta.takeType) : ''),
        scale: originalProj.scale || meta.budget || meta.scale || '',
        tg: originalProj.tg || meta.tg || '',
        seconds: originalProj.seconds || meta.seconds || '',
        ag: originalProj.ag || meta.ag || '',
        ngItems: originalProj.ngItems || meta.ngItems || '',
        deadline: originalProj.deadline || meta.deadline || '',
        periods: meta.periods && Array.isArray(meta.periods) ? meta.periods : [{ start: originalProj.start_date || '', end: originalProj.end_date || '' }],
        indices: meta.indices && Array.isArray(meta.indices) ? meta.indices : [],
        serviceShares: meta.serviceShares && Array.isArray(meta.serviceShares) ? meta.serviceShares : [],
        // Checkboxes
        checkPersonalAllCost: !!hearing.checkPersonalAllCost,
        checkRefPrice: !!hearing.checkRefPrice,
        checkAUnitPrice: !!hearing.checkAUnitPrice,
        checkAG: !!hearing.checkAG,
        checkUpperLimit: !!hearing.checkUpperLimit,
        checkBias: !!hearing.checkBias,
        checkHouseholdCost: !!hearing.checkHouseholdCost,
        checkUnitPrice: !!hearing.checkUnitPrice,
        checkStraightPub: !!hearing.checkStraightPub,
        checkInterviewPub: !!hearing.checkInterviewPub,
        checkTalkPub: !!hearing.checkTalkPub,
        checkPrePub: !!hearing.checkPrePub,
        checkProgramIntegration: !!hearing.checkProgramIntegration,
        checkPlanning: !!hearing.checkPlanning,
        checkProposal: !!hearing.checkProposal,
        customHearingItems: Array.isArray(hearing.customHearingItems) ? hearing.customHearingItems : [],
        planningDetails: hearing.planningDetails || ''
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="animate-fade" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div className="glass-card animate-scale" style={{ width: '1000px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'white', border: '1.5px solid #f1f5f9', padding: '40px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', pointerEvents: 'all' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '950', color: '#1e293b', margin: 0 }}>見積依頼内容の変更</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>案件の基本事項や要求内容を書き換えて保存できます。</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {/* 1行目 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>スポンサー名</label>
              <input type="text" value={editFormData.sponsor_name} onChange={e => setEditFormData({ ...editFormData, sponsor_name: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>商品・CP名 (案件名)</label>
              <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>放送・実施期間</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(editFormData.periods || []).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="date" value={p.start || ''} onChange={e => {
                      const nextPeriods = [...editFormData.periods];
                      nextPeriods[idx].start = e.target.value;
                      setEditFormData({ ...editFormData, periods: nextPeriods, start_date: nextPeriods[0]?.start || '' });
                    }} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
                    <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '800' }}>〜</span>
                    <input type="date" value={p.end || ''} onChange={e => {
                      const nextPeriods = [...editFormData.periods];
                      nextPeriods[idx].end = e.target.value;
                      setEditFormData({ ...editFormData, periods: nextPeriods, end_date: nextPeriods[0]?.end || '' });
                    }} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
                    {editFormData.periods.length > 1 && (
                      <button onClick={() => setEditFormData({ ...editFormData, periods: editFormData.periods.filter((_, i) => i !== idx) })} style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>&times;</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setEditFormData({ ...editFormData, periods: [...(editFormData.periods || []), { start: '', end: '' }] })} style={{ border: '1.5px dashed #cbd5e1', background: 'none', color: '#64748b', padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>+ 期間を追加</button>
              </div>
            </div>
          </div>

          {/* 2行目 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>放送・実施エリア</label>
              <input type="text" value={editFormData.area} onChange={e => setEditFormData({ ...editFormData, area: e.target.value })} placeholder="例: 関東, 関西, 中京" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>取り方 (パターン)</label>
              <input type="text" value={editFormData.takeType} onChange={e => setEditFormData({ ...editFormData, takeType: e.target.value })} placeholder="例: 全日, ヨの字" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>NG項目</label>
              <input type="text" value={editFormData.ngItems} onChange={e => setEditFormData({ ...editFormData, ngItems: e.target.value })} placeholder="例: 同業種NG, 特記事項など" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #fff5f5', backgroundColor: '#fffdfd', color: 'var(--tacos-red)', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
          </div>

          {/* 3行目 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>規模</label>
              <input type="text" value={editFormData.scale} onChange={e => setEditFormData({ ...editFormData, scale: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>TG</label>
              <input type="text" value={editFormData.tg} onChange={e => setEditFormData({ ...editFormData, tg: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>秒数</label>
              <input type="text" value={editFormData.seconds} onChange={e => setEditFormData({ ...editFormData, seconds: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>AG条件</label>
              <input type="text" value={editFormData.ag} onChange={e => setEditFormData({ ...editFormData, ag: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>見積〆切</label>
              <input type="datetime-local" value={editFormData.deadline} onChange={e => setEditFormData({ ...editFormData, deadline: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: 'var(--tacos-red)', fontSize: '14px', fontWeight: '800', minHeight: '44px', outline: 'none' }} />
            </div>
          </div>

          {/* 下段：ヒアリング事項 */}
          <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '24px', marginTop: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icons.Chat size={20} /> ヒアリング事項
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { id: 'checkPersonalAllCost', label: '個人ALLコスト' },
                { id: 'checkRefPrice', label: '目安一本単価' },
                { id: 'checkAUnitPrice', label: 'A単価', disabled: !!editFormData.ag },
                { id: 'checkAG', label: 'AG', disabled: !!editFormData.ag },
                { id: 'checkUpperLimit', label: '上限' },
                { id: 'checkBias', label: '30秒バイアス' },
                { id: 'checkHouseholdCost', label: '世帯コスト' },
                { id: 'checkUnitPrice', label: '単価（60s〜）' },
                { id: 'checkStraightPub', label: 'ストパブ' },
                { id: 'checkInterviewPub', label: '取材パブ' },
                { id: 'checkTalkPub', label: '対談パブ' },
                { id: 'checkPrePub', label: 'プレパブ' },
                { id: 'checkProgramIntegration', label: '番組仕込み' },
                { id: 'checkPlanning', label: '企画' },
                { id: 'checkProposal', label: '企画書' },
                ...editFormData.customHearingItems
              ].map(item => (
                <label key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', cursor: item.disabled ? 'not-allowed' : 'pointer',
                  padding: '12px', borderRadius: '14px', border: '2px solid',
                  backgroundColor: editFormData[item.id] ? 'white' : 'transparent',
                  borderColor: editFormData[item.id] ? 'var(--tacos-red)' : '#f1f5f9',
                  color: editFormData[item.id] ? 'var(--tacos-red)' : item.disabled ? '#cbd5e1' : '#475569',
                  transition: 'all 0.2s', opacity: item.disabled ? 0.6 : 1
                }}>
                  <input
                    type="checkbox"
                    checked={!!editFormData[item.id]}
                    disabled={item.disabled}
                    onChange={(e) => setEditFormData({ ...editFormData, [item.id]: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--tacos-red)' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>{item.label}</span>
                </label>
              ))}

              {/* 項目追加ボタン */}
              <button 
                onClick={() => {
                  const label = prompt('追加する項目名を入力してください');
                  if (label) {
                    const id = `custom_${Date.now()}`;
                    setEditFormData(prev => ({
                      ...prev,
                      customHearingItems: [...prev.customHearingItems, { id, label }],
                      [id]: true
                    }));
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '12px', borderRadius: '14px', border: '2px dashed #cbd5e1',
                  backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '800', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--tacos-red)'; e.currentTarget.style.color = 'var(--tacos-red)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <Icons.Plus size={16} />
                <span>項目追加</span>
              </button>
            </div>

            {editFormData.checkPlanning && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fcfcfe', borderRadius: '14px', border: '1.5px solid rgba(230,0,18,0.2)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '900', fontSize: '14px', color: 'var(--tacos-red)' }}>企画の内容 (自由記述)</label>
                <textarea
                  placeholder="企画内容の詳細、条件、放送枠の希望などを入力してください..."
                  value={editFormData.planningDetails || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, planningDetails: e.target.value })}
                  style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '10px', border: '1px solid #ffc9c9', fontSize: '14px', outline: 'none', resize: 'none' }}
                />
              </div>
            )}

            {/* INDEX設定 */}
            <div style={{ marginTop: '20px', borderTop: '1.5px solid #f1f5f9', paddingTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>INDEX設定</label>
              <div
                onClick={() => setIsIndexModalOpen(true)}
                style={{
                  width: '100%', minHeight: '52px', padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #e1e4e8',
                  backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {(editFormData.indices || []).length === 0 ? <span style={{ color: '#adb5bd', fontSize: '14px', fontWeight: '600' }}>未設定 (タップして項目を選択)</span> :
                    (editFormData.indices || []).map((idx, i) => (
                      <span key={i} style={{ fontSize: '12px', color: '#495057', backgroundColor: '#f1f3f5', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                        {idx.label}{idx.value && <>: <span style={{ color: 'var(--tacos-red)' }}>{idx.value}</span></>}
                      </span>
                    ))
                  }
                </div>
                <Icons.Edit size={18} style={{ color: '#94a3b8' }} />
              </div>
            </div>

            {/* サービス設定 */}
            <div style={{ marginTop: '20px', borderTop: '1.5px solid #f1f5f9', paddingTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>サービス</label>
              <div
                onClick={() => setIsServiceModalOpen(true)}
                style={{
                  width: '100%', minHeight: '52px', padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #e1e4e8',
                  backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {(editFormData.serviceShares || []).length === 0 ? <span style={{ color: '#adb5bd', fontSize: '14px', fontWeight: '600' }}>未設定 (タップして金額シェアを設定)</span> :
                    (editFormData.serviceShares || []).map((s, i) => (
                      <span key={i} style={{ fontSize: '12px', color: '#495057', backgroundColor: 'rgba(230,0,18,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1.5px solid rgba(230,0,18,0.1)', fontWeight: '800' }}>
                        {s.label}: <span style={{ color: 'var(--tacos-red)' }}>{s.value}%</span>
                      </span>
                    ))
                  }
                </div>
                <Icons.Edit size={18} style={{ color: '#94a3b8' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e1e4e8', backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>キャンセル</button>
          <button onClick={() => { onSave(editFormData); onClose(); }} style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #64748b', backgroundColor: '#64748b', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}>保存する</button>
        </div>
      </div>

      <IndexModal
        isOpen={isIndexModalOpen}
        onClose={() => setIsIndexModalOpen(false)}
        initialIndices={editFormData.indices || []}
        onSave={(newIndices) => setEditFormData({ ...editFormData, indices: newIndices })}
      />
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        initialShares={editFormData.serviceShares || []}
        onSave={(newShares) => setEditFormData({ ...editFormData, serviceShares: newShares })}
      />
    </div>
  );
};

/* --- アノテーション（書き込み）モーダル --- */
const RevisionAnnotatorModal = ({ station, onClose, onSave, proposalFile }) => {
  const [tool, setTool] = useState('rect'); // 'rect', 'text', 'pen'
  
  return (
    <div className="animate-fade" style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '40px'
    }}>
       <div style={{ 
         width: '1000px', height: '90vh', backgroundColor: 'white', 
         borderRadius: '32px', display: 'flex', flexDirection: 'column', 
         overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
         border: '1px solid rgba(255,255,255,0.2)'
       }}>
          <header style={{ 
            padding: '24px 32px', borderBottom: '1px solid #f1f3f5', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            backgroundColor: 'white', zIndex: 10
          }}>
             <div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>改案作成：{station}</div>
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>放送プランへの書き込み・修正依頼</h3>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', marginRight: '24px' }}>
                   <button onClick={() => setTool('rect')} style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: tool === 'rect' ? '#fee2e2' : 'transparent', color: tool === 'rect' ? 'var(--tacos-red)' : '#64748b', fontWeight: '800' }}>
                     <Icons.Table size={18} /> 四角
                   </button>
                   <button onClick={() => setTool('text')} style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: tool === 'text' ? '#fee2e2' : 'transparent', color: tool === 'text' ? 'var(--tacos-red)' : '#64748b', fontWeight: '800' }}>
                     <Icons.Edit size={18} /> 文字
                   </button>
                   <button onClick={() => setTool('pen')} style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: tool === 'pen' ? '#fee2e2' : 'transparent', color: tool === 'pen' ? 'var(--tacos-red)' : '#64748b', fontWeight: '800' }}>
                     <Icons.Chat size={18} /> ペン
                   </button>
                </div>
                <button className="btn-secondary" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px' }}>キャンセル</button>
                <button className="btn-primary" onClick={onSave} style={{ padding: '10px 32px', borderRadius: '10px', fontWeight: '800', backgroundColor: 'var(--tacos-red)' }}>現在の内容で送信</button>
             </div>
          </header>
          
          <div style={{ flex: 1, backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'auto' }}>
             {/* Virtual PDF Canvas */}
             <div style={{ 
               width: '840px', height: '1188px', backgroundColor: 'white', position: 'relative', 
               boxShadow: '0 20px 50px rgba(0,0,0,0.3)', cursor: 'crosshair', pointerEvents: 'all' 
             }}>
                {/* PDF Background simulation */}
                <div style={{ padding: '60px', opacity: 0.8 }}>
                   <div style={{ width: '200px', height: '20px', backgroundColor: '#e2e8f0', marginBottom: '40px' }} />
                   <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>局案・明細ファイル (書き込み改案)</div>
                   <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px' }}>作成日: 2026年4月24日 | 発信元: {station}</div>
                   
                   {proposalFile && (
                     <div style={{ padding: '18px 24px', border: '1.5px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '14px', marginBottom: '32px' }}>
                       <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px', letterSpacing: '0.02em' }}>対象ファイル:</div>
                       {proposalFile.split(',').map((f, i) => (
                         <div key={i} style={{ fontSize: '13px', fontWeight: '950', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                           <Icons.FileText size={14} color="#0ea5e9" /> {f.trim()}
                         </div>
                       ))}
                     </div>
                   )}

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '60px' }}>
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} style={{ height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />)}
                   </div>
                   
                   <div style={{ width: '100%', height: '320px', border: '2px solid #f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '24px', fontWeight: '800' }}>
                      タイムテーブル詳細プレビュー
                   </div>
                </div>

                {/* Annotation layer */}
                <div style={{ position: 'absolute', top: '340px', left: '100px', border: '4px solid var(--tacos-red)', width: '300px', height: '100px', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: '-30px', left: '0', backgroundColor: 'var(--tacos-red)', color: 'white', padding: '2px 8px', fontSize: '12px', fontWeight: '800' }}>
                    ここを修正希望
                  </div>
                </div>

                <div style={{ position: 'absolute', top: '550px', left: '500px', color: 'var(--tacos-red)', fontSize: '20px', fontWeight: '900' }}>
                   ← 単価を再考してください
                </div>
                
                {/* Simulated pen marks */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                   <path d="M 100 800 Q 150 750 200 800 T 300 800" stroke="var(--tacos-red)" strokeWidth="3" fill="none" opacity="0.6" />
                </svg>
             </div>
          </div>
       </div>
    </div>
  );
};

/* --- ファイルプレビュー・ダウンロード・印刷モーダル --- */
const FilePreviewDownloadPrintModal = ({ station, proposalFile, onClose }) => {
  return (
    <div className="animate-fade" style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '40px'
    }}>
       <div style={{ 
         width: '800px', maxHeight: '90vh', backgroundColor: 'white', 
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
                
                <div style={{ flex: 1, backgroundColor: '#fcfdfe', border: '1px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px', fontWeight: '800', padding: '40px', textAlign: 'center' }}>
                   <div>
                     <Icons.FileText size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                     <div>ファイルを正常に読み込みました。プレビューが利用可能です。</div>
                   </div>
                </div>
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

  // Default mock weeks/days structure for the 4/5 week calendar
  const weeks = [
    { title: '1週目', days: [
      { date: '9/1', day: '月' }, { date: '9/2', day: '火' }, { date: '9/3', day: '水' }, 
      { date: '9/4', day: '木' }, { date: '9/5', day: '金' }, { date: '9/6', day: '土' }, { date: '9/7', day: '日' }
    ]},
    { title: '2週目', days: [
      { date: '9/8', day: '月' }, { date: '9/9', day: '火' }, { date: '9/10', day: '水' }, 
      { date: '9/11', day: '木' }, { date: '9/12', day: '金' }, { date: '9/13', day: '土' }, { date: '9/14', day: '日' }
    ]},
    { title: '3週目', days: [
      { date: '9/15', day: '月' }, { date: '9/16', day: '火' }, { date: '9/17', day: '水' }, 
      { date: '9/18', day: '木' }, { date: '9/19', day: '金' }, { date: '9/20', day: '土' }, { date: '9/21', day: '日' }
    ]},
    { title: '4週目', days: [
      { date: '9/22', day: '月' }, { date: '9/23', day: '火' }, { date: '9/24', day: '水' }, 
      { date: '9/25', day: '木' }, { date: '9/26', day: '金' }, { date: '9/27', day: '土' }, { date: '9/28', day: '日' }
    ]},
    { title: '5週目', days: [
      { date: '9/29', day: '月' }, { date: '9/30', day: '火' }, { date: '', day: '' }, 
      { date: '', day: '' }, { date: '', day: '' }, { date: '', day: '' }, { date: '', day: '' }
    ]}
  ];

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      alert('進行表を送信しました。');
      setSending(false);
      onClose();
    }, 800);
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
                                  <input style={inputStyle} defaultValue={station || ''} />
                               </td>
                               <td style={{ ...headerCellStyle, width: '20%' }}>契約番号</td>
                               <td style={{ ...dataCellStyle, width: '30%' }}>
                                  <input style={inputStyle} placeholder="自動生成" />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>広告主</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} defaultValue={item?.sponsor || ''} />
                               </td>
                               <td style={headerCellStyle}>契約名</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} defaultValue={item?.name || ''} />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>放送期間</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="9/1 〜 9/30" />
                               </td>
                               <td style={headerCellStyle}>放送本数</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="本数" />
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
                                  <input style={inputStyle} placeholder="広告会社名" defaultValue={item?.originalProject?.metadata?.ba || '電通'} />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>担当</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="担当者名" />
                               </td>
                            </tr>
                            <tr>
                               <td style={{ ...headerCellStyle, height: '36px' }}>メール</td>
                               <td style={dataCellStyle}>
                                  <input style={inputStyle} placeholder="contact@example.com" />
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
                      {[1, 2, 3, 4].map(i => (
                         <tr key={i}>
                            <td style={dataCellStyle}><input style={inputStyle} /></td>
                            <td style={dataCellStyle}><input style={{ ...inputStyle, textAlign: 'left' }} /></td>
                            <td style={dataCellStyle}><input style={inputStyle} /></td>
                            <td style={dataCellStyle}><input style={inputStyle} /></td>
                            <td style={dataCellStyle}>
                               <select style={{ width: '100%', border: 'none', fontSize: '11px', textAlign: 'center', cursor: 'pointer' }}>
                                  <option value="">選択</option>
                                  <option value="在">在</option>
                                  <option value="送">送</option>
                               </select>
                            </td>
                            <td style={dataCellStyle}><input style={inputStyle} /></td>
                            <td style={dataCellStyle}><input style={inputStyle} /></td>
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
                                              {[1, 2, 3, 4].map(r => (
                                                 <div key={r} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', borderBottom: r === 4 ? 'none' : '1px solid #f1f5f9', flex: 1 }}>
                                                    <input style={{ ...inputStyle, fontSize: '10px' }} />
                                                    <input style={{ ...inputStyle, fontSize: '10px' }} />
                                                    <input style={{ ...inputStyle, fontSize: '10px' }} />
                                                    <input style={{ ...inputStyle, fontSize: '10px' }} />
                                                 </div>
                                              ))}
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

export default RevisionsView;
