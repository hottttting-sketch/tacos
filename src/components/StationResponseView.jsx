import React, { useState, useEffect } from 'react';
import IconWrapper from './IconWrapper';
import { Icons } from './IconLibrary';
import { api } from '../utils/api';

const mapProjectToRequest = (p) => {
  if (!p) return null;
  // typeの判定を柔軟にする (p.type または p.metadata.type)
  let displayType = 'スポット';
  const rawType = p.type || p.metadata?.type;
  if (rawType === 'time' || rawType === 'タイム') displayType = 'タイム';
  else if (rawType === 'event' || rawType === 'イベント') displayType = 'イベント';

  return {
    id: p.id,
    type: displayType,
    agency: p.metadata?.ba || '電通',
    sponsor: p.sponsor_name || p.sponsor || '不明',
    product: p.name || p.title || '無題の案件',
    period: p.start_date && p.end_date ? `${p.start_date} 〜 ${p.end_date}` : '2026/07/01 〜 2026/08/31',
    area: p.metadata?.area || ['全国'],
    takeType: p.metadata?.selectedTypes || p.metadata?.takeType || ['全日'],
    scale: p.metadata?.budget || p.metadata?.scale || '',
    tg: p.metadata?.tg || '',
    seconds: p.metadata?.seconds || '',
    ag: p.metadata?.ag || '',
    ngItems: p.metadata?.ngSelections || p.metadata?.ngItems || [],
    deadline: p.metadata?.deadline || '2026/05/20',
    pubTypes: p.metadata?.pub_types || [],
    materialStartDate: p.metadata?.material_start_date || p.metadata?.material_deadline || '',
    status: p.status === 'planning' ? 'プランニング中' : (p.status === 'requesting' ? '見積依頼中' : '進行中'),
    rawStatus: p.status || 'requesting',
    hearingItems: {
      checkPersonalAllCost: p.metadata?.checkPersonalAllCost || p.metadata?.hearingItems?.checkPersonalAllCost || false,
      checkRefPrice: p.metadata?.checkRefPrice || p.metadata?.hearingItems?.checkRefPrice || false,
      checkUpperLimit: p.metadata?.checkUpperLimit || p.metadata?.hearingItems?.checkUpperLimit || false,
      checkHouseholdCost: p.metadata?.checkHouseholdCost || p.metadata?.hearingItems?.checkHouseholdCost || false,
      checkUnitPrice: p.metadata?.checkUnitPrice || p.metadata?.hearingItems?.checkUnitPrice || false,
      checkAUnitPrice: p.metadata?.checkAUnitPrice || p.metadata?.hearingItems?.checkAUnitPrice || false,
      checkBias: p.metadata?.checkBias || p.metadata?.hearingItems?.checkBias || false,
      checkAG: p.metadata?.checkAG || p.metadata?.hearingItems?.checkAG || false,
      checkStraightPub: p.metadata?.checkStraightPub || p.metadata?.hearingItems?.checkStraightPub || false,
      checkInterviewPub: p.metadata?.checkInterviewPub || p.metadata?.hearingItems?.checkInterviewPub || false,
      checkTalkPub: p.metadata?.checkTalkPub || p.metadata?.hearingItems?.checkTalkPub || false,
      checkPrePub: p.metadata?.checkPrePub || p.metadata?.hearingItems?.checkPrePub || false,
      checkProgramIntegration: p.metadata?.checkProgramIntegration || p.metadata?.hearingItems?.checkProgramIntegration || false,
      checkPlanning: p.metadata?.checkPlanning || p.metadata?.hearingItems?.checkPlanning || false,
      checkProposal: p.metadata?.checkProposal || p.metadata?.hearingItems?.checkProposal || false
    },
    metadata: p.metadata || {},
    planningDetails: p.metadata?.planningDetails || '',
    zones: p.metadata?.zones || {},
    serviceShares: p.metadata?.serviceShares || [],
    zonesCount: p.metadata?.zonesCount || 0
  };
};

const StationResponseView = ({ request: initialRequest, onBack }) => {
  const [selectedRequest, setSelectedRequest] = useState(() => {
    return mapProjectToRequest(initialRequest);
  });
  const [activeTab, setActiveTab] = useState('すべて');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      console.log('[UI] getProjects result:', data);
      const mapped = data ? data.map(mapProjectToRequest).filter(Boolean) : [];
      console.log('[UI] Mapped requests:', mapped);
      setRequests(mapped);
    } catch (e) {
      console.error('[UI] Failed to fetch requests:', e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);

  const [response, setResponse] = useState({
    timeRows: [{ program: '', day: '月曜', time: '19:00', gross: '', type: '目安', index: '' }],
    remarks: '',
    serviceRemark: '',
    serviceRows: [{ moneyShare: 20, serviceN: '' }],
    planningCondition: ''
  });

  const [spotRows, setSpotRows] = useState([]);
  const [isPastModalOpen, setIsPastModalOpen] = useState(false);

  const getIndexLabels = () => {
    if (!selectedRequest) return [];
    const indices = selectedRequest.indices || selectedRequest.metadata?.indices || [];
    if (indices && indices.length > 0) {
      return indices.map(ind => (typeof ind === 'object' && ind.label ? ind.label : String(ind))).filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    if (selectedRequest) {
      const loadResponse = async () => {
        try {
          // 放送局の回答をDBから読み込み
          const myStation = selectedRequest.metadata?.station || 'EX';
          const responses = await api.getStationResponses(selectedRequest.id);
          const ans = responses.find(r => r.station_network === myStation) || selectedRequest.metadata?.stationResponses?.[myStation];

          if (ans) {
            if (ans.spot_rows || ans.spotRows) {
              setSpotRows(ans.spot_rows || ans.spotRows);
            }

            setResponse(prev => ({
              ...prev,
              timeRows: ans.time_rows || ans.timeRows || [{ program: '', day: '月曜', time: '19:00', gross: '', type: '目安', index: '' }],
              remarks: ans.remarks || '',
              serviceRemark: ans.service_remark || ans.serviceRemark || '',
              serviceRows: ans.service_rows || ans.serviceRows || [],
              straightPubCondition: ans.straight_pub_condition || ans.straightPubCondition || '',
              interviewPubCondition: ans.interview_pub_condition || ans.interviewPubCondition || '',
              talkPubCondition: ans.talk_pub_condition || ans.talkPubCondition || '',
              prePubCondition: ans.pre_pub_condition || ans.prePubCondition || '',
              programIntegrationCondition: ans.program_integration_condition || ans.programIntegrationCondition || '',
              proposalFile: ans.proposal_file_url || ans.proposalFile || '',
              planningCondition: ans.planning_condition || ans.planningCondition || ''
            }));

            // ロック状態を判定
            setIsLocked(ans.status === 'submitted');
          } else if (selectedRequest.takeType) {
            const labels = getIndexLabels();
            setSpotRows(selectedRequest.takeType.map(pattern => {
              const rowObj = {
                pattern, personal: '', refPrice: '', aPrice: '', ag: '', grp: ''
              };
              labels.forEach(lbl => {
                rowObj[`index_${lbl}`] = '';
              });
              return rowObj;
            }));
          } else {
            setSpotRows([]);
          }
        } catch (e) {
          console.error('Failed to load response from DB', e);
        }
      };

      loadResponse();
    }
  }, [selectedRequest]);

  const addServiceRow = () => {
    if (isLocked) return;
    setResponse(prev => {
      return {
        ...prev,
        serviceRows: [...(prev.serviceRows || []), { moneyShare: '', serviceN: '', isNew: true }]
      };
    });
  };

  const removeServiceRow = (idx) => {
    if (isLocked) return;
    setResponse(prev => ({
      ...prev,
      serviceRows: (prev.serviceRows || []).filter((_, i) => i !== idx)
    }));
  };

  const updateServiceRow = (idx, field, value) => {
    if (isLocked) return;
    setResponse(prev => {
      const nextRows = [...(prev.serviceRows || [])];
      if (nextRows[idx]) {
        nextRows[idx] = { ...nextRows[idx], [field]: value };
      }
      return { ...prev, serviceRows: nextRows };
    });
  };

  const addSpotRow = () => {
    if (isLocked) return;
    const labels = getIndexLabels();
    const newRow = { pattern: '', personal: '', refPrice: '', aPrice: '', ag: '', grp: '' };
    labels.forEach(lbl => {
      newRow[`index_${lbl}`] = '';
    });
    setSpotRows(prev => [...prev, newRow]);
  };

  const removeSpotRow = (idx) => {
    if (isLocked) return;
    setSpotRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSpotRow = (idx, field, value) => {
    if (isLocked) return;
    setSpotRows(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  };

  const addTimeRow = () => {
    if (isLocked) return;
    setResponse(prev => ({
      ...prev,
      timeRows: [...prev.timeRows, { program: '', day: '月曜', time: '19:00', gross: '', type: '目安', index: '' }]
    }));
  };

  const removeTimeRow = (idx) => {
    if (isLocked) return;
    setResponse(prev => ({
      ...prev,
      timeRows: prev.timeRows.length <= 1 ? [{ program: '', day: '月曜', time: '19:00', gross: '', type: '目安', index: '' }] : prev.timeRows.filter((_, i) => i !== idx)
    }));
  };

  const updateTimeRow = (idx, field, value) => {
    if (isLocked) return;
    setResponse(prev => {
      const nextRows = [...prev.timeRows];
      if (nextRows[idx]) {
        nextRows[idx] = { ...nextRows[idx], [field]: value };
      }
      return { ...prev, timeRows: nextRows };
    });
  };

  const handleSendResponse = async (status = 'negotiating') => {
    try {
      const myStation = selectedRequest.metadata?.station || 'EX';

      const responsePayload = {
        status: status === 'draft' ? 'draft' : 'submitted',
        spotRows: spotRows,
        ...response
      };

      // 新テーブルに保存
      await api.saveStationResponse(selectedRequest.id, myStation, responsePayload);

      const updatedMetadata = {
        ...(selectedRequest.metadata || {}),
        stationResponses: {
          ...(selectedRequest.metadata?.stationResponses || {}),
          [myStation]: responsePayload
        }
      };

      await api.updateProject(selectedRequest.id, {
        status: status === 'draft' ? 'requesting' : 'planning',
        metadata: updatedMetadata
      });
      alert(status === 'draft' ? '一時保存しました' : '回答を送信しました！');
      // setSelectedRequest(null);
      await fetchRequests();
      setSelectedRequest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          metadata: updatedMetadata
        };
      });
    } catch (e) {
      console.error(e);
      alert('送信に失敗しました。');
    }
  };

  const getZoneSummary = (pattern, zones) => {
    const pz = zones && zones[pattern];
    if (!pz || !Object.values(pz).some(v => v)) return '';

    const getS = (days) => {
      const hSet = new Set();
      Object.keys(pz).forEach(k => {
        const [d, h] = k.split('-');
        if (pz[k] && days.includes(d)) hSet.add(parseInt(h));
      });
      if (hSet.size === 0) return null;
      const sorted = [...hSet].sort((a, b) => a - b);
      const res = [];
      let start = sorted[0];
      let end = sorted[0] + 1;
      for (let i = 1; i <= sorted.length; i++) {
        if (i < sorted.length && sorted[i] === end) {
          end++;
        } else {
          res.push(`${start}:00-${end}:00`);
          if (i < sorted.length) {
            start = sorted[i];
            end = sorted[i] + 1;
          }
        }
      }
      return res.join('、');
    };

    const w = getS(['月', '火', '水', '木', '金']);
    const e = getS(['土', '日']);

    if (w === e) return w ? ` (${w})` : '';
    let s = '';
    if (w) s += `平日${w}`;
    if (e) s += `${s ? ' / ' : ''}休日${e}`;
    return s ? ` (${s})` : '';
  };

  const getTakeTypeWithTime = (takeType, zones) => {
    if (!takeType) return '全日 (05:00-29:00)';
    const mapTakeType = (t) => {
      const summary = getZoneSummary(t, zones);
      if (summary) return `${t}${summary}`;

      if (t.includes('全日')) return '全日 (05:00-29:00)';
      if (t.includes('ヨの字')) return 'ヨの字 (06:00-09:00/19:00-24:00)';
      if (t.includes('逆L')) return '逆L (19:00-26:00/土日09:00-25:00)';
      if (t.includes('コの字')) return 'コの字 (06:00-09:00/12:00-14:00/19:00-24:00)';
      if (t.includes('平日パケ')) return '平日パケ (月〜金 06:00-24:00)';
      if (t.includes('週末パケ')) return '週末パケ (土日 06:00-25:00)';
      return t;
    };
    if (Array.isArray(takeType)) {
      return takeType.map(t => mapTakeType(t)).join('・');
    }
    return mapTakeType(takeType);
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
  const valueBoxStyle = { padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', display: 'flex', alignItems: 'center' };



  const getServiceShares = () => {
    if (!selectedRequest?.metadata?.serviceShares) return [];
    return selectedRequest.metadata.serviceShares;
  };

  if (!selectedRequest) {
    const filteredRequests = requests.filter(r => activeTab === 'すべて' || r.type === activeTab);
    return (
      <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>見積回答</h2>
        </header>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {['すべて', 'スポット', 'タイム', 'イベント'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 24px', borderRadius: '14px', border: activeTab === tab ? 'none' : '1.5px solid #e2e8f0', backgroundColor: activeTab === tab ? 'var(--tacos-red)' : 'white', color: activeTab === tab ? 'white' : '#64748b', fontWeight: '900', cursor: 'pointer' }}>{tab}</button>
          ))}
        </div>
        <div className="glass-card" style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>種別</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>SP / AG / 案件名</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>期間</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>ステータス</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '11px', fontWeight: '950', color: req.type === 'スポット' ? '#f08c00' : req.type === 'タイム' ? '#4338ca' : '#087f5b', backgroundColor: req.type === 'スポット' ? '#fff9db' : req.type === 'タイム' ? '#eef2ff' : '#ebfbee', padding: '4px 10px', borderRadius: '8px' }}>{req.type}</span></td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900' }}>{req.sponsor} / {req.agency}</div>
                    <div style={{ fontWeight: '950', color: '#1e293b', fontSize: '15px' }}>{req.product}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '800' }}>{req.period}</td>
                  <td style={{ padding: '16px 24px' }}><span style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '950', backgroundColor: req.rawStatus === 'planning' ? '#eef2ff' : '#fff5f5', color: req.rawStatus === 'planning' ? '#4338ca' : '#fa5252' }}>{req.status}</span></td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}><button onClick={() => setSelectedRequest(req)} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '900' }}>回答する</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setSelectedRequest(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <IconWrapper color="#f1f5f9" iconColor="#475569" size={44} borderRadius={22}><Icons.ArrowLeft size={24} /></IconWrapper>
          </button>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>見積回答作成</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>要求項目に即した提案を入力してください</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setIsPastModalOpen(true)}
            className="btn-secondary"
            style={{
              padding: '12px 24px', borderRadius: '15px', fontWeight: '900',
              backgroundColor: '#edf2f7', border: '1px solid #cbd5e1', color: '#1a202c', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Icons.History size={16} /> 過去の回答を参照
          </button>
          {isLocked && <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--tacos-red)', backgroundColor: '#fff5f5', padding: '6px 12px', borderRadius: '10px' }}>回答送信済み（ロック中）</span>}
          <button onClick={() => handleSendResponse('draft')} className="btn-secondary" disabled={isLocked} style={{ padding: '12px 24px', borderRadius: '15px', fontWeight: '900', backgroundColor: isLocked ? '#f1f5f9' : 'white', border: '2px solid #e2e8f0', color: isLocked ? '#94a3b8' : '#334155', cursor: isLocked ? 'not-allowed' : 'pointer' }}>一時保存</button>
          <button onClick={() => handleSendResponse('negotiating')} className="btn-primary" disabled={isLocked} style={{ padding: '12px 32px', borderRadius: '15px', fontWeight: '900', backgroundColor: isLocked ? '#cbd5e1' : 'var(--tacos-red)', cursor: isLocked ? 'not-allowed' : 'pointer' }}>回答を送信する</button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1.5px solid #e2e8f0', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '950', color: 'var(--tacos-red)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconWrapper color="rgba(230,0,18,0.08)" iconColor="var(--tacos-red)" size={32} borderRadius={8}><Icons.FileText size={18} /></IconWrapper>
            依頼内容の確認（基本事項）
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1行目 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div><label style={labelStyle}>スポンサー / 代理店</label><div style={valueBoxStyle}>{selectedRequest?.sponsor || '-'} / {selectedRequest?.agency || '-'}</div></div>
              <div><label style={labelStyle}>商品・CP名</label><div style={valueBoxStyle}>{selectedRequest?.product || '-'}</div></div>
              <div><label style={labelStyle}>放送・実施期間</label><div style={{ ...valueBoxStyle, borderLeft: '4px solid #4338ca' }}>{selectedRequest?.period || '-'}</div></div>
            </div>

            {/* 2行目 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div><label style={labelStyle}>放送・実施エリア</label><div style={valueBoxStyle}>{(Array.isArray(selectedRequest?.area) ? selectedRequest.area : []).join('・') || '-'}</div></div>
              <div><label style={labelStyle}>取り方（パターン）</label><div style={valueBoxStyle}>{getTakeTypeWithTime(selectedRequest?.takeType, selectedRequest?.zones)}</div></div>
              <div><label style={labelStyle}>NG項目</label><div style={{ ...valueBoxStyle, backgroundColor: '#fff5f5', borderLeft: '4px solid var(--tacos-red)', color: 'var(--tacos-red)' }}>{selectedRequest?.ngItems && (Array.isArray(selectedRequest.ngItems) ? selectedRequest.ngItems.join('、') : selectedRequest.ngItems) || 'なし'}</div></div>
            </div>

            {/* パブリシティ特有項目 */}
            {(selectedRequest.pubTypes?.length > 0 || selectedRequest.materialStartDate) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>パブ種別</label>
                  <div style={{ ...valueBoxStyle, gap: '8px', flexWrap: 'wrap' }}>
                    {Array.isArray(selectedRequest.pubTypes) ? selectedRequest.pubTypes.map((t, idx) => (
                      <span key={idx} style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(230,0,18,0.05)', color: 'var(--tacos-red)', fontSize: '11px', fontWeight: '900', border: '1px solid rgba(230,0,18,0.1)' }}>{t}</span>
                    )) : (selectedRequest.pubTypes || '-')}
                    {(!selectedRequest.pubTypes || selectedRequest.pubTypes.length === 0) && '-'}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>素材搬入開始日</label>
                  <div style={{ ...valueBoxStyle, color: '#059669', borderLeft: '4px solid #10b981' }}>{selectedRequest.materialStartDate || '未設定'}</div>
                </div>
              </div>
            )}

            {/* 3行目 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              <div><label style={labelStyle}>規模</label><div style={valueBoxStyle}>{selectedRequest.scale}</div></div>
              <div><label style={labelStyle}>TG</label><div style={valueBoxStyle}>{selectedRequest.tg}</div></div>
              <div><label style={labelStyle}>秒数</label><div style={valueBoxStyle}>{selectedRequest.seconds}</div></div>
              <div><label style={labelStyle}>AG条件</label><div style={valueBoxStyle}>{selectedRequest.ag}</div></div>
              <div><label style={labelStyle}>見積〆切</label><div style={{ ...valueBoxStyle, color: 'var(--tacos-red)', borderLeft: '3px solid var(--tacos-red)' }}>{selectedRequest.deadline}</div></div>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1.5px solid #e2e8f0', backgroundColor: '#fcfdfe' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '950', color: '#475569', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconWrapper color="#f1f5f9" iconColor="#475569" size={32} borderRadius={8}><Icons.Edit size={18} /></IconWrapper>
            回答・提案の入力（依頼要件へのレスポンス）
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {selectedRequest.type === 'スポット' && (
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b', margin: 0 }}>スポット見積回答グリッド</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr>
                        {[
                          'パターン',
                          selectedRequest.hearingItems?.checkPersonalAllCost && '個人ALLコスト',
                          selectedRequest.hearingItems?.checkRefPrice && '目安一本単価',
                          selectedRequest.hearingItems?.checkAUnitPrice && 'A単価',
                          selectedRequest.hearingItems?.checkAG && 'AG',
                          selectedRequest.hearingItems?.checkUpperLimit && '上限',
                          selectedRequest.hearingItems?.checkBias && '30秒バイアス',
                          selectedRequest.hearingItems?.checkHouseholdCost && '世帯コスト',
                          selectedRequest.hearingItems?.checkUnitPrice && '単価（60s〜）',
                          ...getIndexLabels(),
                          ...['F1', 'F2', 'F3', 'M1', 'M2', 'M3', '主婦', 'C', 'T'].filter(ind =>
                            (selectedRequest.tg || '').includes(ind) ||
                            (selectedRequest.metadata?.indices || []).includes(ind)
                          ).flatMap(ind => [`${ind}目安`, `${ind}キメ`])
                        ].filter(Boolean).map((h, idx) => (
                          <th key={idx} style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textAlign: h === 'パターン' ? 'left' : 'center', minWidth: h === 'パターン' ? '120px' : '95px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spotRows.map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px', fontWeight: '950', color: '#475569', minWidth: '120px' }}>{row.pattern || '全日'}</td>
                          {selectedRequest.hearingItems?.checkPersonalAllCost && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.personal || ''} onChange={e => updateSpotRow(i, 'personal', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkRefPrice && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.refPrice || ''} onChange={e => updateSpotRow(i, 'refPrice', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkAUnitPrice && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.aPrice || ''} onChange={e => updateSpotRow(i, 'aPrice', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkAG && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.ag || ''} onChange={e => updateSpotRow(i, 'ag', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0%" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkUpperLimit && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.upperLimit || ''} onChange={e => updateSpotRow(i, 'upperLimit', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkBias && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.bias || ''} onChange={e => updateSpotRow(i, 'bias', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkHouseholdCost && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.householdCost || ''} onChange={e => updateSpotRow(i, 'householdCost', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkUnitPrice && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.unitPrice || ''} onChange={e => updateSpotRow(i, 'unitPrice', e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="0" /></td>
                          )}
                          {getIndexLabels().map((lbl, idx) => (
                            <td key={idx} style={{ padding: '4px' }}>
                              <input
                                type="text"
                                value={row[`index_${lbl}`] || ''}
                                onChange={e => updateSpotRow(i, `index_${lbl}`, e.target.value)}
                                disabled={isLocked}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                                placeholder="1.0"
                              />
                            </td>
                          ))}
                          {['F1', 'F2', 'F3', 'M1', 'M2', 'M3', '主婦', 'C', 'T'].filter(ind =>
                            (selectedRequest.tg || '').includes(ind) ||
                            (selectedRequest.metadata?.indices || []).includes(ind)
                          ).flatMap(ind => [`${ind}目安`, `${ind}キメ`]).map((tgKey, idx) => (
                            <td key={idx} style={{ padding: '4px' }}><input type="text" value={row[`index_${tgKey}`] || ''} onChange={e => updateSpotRow(i, `index_${tgKey}`, e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white' }} placeholder="1.0" /></td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedRequest.type === 'タイム' && (
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b', margin: 0 }}>放送枠提案リスト</h4>
                  <button
                    onClick={addTimeRow}
                    className="btn-secondary"
                    disabled={isLocked}
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '900', cursor: isLocked ? 'not-allowed' : 'pointer', backgroundColor: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Icons.Plus size={14} /> 行を追加
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {response.timeRows.map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.2fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                      <input
                        style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                        placeholder="提案番組名"
                        value={row.program || ''}
                        disabled={isLocked}
                        onChange={e => updateTimeRow(i, 'program', e.target.value)}
                      />
                      <select
                        style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                        value={row.day ? `${row.day} ${row.time}` : '月曜 19:00'}
                        disabled={isLocked}
                        onChange={e => {
                          const [d, t] = e.target.value.split(' ');
                          updateTimeRow(i, 'day', d);
                          updateTimeRow(i, 'time', t);
                        }}
                      >
                        {['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'].map(day => (
                          ['19:00', '20:00', '21:00', '22:00', '23:00'].map(time => (
                            <option key={`${day} ${time}`}>{day} {time}</option>
                          ))
                        ))}
                      </select>
                      <input
                        style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', textAlign: 'right', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                        placeholder="GROSS"
                        value={row.gross || ''}
                        disabled={isLocked}
                        onChange={e => updateTimeRow(i, 'gross', e.target.value)}
                      />
                      <select
                        style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                        value={row.type || '目安'}
                        disabled={isLocked}
                        onChange={e => updateTimeRow(i, 'type', e.target.value)}
                      >
                        <option>目安</option>
                        <option>確定</option>
                      </select>
                      <input
                        style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', textAlign: 'center', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                        placeholder="INDEX"
                        value={row.index || ''}
                        disabled={isLocked}
                        onChange={e => updateTimeRow(i, 'index', e.target.value)}
                      />
                      <div style={{ textAlign: 'center' }}>
                        {response.timeRows.length > 1 && (
                          <button
                            onClick={() => removeTimeRow(i)}
                            disabled={isLocked}
                            style={{ background: 'none', border: 'none', color: '#fa5252', cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '900' }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* 左カラム：パブリシティ条件 */}
              <div style={{ backgroundColor: '#fdfcfe', padding: '24px', borderRadius: '20px', border: '1.5px solid #f1eef8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#6366f1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconWrapper color="rgba(99,102,241,0.08)" iconColor="#6366f1" size={28} borderRadius={6}><Icons.Shield size={15} /></IconWrapper>
                  パブリシティ条件
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedRequest.hearingItems?.checkStraightPub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>ストレートパブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="実施条件等を記入"
                        disabled={isLocked}
                        value={response.straightPubCondition || ''}
                        onChange={e => setResponse({ ...response, straightPubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkInterviewPub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>取材パブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="取材パブの条件等を記入"
                        disabled={isLocked}
                        value={response.interviewPubCondition || ''}
                        onChange={e => setResponse({ ...response, interviewPubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkTalkPub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>対談パブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="対談パブの条件等を記入"
                        disabled={isLocked}
                        value={response.talkPubCondition || ''}
                        onChange={e => setResponse({ ...response, talkPubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkPrePub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>プレパブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="プレパブの条件等を記入"
                        disabled={isLocked}
                        value={response.prePubCondition || ''}
                        onChange={e => setResponse({ ...response, prePubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkProgramIntegration && (
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>番組仕込み</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="番組仕込みの条件等を記入"
                        disabled={isLocked}
                        value={response.programIntegrationCondition || ''}
                        onChange={e => setResponse({ ...response, programIntegrationCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {!(selectedRequest.hearingItems?.checkStraightPub ||
                    selectedRequest.hearingItems?.checkInterviewPub ||
                    selectedRequest.hearingItems?.checkTalkPub ||
                    selectedRequest.hearingItems?.checkPrePub ||
                    selectedRequest.hearingItems?.checkProgramIntegration) && (
                      <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '800', fontStyle: 'italic', padding: '12px 0' }}>パブリシティのヒアリングはありません。</div>
                    )}
                </div>
              </div>

              {/* 右カラム：企画条件 */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconWrapper color="rgba(2,132,199,0.08)" iconColor="#0284c7" size={28} borderRadius={6}><Icons.Shield size={15} /></IconWrapper>
                  企画条件
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ ...labelStyle, color: '#475569', marginBottom: '8px' }}>企画条件欄 (詳細)</label>
                      <div style={{ ...valueBoxStyle, minHeight: '100px', backgroundColor: '#fcfdfe', color: '#334155', alignItems: 'flex-start', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {selectedRequest.metadata?.planningDetails || selectedRequest.planningDetails || '企画の希望条件等はありません。'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ ...labelStyle, color: '#475569', margin: 0 }}>条件記入欄</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '100px', padding: '12px 14px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800', border: '1.5px solid #e1e4e8', borderRadius: '12px', outline: 'none' }}
                        placeholder="企画に対する回答・条件を記入してください..."
                        disabled={isLocked}
                        value={response.planningCondition || ''}
                        onChange={e => setResponse({ ...response, planningCondition: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ ...labelStyle, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      企画書アップロード
                      {selectedRequest.hearingItems?.checkProposal && (
                        <span style={{ fontSize: '11px', color: 'white', backgroundColor: '#e60012', padding: '2px 8px', borderRadius: '6px', fontWeight: '950' }}>ヒアリングあり</span>
                      )}
                    </label>
                    <div style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: '14px', backgroundColor: '#fcfdff', textAlign: 'center', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                      <input
                        type="file"
                        id="proposal-uploader"
                        disabled={isLocked}
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            try {
                              const uploadedUrl = await api.uploadTransferFile(file);
                              if (uploadedUrl) {
                                setResponse({ ...response, proposalFile: uploadedUrl });
                                alert(`${file.name} をアップロードしました。`);
                              } else {
                                alert('ファイルのアップロードに失敗しました。');
                              }
                            } catch (err) {
                              console.error('Upload error:', err);
                              alert('アップロード中にエラーが発生しました。');
                            }
                          }
                        }}
                      />
                      <label htmlFor="proposal-uploader" style={{ cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <Icons.Plus size={20} color="#0284c7" />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>
                          {response.proposalFile ? `選択済み: ${response.proposalFile}` : 'ファイルを選択するか、ドラッグ＆ドロップしてください'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>PDF, PPTX 等の企画書ファイル</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>サービス提案</label>
                  <button
                    onClick={addServiceRow}
                    disabled={isLocked}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '10px', border: isLocked ? '1.5px solid #cbd5e1' : '1.5px solid #6366f1',
                      backgroundColor: 'transparent', color: isLocked ? '#94a3b8' : '#6366f1', cursor: isLocked ? 'not-allowed' : 'pointer',
                      fontSize: '13px', fontWeight: '800', transition: 'all 0.2s'
                    }}
                  >
                    <Icons.Plus size={14} />
                    <span>行を追加</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {(response.serviceRows || []).map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>金額シェア</span>
                        <input
                          type="number"
                          value={row.moneyShare || (row.isNew ? '' : 20)}
                          onChange={e => updateServiceRow(i, 'moneyShare', e.target.value)}
                          disabled={isLocked || !row.isNew}
                          style={{
                            width: '80px', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                            backgroundColor: row.isNew && !isLocked ? 'white' : '#f1f5f9', color: row.isNew && !isLocked ? '#1e293b' : '#64748b',
                            textAlign: 'right', fontWeight: '900', outline: 'none'
                          }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>％</span>
                      </div>
                      <div style={{ width: '1.5px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>サービス</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={row.serviceN || ''}
                          disabled={isLocked}
                          onChange={e => {
                            const val = Math.min(1000, Math.max(0, Number(e.target.value)));
                            updateServiceRow(i, 'serviceN', e.target.value === '' ? '' : val);
                          }}
                          placeholder="0"
                          style={{ width: '85px', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: '900', outline: 'none', backgroundColor: isLocked ? '#f8fafc' : 'white' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>％</span>
                      </div>
                      {row.isNew && (
                        <button
                          onClick={() => removeServiceRow(i)}
                          disabled={isLocked}
                          style={{ background: 'none', border: 'none', color: '#fa5252', cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: '900', padding: '0 8px' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>全体備考・特記事項</label>
                <textarea
                  style={{ ...valueBoxStyle, minHeight: '80px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none' }}
                  disabled={isLocked}
                  placeholder="補足情報を記入してください"
                  value={response.remarks || ''}
                  onChange={e => setResponse({ ...response, remarks: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {isPastModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '800px', maxHeight: '85vh', overflow: 'auto', border: '2px solid #e1e4e8', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.History size={20} style={{ color: '#0ea5e9' }} /> 「{selectedRequest?.sponsor}」の過去回答履歴
              </h3>
              <button
                onClick={() => setIsPastModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>

            {requests.filter(p => p.id !== selectedRequest?.id && p.sponsor === selectedRequest?.sponsor).length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '800', textAlign: 'center', margin: '32px 0' }}>該当する過去の回答はありません。</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {requests.filter(p => p.id !== selectedRequest?.id && p.sponsor === selectedRequest?.sponsor).map(proj => {
                  const myStation = proj.metadata?.station || 'EX';
                  const ans = proj.metadata?.stationResponses?.[myStation];

                  return (
                    <div key={proj.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#fcfdfe' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '950', backgroundColor: proj.type === 'スポット' ? '#fff9db' : '#eef2ff', color: proj.type === 'スポット' ? '#f08c00' : '#4338ca', padding: '4px 10px', borderRadius: '6px', marginRight: '8px' }}>{proj.type}</span>
                          <span style={{ fontWeight: '950', fontSize: '15px', color: '#1e293b' }}>{proj.product}</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '800' }}>{proj.period}</span>
                      </div>

                      {ans ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                          {ans.spotRows && ans.spotRows.length > 0 && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '4px' }}>スポット提案:</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {ans.spotRows.map((sr, idx) => (
                                  <span key={idx} style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#f1f3f5', borderRadius: '6px', color: '#495057', fontWeight: '800' }}>
                                    {sr.pattern || '全日'}:
                                    {sr.personal && ` 個ALL:${sr.personal}`}
                                    {sr.refPrice && ` 目安:${sr.refPrice}`}
                                    {sr.aPrice && ` A単価:${sr.aPrice}`}
                                    {sr.ag && ` AG:${sr.ag}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {ans.timeRows && ans.timeRows.length > 0 && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '4px' }}>タイム提案:</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {ans.timeRows.map((tr, idx) => (
                                  <span key={idx} style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#eef2ff', borderRadius: '6px', color: '#4338ca', fontWeight: '800' }}>
                                    {tr.program && `${tr.program} `}
                                    {tr.day && `(${tr.day}) `}
                                    {tr.time && `${tr.time} `}
                                    {tr.gross && `グロス:${tr.gross}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {ans.planningCondition && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '2px' }}>企画条件への回答:</div>
                              <p style={{ margin: 0, fontSize: '12px', color: '#1e293b', backgroundColor: '#fdfcfe', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1eef8', whiteSpace: 'pre-wrap' }}>
                                {ans.planningCondition}
                              </p>
                            </div>
                          )}

                          {ans.remarks && (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '2px' }}>特記事項:</div>
                              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', whiteSpace: 'pre-wrap' }}>{ans.remarks}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>送信された回答データはありません。</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StationResponseView;
