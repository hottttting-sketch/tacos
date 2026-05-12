import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const IndexModal = ({ isOpen, onClose, onSave, initialIndices = [] }) => {
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['目安']);

  useEffect(() => { 
    if (isOpen) {
      const demos = new Set();
      const types = new Set();
      initialIndices.forEach(idx => {
        if (!idx || typeof idx !== 'object') return;
        const label = idx.label || '';
        const parts = label.split(' ');
        const demo = parts[0];
        const typeLabel = parts[1];
        if (demo) demos.add(demo);
        if (typeLabel) types.add(typeLabel);
      });
      setSelectedDemographics(Array.from(demos));
      if (types.size > 0) setSelectedTypes(Array.from(types));
      else setSelectedTypes(['目安']);
    }
  }, [isOpen, initialIndices]);

  if (!isOpen) return null;

  const toggleDemographic = (demo) => {
    setSelectedDemographics(prev => 
      prev.includes(demo) ? prev.filter(d => d !== demo) : [...prev, demo]
    );
  };

  const toggleType = (t) => {
    setSelectedTypes(prev => 
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleSave = () => {
    const result = [];
    selectedDemographics.forEach(demo => {
      selectedTypes.forEach(t => {
        result.push({ label: `${demo} ${t}`, value: '' });
      });
    });
    onSave(result);
    onClose();
  };

  const demographicRows = [
    ['F1', 'F2', 'F3'],
    ['M1', 'M2', 'M3'],
    ['主婦', 'C', 'T']
  ];

  const labelStyle = { fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '6px', display: 'block' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '500px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '1px solid #f1f5f9' }} className="animate-pop">
        <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1.75rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fff5f5', borderRadius: '12px', color: 'var(--tacos-red)' }}>
            <Icons.Chart size={24} />
          </div>
          INDEX設定
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: キメ・目安 Checkboxes (Centered) */}
          <div style={{ display: 'flex', gap: '32px', paddingBottom: '20px', borderBottom: '1.5px solid #f1f5f9', justifyContent: 'center' }}>
            {['目安', 'キメ'].map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 16px', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: selectedTypes.includes(t) ? 'rgba(230,0,18,0.05)' : 'transparent' }}>
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes(t)} 
                  onChange={() => toggleType(t)}
                  style={{ width: '22px', height: '22px', accentColor: 'var(--tacos-red)' }} 
                />
                <span style={{ fontSize: '16px', fontWeight: '900', color: selectedTypes.includes(t) ? 'var(--tacos-red)' : '#64748b' }}>{t}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {demographicRows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {row.map(demo => (
                  <button 
                    key={demo}
                    onClick={() => toggleDemographic(demo)}
                    style={{ 
                      padding: '16px 8px', 
                      borderRadius: '16px', 
                      border: '2px solid',
                      borderColor: selectedDemographics.includes(demo) ? 'var(--tacos-red)' : '#f1f5f9',
                      backgroundColor: selectedDemographics.includes(demo) ? 'white' : '#f8fafc',
                      color: selectedDemographics.includes(demo) ? 'var(--tacos-red)' : '#64748b',
                      fontSize: '15px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {demo}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '16px', fontWeight: '800' }}>キャンセル</button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 2, padding: '14px', borderRadius: '16px', fontWeight: '900', boxShadow: '0 10px 25px rgba(230, 0, 18, 0.2)' }}>設定を保存</button>
        </div>
      </div>
    </div>
  );
};

export default IndexModal;
