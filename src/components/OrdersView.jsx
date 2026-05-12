import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('spot'); // 'spot' or 'time'

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      const filtered = (data || []).filter(p => {
        return p.status === 'ordered' || p.status === 'revenue_active' || p.metadata?.type === 'revenue_item';
      });

      setOrders(filtered.map(p => ({
        id: p.id,
        name: p.name,
        sp: p.sponsor_name,
        ag: p.metadata?.ba || p.metadata?.ag || '設定なし',
        date: p.start_date || '未定',
        status: p.status === 'ordered' ? 'confirmed' : 'pending',
        category: p.metadata?.type === 'time' ? 'time' : 'spot'
      })));
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>読み込み中...</div>;

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>進行表管理</h2>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '15px' }}>確定案件の進行表取得と、放送までのステータスを管理します。</p>
        </div>
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

      <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
            <tr>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>案件名 / SP/AG</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>放送開始日</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>進行状況</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(o => o.category === activeCategory).length === 0 ? (
               <tr>
                 <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>表示可能な進行済案件がありません。</td>
               </tr>
            ) : orders.filter(o => o.category === activeCategory).map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 24px' }}>
                   <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>{o.sp} / {o.ag}</div>
                   <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '950' }}>{o.name}</div>
                </td>
                <td style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', fontSize: '14px' }}>{o.date}</td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', width: 'fit-content',
                    backgroundColor: o.status === 'confirmed' ? '#ebfbee' : '#fff9db',
                    color: o.status === 'confirmed' ? '#087f5b' : '#f08c00',
                    fontSize: '11px', fontWeight: '950'
                  }}>
                    {o.status === 'confirmed' ? <Icons.Check size={14} /> : <Icons.Clock size={14} />}
                    {o.status === 'confirmed' ? '進行済' : '内容確認中'}
                  </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
                    onClick={() => alert(`[${activeCategory.toUpperCase()}] 進行表をダウンロードします`)}
                  >
                    <Icons.Download size={16} />
                    進行表DL
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersView;
