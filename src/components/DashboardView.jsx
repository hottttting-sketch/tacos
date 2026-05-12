import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

const TrendChart = ({ data = [], height = 60 }) => {
  // 安全チェック: データが配列でない、または要素が2つ未満なら描画しない
  if (!Array.isArray(data) || data.length < 2) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>データ収集中...</div>;
  }

  try {
    const values = data.map(d => Number(d.value) || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height, overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke="var(--tacos-red)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  } catch (e) {
    return <div style={{ height, backgroundColor: '#f8fafc' }}></div>;
  }
};

const DashboardView = ({ role, fullProfile }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 全てのリクエストにエラーハンドリングを追加
      const projects = await api.getProjects().catch(() => []);
      const stats = await api.getRevenueTimeSeriesStats().catch(() => []);

      if (Array.isArray(projects)) {
        console.log('[UI:DashboardView] Processing projects for deadlines:', projects.length);
        const mappedDeadlines = projects.map(p => {
          if (!p) return null;
          const status = p.status || 'planning';
          // revision と revising 両方を考慮
          const type = status === 'requesting' ? '見積〆切' : (status === 'revising' || status === 'revision') ? '改案〆切' : '初案〆切';
          return {
            id: p.id || Math.random(),
            type: type,
            project: p.name || '名称未設定',
            date: p.metadata?.estimateDeadline ? p.metadata.estimateDeadline.split('T')[0] : (p.end_date || '未設定'),
            time: p.metadata?.estimateDeadline ? p.metadata.estimateDeadline.split('T')[1]?.substring(0, 5) : '18:00',
            priority: status === 'requesting' ? 'high' : 'medium',
            company: p.sponsor_name || '-'
          };
        }).filter(Boolean);
        console.log('[UI:DashboardView] Mapped deadlines count:', mappedDeadlines.length);
        setDeadlines(mappedDeadlines);
      }

      if (Array.isArray(stats)) {
        // プロパティ名を api.js の戻り値 (revenue) に合わせる
        setRevenueStats(stats.map(s => ({ value: Number(s.revenue) || 0 })));
      }
    } catch (e) {
      console.error('Dashboard logic error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getPriorityColor = (p) => {
    if (p === 'high') return { border: '#fa5252', bg: '#fff5f5', text: '#fa5252' };
    if (p === 'medium') return { border: '#f08c00', bg: '#fff9db', text: '#f08c00' };
    return { border: '#40c057', bg: '#ebfbee', text: '#40c057' };
  };

  if (isLoading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div className="animate-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #f1f5f9', borderTopColor: 'var(--tacos-red)' }}></div>
      <div style={{ fontWeight: '800', color: '#94a3b8' }}>ダッシュボードを集約中...</div>
    </div>
  );

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>
            {fullProfile?.name ? `${fullProfile.name} さん、おかえりなさい` : 'ダッシュボード'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>現在の進捗状況と最新のアラートを確認してください</p>
        </div>
        <button onClick={fetchDashboardData} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
          データを更新
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '40px' }}>
         <div style={{ padding: '28px', borderRadius: '32px', backgroundColor: 'white', border: '1.5px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#64748b', marginBottom: '20px' }}>収益トレンド (予測)</h3>
            <div style={{ height: '100px', width: '100%' }}>
               <TrendChart data={revenueStats} height={100} />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>直近 6 ヶ月</span>
               <span style={{ fontSize: '16px', fontWeight: '950', color: 'var(--tacos-red)' }}>
                  {revenueStats.length > 0 ? `¥${(revenueStats.reduce((a, b) => a + b.value, 0) / 10000).toFixed(1)}万` : '¥0'}
               </span>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {['見積〆切', '初案〆切', '改案〆切'].map(title => {
               const count = deadlines.filter(d => d.type === title).length;
               return (
                  <div key={title} style={{ padding: '24px', borderRadius: '24px', backgroundColor: 'white', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                     <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '900', marginBottom: '8px' }}>{title}</div>
                     <div style={{ fontSize: '32px', fontWeight: '950', color: '#1e293b' }}>{count}<span style={{ fontSize: '14px', marginLeft: '4px' }}>件</span></div>
                  </div>
               );
            })}
         </div>
      </div>

      <section>
         <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#475569', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} /> 進行中の〆切スケジュール
         </h3>
         {deadlines.length === 0 ? (
           <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1.5px dashed #e2e8f0', color: '#94a3b8', fontWeight: '700' }}>直近の〆切はありません</div>
         ) : (
           <div style={{ display: 'grid', gap: '16px' }}>
              {deadlines.map(item => {
                 const pStyle = getPriorityColor(item.priority);
                 return (
                    <div key={item.id} style={{ 
                       padding: '20px 32px', borderRadius: '20px', backgroundColor: 'white', 
                       border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <div style={{ 
                             padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '950',
                             backgroundColor: item.type === '見積〆切' ? '#eef2ff' : '#f3f0ff',
                             color: item.type === '見積〆切' ? '#4338ca' : '#7048e8'
                          }}>
                             {item.type}
                          </div>
                          <div>
                             <div style={{ fontWeight: '950', color: '#1e293b', fontSize: '16px' }}>{item.project}</div>
                             <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', marginTop: '4px' }}>{item.company}</div>
                          </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b' }}>{item.date} <span style={{ color: '#fa5252' }}>{item.time}</span></div>
                          <div style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '950', backgroundColor: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}` }}>
                             PRIORITY: {item.priority?.toUpperCase()}
                          </div>
                       </div>
                    </div>
                 );
              })}
           </div>
         )}
      </section>
    </div>
  );
};

export default DashboardView;
