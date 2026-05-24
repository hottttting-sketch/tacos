import React, { useState } from 'react';
import { Icons } from './IconLibrary';

const IconWrapper = ({ children, color, iconColor, size = 48, borderRadius = 14 }) => (
  <div style={{
    width: size, height: size, borderRadius, backgroundColor: color, color: iconColor,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  }}>
    {children}
  </div>
);

const UrlStationResponseDemo = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ダミーデータ（案件要件）
  const request = {
    sponsor: '株式会社サンプル',
    agency: '大手広告代理店',
    product: '新商品サマーキャンペーン',
    period: '2026/07/01 〜 2026/08/31',
    area: ['関東', '関西', '中京'],
    takeType: '全日 (05:00-29:00)・ヨの字 (06:00-09:00/19:00-24:00)',
    scale: '10,000,000円',
    tg: 'F1, F2',
    seconds: '15秒, 30秒',
    ag: '15%',
    ngItems: '同業他社(化粧品), 競合タレント',
    deadline: '2026/06/15 17:00',
    pubTypes: ['生CM', 'VTR', 'インフォマーシャル'],
    materialStartDate: '2026/06/20'
  };

  // ダミーデータ（回答入力用ステート）
  const [spotRows, setSpotRows] = useState([
    { pattern: '全日', personal: '', refPrice: '', aPrice: '', index_F1: '', index_F2: '' },
    { pattern: 'ヨの字', personal: '', refPrice: '', aPrice: '', index_F1: '', index_F2: '' }
  ]);

  const [response, setResponse] = useState({
    straightPubCondition: '',
    interviewPubCondition: '',
    planningCondition: ''
  });

  const updateSpotRow = (idx, field, value) => {
    if (isLocked) return;
    setSpotRows(prev => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '800', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' };
  const valueBoxStyle = { padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', color: '#1e293b', fontSize: '14px', fontWeight: '800', minHeight: '44px', display: 'flex', alignItems: 'center' };

  const handleConfirm = () => {
    if (isLocked || isSaving) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsLocked(true);
      alert('回答を送信しました！\n（※プレビュー用のため、データは実際に保存されていません）');
    }, 800);
  };

  const handleUnlock = () => {
    if (!isLocked) return;
    setIsLocked(false);
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>見積回答作成</h2>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'white', backgroundColor: '#94a3b8', padding: '4px 10px', borderRadius: '8px' }}>プレビュー</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>要求項目に即した提案を入力してください</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isLocked && <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--tacos-red)', backgroundColor: '#fff5f5', padding: '6px 12px', borderRadius: '10px' }}>回答送信済み（ロック中）</span>}
            <button 
              className="btn-secondary" 
              disabled={isLocked} 
              style={{ padding: '12px 24px', borderRadius: '15px', fontWeight: '900', backgroundColor: isLocked ? '#f1f5f9' : 'white', border: '2px solid #e2e8f0', color: isLocked ? '#94a3b8' : '#334155', cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              一時保存
            </button>
            <button 
              onClick={handleConfirm}
              className="btn-primary" 
              disabled={isLocked} 
              style={{ padding: '12px 32px', borderRadius: '15px', fontWeight: '900', backgroundColor: isLocked ? '#cbd5e1' : 'var(--tacos-red)', color: 'white', border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: isLocked ? 'none' : '0 8px 20px rgba(230,0,18,0.2)' }}
            >
              回答を送信する
            </button>
            {isLocked && (
              <button 
                onClick={handleUnlock}
                style={{ padding: '12px 24px', borderRadius: '15px', fontWeight: '900', backgroundColor: 'white', border: '2px solid #e2e8f0', color: '#334155', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                編集
              </button>
            )}
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* 上段：依頼内容の確認 */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '950', color: 'var(--tacos-red)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconWrapper color="rgba(230,0,18,0.08)" iconColor="var(--tacos-red)" size={32} borderRadius={8}><Icons.FileText size={18} /></IconWrapper>
              依頼内容の確認（基本事項）
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1行目 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div><label style={labelStyle}>スポンサー / 代理店</label><div style={valueBoxStyle}>{request.sponsor} / {request.agency}</div></div>
                <div><label style={labelStyle}>商品・CP名</label><div style={valueBoxStyle}>{request.product}</div></div>
                <div><label style={labelStyle}>放送・実施期間</label><div style={{ ...valueBoxStyle, borderLeft: '4px solid #4338ca' }}>{request.period}</div></div>
              </div>

              {/* 2行目 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div><label style={labelStyle}>放送・実施エリア</label><div style={valueBoxStyle}>{request.area.join('・')}</div></div>
                <div><label style={labelStyle}>取り方（パターン）</label><div style={valueBoxStyle}>{request.takeType}</div></div>
                <div><label style={labelStyle}>NG項目</label><div style={{ ...valueBoxStyle, backgroundColor: '#fff5f5', borderLeft: '4px solid var(--tacos-red)', color: 'var(--tacos-red)' }}>{request.ngItems}</div></div>
              </div>

              {/* パブ特有 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>パブ種別</label>
                  <div style={{ ...valueBoxStyle, gap: '8px', flexWrap: 'wrap' }}>
                    {request.pubTypes.map((t, idx) => (
                      <span key={idx} style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(230,0,18,0.05)', color: 'var(--tacos-red)', fontSize: '11px', fontWeight: '900', border: '1px solid rgba(230,0,18,0.1)' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>素材搬入開始日</label>
                  <div style={{ ...valueBoxStyle, color: '#059669', borderLeft: '4px solid #10b981' }}>{request.materialStartDate}</div>
                </div>
              </div>

              {/* 3行目 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                <div><label style={labelStyle}>規模</label><div style={valueBoxStyle}>{request.scale}</div></div>
                <div><label style={labelStyle}>TG</label><div style={valueBoxStyle}>{request.tg}</div></div>
                <div><label style={labelStyle}>秒数</label><div style={valueBoxStyle}>{request.seconds}</div></div>
                <div><label style={labelStyle}>AG条件</label><div style={valueBoxStyle}>{request.ag}</div></div>
                <div><label style={labelStyle}>見積〆切</label><div style={{ ...valueBoxStyle, color: 'var(--tacos-red)', borderLeft: '3px solid var(--tacos-red)' }}>{request.deadline}</div></div>
              </div>
            </div>
          </section>

          {/* 下段：回答・提案の入力 */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1.5px solid #e2e8f0', backgroundColor: '#fcfdfe', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '950', color: '#475569', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconWrapper color="#f1f5f9" iconColor="#475569" size={32} borderRadius={8}><Icons.Edit size={18} /></IconWrapper>
              回答・提案の入力（依頼要件へのレスポンス）
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* グリッド */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b', margin: 0 }}>スポット見積回答グリッド</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr>
                        {['パターン', '個人ALLコスト', '目安一本単価', 'A単価', 'F1', 'F2'].map((h, idx) => (
                          <th key={idx} style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: '900', textAlign: h === 'パターン' ? 'left' : 'center', minWidth: h === 'パターン' ? '120px' : '95px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spotRows.map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px', fontWeight: '950', color: '#475569', minWidth: '120px' }}>{row.pattern}</td>
                          {['personal', 'refPrice', 'aPrice', 'index_F1', 'index_F2'].map((field, idx) => (
                            <td key={idx} style={{ padding: '4px' }}>
                              <input 
                                type="text" 
                                value={row[field]} 
                                onChange={e => updateSpotRow(i, field, e.target.value)} 
                                disabled={isLocked} 
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontSize: '14px', fontWeight: '900', backgroundColor: isLocked ? '#f8fafc' : 'white', outline: 'none' }} 
                                placeholder={field.startsWith('index') ? "1.0" : "0"} 
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* パブ＆企画条件 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* パブリシティ条件 */}
                <div style={{ backgroundColor: '#fdfcfe', padding: '24px', borderRadius: '20px', border: '1.5px solid #f1eef8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#6366f1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconWrapper color="rgba(99,102,241,0.08)" iconColor="#6366f1" size={28} borderRadius={6}><Icons.Shield size={15} /></IconWrapper>
                    パブリシティ条件
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>ストレートパブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800', outline: 'none' }}
                        placeholder="実施条件等を記入"
                        disabled={isLocked}
                        value={response.straightPubCondition}
                        onChange={e => setResponse({ ...response, straightPubCondition: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ ...labelStyle, margin: 0, color: '#334155' }}>取材パブ</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '44px', padding: '8px 12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '13px', fontWeight: '800', outline: 'none' }}
                        placeholder="取材パブの条件等を記入"
                        disabled={isLocked}
                        value={response.interviewPubCondition}
                        onChange={e => setResponse({ ...response, interviewPubCondition: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 企画条件 */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconWrapper color="rgba(2,132,199,0.08)" iconColor="#0284c7" size={28} borderRadius={6}><Icons.Shield size={15} /></IconWrapper>
                    企画条件
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ ...labelStyle, color: '#475569', marginBottom: '8px' }}>回答・提案コメント</label>
                      <textarea
                        style={{ ...valueBoxStyle, minHeight: '110px', padding: '12px', backgroundColor: isLocked ? '#f8fafc' : 'white', width: '100%', resize: 'none', fontSize: '14px', fontWeight: '800', outline: 'none' }}
                        placeholder="企画に対する提案や特記事項を入力..."
                        disabled={isLocked}
                        value={response.planningCondition}
                        onChange={e => setResponse({ ...response, planningCondition: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <footer style={{ marginTop: '20px', textAlign: 'center', paddingBottom: '60px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
              Powered by タコス (TV Planning Linker)
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default UrlStationResponseDemo;
