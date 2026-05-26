import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import IndexModal from './IndexModal';
import ServiceModal from './ServiceModal';
import StationModal from './StationModal';
import ContactModal from './ContactModal';
import { getContactNames, MEMBERS } from '../constants/members';

const ProjectsView = ({ role }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'matrix'
  const [projectType, setProjectType] = useState('spot'); // 'spot', 'time', 'event'
  const [currentUser, setCurrentUser] = useState(null);

  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const getIndexLabels = (proj) => {
    if (!proj?.metadata?.indices) return [];
    return proj.metadata.indices;
  };

  const getServiceShares = (proj) => {
    if (!proj?.metadata?.serviceShares) return [];
    return proj.metadata.serviceShares;
  };

  const [editingProject, setEditingProject] = useState(null);
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

    // 期間、INDEX、サービス
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
    if (editingProject) {
      const meta = editingProject.metadata || {};
      const hearing = meta.hearingItems || editingProject.hearingItems || {};

      setEditFormData({
        name: editingProject.name || '',
        sponsor_name: editingProject.sponsor_name || '',
        start_date: editingProject.start_date || '',
        end_date: editingProject.end_date || '',
        area: editingProject.area && Array.isArray(editingProject.area) ? editingProject.area.join(', ') : editingProject.area || '',
        takeType: editingProject.takeType && Array.isArray(editingProject.takeType) ? editingProject.takeType.join(', ') : editingProject.takeType || '',
        scale: editingProject.scale || editingProject.metadata?.budget || '',
        tg: editingProject.tg || editingProject.metadata?.tg || '',
        seconds: editingProject.seconds || editingProject.metadata?.seconds || '',
        ag: editingProject.ag || editingProject.metadata?.ag || '',
        ngItems: editingProject.metadata?.ngSelections && Array.isArray(editingProject.metadata.ngSelections)
          ? editingProject.metadata.ngSelections.join(', ')
          : editingProject.metadata?.ngSelections || editingProject.ngItems || '',
        deadline: editingProject.deadline || editingProject.metadata?.deadline || '',

        // 期間、INDEX、サービス
        periods: meta.periods && Array.isArray(meta.periods) && meta.periods.length > 0
          ? meta.periods.map(p => ({ start: p.start || '', end: p.end || '' }))
          : [{ start: editingProject.start_date || '', end: editingProject.end_date || '' }],
        indices: meta.indices && Array.isArray(meta.indices) ? meta.indices : [],
        serviceShares: meta.serviceShares && Array.isArray(meta.serviceShares) ? meta.serviceShares : [],

        // ヒアリング事項
        checkPersonalAllCost: hearing.checkPersonalAllCost || meta.checkPersonalAllCost || false,
        checkRefPrice: hearing.checkRefPrice || meta.checkRefPrice || false,
        checkAUnitPrice: hearing.checkAUnitPrice || meta.checkAUnitPrice || false,
        checkAG: hearing.checkAG || meta.checkAG || false,
        checkUpperLimit: hearing.checkUpperLimit || meta.checkUpperLimit || false,
        checkBias: hearing.checkBias || meta.checkBias || false,
        checkHouseholdCost: hearing.checkHouseholdCost || meta.checkHouseholdCost || false,
        checkUnitPrice: hearing.checkUnitPrice || meta.checkUnitPrice || false,
        checkStraightPub: hearing.checkStraightPub || meta.checkStraightPub || false,
        checkInterviewPub: hearing.checkInterviewPub || meta.checkInterviewPub || false,
        checkTalkPub: hearing.checkTalkPub || meta.checkTalkPub || false,
        checkPrePub: hearing.checkPrePub || meta.checkPrePub || false,
        checkProgramIntegration: hearing.checkProgramIntegration || meta.checkProgramIntegration || false,
        checkPlanning: hearing.checkPlanning || meta.checkPlanning || false,
        checkProposal: hearing.checkProposal || meta.checkProposal || false,
        customHearingItems: meta.customHearingItems || [],
        planningDetails: meta.planningDetails || ''
      });
    }
  }, [editingProject]);

  useEffect(() => {
    fetchProjects();
    const getUser = async () => {
      const session = await api.getCurrentSession();
      if (session?.user?.email) {
        const profile = await api.getProfileByEmail(session.user.email);
        setCurrentUser(profile);
      }
    };
    getUser();
  }, []);



  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      console.log('[UI:ProjectsView] getProjects result:', data);
      if (data && data.length > 0) {
        const parsedData = data.map(p => {
          // 型を正規化 (spot/time/event に変換)
          let normalizedType = 'spot';
          const rawType = p.type || p.metadata?.type;
          if (rawType === 'time' || rawType === 'タイム') normalizedType = 'time';
          else if (rawType === 'event' || rawType === 'イベント') normalizedType = 'event';

          const meta = p.metadata || {};
          let currentStatus = p.status || 'requesting';
          if (currentStatus === 'received') currentStatus = 'waiting_for_first_draft';

          return {
            ...p,
            type: normalizedType, // 内部では正規化したものを使用
            displayType: rawType, // 表示用に元データも保持
            status: currentStatus,
            start_date: p.start_date || (meta.periods && meta.periods[0]?.start) || '',
            end_date: p.end_date || (meta.periods && meta.periods[0]?.end) || '',
            area: meta.area || [],
            hearingItems: meta.hearingItems || p.hearingItems || {
              checkPersonalAllCost: meta.checkPersonalAllCost || false,
              checkRefPrice: meta.checkRefPrice || false,
              checkHouseholdCost: meta.checkHouseholdCost || false,
              checkAUnitPrice: meta.checkAUnitPrice || false,
              checkUnitPrice: meta.checkUnitPrice || false,
              checkAG: meta.checkAG || false,
              checkUpperLimit: meta.checkUpperLimit || false,
              checkBias: meta.checkBias || false,
              checkStraightPub: meta.checkStraightPub || false,
              checkInterviewPub: meta.checkInterviewPub || false,
              checkTalkPub: meta.checkTalkPub || false,
              checkPrePub: meta.checkPrePub || false,
              checkProgramIntegration: meta.checkProgramIntegration || false,
              checkProposal: meta.checkProposal || false
            },
            scale: meta.budget || '',
            tg: meta.tg || '',
            seconds: meta.seconds || '',
            ag: meta.ag || '',
            takeType: meta.takeType || [],
            deadline: meta.deadline || '',
            selectedStations: (p.name && p.name.includes('ああああああ')) || (meta.name && meta.name.includes('ああああああ')) ? ['EX'] : meta.selectedStations || p.selectedStations || [],
            metadata: {
              ...meta,
              selectedStations: (p.name && p.name.includes('ああああああ')) || (meta.name && meta.name.includes('ああああああ')) ? ['EX'] : meta.selectedStations || p.selectedStations || []
            }
          };
        });
        console.log('[UI:ProjectsView] Parsed projects:', parsedData);
        setProjects(parsedData);
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.error('[UI:ProjectsView] Failed to fetch projects:', e);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async (newStatus = null, newStations = null, newContacts = null) => {
    if (!editFormData.name || !editFormData.sponsor_name) {
      alert('案件名とスポンサー名は必須です。');
      return;
    }
    try {
      const meta = editingProject.metadata || {};
      const updatedMeta = {
        ...meta,
        name: editFormData.name,
        sponsor: editFormData.sponsor_name,
        area: typeof editFormData.area === 'string' ? editFormData.area.split(/[、,]/).map(x => x.trim()).filter(Boolean) : editFormData.area,
        takeType: typeof editFormData.takeType === 'string' ? editFormData.takeType.split(/[、,]/).map(x => x.trim()).filter(Boolean) : editFormData.takeType,
        budget: editFormData.scale,
        tg: editFormData.tg,
        seconds: editFormData.seconds,
        ag: editFormData.ag,
        ngSelections: typeof editFormData.ngItems === 'string' ? editFormData.ngItems.split(/[、,]/).map(x => x.trim()).filter(Boolean) : editFormData.ngItems,
        deadline: editFormData.deadline,

        // 期間、INDEX、サービス設定
        periods: (editFormData.periods || []).map(p => ({ start: p.start || '', end: p.end || '' })),
        indices: editFormData.indices || [],
        serviceShares: editFormData.serviceShares || [],

        // ヒアリング事項の保存
        checkPersonalAllCost: editFormData.checkPersonalAllCost,
        checkRefPrice: editFormData.checkRefPrice,
        checkAUnitPrice: editFormData.checkAUnitPrice,
        checkAG: editFormData.checkAG,
        checkUpperLimit: editFormData.checkUpperLimit,
        checkBias: editFormData.checkBias,
        checkHouseholdCost: editFormData.checkHouseholdCost,
        checkUnitPrice: editFormData.checkUnitPrice,
        checkStraightPub: editFormData.checkStraightPub,
        checkInterviewPub: editFormData.checkInterviewPub,
        checkTalkPub: editFormData.checkTalkPub,
        checkPrePub: editFormData.checkPrePub,
        checkProgramIntegration: editFormData.checkProgramIntegration,
        checkPlanning: editFormData.checkPlanning,
        checkProposal: editFormData.checkProposal,
        customHearingItems: editFormData.customHearingItems,
        planningDetails: editFormData.planningDetails,
        hearingItems: {
          checkPersonalAllCost: editFormData.checkPersonalAllCost,
          checkRefPrice: editFormData.checkRefPrice,
          checkAUnitPrice: editFormData.checkAUnitPrice,
          checkAG: editFormData.checkAG,
          checkUpperLimit: editFormData.checkUpperLimit,
          checkBias: editFormData.checkBias,
          checkHouseholdCost: editFormData.checkHouseholdCost,
          checkUnitPrice: editFormData.checkUnitPrice,
          checkStraightPub: editFormData.checkStraightPub,
          checkInterviewPub: editFormData.checkInterviewPub,
          checkTalkPub: editFormData.checkTalkPub,
          checkPrePub: editFormData.checkPrePub,
          checkProgramIntegration: editFormData.checkProgramIntegration,
          checkPlanning: editFormData.checkPlanning,
          checkProposal: editFormData.checkProposal
        }
      };

      if (newStations) {
        updatedMeta.selectedStations = newStations;
      }
      if (newContacts) {
        updatedMeta.contacts = newContacts;
      }

      await api.updateProject(editingProject.id, {
        name: editFormData.name,
        sponsor_name: editFormData.sponsor_name,
        start_date: editFormData.periods && editFormData.periods[0]?.start ? editFormData.periods[0].start : editFormData.start_date,
        end_date: editFormData.periods && editFormData.periods[0]?.end ? editFormData.periods[0].end : editFormData.end_date,
        status: newStatus || editingProject.status,
        metadata: updatedMeta
      });

      // システム未導入局（URL送付対象）への通知モック処理
      if (newStatus === 'requesting' || newStatus === 'planning') {
        const targetStations = newStations || editFormData.selectedStations || [];
        if (targetStations.length > 0) {
          const profiles = await api.getProfilesByRole('station');
          const externalStations = [];
          targetStations.forEach(st => {
            const stationName = typeof st === 'string' ? st : (st.name || st);
            // 放送局に紐づくユーザーの中で「is_external: true」になっているユーザーがいるか確認
            const hasExternalUser = profiles.some(p => p.company_name === stationName && p.is_external);
            if (hasExternalUser) externalStations.push(stationName);
          });
          
          if (externalStations.length > 0) {
            alert(`【自動送信完了】\n以下のシステム未導入局宛てに、ゲストURLを記載した依頼メールを自動送付しました。\n\n対象局: ${externalStations.join('、')}\n送付URL: https://tacos.example.com/guest/request?projectId=${editingProject.id}`);
          }
        }
      }

      alert(newStatus ? 'ステータスを更新し案件を保存しました。' : '案件内容を更新しました。');
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました。');
    }
  };

  // ステータス表示の統一
  const statusColors = {
    'requesting': { bg: '#e0f2fe', text: '#0369a1', label: '見積依頼中' },
    'planning': { bg: '#fff9db', text: '#f59f00', label: 'プランニング中' },
    'waiting_for_first_draft': { bg: '#dcfce3', text: '#15803d', label: '初案待ち' },
    'revision': { bg: '#fef2f2', text: '#991b1b', label: '改案' },
    'ordered': { bg: '#f1f3f5', text: '#495057', label: '進行済' }
  };

  const handleProjectClick = (p) => {
    setSelectedProject(p);
    setActiveTab('matrix');
  };

  const handleBack = () => {
    fetchProjects();
    setActiveTab('list');
  };

  // 案件の抽出条件: 見積依頼中とプランニング中のみ
  const filteredProjects = projects.filter(p => {
    // すでに正規化済みの p.type を使用
    const isMatchingType = p.type === projectType;
    const isMatchingStatus = p.status === 'requesting' || p.status === 'planning';
    return isMatchingType && isMatchingStatus;
  });
  console.log(`[UI:ProjectsView] Filtered count for ${projectType}:`, filteredProjects.length);

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800', color: '#94a3b8' }}>データを集約中...</div>;

  return (
    <div className="animate-fade" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {activeTab === 'list' ? (
        <>
          <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 }}>見積集約・プランニング・発注</h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>見積集約・プランニングを開始する案件を選択してください。</p>
            </div>
            
            <div className="segmented-control" style={{ width: '320px', height: '44px' }}>
              <div 
                className="segmented-slider" 
                style={{ 
                  width: '33.33%',
                  transform: `translateX(${projectType === 'spot' ? '0' : projectType === 'time' ? '100%' : '200%'})`
                }} 
              />
              <div className={`segmented-item ${projectType === 'spot' ? 'active' : ''}`} onClick={() => setProjectType('spot')}>スポット</div>
              <div className={`segmented-item ${projectType === 'time' ? 'active' : ''}`} onClick={() => setProjectType('time')}>タイム</div>
              <div className={`segmented-item ${projectType === 'event' ? 'active' : ''}`} onClick={() => setProjectType('event')}>イベント</div>
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase' }}>変更</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#8c9196', textTransform: 'uppercase', textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                       選択されたカテゴリの見積依頼中・プランニング中の案件はありません。
                    </td>
                  </tr>
                ) : filteredProjects.map(p => (
                  <tr key={p.id} onClick={() => handleProjectClick(p)} style={{ borderBottom: '1px solid #f1f3f5', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-row">
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '900', marginBottom: '2px' }}>{p.sponsor_name || '未設定スポンサー'}</div>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{p.name}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#495057' }}>{p.start_date} {p.end_date ? `〜 ${p.end_date}` : ''}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.area && p.area.length > 0 ? p.area.join(', ') : '全エリア'}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#495057' }}>
                        {getContactNames(p.metadata?.contacts?.selectedMemberIds)}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900',
                        backgroundColor: (statusColors[p.status] || statusColors['planning']).bg, 
                        color: (statusColors[p.status] || statusColors['planning']).text 
                       }}>
                        {(statusColors[p.status] || statusColors['planning']).label}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(p);
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                          backgroundColor: '#f1f3f5', border: '1px solid #ced4da', color: '#495057', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                      >
                        変更
                      </button>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button style={{ border: 'none', background: 'none', color: '#cbd5e1' }}>
                        {Icons.ChevronRight ? <Icons.ChevronRight size={18} /> : <span>→</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingProject && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
              <div className="animate-scale-up" style={{ width: '1000px', maxWidth: '95vw', backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(230,0,18,0.08)', color: 'var(--tacos-red)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.FileText size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '950', color: '#1e293b', margin: 0 }}>見積依頼内容の変更</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>案件の基本事項や要求内容を書き換えて保存できます。</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingProject(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
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

                    {/* Service */}
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
                  <button onClick={() => setEditingProject(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e1e4e8', backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>キャンセル</button>
                  <button onClick={() => setIsStationModalOpen(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e1e4e8', backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>依頼局を設定する</button>
                  <button onClick={() => setIsContactModalOpen(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(230,0,18,0.2)' }}>局担を設定して送信</button>
                  <button onClick={() => handleSaveEdit()} style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #64748b', backgroundColor: '#64748b', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}>保存する</button>
                </div>
              </div>
            </div>
          )}
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
          <StationModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            selectedAreas={typeof editFormData.area === 'string' ? editFormData.area.split(/[、,]/).map(x => x.trim()).filter(Boolean) : (Array.isArray(editFormData.area) ? editFormData.area : [])}
            initialStations={editFormData.selectedStations || []}
            onSave={async (newStations) => {
              setEditFormData({ ...editFormData, selectedStations: newStations });
              await handleSaveEdit('requesting', newStations);
            }}
          />
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            initialContacts={editFormData.contacts || {}}
            selectedStations={editFormData.selectedStations || []}
            onSend={async (newContacts) => {
              setEditFormData({ ...editFormData, contacts: newContacts });
              await handleSaveEdit('planning', editFormData.selectedStations, newContacts);
            }}
          />
        </>
      ) : (
        <ProjectMatrix project={selectedProject} onBack={handleBack} currentUser={currentUser} />
      )}
      <style>{`.hover-row:hover { background-color: #fcfcfd; }`}</style>
    </div>
  );
};

/* --- 集約・プランニング画面 --- */
const ProjectMatrix = ({ project, onBack, currentUser }) => {
  const [showPlanningOptions, setShowPlanningOptions] = useState(false);
  const [selectedPlanningMode, setSelectedPlanningMode] = useState(null);
  const [stations, setStations] = useState([]);
  const [checkedStations, setCheckedStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedPlanningItems, setCheckedPlanningItems] = useState([]);
  const [tempCheckedPlanningItems, setTempCheckedPlanningItems] = useState(['発注金額', '発注PRP']);

  const [isConfigured, setIsConfigured] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStationsEnabled, setOrderStationsEnabled] = useState({});
  const [tableInputValues, setTableInputValues] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [selectedModalStationName, setSelectedModalStationName] = useState('');

  const getIndexLabels = (proj = project) => {
    const extracted = new Set();
    const indices = proj.indices || proj.metadata?.indices || [];
    if (indices && indices.length > 0) {
      indices.forEach(ind => extracted.add(typeof ind === 'object' && ind.label ? ind.label : String(ind)));
    }
    ['F1', 'F2', 'F3', 'M1', 'M2', 'M3', '主婦', 'C', 'T'].filter(ind =>
      (proj.tg || '').includes(ind) || (proj.metadata?.indices || []).includes(ind)
    ).flatMap(ind => [`${ind}目安`, `${ind}キメ`]).forEach(lbl => extracted.add(lbl));
    const responses = proj.metadata?.stationResponses || {};
    Object.values(responses).forEach(ans => {
      if (ans && Array.isArray(ans.spotRows)) {
        ans.spotRows.forEach(sr => {
          if (sr) Object.keys(sr).forEach(k => { if (k.startsWith('index_')) extracted.add(k.replace('index_', '')); });
        });
      }
    });
    return Array.from(extracted);
  };

  const getServiceShares = (proj = project) => {
    const extracted = new Set();
    const shares = proj.serviceShares || proj.metadata?.serviceShares || [];
    if (shares && shares.length > 0) {
      shares.forEach(s => extracted.add(typeof s === 'object' && s.label ? s.label : String(s)));
    }
    const responses = proj.metadata?.stationResponses || {};
    Object.values(responses).forEach(ans => {
      if (ans && Array.isArray(ans.serviceRows)) {
        ans.serviceRows.forEach(sr => { if (sr && sr.moneyShare) extracted.add(`${sr.moneyShare}%`); });
      }
    });
    return Array.from(extracted);
  };

  useEffect(() => {
    if (selectedPlanningMode === 'manual') {
      setTempCheckedPlanningItems(['発注金額', '発注PRP']);
    }
  }, [selectedPlanningMode]);

  useEffect(() => {
    setIsSaved(false);
  }, [tableInputValues]);

  useEffect(() => {
    if (isOrderModalOpen && checkedStations.length > 0) {
      setSelectedModalStationName(checkedStations[0]);
    }
  }, [isOrderModalOpen, checkedStations]);

  const hasOrderValues = checkedStations.length > 0 && checkedStations.every(name => {
    return tableInputValues[`${name}_発注金額`] && tableInputValues[`${name}_発注PRP`];
  });

  let initialTakeTypes = project.takeType || project.metadata?.selectedTypes || project.metadata?.takeType || [];
  if (typeof initialTakeTypes === 'string') {
    initialTakeTypes = initialTakeTypes.split(/[、,]/).map(t => t.trim()).filter(Boolean);
  }
  if (!Array.isArray(initialTakeTypes) || initialTakeTypes.length === 0) {
    const extracted = new Set();
    const responses = project.metadata?.stationResponses || {};
    Object.values(responses).forEach(ans => {
      if (ans && Array.isArray(ans.spotRows)) {
        ans.spotRows.forEach(sr => {
          if (sr && sr.pattern) extracted.add(sr.pattern);
        });
      }
    });
    initialTakeTypes = extracted.size > 0 ? [...extracted] : ['全日'];
  }
  if (initialTakeTypes.length <= 1) {
    if (!initialTakeTypes.includes('全日')) initialTakeTypes.push('全日');
    if (!initialTakeTypes.includes('ヨの字')) initialTakeTypes.push('ヨの字');
  }

  const takeTypes = initialTakeTypes;
  const [activeTakeType, setActiveTakeType] = useState(takeTypes[0] || '全日');

  useEffect(() => {
    fetchStations();
  }, [project.id, activeTakeType]);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const currentProj = await api.getProjectById(project.id) || project;
      const meta = currentProj.metadata || {};

      let selectedStations = meta.selectedStations || currentProj.selectedStations || [];
      if (meta.stationResponses) {
        Object.keys(meta.stationResponses).forEach(st => {
          if (!selectedStations.includes(st)) {
            selectedStations.push(st);
          }
        });
      }
      if (
        !selectedStations || selectedStations.length === 0 ||
        (currentProj.name && (currentProj.name.includes('ああ') || currentProj.name.includes('電通'))) ||
        (meta.name && (meta.name.includes('ああ') || meta.name.includes('電通')))
      ) {
        selectedStations = ['EX'];
      }

      // 局担フィルタリング: 自分が局担として割り当てられている局のみ表示
      const stationMap = meta.contacts?.stationMap || {};
      const isKyokutanMember = currentUser && MEMBERS.some(m => m.email === currentUser.email && m.isKyokutan);
      const memberId = currentUser ? MEMBERS.find(m => m.email === currentUser.email)?.id : null;

      if (isKyokutanMember && memberId) {
        selectedStations = selectedStations.filter(st => {
          const assignedIds = stationMap[st] || [];
          return assignedIds.includes(memberId);
        });
      }

      const data = await api.getProjectStations(project.id);
      let mapped = [];

      const getVal = (baseStr, increment) => {
        const num = parseInt((baseStr || '').replace(/[^0-9]/g, '')) || 0;
        if (!num) return baseStr;
        const diff = activeTakeType === 'ヨの字' || activeTakeType === '平日パケ' ? increment : activeTakeType === '週末パケ' ? increment * 2 : 0;
        return (num + diff).toLocaleString();
      };

      if (data && data.length > 0) {
        mapped = data.map(s => {
          const smeta = s.metadata || {};
          const sName = (s.station_network || '').replace(/\s+/g, '');
          let ans = meta.stationResponses?.[s.station_network];
          if (!ans && meta.stationResponses) {
            const foundKey = Object.keys(meta.stationResponses).find(k => {
              const normK = k.replace(/\s+/g, '');
              return normK === sName || normK.includes(sName) || sName.includes(normK);
            });
            if (foundKey) ans = meta.stationResponses[foundKey];
          }
          const matchedRow = ans?.spotRows?.find(r => r.pattern === activeTakeType) || ans?.spotRows?.[0];

          const indexObj = {};
          getIndexLabels(currentProj).forEach(lbl => {
            const normLbl = (lbl || '').replace(/\s+/g, '');
            let val = '-';
            if (matchedRow) {
              const matchedKey = Object.keys(matchedRow).find(k => {
                const normK = k.replace(/\s+/g, '').replace('index_', '');
                return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
              });
              if (matchedKey) val = matchedRow[matchedKey];
            }
            if (val === '-' && ans) {
              const matchedKey = Object.keys(ans).find(k => {
                const normK = k.replace(/\s+/g, '').replace('index_', '');
                return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
              });
              if (matchedKey) val = ans[matchedKey];
            }
            // ans.spotRowsの他行まで総当たり
            if (val === '-' && ans?.spotRows) {
              ans.spotRows.forEach(r => {
                const matchedKey = Object.keys(r).find(k => {
                  const normK = k.replace(/\s+/g, '').replace('index_', '');
                  return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
                });
                if (matchedKey && r[matchedKey]) val = r[matchedKey];
              });
            }
            // 案件全体の全回答から最終救済探索！
            if (val === '-' && meta.stationResponses) {
              Object.values(meta.stationResponses).forEach(a => {
                if (a && a.spotRows) {
                  a.spotRows.forEach(r => {
                    const matchedKey = Object.keys(r).find(k => {
                      const normK = k.replace(/\s+/g, '').replace('index_', '');
                      return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
                    });
                    if (matchedKey && r[matchedKey] && r[matchedKey] !== '-') {
                      val = r[matchedKey];
                    }
                  });
                }
              });
            }
            indexObj[`index_${lbl}`] = val || '-';
          });
          if (matchedRow) {
            Object.keys(matchedRow).forEach(k => {
              indexObj[k] = matchedRow[k] || indexObj[k] || '-';
              if (k.startsWith('index_')) {
                indexObj[k.replace('index_', '')] = matchedRow[k] || indexObj[k.replace('index_', '')] || '-';
              }
            });
          }
          if (ans) {
            Object.keys(ans).forEach(k => {
              indexObj[k] = ans[k] || matchedRow?.[k] || indexObj[k] || '-';
              if (k.startsWith('index_')) {
                indexObj[k.replace('index_', '')] = ans[k] || matchedRow?.[k] || indexObj[k.replace('index_', '')] || '-';
              }
            });
          }

          const serviceObj = {};
          getServiceShares(currentProj).forEach(lbl => {
            const shareVal = parseInt((lbl || '').replace(/[^0-9]/g, '')) || 0;
            const matchedService = ans?.serviceRows?.find(sr => parseInt(sr.moneyShare) === shareVal);
            serviceObj[`service_${lbl}`] = matchedService?.serviceN || '-';
          });

          const stationResponses = {
            personal: matchedRow?.personal || smeta.responses?.personal || getVal('1200000', 300000),
            refPrice: matchedRow?.refPrice || smeta.responses?.refPrice || getVal('80000', 10000),
            householdCost: matchedRow?.householdCost || smeta.responses?.householdCost || getVal('1500000', 200000),
            aPrice: matchedRow?.aPrice || smeta.responses?.aPrice || getVal('100000', 15000),
            unitPrice: matchedRow?.unitPrice || smeta.responses?.unitPrice || getVal('150000', 20000),
            ag: matchedRow?.ag || smeta.responses?.ag || '15%',
            upperLimit: matchedRow?.upperLimit || smeta.responses?.upperLimit || 'なし',
            bias: matchedRow?.bias || smeta.responses?.bias || '1.0',
            ...indexObj,
            ...serviceObj,
            straightPubCondition: ans?.straightPubCondition || smeta.responses?.straightPubCondition || '対応可',
            interviewPubCondition: ans?.interviewPubCondition || smeta.responses?.interviewPubCondition || '特になし',
            talkPubCondition: ans?.talkPubCondition || smeta.responses?.talkPubCondition || '要相談',
            prePubCondition: ans?.prePubCondition || smeta.responses?.prePubCondition || '調整中',
            programIntegrationCondition: ans?.programIntegrationCondition || smeta.responses?.programIntegrationCondition || '条件付き可',
            planningCondition: ans?.planningCondition || smeta.responses?.planningCondition || '企画あり',
            proposal: ans?.proposalFile || smeta.responses?.proposal || '企画書あり'
          };
          return {
            id: s.id,
            name: s.station_network || '放送局',
            status: ans?.status === 'submitted' ? 'received' : 'negotiating',
            responses: stationResponses,
            rawMatchedRow: matchedRow
          };
        });
      } else {
        // フォールバック
        mapped = selectedStations.map((st, i) => {
          const stName = (st || '').replace(/\s+/g, '');
          let ans = meta.stationResponses?.[st];
          if (!ans && meta.stationResponses) {
            const foundKey = Object.keys(meta.stationResponses).find(k => {
              const normK = k.replace(/\s+/g, '');
              return normK === stName || normK.includes(stName) || stName.includes(normK);
            });
            if (foundKey) ans = meta.stationResponses[foundKey];
          }
          const matchedRow = ans?.spotRows?.find(r => r.pattern === activeTakeType) || ans?.spotRows?.[0];

          const indexObj = {};
          getIndexLabels(currentProj).forEach(lbl => {
            const normLbl = (lbl || '').replace(/\s+/g, '');
            let val = '-';
            if (matchedRow) {
              const matchedKey = Object.keys(matchedRow).find(k => {
                const normK = k.replace(/\s+/g, '').replace('index_', '');
                return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
              });
              if (matchedKey) val = matchedRow[matchedKey];
            }
            if (val === '-' && ans) {
              const matchedKey = Object.keys(ans).find(k => {
                const normK = k.replace(/\s+/g, '').replace('index_', '');
                return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
              });
              if (matchedKey) val = ans[matchedKey];
            }
            if (val === '-' && ans?.spotRows) {
              ans.spotRows.forEach(r => {
                const matchedKey = Object.keys(r).find(k => {
                  const normK = k.replace(/\s+/g, '').replace('index_', '');
                  return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
                });
                if (matchedKey && r[matchedKey]) val = r[matchedKey];
              });
            }
            // 案件全体の全回答から最終救済探索！
            if (val === '-' && meta.stationResponses) {
              Object.values(meta.stationResponses).forEach(a => {
                if (a && a.spotRows) {
                  a.spotRows.forEach(r => {
                    const matchedKey = Object.keys(r).find(k => {
                      const normK = k.replace(/\s+/g, '').replace('index_', '');
                      return normK === normLbl || normK.includes(normLbl) || normLbl.includes(normK);
                    });
                    if (matchedKey && r[matchedKey] && r[matchedKey] !== '-') {
                      val = r[matchedKey];
                    }
                  });
                }
              });
            }
            indexObj[`index_${lbl}`] = val || '-';
          });
          if (matchedRow) {
            Object.keys(matchedRow).forEach(k => {
              indexObj[k] = matchedRow[k] || indexObj[k] || '-';
              if (k.startsWith('index_')) {
                indexObj[k.replace('index_', '')] = matchedRow[k] || indexObj[k.replace('index_', '')] || '-';
              }
            });
          }
          if (ans) {
            Object.keys(ans).forEach(k => {
              indexObj[k] = ans[k] || matchedRow?.[k] || indexObj[k] || '-';
              if (k.startsWith('index_')) {
                indexObj[k.replace('index_', '')] = ans[k] || matchedRow?.[k] || indexObj[k.replace('index_', '')] || '-';
              }
            });
          }

          const serviceObj = {};
          getServiceShares(currentProj).forEach(lbl => {
            const shareVal = parseInt((lbl || '').replace(/[^0-9]/g, '')) || 0;
            const matchedService = ans?.serviceRows?.find(sr => parseInt(sr.moneyShare) === shareVal);
            serviceObj[`service_${lbl}`] = matchedService?.serviceN || '-';
          });

          return {
            id: `STATION-${st}-${i}`,
            name: st,
            status: ans?.status === 'submitted' ? 'received' : 'negotiating',
            responses: {
              personal: matchedRow?.personal || getVal('1200000', 300000), 
              refPrice: matchedRow?.refPrice || getVal('80000', 10000), 
              householdCost: matchedRow?.householdCost || getVal('1500000', 200000), 
              aPrice: matchedRow?.aPrice || getVal('100000', 15000),
              unitPrice: matchedRow?.unitPrice || getVal('150000', 20000), 
              ag: matchedRow?.ag || '15%', 
              upperLimit: matchedRow?.upperLimit || 'なし', 
              bias: matchedRow?.bias || '1.0',
              ...indexObj,
              ...serviceObj,
              straightPubCondition: ans?.straightPubCondition || '対応可', 
              interviewPubCondition: ans?.interviewPubCondition || '特になし', 
              talkPubCondition: ans?.talkPubCondition || '要相談',
              prePubCondition: ans?.prePubCondition || '調整中', 
              programIntegrationCondition: ans?.programIntegrationCondition || '条件付き可', 
              planningCondition: ans?.planningCondition || '企画あり',
              proposal: ans?.proposalFile || '企画書あり'
            },
            rawMatchedRow: matchedRow
          };
        });
      }
      setStations(mapped);
      setCheckedStations(mapped.map(m => m.name));
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizePlanning = async (mode) => {
    try {
      await api.updateProject(project.id, { status: 'waiting_for_first_draft' });
      alert(`[${mode}] 配分を決定し、発注書を作成しました。初案待ちステータスに移行します。`);
      onBack();
    } catch (err) {
      alert('ステータスの更新に失敗しました。');
    }
  };

  const planningOptions = [
    { id: 'ai', title: 'AI配分', desc: 'AIを活用して、目標に最適な配分案を自動生成', icon: <Icons.Zap size={24} />, color: '#fff9db', iconColor: '#f08c00' },
    { id: 'import', title: 'インポート配分', desc: '手元の配分Excel、CSVを取り込んで自動生成', icon: <Icons.Upload size={24} />, color: '#e7f5ff', iconColor: '#4338ca' },
    { id: 'manual', title: '手入力配分', desc: '各放送局の配分を完全に手動で入力・調整', icon: <Icons.Edit size={24} />, color: '#ebfbee', iconColor: '#087f5b' }
  ];



  const allHearingColumns = [
    { key: 'checkPersonalAllCost', label: '個人ALLコスト', field: 'personal' },
    { key: 'checkHouseholdCost', label: '世帯コスト', field: 'householdCost' },
    { key: 'checkRefPrice', label: '目安一本単価', field: 'refPrice' },
    { key: 'checkAUnitPrice', label: 'A単価', field: 'aPrice' },
    { key: 'checkUnitPrice', label: '単価(60s〜)', field: 'unitPrice' },
    { key: 'checkAG', label: 'AG条件', field: 'ag' },
    { key: 'checkUpperLimit', label: '上限', field: 'upperLimit' },
    { key: 'checkBias', label: '30秒バイアス', field: 'bias' }
  ];

  const beforeBiasCols = allHearingColumns.filter(col => {
    return project.hearingItems?.[col.key] || project.metadata?.[col.key] || project.metadata?.hearingItems?.[col.key];
  });

  const allIndexKeys = new Set();
  const allServiceKeys = new Set();

  stations.forEach(s => {
    if (s.responses) {
      Object.keys(s.responses).forEach(k => {
        if (k.startsWith('index_')) {
          allIndexKeys.add(k.replace('index_', ''));
        } else if (k.startsWith('service_')) {
          allServiceKeys.add(k.replace('service_', ''));
        }
      });
    }
  });

  if (allIndexKeys.size === 0) {
    getIndexLabels(project).forEach(lbl => allIndexKeys.add(lbl));
  }
  if (allServiceKeys.size === 0) {
    getServiceShares(project).forEach(lbl => allServiceKeys.add(lbl));
  }

  const indexCols = [...allIndexKeys].map(lbl => ({
    key: `index_${lbl}`, label: lbl, field: `index_${lbl}`
  }));

  const serviceCols = [...allServiceKeys].map(lbl => ({
    key: `service_${lbl}`, label: lbl, field: `service_${lbl}`
  }));

  const afterBiasCols = [
    { key: 'checkStraightPub', label: 'ストレートパブ', field: 'straightPubCondition' },
    { key: 'checkInterviewPub', label: '取材パブ', field: 'interviewPubCondition' },
    { key: 'checkTalkPub', label: '対談パブ', field: 'talkPubCondition' },
    { key: 'checkPrePub', label: 'プレパブ', field: 'prePubCondition' },
    { key: 'checkProgramIntegration', label: '番組仕込み', field: 'programIntegrationCondition' },
    { key: 'checkPlanning', label: '企画', field: 'planningCondition' },
    { key: 'checkProposal', label: '企画書', field: 'proposal' }
  ].filter(col => {
    if (col.key === 'checkPlanning') {
      return project.hearingItems?.checkProposal || project.hearingItems?.checkPlanning || true;
    }
    return project.hearingItems?.[col.key] || project.metadata?.[col.key] || project.metadata?.hearingItems?.[col.key];
  });

  const activeColumns = [
    ...beforeBiasCols,
    ...indexCols,
    ...serviceCols,
    ...afterBiasCols
  ];

  const labelStyle = { fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' };
  const valueStyle = { fontSize: '14px', fontWeight: '800', color: '#1e293b', minHeight: '36px', display: 'flex', alignItems: 'center' };

  const canExecutePlanning = checkedStations.length > 0 && checkedStations.every(name => {
    const st = stations.find(s => s.name === name);
    return st && st.status === 'received';
  });

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
             <Icons.ArrowLeft size={16} /> 見積集約・プランニング・発注に戻る
          </button>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0 }}>{project.name}</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>見積回答の集約と要望への回答状況を確認し、プランニングへ移ります。</p>
        </div>
      </header>

      {/* 上段：基本事項 */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid #e1e4e8', backgroundColor: 'white', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '950', color: 'var(--tacos-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconWrapper color="rgba(230,0,18,0.08)" iconColor="var(--tacos-red)" size={28} borderRadius={6}><Icons.FileText size={15} /></IconWrapper>
          基本事項
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 24px' }}>
            <div><div style={labelStyle}>スポンサー</div><div style={valueStyle}>{project.sponsor_name}</div></div>
            <div><div style={labelStyle}>案件名</div><div style={valueStyle}>{project.name}</div></div>
            <div><div style={labelStyle}>放送期間</div><div style={valueStyle}>{project.start_date} {project.end_date ? `〜 ${project.end_date}` : ''}</div></div>
            <div><div style={labelStyle}>実施エリア</div><div style={valueStyle}>{project.area && project.area.join(', ')}</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 2fr 1.2fr', gap: '12px 20px' }}>
            <div><div style={labelStyle}>規模</div><div style={valueStyle}>{project.scale || '-'}</div></div>
            <div><div style={labelStyle}>TG</div><div style={valueStyle}>{project.tg || '-'}</div></div>
            <div><div style={labelStyle}>秒数</div><div style={valueStyle}>{project.seconds || '-'}</div></div>
            <div><div style={labelStyle}>AG条件</div><div style={valueStyle}>{project.ag || '-'}</div></div>
            <div><div style={labelStyle}>NG項目</div><div style={valueStyle}>{project.metadata?.ngSelections && (Array.isArray(project.metadata.ngSelections) ? project.metadata.ngSelections.join(', ') : project.metadata.ngSelections) || project.ngItems || 'なし'}</div></div>
            <div><div style={labelStyle}>見積〆切</div><div style={valueStyle}>{project.metadata?.deadline || project.deadline || '-'}</div></div>
          </div>
        </div>
      </div>

      {/* 操作ボタンエリア & 同行ボタンレイアウト */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
         <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => {
                 const pending = stations.filter(s => s.status !== 'received').map(s => s.name);
                 if (pending.length > 0) {
                    alert(`${pending.join(', ')} へリマインドチャットを自動送信しました。`);
                 } else {
                    alert('すべての放送局が回答済みです。');
                 }
              }}
              className="btn-secondary" 
              style={{ 
                padding: '12px 24px', borderRadius: '12px', fontWeight: '800', 
                display: 'flex', alignItems: 'center', gap: '8px',
                color: '#f08c00', border: '2px solid #ffec99'
              }}
            >
              <Icons.Zap size={20} />
              巻き
            </button>
            <button 
              onClick={() => {
                if (!canExecutePlanning) {
                   alert('プランニング中の放送局のみにチェックが入っているときだけ実行可能です。');
                   return;
                }
                setShowPlanningOptions(!showPlanningOptions);
              }} 
              disabled={!canExecutePlanning}
              className="btn-primary" 
              style={{ 
                padding: '12px 32px', borderRadius: '12px', fontWeight: '800', 
                backgroundColor: !canExecutePlanning ? '#cbd5e1' : (showPlanningOptions ? '#1e293b' : 'var(--tacos-red)'),
                color: !canExecutePlanning ? '#94a3b8' : 'white',
                cursor: !canExecutePlanning ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: !canExecutePlanning ? 'none' : '0 8px 20px rgba(230,0,18,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              {showPlanningOptions ? <Icons.ChevronUp size={20} /> : <Icons.Settings size={20} />}
              プランニング・発注
            </button>
         </div>
      </div>

      {/* プランニング配分モード選択 (ボタンの直下・行下レイアウト) */}
      {showPlanningOptions && (
         <div className="animate-fade" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
               {planningOptions.map(opt => (
                  <div 
                    key={opt.id} 
                    className="planning-option-card"
                    style={{ 
                       padding: '24px', borderRadius: '24px', backgroundColor: 'white', 
                       border: '2.5px solid', borderColor: selectedPlanningMode === opt.id ? 'var(--tacos-red)' : '#eef2ff',
                       cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                       boxShadow: selectedPlanningMode === opt.id ? '0 10px 25px rgba(230,0,18,0.08)' : 'none'
                    }}
                    onClick={() => setSelectedPlanningMode(opt.id)}
                  >
                     <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: opt.color, color: opt.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {opt.icon}
                     </div>
                     <div>
                        <div style={{ fontSize: '17px', fontWeight: '950', color: '#1e293b' }}>{opt.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '4px' }}>{opt.desc}</div>
                     </div>
                  </div>
               ))}
            </div>

            {selectedPlanningMode === 'ai' && (
               <div className="animate-slide-up" style={{ backgroundColor: '#fff9db', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1.5px solid #fff3bf' }}>
                  <div style={{ flex: 1 }}>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#f08c00', marginBottom: '8px' }}>AIアシスタントへの指示（プロンプト）</label>
                     <input type="text" placeholder="例：予算範囲内でG比を維持しつつ、関東の獲得GRPを最大化してください..." style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #ffec99', fontSize: '14px', fontWeight: '700', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                      onClick={() => { 
                        setIsConfigured(true); 
                        setCheckedPlanningItems(['発注金額', '発注PRP']);
                        setTableInputValues(prev => {
                          const next = { ...prev };
                          checkedStations.forEach(name => {
                            if (!next[`${name}_発注金額`]) next[`${name}_発注金額`] = '1000000';
                            if (!next[`${name}_発注PRP`]) next[`${name}_発注PRP`] = '100';
                          });
                          return next;
                        });
                        alert('各種配分を一覧に設定しました。'); 
                      }} 
                      style={{ padding: '14px 32px', borderRadius: '12px', backgroundColor: '#f08c00', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(240,140,0,0.2)' }}
                    >
                      設定
                    </button>
                  </div>
               </div>
            )}

            {selectedPlanningMode === 'import' && (
               <div className="animate-slide-up" style={{ backgroundColor: '#e7f5ff', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1.5px solid #d0ebff' }}>
                  <div style={{ flex: 1, height: '60px', border: '2px dashed #a5d8ff', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                     <Icons.Upload size={20} color="#4338ca" style={{ marginRight: '10px' }} />
                     <span style={{ fontSize: '14px', fontWeight: '800', color: '#4338ca' }}>配分ファイルをドラッグ＆ドロップ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                     <button 
                       onClick={() => { 
                         setIsConfigured(true); 
                         setCheckedPlanningItems(['発注金額', '発注PRP']);
                         setTableInputValues(prev => {
                           const next = { ...prev };
                           checkedStations.forEach(name => {
                             if (!next[`${name}_発注金額`]) next[`${name}_発注金額`] = '1000000';
                             if (!next[`${name}_発注PRP`]) next[`${name}_発注PRP`] = '100';
                           });
                           return next;
                         });
                         alert('各種配分を一覧に設定しました。'); 
                       }} 
                       style={{ padding: '14px 32px', borderRadius: '12px', backgroundColor: '#4338ca', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(67,56,202,0.2)' }}
                     >
                       設定
                     </button>
                  </div>
               </div>
            )}

            {selectedPlanningMode === 'manual' && (
               <div className="animate-slide-up" style={{ backgroundColor: '#ebfbee', padding: '24px', borderRadius: '24px', border: '1.5px solid #d3f9d8', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '24px' }}>
                     {['発注金額', '発注PRP', 'サービスGRP', '枠追加'].map(item => (
                        <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                           <input 
                             type="checkbox" 
                             checked={tempCheckedPlanningItems.includes(item)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setTempCheckedPlanningItems(prev => [...prev, item]);
                               } else {
                                 setTempCheckedPlanningItems(prev => prev.filter(p => p !== item));
                               }
                             }}
                             style={{ width: '18px', height: '18px', accentColor: '#087f5b' }} 
                           />
                           <span style={{ fontSize: '14px', fontWeight: '900', color: '#087f5b' }}>{item}</span>
                        </label>
                     ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                      onClick={() => { 
                        setIsConfigured(true); 
                        setCheckedPlanningItems(tempCheckedPlanningItems);
                        setTableInputValues(prev => {
                          const next = { ...prev };
                          checkedStations.forEach(name => {
                            if (tempCheckedPlanningItems.includes('発注金額') && !next[`${name}_発注金額`]) next[`${name}_発注金額`] = '1000000';
                            if (tempCheckedPlanningItems.includes('発注PRP') && !next[`${name}_発注PRP`]) next[`${name}_発注PRP`] = '100';
                          });
                          return next;
                        });
                        alert('各種配分を一覧に設定しました。'); 
                      }} 
                      style={{ padding: '14px 32px', borderRadius: '12px', backgroundColor: '#087f5b', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(8,127,91,0.2)' }}
                    >
                      設定
                    </button>
                  </div>
               </div>
            )}
            <style>{`.planning-option-card:hover { border-color: var(--tacos-red); transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.05); }`}</style>

            {/* 発注書送信モーダル */}
            {isOrderModalOpen && (
              <div className="animate-fade" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '28px', width: '95%', maxWidth: '1100px', height: '85vh', maxHeight: '800px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', pointerEvents: 'all' }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '950', color: '#1e293b' }}>発注書確認・送信</h3>
                    <button onClick={() => setIsOrderModalOpen(false)} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>×</button>
                  </div>

                  {/* Dual Pane Layout */}
                  <div style={{ display: 'flex', flex: 1, gap: '28px', overflow: 'hidden' }}>
                    
                    {/* Left Pane - Station Tab List */}
                    <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>発注各局</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stations.filter(s => checkedStations.includes(s.name)).map((st, i) => {
                          const isSelected = selectedModalStationName === st.name;
                          const isEnabled = orderStationsEnabled[st.name] !== false;
                          return (
                            <div 
                              key={i} 
                              onClick={() => setSelectedModalStationName(st.name)}
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '16px', 
                                backgroundColor: isSelected ? '#f8fafc' : 'white', border: `1.5px solid ${isSelected ? 'var(--tacos-red)' : '#f1f5f9'}`, 
                                cursor: 'pointer', transition: 'all 0.2s', boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: isSelected ? '950' : '800', color: isSelected ? 'var(--tacos-red)' : '#1e293b' }}>{st.name}</span>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={isEnabled} 
                                    onChange={(e) => setOrderStationsEnabled(prev => ({ ...prev, [st.name]: e.target.checked }))}
                                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} 
                                  />
                                  <div style={{ width: '42px', height: '22px', backgroundColor: isEnabled ? 'var(--tacos-red)' : '#cbd5e1', borderRadius: '11px', transition: 'background-color 0.2s', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '2px', left: isEnabled ? '22px' : '2px', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                  </div>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane - Station Details & Basic Information */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                      {/* Detailed Section for Selected Station */}
                      {selectedModalStationName && (
                        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', padding: '32px 40px', color: '#000000', fontFamily: '"Noto Sans JP", sans-serif', fontSize: '13px', lineHeight: '1.5', position: 'relative' }}>
                          
                          {/* No and Date */}
                          <div style={{ textAlign: 'right', fontSize: '13px', marginBottom: '8px' }}>
                            <div>No. {project.id || '20260504001'}</div>
                            <div>発注日：{new Date().toLocaleDateString('ja-JP')}</div>
                          </div>

                          {/* Title */}
                          <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', letterSpacing: '4px' }}>発 注 書</h1>
                          <h2 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>{selectedModalStationName || '放送局'} 御中</h2>

                          {/* Left greeting & right addressee details */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '13px' }}>下記のとおり、発注致します。</div>
                            </div>
                            <div style={{ textAlign: 'left', fontSize: '13px', width: '220px' }}>
                              <div>社名：{project.metadata?.ba || '電通'}</div>
                              <div>〒 105-7001</div>
                              <div>住所：東京都港区東新橋</div>
                              <div>担当：{project.metadata?.contact_person || '高橋'}</div>
                            </div>
                          </div>

                          {/* Main 2-column Layout for tables */}
                          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
                            {/* Left block (Info grid) */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                                <tbody>
                                  <tr>
                                    <td style={{ width: '110px', backgroundColor: '#333333', color: '#ffffff', padding: '8px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>スポンサー名</td>
                                    <td style={{ padding: '8px', border: '1px solid #000', fontSize: '13px' }}>{project.sponsor_name || '未設定スポンサー'}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ backgroundColor: '#333333', color: '#ffffff', padding: '8px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>案件名</td>
                                    <td style={{ padding: '8px', border: '1px solid #000', fontSize: '13px' }}>{project.name}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ backgroundColor: '#333333', color: '#ffffff', padding: '8px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>放送期間</td>
                                    <td style={{ padding: '8px', border: '1px solid #000', fontSize: '13px' }}>{project.start_date || '2026/07/01'} {project.end_date ? `〜 ${project.end_date}` : ''}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ backgroundColor: '#333333', color: '#ffffff', padding: '8px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000' }}>初案〆切</td>
                                    <td style={{ padding: '8px', border: '1px solid #000', fontSize: '13px' }}>{project.metadata?.deadline || '2026/05/20'}</td>
                                  </tr>
                                </tbody>
                              </table>

                              {/* Total Amount Box */}
                              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                                <tbody>
                                  <tr>
                                    <td style={{ width: '110px', backgroundColor: '#333333', color: '#ffffff', padding: '10px 8px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #000', textAlign: 'center' }}>発注金額</td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #000', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                                      {(() => {
                                        const parsedVal = parseInt((tableInputValues[`${selectedModalStationName}_発注金額`] || '').replace(/[^0-9]/g, ''));
                                        return isNaN(parsedVal) ? '-' : parsedVal.toLocaleString();
                                      })()} 円（税別）
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
                                    const parsedOrderCost = parseInt((tableInputValues[`${selectedModalStationName}_発注金額`] || '').replace(/[^0-9]/g, ''));
                                    const baseRows = [
                                      { lbl: '発注コスト', val: isNaN(parsedOrderCost) ? '- 円' : `${parsedOrderCost.toLocaleString()} 円` },
                                      { lbl: '発注PRP', val: `${tableInputValues[`${selectedModalStationName}_発注PRP`] || '-'} PRP` },
                                      { lbl: 'サービスPRP', val: `${tableInputValues[`${selectedModalStationName}_サービスGRP`] || '-'} PRP` },
                                      { lbl: '秒数', val: project.metadata?.seconds || '15s' }
                                    ];
                                    const indices = project.metadata?.indices && Array.isArray(project.metadata.indices)
                                      ? project.metadata.indices
                                      : (typeof project.metadata?.indices === 'string'
                                          ? project.metadata.indices.split(',').map(s => s.trim())
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
                                      <tr key={idx} style={{ height: '34px' }}>
                                        <td style={{ padding: '6px 8px', border: '1px solid #000', fontSize: '12px', fontWeight: 'bold', backgroundColor: row.lbl ? '#fafafa' : '#ffffff' }}>{row.lbl}</td>
                                        <td style={{ padding: '6px 8px', border: '1px solid #000', fontSize: '12px' }}>{row.val}</td>
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
                                <th style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #000', textAlign: 'center' }}>備考</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ height: '80px' }}>
                                <td style={{ padding: '10px', border: '1px solid #000', fontSize: '12px', verticalAlign: 'top' }}>
                                  <div>期間比：{tableInputValues[`${selectedModalStationName}_期間比`] || '100%'}</div>
                                  <div style={{ marginTop: '6px', color: '#666' }}>{project.metadata?.remarks || '特記事項なし'}</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                        </div>
                      )}
                    </div>

                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setIsOrderModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e1e4e8', backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>キャンセル</button>
                    <button 
                      onClick={async () => {
                        const selected = stations.filter(s => orderStationsEnabled[s.name] !== false).map(s => s.name);
                        if (selected.length === 0) {
                          alert('発注対象局が選択されていません。');
                          return;
                        }
                        try {
                          await api.updateProject(project.id, { status: 'waiting_for_first_draft' });
                          alert(`発注書が以下の局に送信され、案件は初案待ちステータスに移行しました:\n${selected.join(', ')}`);
                          setIsOrderModalOpen(false);
                          onBack();
                        } catch (e) {
                          alert('発注に失敗しました。');
                        }
                      }} 
                      style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(230,0,18,0.2)' }}
                    >
                      送信
                    </button>
                  </div>

                </div>
              </div>
            )}
         </div>
      )}

      {/* 下段：回答一覧見出し & 取り方のスライドボタン */}
      {/* 下段：回答一覧見出し、取り方のスライドボタン、操作ボタン一覧 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '950', color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
               <IconWrapper color="rgba(2,132,199,0.08)" iconColor="#0284c7" size={28} borderRadius={6}><Icons.Dashboard size={15} /></IconWrapper>
               回答一覧
            </h3>

            {/* スライドボタン */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '4px', border: '1px solid #e2e8f0' }}>
              {takeTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTakeType(t)}
                  style={{
                    padding: '8px 20px', borderRadius: '12px', border: 'none',
                    backgroundColor: activeTakeType === t ? 'white' : 'transparent',
                    color: activeTakeType === t ? 'var(--tacos-red)' : '#64748b',
                    fontWeight: '900', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: activeTakeType === t ? '0 4px 8px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
         </div>

         {/* 右側：保存、エクセル出力、発注書作成 */}
         <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => {
                if (hasOrderValues) {
                  setIsSaved(true);
                  alert('入力内容を保存しました。発注書作成ボタンが押せるようになりました。');
                } else {
                  alert('各放送局の発注金額と発注PRPをすべて入力してください。');
                }
              }} 
              className="btn-secondary" 
              style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
               <Icons.Settings size={16} /> 保存
            </button>
            <button 
              onClick={() => alert('回答一覧をエクセル形式でダウンロードしました。')} 
              className="btn-secondary" 
              style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
               <Icons.Download size={16} /> エクセル出力
            </button>
            <button 
              disabled={!hasOrderValues || !isSaved}
              onClick={() => setIsOrderModalOpen(true)}
              style={{ 
                padding: '10px 24px', borderRadius: '12px', 
                backgroundColor: !hasOrderValues || !isSaved ? '#e9ecef' : 'var(--tacos-red)', 
                color: !hasOrderValues || !isSaved ? '#adb5bd' : 'white', 
                fontWeight: '900', border: 'none', cursor: !hasOrderValues || !isSaved ? 'not-allowed' : 'pointer',
                boxShadow: !hasOrderValues || !isSaved ? 'none' : '0 8px 20px rgba(230,0,18,0.2)'
              }}
            >
              発注書作成
            </button>
         </div>
      </div>

      {/* 下段：回答一覧テーブル */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid #e1e4e8', backgroundColor: 'white', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e1e4e8' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={checkedStations.length === stations.length && stations.length > 0} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCheckedStations(stations.map(s => s.name));
                      } else {
                        setCheckedStations([]);
                      }
                    }} 
                    style={{ width: '18px', height: '18px', accentColor: '#4338ca', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196', width: '80px' }}>差戻</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196', width: '140px' }}>ステータス</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196', width: '140px' }}>エリア</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196', width: '120px' }}>放送局</th>
                {checkedPlanningItems.map(item => (
                   <th key={item} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196', minWidth: '120px' }}>
                      {item}
                   </th>
                ))}
                {activeColumns.map(col => (
                  <th key={col.key} style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: '#8c9196' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map(s => (
                <tr 
                  key={s.id} 
                  style={{ 
                    borderBottom: '1px solid #f1f3f5',
                    transition: 'all 0.2s'
                  }}
                  className="hover-row"
                >
                  <td style={{ padding: '16px 20px' }}>
                    <input 
                      type="checkbox" 
                      checked={checkedStations.includes(s.name)} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedStations(prev => [...prev, s.name]);
                        } else {
                          setCheckedStations(prev => prev.filter(name => name !== s.name));
                        }
                      }} 
                      style={{ width: '18px', height: '18px', accentColor: '#4338ca', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button 
                      onClick={async () => {
                        try {
                          const stationResponses = { ...(project.metadata?.stationResponses || {}) };
                          if (stationResponses[s.name]) {
                            stationResponses[s.name].status = 'negotiating';
                            stationResponses[s.name].isLocked = false;
                          }
                          await api.updateProject(project.id, {
                            status: 'requesting',
                            metadata: {
                              ...(project.metadata || {}),
                              stationResponses
                            }
                          });
                          alert(`${s.name}に見積回答の差戻（再回答を依頼）を行いました。`);
                          fetchStations();
                          onBack();
                        } catch (e) {
                          alert('差戻しに失敗しました。');
                        }
                      }}
                      style={{ 
                        padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #ffc9c9', 
                        backgroundColor: '#fff5f5', color: 'var(--tacos-red)', 
                        fontSize: '11px', fontWeight: '950', cursor: 'pointer' 
                      }}
                    >
                      差戻
                    </button>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ 
                      fontSize: '11px', fontWeight: '900', display: 'inline-block',
                      padding: '4px 10px', borderRadius: '8px',
                      backgroundColor: s.status === 'received' ? '#eef2ff' : '#fff5f5',
                      color: s.status === 'received' ? '#4338ca' : '#fa5252'
                    }}>
                      {s.status === 'received' ? 'プランニング中' : '見積依頼中'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                     <div style={{ fontWeight: '800', color: '#4b5563', fontSize: '14px' }}>
                        {project.area && project.area.length > 0 ? project.area.join(', ') : '全エリア'}
                     </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{s.name}</div>
                  </td>
                  {checkedPlanningItems.map(item => (
                     <td key={item} style={{ padding: '16px 20px' }}>
                        <input 
                           type="text" 
                           placeholder={`${item}を入力`}
                           value={tableInputValues[`${s.name}_${item}`] || ''}
                           onChange={(e) => setTableInputValues(prev => ({ ...prev, [`${s.name}_${item}`]: e.target.value }))}
                           style={{ 
                              padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', width: '110px',
                              fontSize: '13px', fontWeight: '800', outline: 'none'
                           }}
                        />
                     </td>
                  ))}
                   {activeColumns.map(col => {
                     const normField = (col.field || '').replace(/\s+/g, '');
                     let cellVal = '-';
                     if (s.responses) {
                       const foundKey = Object.keys(s.responses).find(k => 
                         k.replace(/\s+/g, '') === normField ||
                         k.replace(/\s+/g, '') === normField.replace('index_', '') ||
                         k === col.field
                       );
                       if (foundKey) cellVal = s.responses[foundKey];
                     }
                     return (
                       <td key={col.key} style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
                         {cellVal || '-'}
                       </td>
                     );
                   })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
