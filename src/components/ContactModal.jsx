import React, { useState } from 'react';
import { Icons } from './IconLibrary';

import { MEMBERS } from '../constants/members';

const ContactModal = ({ isOpen, onClose, onSend, initialContacts = {}, selectedStations = [] }) => {
  const [formData, setFormData] = useState({
    stationMap: initialContacts?.stationMap || {}, // stationName -> [memberIds]
    notes: initialContacts?.notes || ''
  });

  const kyokutanMembers = MEMBERS.filter(m => m.isKyokutan);

  const toggleMember = (station, memberId) => {
    setFormData(prev => {
      const currentIds = prev.stationMap[station] || [];
      const nextIds = currentIds.includes(memberId)
        ? currentIds.filter(id => id !== memberId)
        : [...currentIds, memberId];
      
      return {
        ...prev,
        stationMap: {
          ...prev.stationMap,
          [station]: nextIds
        }
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
       <div className="animate-pop" style={{ backgroundColor: 'white', width: '90%', maxWidth: '800px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: '1px solid #f1f5f9' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>局担の設定と送信</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>放送局ごとに担当者を選択し、依頼を送信してください。</p>
             </div>
             <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>×</button>
          </div>
          
          <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
             
             {selectedStations.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '800' }}>
                 放送局が選択されていません。先に依頼局を設定してください。
               </div>
             ) : selectedStations.map(station => (
               <div key={station} style={{ border: '1.5px solid #f1f5f9', borderRadius: '24px', padding: '20px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                   <div style={{ backgroundColor: 'var(--tacos-red)', color: 'white', padding: '4px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900' }}>放送局</div>
                                       <span style={{ fontSize: '16px', fontWeight: '950', color: '#1e293b' }}>{typeof station === 'string' ? station : (station.name || '不明')}</span>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                    {kyokutanMembers.map(m => {
                       const isSelected = (formData.stationMap[station] || []).includes(m.id);
                       return (
                          <div 
                             key={m.id}
                             onClick={() => toggleMember(station, m.id)}
                             style={{ 
                                padding: '12px', borderRadius: '16px', border: '1.5px solid',
                                borderColor: isSelected ? 'var(--tacos-red)' : '#f1f5f9',
                                backgroundColor: isSelected ? 'rgba(230,0,18,0.03)' : '#f8fafc',
                                cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', gap: '10px'
                             }}
                          >
                             <div style={{ 
                                width: '28px', height: '28px', borderRadius: '14px', 
                                backgroundColor: isSelected ? 'var(--tacos-red)' : '#e2e8f0', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: isSelected ? 'white' : '#64748b' 
                             }}>
                                <Icons.Users size={14} />
                             </div>
                             <div>
                                <div style={{ color: isSelected ? 'var(--tacos-red)' : '#1e293b', fontWeight: '900' }}>{m.name}</div>
                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{m.dept.split(' ')[0]}</div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
               </div>
             ))}

             <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                   <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', display: 'block' }}>コメント</label>
                   <textarea 
                     placeholder="メッセージを入力してください..." 
                     value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                     style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2.5px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '700', minHeight: '120px', resize: 'none', outline: 'none', color: '#1e293b' }}
                   />
                </div>
             </div>
          </div>

          <div style={{ padding: '24px 32px', backgroundColor: '#fcfdfe', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9' }}>
             <button className="btn-secondary" onClick={onClose} style={{ padding: '12px 28px', borderRadius: '14px', fontWeight: '800' }}>キャンセル</button>
             <button 
                className="btn-primary" 
                onClick={() => onSend({
                  ...formData,
                  // Legacy support if needed, but stationMap is the main one now
                  selectedMemberIds: Array.from(new Set(Object.values(formData.stationMap).flat()))
                })} 
                style={{ padding: '12px 64px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 8px 24px rgba(230, 0, 18, 0.25)' }}
             >
                設定して送信する
             </button>
          </div>
       </div>
    </div>
  );
};

export default ContactModal;
