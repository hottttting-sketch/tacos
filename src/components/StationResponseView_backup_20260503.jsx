import React, { useState, useEffect } from 'react';
import IconWrapper from './IconWrapper';
import { Icons } from './IconLibrary';
import { api } from '../utils/api';

const StationResponseView = ({ request: initialRequest, onBack }) => {
  const [selectedRequest, setSelectedRequest] = useState(initialRequest);
  const [activeTab, setActiveTab] = useState('すべて');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      if (data && data.length > 0) {
        setRequests(data.map(p => ({
          id: p.id,
          type: p.metadata?.type === 'time' ? 'タイム' : 'スポット',
          agency: p.metadata?.ba || '電通',
          sponsor: p.sponsor_name,
          product: p.name,
          period: p.start_date && p.end_date ? `${p.start_date} 〜 ${p.end_date}` : '2026/07/01 〜 2026/08/31',
          area: p.metadata?.area || ['全国'],
          takeType: p.metadata?.selectedTypes || p.metadata?.takeType || ['全日'],
          scale: p.metadata?.budget || '3000 GRP',
          tg: p.metadata?.tg || 'F2',
          seconds: p.metadata?.seconds || '15s',
          ag: p.metadata?.ag || '15%',
          ngItems: p.metadata?.ngItems || [],
          deadline: p.metadata?.deadline || '2026/05/20',
          status: p.status === 'negotiating' ? '交渉中' : p.status === 'approved' ? '交渉中' : '未回答',
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
          serviceShares: p.metadata?.serviceShares || [],
          zonesCount: p.metadata?.zonesCount || 0
        })));
      } else {
        const initialRequests = [
          { 
            id: 'REQ-SPOT-101', 
            type: 'スポット', 
            agency: '電通', 
            sponsor: 'サントリーホールディングス', 
            product: 'プレミアムモルツ 2026夏企画', 
            period: '2026/07/01 〜 2026/08/31', 
            area: ['関東', '関西', '中京'],
            takeType: ['全日', 'ヨの字'],
            scale: '3000 GRP',
            tg: 'F2 (35-49歳女性)', 
            seconds: '15s',
            ag: '15%',
            ngItems: ['競合飲料メーカー'],
            deadline: '2026/05/20 18:00',
            status: '未回答',
            hearingItems: { checkPersonalAllCost: true, checkRefPrice: true, checkAG: true, checkStraightPub: true, checkPlanning: true },
            zonesCount: 5
          },
          { 
            id: 'REQ-TIME-202', 
            type: 'タイム', 
            agency: '博報堂', 
            sponsor: '日産自動車', 
            product: '新型SUV 安全機能紹介篇', 
            period: '2026/09/01 〜 2026/12/31', 
            area: ['全国'],
            takeType: ['平日パケ', '週末パケ'],
            scale: '5,000万円',
            tg: 'M2-M3 (35歳以上男性)', 
            seconds: '30s',
            ag: '20%',
            ngItems: ['他社SUV'],
            deadline: '2026/06/15 12:00',
            status: '交渉中',
            hearingItems: { checkRefPrice: true, checkUnitPrice: true, checkInterviewPub: true },
            zonesCount: 2
          }
        ];
        const localFormat = initialRequests.map(item => ({
          id: item.id,
          name: item.product,
          sponsor_name: item.sponsor,
          status: item.status,
          created_at: new Date().toISOString(),
          metadata: {
            type: item.type === 'タイム' ? 'time' : 'spot',
            ba: item.agency,
            area: item.area,
            takeType: item.takeType,
            budget: item.scale,
            tg: item.tg,
            seconds: item.seconds,
            ag: item.ag,
            ngItems: item.ngItems,
            deadline: item.deadline,
            hearingItems: item.hearingItems,
            zonesCount: item.zonesCount
          }
        }));
        localStorage.setItem('tacos_local_projects', JSON.stringify(localFormat));
        setRequests(initialRequests);
      }
    } catch (e) {
      console.error(e);
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
    serviceRows: [{ moneyShare: 20, serviceN: '' }]
  });

  const [spotRows, setSpotRows] = useState([]);

  useEffect(() => {
    if (selectedRequest) {
      if (selectedRequest.takeType) {
        setSpotRows(selectedRequest.takeType.map(pattern => ({
          pattern, personal: '', refPrice: '', aPrice: '', ag: '', grp: '', index: ''
        })));
      } else {
        setSpotRows([]);
      }

      // serviceSharesの初期値をresponseに反映
      const serviceShares = selectedRequest.serviceShares || [];
      const initRows = serviceShares.map(s => ({
        moneyShare: s.value || 20,
        serviceN: ''
      }));

      setResponse(prev => ({
        ...prev,
        serviceRows: initRows.length > 0 ? initRows : [{ moneyShare: 20, serviceN: '' }]
      }));
    }
  }, [selectedRequest]);

  const addServiceRow = () => {
    setResponse(prev => {
      // 既存行があれば一番上の行の金額シェアを引き継ぐ
      const baseShare = prev.serviceRows?.[0]?.moneyShare || 20;
      return {
        ...prev,
        serviceRows: [...(prev.serviceRows || []), { moneyShare: baseShare, serviceN: '' }]
      };
    });
  };

  const removeServiceRow = (idx) => {
    setResponse(prev => ({
      ...prev,
      serviceRows: (prev.serviceRows || []).filter((_, i) => i !== idx)
    }));
  };

  const updateServiceRow = (idx, field, value) => {
    setResponse(prev => {
      const nextRows = [...(prev.serviceRows || [])];
      if (nextRows[idx]) {
        nextRows[idx] = { ...nextRows[idx], [field]: value };
      }
      return { ...prev, serviceRows: nextRows };
    });
  };

  const addSpotRow = () => {
    setSpotRows(prev => [...prev, { pattern: '', personal: '', refPrice: '', aPrice: '', ag: '', grp: '', index: '' }]);
  };

  const removeSpotRow = (idx) => {
    setSpotRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSpotRow = (idx, field, value) => {
    setSpotRows(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  };

  const addTimeRow = () => {
    setResponse(prev => ({
      ...prev,
      timeRows: [...prev.timeRows, { program: '', day: '月曜', time: '19:00', gross: '', type: '目安', index: '' }]
    }));
  };

  const removeTimeRow = (idx) => {
    setResponse(prev => ({
      ...prev,
      timeRows: prev.timeRows.length <= 1 ? [{ program: '', day: '月曜', time: '19:00', gross: '', type: '目安', index: '' }] : prev.timeRows.filter((_, i) => i !== idx)
    }));
  };

  const updateTimeRow = (idx, field, value) => {
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
      await api.updateProject(selectedRequest.id, { status });
      alert(status === 'draft' ? '一時保存しました' : '回答を送信しました！');
      setSelectedRequest(null);
      fetchRequests();
    } catch (e) {
      alert('送信に失敗しました。');
    }
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
  const valueBoxStyle = { padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', display: 'flex', alignItems: 'center' };

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
                  <td style={{ padding: '16px 24px' }}><span style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '950', backgroundColor: req.status === '未回答' ? '#fff5f5' : '#fff9db', color: req.status === '未回答' ? '#fa5252' : '#f08c00' }}>{req.status}</span></td>
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
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={() => handleSendResponse('draft')} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '15px', fontWeight: '900', backgroundColor: 'white', border: '2px solid #e2e8f0' }}>一時保存</button>
          <button onClick={() => handleSendResponse('negotiating')} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '15px', fontWeight: '900' }}>回答を送信する</button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1.5px solid #e2e8f0', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '950', color: 'var(--tacos-red)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconWrapper color="rgba(230,0,18,0.08)" iconColor="var(--tacos-red)" size={32} borderRadius={8}><Icons.FileText size={18} /></IconWrapper>
            依頼内容の確認（基本事項）
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px 32px' }}>
            <div><label style={labelStyle}>スポンサー / 代理店</label><div style={valueBoxStyle}>{selectedRequest.sponsor} / {selectedRequest.agency}</div></div>
            <div><label style={labelStyle}>商品・CP名</label><div style={valueBoxStyle}>{selectedRequest.product}</div></div>
            <div><label style={labelStyle}>放送・実施エリア</label><div style={valueBoxStyle}>{selectedRequest.area.join('・')}</div></div>
            <div><label style={labelStyle}>取り方（パターン）</label><div style={valueBoxStyle}>{Array.isArray(selectedRequest.takeType) ? selectedRequest.takeType.join('・') : selectedRequest.takeType || '全日'}</div></div>
            <div><label style={labelStyle}>放送・実施期間</label><div style={{ ...valueBoxStyle, borderLeft: '4px solid #4338ca' }}>{selectedRequest.period}</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
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
                            <td style={{ padding: '4px' }}><input type="text" value={row.personal || ''} onChange={e => updateSpotRow(i, 'personal', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkRefPrice && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.refPrice || ''} onChange={e => updateSpotRow(i, 'refPrice', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkAUnitPrice && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.aPrice || ''} onChange={e => updateSpotRow(i, 'aPrice', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkAG && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.ag || ''} onChange={e => updateSpotRow(i, 'ag', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0%" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkUpperLimit && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.upperLimit || ''} onChange={e => updateSpotRow(i, 'upperLimit', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkBias && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.bias || ''} onChange={e => updateSpotRow(i, 'bias', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkHouseholdCost && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.householdCost || ''} onChange={e => updateSpotRow(i, 'householdCost', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {selectedRequest.hearingItems?.checkUnitPrice && (
                            <td style={{ padding: '4px' }}><input type="text" value={row.unitPrice || ''} onChange={e => updateSpotRow(i, 'unitPrice', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="0" /></td>
                          )}
                          {['F1', 'F2', 'F3', 'M1', 'M2', 'M3', '主婦', 'C', 'T'].filter(ind =>
                            (selectedRequest.tg || '').includes(ind) ||
                            (selectedRequest.metadata?.indices || []).includes(ind)
                          ).flatMap(ind => [`${ind}目安`, `${ind}キメ`]).map((tgKey, idx) => (
                            <td key={idx} style={{ padding: '4px' }}><input type="text" value={row[`index_${tgKey}`] || ''} onChange={e => updateSpotRow(i, `index_${tgKey}`, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900' }} placeholder="1.0" /></td>
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
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', backgroundColor: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Icons.Plus size={14} /> 行を追加
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {response.timeRows.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.2fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                        <input
                           style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800' }}
                           placeholder="提案番組名"
                           value={row.program || ''}
                           onChange={e => updateTimeRow(i, 'program', e.target.value)}
                        />
                        <select
                           style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800' }}
                           value={row.day ? `${row.day} ${row.time}` : '月曜 19:00'}
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
                           style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', textAlign: 'right' }}
                           placeholder="GROSS"
                           value={row.gross || ''}
                           onChange={e => updateTimeRow(i, 'gross', e.target.value)}
                        />
                        <select
                           style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800' }}
                           value={row.type || '目安'}
                           onChange={e => updateTimeRow(i, 'type', e.target.value)}
                        >
                           <option>目安</option>
                           <option>確定</option>
                        </select>
                        <input
                           style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontWeight: '800', textAlign: 'center' }}
                           placeholder="INDEX"
                           value={row.index || ''}
                           onChange={e => updateTimeRow(i, 'index', e.target.value)}
                        />
                        <div style={{ textAlign: 'center' }}>
                           {response.timeRows.length > 1 && (
                              <button
                                 onClick={() => removeTimeRow(i)}
                                 style={{ background: 'none', border: 'none', color: '#fa5252', cursor: 'pointer', fontSize: '16px', fontWeight: '900' }}
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

            {(selectedRequest.hearingItems?.checkStraightPub ||
              selectedRequest.hearingItems?.checkInterviewPub ||
              selectedRequest.hearingItems?.checkTalkPub ||
              selectedRequest.hearingItems?.checkPrePub ||
              selectedRequest.hearingItems?.checkProgramIntegration ||
              selectedRequest.hearingItems?.checkPlanning) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#fdfcfe', padding: '24px', borderRadius: '20px', border: '1.5px solid #f1eef8' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#6366f1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconWrapper color="rgba(99,102,241,0.08)" iconColor="#6366f1" size={28} borderRadius={6}><Icons.Shield size={15} /></IconWrapper>
                  パブリシティ条件
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedRequest.hearingItems?.checkStraightPub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>ストレートパブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="実施条件、放送時間等を記入"
                        value={response.straightPubCondition || ''}
                        onChange={e => setResponse({ ...response, straightPubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkInterviewPub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>取材パブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="取材パブリシティの実施条件等を記入"
                        value={response.interviewPubCondition || ''}
                        onChange={e => setResponse({ ...response, interviewPubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkTalkPub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>対談パブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="対談パブリシティの実施条件等を記入"
                        value={response.talkPubCondition || ''}
                        onChange={e => setResponse({ ...response, talkPubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkPrePub && (
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>プレパブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="プレパブリシティの実施条件等を記入"
                        value={response.prePubCondition || ''}
                        onChange={e => setResponse({ ...response, prePubCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkProgramIntegration && (
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>番組仕込み</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="番組仕込みの実施条件等を記入"
                        value={response.programIntegrationCondition || ''}
                        onChange={e => setResponse({ ...response, programIntegrationCondition: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedRequest.hearingItems?.checkPlanning && (
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>企画提示・サービス提案</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800' }}
                        placeholder="企画提示・提案プランを記入"
                        value={response.planningProposal || ''}
                        onChange={e => setResponse({ ...response, planningProposal: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ ...labelStyle, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconWrapper color="rgba(99,102,241,0.08)" iconColor="#6366f1" size={24} borderRadius={6}><Icons.Shield size={14} /></IconWrapper>
                企画書アップロード
                {selectedRequest.hearingItems?.checkProposal && (
                  <span style={{ fontSize: '11px', color: 'white', backgroundColor: '#e60012', padding: '2px 8px', borderRadius: '6px', fontWeight: '950' }}>ヒアリングあり</span>
                )}
              </label>
              <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '14px', backgroundColor: '#fcfdff', textAlign: 'center', cursor: 'pointer' }}>
                <input 
                  type="file" 
                  id="proposal-uploader" 
                  style={{ display: 'none' }} 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setResponse({ ...response, proposalFile: e.target.files[0].name });
                      alert(`${e.target.files[0].name} を選択しました。`);
                    }
                  }} 
                />
                <label htmlFor="proposal-uploader" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Icons.Plus size={24} color="#6366f1" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#475569' }}>
                    {response.proposalFile ? `選択済み: ${response.proposalFile}` : 'ファイルを選択するか、ドラッグ＆ドロップしてください'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>PDF, PPTX 等の企画書ファイル</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>サービス提案</label>
                  <button
                    onClick={addServiceRow}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '10px', border: '1.5px solid #6366f1',
                      backgroundColor: 'transparent', color: '#6366f1', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '800', transition: 'all 0.2s'
                    }}
                  >
                    <Icons.Plus size={14} />
                    <span>行を追加</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(response.serviceRows || []).map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'white', padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>金額シェア</span>
                        <input
                          type="number"
                          value={row.moneyShare || 20}
                          disabled
                          style={{ width: '80px', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', textAlign: 'right', fontWeight: '900', outline: 'none' }}
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
                          onChange={e => {
                            const val = Math.min(1000, Math.max(0, Number(e.target.value)));
                            updateServiceRow(i, 'serviceN', e.target.value === '' ? '' : val);
                          }}
                          placeholder="0"
                          style={{ width: '85px', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'right', fontWeight: '900', outline: 'none' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>％</span>
                      </div>
                      {response.serviceRows.length > 1 && (
                        <button
                          onClick={() => removeServiceRow(i)}
                          style={{ background: 'none', border: 'none', color: '#fa5252', cursor: 'pointer', fontSize: '18px', fontWeight: '900', padding: '0 8px' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>企画提案回答・企画詳細</label>
                <textarea
                  style={{ ...valueBoxStyle, minHeight: '100px', backgroundColor: 'white', width: '100%', resize: 'none' }}
                  placeholder="具体的な企画プランや提案内容を記載してください"
                  value={response.proposalDetail || ''}
                  onChange={e => setResponse({ ...response, proposalDetail: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>全体備考・特記事項</label>
                <textarea style={{ ...valueBoxStyle, minHeight: '80px', backgroundColor: 'white', width: '100%', resize: 'none' }} placeholder="補足情報を記入してください" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StationResponseView;
