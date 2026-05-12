import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const AreaModal = ({ isOpen, onClose, onSave, initialAreas = [] }) => {
  const [selected, setSelected] = useState([]);
  const regions = {
    '北海道・東北': ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島'],
    '関東': ['東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬'],
    '中部・甲信越': ['愛知', '静岡', '岐阜', '三重', '山梨', '長野', '新潟', '富山', '石川', '福井'],
    '近畿': ['大阪', '兵庫', '京都', '滋賀', '奈良', '和歌山'],
    '中国・四国': ['広島', '岡山', '鳥取', '島根', '山口', '香川', '徳島', '愛媛', '高知'],
    '九州・沖縄': ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']
  };

  useEffect(() => { 
    if (isOpen) setSelected(initialAreas || []); 
  }, [isOpen, initialAreas]);

  if (!isOpen) return null;

  const toggle = (a) => setSelected(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const selectAll = () => {
    const allAreas = Object.values(regions).flat();
    setSelected(allAreas);
  };

  const deselectAll = () => {
    setSelected([]);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 70px rgba(0,0,0,0.3)', border: '1px solid #f1f5f9' }} className="animate-pop">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '12px', color: '#0ea5e9' }}>
                    <Icons.Board size={24} />
                 </div>
                 エリア設定
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>対象となる地域を選択してください（地域ごとに1行で表示しています）。</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={selectAll}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #0ea5e9', backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                一括選択
              </button>
              <button 
                onClick={deselectAll}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                全解除
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>選択済み</div>
             <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--tacos-red)' }}>{selected.length} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>エリア</span></div>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(regions).map(([region, areas]) => (
            <div key={region} style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '20px', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '24px' }}>
               <h4 style={{ width: '120px', flexShrink: 0, fontSize: '0.85rem', fontWeight: '900', color: '#475569', borderRight: '2px solid #e2e8f0', margin: 0 }}>
                  {region}
               </h4>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                  {areas.map(a => (
                    <button 
                      key={a} 
                      onClick={() => toggle(a)} 
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '10px', 
                        border: '1.5px solid',
                        cursor: 'pointer', 
                        fontSize: '0.85rem', 
                        fontWeight: '800', 
                        transition: 'all 0.15s ease',
                        backgroundColor: selected.includes(a) ? 'var(--tacos-red)' : 'white', 
                        borderColor: selected.includes(a) ? 'var(--tacos-red)' : '#e2e8f0',
                        color: selected.includes(a) ? 'white' : '#64748b',
                        boxShadow: selected.includes(a) ? '0 4px 10px rgba(230, 0, 18, 0.15)' : 'none'
                      }}
                    >
                      {a}
                    </button>
                  ))}
               </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', position: 'sticky', bottom: '-1px', background: 'white', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: '800' }}>キャンセル</button>
          <button onClick={() => { onSave(selected); onClose(); }} className="btn-primary" style={{ flex: 2, padding: '14px', borderRadius: '16px', fontWeight: '900', boxShadow: '0 10px 25px rgba(230, 0, 18, 0.2)' }}>エリアを決定</button>
        </div>
      </div>
    </div>
  );
};

export default AreaModal;
