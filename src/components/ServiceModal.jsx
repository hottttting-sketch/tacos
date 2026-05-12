import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const ServiceModal = ({ isOpen, onClose, onSave, initialShares = [] }) => {
  const [shares, setShares] = useState([
    { label: '金額シェア', value: '' },
    { label: '金額シェア', value: '' },
    { label: '金額シェア', value: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      if (initialShares && initialShares.length > 0) {
        setShares(initialShares.map((s) => ({
          label: '金額シェア',
          value: s.value
        })));
      } else {
        setShares([
          { label: '金額シェア', value: '' },
          { label: '金額シェア', value: '' },
          { label: '金額シェア', value: '' }
        ]);
      }
    }
  }, [isOpen, initialShares]);

  if (!isOpen) return null;

  const addRow = () => {
    setShares([...shares, { label: '金額シェア', value: '' }]);
  };

  const removeRow = (index) => {
    const next = shares.filter((_, i) => i !== index).map((s) => ({
      ...s,
      label: '金額シェア'
    }));
    setShares(next);
  };

  const updateRow = (index, val) => {
    let numericVal = val;
    if (val !== '') {
      numericVal = Math.max(1, Math.min(100, Number(val)));
    }
    const next = [...shares];
    next[index].value = numericVal;
    setShares(next);
  };

  const handleSave = () => {
    onSave(shares.filter(s => s.value !== ''));
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
       <div className="animate-pop" style={{ backgroundColor: 'white', width: '95%', maxWidth: '450px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: '1px solid #f1f5f9' }}>
          <div style={{ padding: '28px 32px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>サービス設定</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>金額シェア（1〜100%）を設定してください。</p>
             </div>
             <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>
               <Icons.X size={18} />
             </button>
          </div>
          
          <div style={{ padding: '32px', maxHeight: '400px', overflowY: 'auto' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {shares.map((item, i) => (
                   <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 40px', gap: '16px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                     <div style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>
                       {item.label}
                     </div>
                     <div>
                       <div style={{ position: 'relative' }}>
                         <input 
                           type="number" 
                           min="1" max="100"
                           value={item.value} 
                           placeholder="N"
                           onChange={(e) => updateRow(i, e.target.value)} 
                           style={{ width: '100%', padding: '12px 36px 12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '15px', fontWeight: '900', textAlign: 'right', color: 'var(--tacos-red)', outline: 'none' }} 
                         />
                         <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '900', color: '#94a3b8' }}>%</span>
                       </div>
                     </div>
                     <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', width: '32px', height: '32px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Icons.Trash size={16} />
                     </button>
                   </div>
                ))}

                <button 
                  onClick={addRow}
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '2px dashed #cbd5e1', background: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                >
                  <Icons.Plus size={18} /> 行を追加
                </button>
             </div>
          </div>

          <div style={{ padding: '24px 32px', backgroundColor: '#fcfdfe', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: '800' }}>キャンセル</button>
             <button className="btn-primary" onClick={handleSave} style={{ flex: 2, padding: '14px', borderRadius: '16px', fontWeight: '900' }}>
                設定を保存
             </button>
          </div>
       </div>
    </div>
  );
};

export default ServiceModal;
