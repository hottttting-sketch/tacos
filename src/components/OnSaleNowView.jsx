import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const OnSaleNowView = ({ onBack, onNavigateToChat }) => {
  const [salesData, setSalesData] = useState([]);
  const [activeSaleTab, setActiveSaleTab] = useState('time');

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const projs = await api.getProjects();
        console.log('[UI:OnSaleNowView] getProjects result:', projs);
        const salesSlots = (projs || [])
          .filter(p => p.metadata?.type === 'sales_slot')
          .map(p => ({
            id: p.id,
            station: p.metadata?.station || p.sponsor_name || '未設定局',
            title: p.name,
            slot: p.metadata?.slot || '未設定枠',
            period: p.metadata?.period || '未設定期間',
            price: p.metadata?.price || '未設定金額',
            label: p.metadata?.label || 'おすすめ枠',
            color: p.metadata?.color || '#f1f5f9',
            iconColor: p.metadata?.iconColor || '#475569',
            saleType: p.metadata?.saleType || 'time'
          }));

        if (salesSlots.length > 0) {
          console.log('[UI:OnSaleNowView] Filtered sales slots:', salesSlots.length);
          setSalesData(salesSlots);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch sales slots from API', err);
      }
      setSalesData([]);
    };

    fetchSalesData();
  }, []);

  const [selectedItem, setSelectedItem] = useState(null);

  const labelStyle = {
    fontWeight: '900',
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
    display: 'block'
  };

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
            <IconWrapper color="#f1f5f9" iconColor="#475569" size={44} borderRadius={22}>
              <Icons.ArrowLeft />
            </IconWrapper>
          </button>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0 }}>On Sale Now</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>放送局が現在セールスを強化している、注目の放送枠・企画一覧です。</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}>
               <Icons.Filter size={18} style={{ marginRight: '8px' }} /> フィルター
            </button>
        </div>
      </header>

      {/* Slide Switch - Time vs Event */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', background: '#f1f3f5', borderRadius: '14px', padding: '4px', gap: '4px',
          width: '320px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {[
            { id: 'time', label: 'タイム' },
            { id: 'event', label: 'イベント' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSaleTab(tab.id)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '11px', border: 'none',
                fontWeight: '900', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: activeSaleTab === tab.id ? 'white' : 'transparent',
                color: activeSaleTab === tab.id ? 'var(--tacos-red)' : '#64748b',
                boxShadow: activeSaleTab === tab.id ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        {salesData.filter(item => (item.saleType || 'time') === activeSaleTab).map((item) => (
          <div 
            key={item.id} 
            className="sale-card"
            style={{ 
              backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #f1f5f9', 
              overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative'
            }}
          >
            {/* Header Badge */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ 
                  fontSize: '11px', fontWeight: '900', color: 'white', backgroundColor: '#334155', 
                  padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase' 
               }}>
                  {item.station}
               </div>
               <div style={{ 
                  fontSize: '11px', fontWeight: '900', color: item.iconColor, backgroundColor: item.color, 
                  padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px'
               }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: item.iconColor }}></div>
                  {item.label}
               </div>
            </div>
            
            {/* Content Body */}
            <div style={{ padding: '28px', flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', marginBottom: '24px', lineHeight: '1.5', minHeight: '3.75rem' }}>{item.title}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#fcfdfe', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                   <span style={labelStyle}>放送枠 / 対象期間</span>
                   <div style={{ fontSize: '14px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icons.Clock size={16} style={{ color: '#94a3b8' }} /> {item.slot}
                   </div>
                   <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginTop: '6px', marginLeft: '26px' }}>
                      {item.period} 実施分
                   </div>
                </div>
              </div>

               <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={labelStyle}>参考価格</span>
                    <div style={{ fontSize: '24px', fontWeight: '950', color: 'var(--tacos-red)', letterSpacing: '-0.02em' }}>
                       {item.price}<span style={{ fontSize: '14px', fontWeight: '800', marginLeft: '2px' }}>(税別)</span>
                    </div>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                     <Icons.Star size={24} />
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '24px 28px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
               <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: '900' }}
                  onClick={() => setSelectedItem(item)}
               >
                  詳細・問合せ
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', maxWidth: '600px', width: '100%', padding: '40px', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}>
             <button 
                onClick={() => setSelectedItem(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
             >
                <Icons.X size={18} />
             </button>

             <div style={{ marginBottom: '32px' }}>
               <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--tacos-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Menu Details</span>
               <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginTop: '8px' }}>{selectedItem.title}</h2>
               <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>{selectedItem.station}</div>
                  <div style={{ backgroundColor: selectedItem.color, padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: selectedItem.iconColor }}>{selectedItem.label}</div>
               </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                   <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>TARGET & REACH</div>
                   <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.6' }}>
                     本企画は、主に{selectedItem.slot}の視聴層（コア層）へのリーチを最大化することを目的としています。
                     実施期間は {selectedItem.period} を予定しており、季節需要に合わせた展開が可能です。
                   </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>ESTIMATED COST</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--tacos-red)' }}>{selectedItem.price}</div>
                   </div>
                   <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>AVAILABILITY</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>即時確認可能</div>
                   </div>
                </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                 <button 
                    onClick={() => setSelectedItem(null)}
                    style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '15px' }}
                 >
                    閉じる
                 </button>
                 <button 
                    onClick={() => {
                       if (onNavigateToChat) {
                          onNavigateToChat(selectedItem.title);
                       } else {
                          alert(`${selectedItem.title} についてチャットを立ち上げます。`);
                       }
                       setSelectedItem(null);
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '16px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' }}
                 >
                    問合せ
                 </button>
              </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .sale-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: var(--tacos-red) !important;
          box-shadow: 0 30px 60px -12px rgba(230, 0, 18, 0.15) !important;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default OnSaleNowView;
