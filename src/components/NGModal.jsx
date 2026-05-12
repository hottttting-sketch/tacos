import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const NGModal = ({ isOpen, onClose, onSave, initialSelections = [], initialOtherText = '' }) => {
  const [selected, setSelected] = useState([]);
  const [otherText, setOtherText] = useState('');

  useEffect(() => {
    if (isOpen) {
      const baseSelected = Array.isArray(initialSelections) ? initialSelections : [];
      const hasOther = baseSelected.find(s => typeof s === 'string' && s.startsWith('その他'));
      
      if (hasOther) {
        setSelected(baseSelected.map(s => (typeof s === 'string' && s.startsWith('その他')) ? 'その他' : s));
        const match = String(hasOther).match(/^その他[:：]\s*(.*)$/);
        setOtherText(match ? match[1] : initialOtherText || '');
      } else {
        setSelected(baseSelected);
        setOtherText(initialOtherText || '');
      }
    }
  }, [isOpen, initialSelections, initialOtherText]);

  if (!isOpen) return null;

  const rows = [
    ['WPT・WSB', 'ミニ枠'],
    ['アニメ', '深夜アニメ'],
    ['政治', '通販番組'],
    ['衝撃映像', 'その他']
  ];

  const toggle = (item) => {
    setSelected(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    const nextSelected = selected.map(s => {
      if (s === 'その他') {
        return otherText ? `その他: ${otherText}` : 'その他';
      }
      return s;
    });
    onSave(nextSelected, otherText);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
       <div className="animate-pop" style={{ backgroundColor: 'white', width: '90%', maxWidth: '640px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: '1px solid #f1f5f9' }}>
          
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#fff5f5', color: '#fa5252', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Icons.X size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>NG項目・制約事項</h3>
             </div>
             <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>×</button>
          </div>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', margin: 0 }}>放送局に伝えるべき競合排除や制約事項（NG項目）を各行から選択してください。</p>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rows.map((rowItems, idx) => (
                   <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {rowItems.map(item => {
                         const isSelected = selected.includes(item);
                         return (
                            <label 
                               key={item} 
                               style={{ 
                                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '16px', 
                                  border: '2px solid', backgroundColor: isSelected ? '#fff5f5' : 'white', borderColor: isSelected ? '#ffc9c9' : '#e2e8f0', 
                                  cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                               }}
                            >
                               <input type="checkbox" checked={isSelected} onChange={() => toggle(item)} style={{ width: '20px', height: '20px', accentColor: '#fa5252' }} />
                               <span style={{ fontSize: '0.95rem', fontWeight: '800', color: isSelected ? '#fa5252' : '#334155' }}>
                                  {item}
                               </span>
                            </label>
                         );
                      })}
                   </div>
                ))}
             </div>

             {selected.includes('その他') && (
                <div className="animate-fade" style={{ padding: '20px', backgroundColor: '#fff5f5', borderRadius: '24px', border: '1.5px solid #ffc9c9' }}>
                   <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '900', color: '#fa5252', marginBottom: '8px' }}>
                      その他の制約事項
                   </label>
                   <textarea
                      placeholder="具体的なNG項目や制約内容を入力してください"
                      value={otherText}
                      onChange={e => setOtherText(e.target.value)}
                      style={{ width: '100%', height: '80px', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #ffc9c9', fontSize: '0.9rem', outline: 'none', resize: 'none', backgroundColor: '#fff' }}
                   />
                </div>
             )}
          </div>

          <div style={{ padding: '24px 32px', backgroundColor: '#fcfdfe', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9' }}>
             <button className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: '800' }}>
                キャンセル
             </button>
             <button className="btn-primary" onClick={handleSave} style={{ flex: 2, padding: '14px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 8px 20px rgba(250, 82, 82, 0.2)' }}>
                設定を保存
             </button>
          </div>
       </div>
    </div>
  );
};

export default NGModal;
