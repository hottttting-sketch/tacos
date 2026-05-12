import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const TimetableModal = ({ isOpen, onClose, onSave, selectedPatterns = [], initialZones = {} }) => {
  const [activeTab, setActiveTab] = useState('全日');
  const [selected, setSelected] = useState({}); // { patternName: { 'day-hour': true } }
  const days = ['月', '火', '水', '木', '金', '土', '日'];
  const hours = Array.from({ length: 24 }, (_, i) => (i + 5)); // 5 to 28
  const allPatterns = ['全日', 'ヨの字', 'コの字', '逆L', '一の字', 'その他'];

  useEffect(() => { 
    if (isOpen) {
      setSelected(initialZones || {});
      setActiveTab(selectedPatterns[0] || '全日');
    }
  }, [isOpen, initialZones, selectedPatterns]);

  if (!isOpen) return null;

  const toggle = (d, h) => {
    if (!activeTab) return;
    const k = `${d}-${h}`;
    
    setSelected(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [k]: !((prev[activeTab] || {})[k])
      }
    }));
  };

  const applyPattern = (patternType, targetTab) => {
    const target = targetTab || activeTab;
    if (!target) return;
    const newZones = {};

    const weekdays = ['月', '火', '水', '木', '金'];
    const weekends = ['土', '日'];

    const setRange = (d, start, end) => {
      for (let h = start; h < end; h++) {
        newZones[`${d}-${h}`] = true;
      }
    };

    if (patternType === 'ATT') {
      days.forEach(d => setRange(d, 5, 28));
    } else if (patternType === '全日') {
      days.forEach(d => setRange(d, 6, 25));
    } else if (patternType === 'ヨの字') {
      weekdays.forEach(d => {
        setRange(d, 6, 8);
        setRange(d, 12, 13);
        setRange(d, 18, 25);
      });
      weekends.forEach(d => setRange(d, 6, 25));
    } else if (patternType === 'コの字') {
      weekdays.forEach(d => {
        setRange(d, 6, 8);
        setRange(d, 18, 25);
      });
      weekends.forEach(d => setRange(d, 6, 25));
    } else if (patternType === '逆L') {
      weekdays.forEach(d => setRange(d, 18, 25));
      weekends.forEach(d => setRange(d, 6, 25));
    } else if (patternType === '一の字') {
      days.forEach(d => setRange(d, 18, 26));
    }

    setSelected(prev => ({
      ...prev,
      [target]: newZones
    }));
  };

  const currentZones = selected[activeTab] || {};

  const tabStyle = (pattern) => ({
    padding: '12px 24px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: activeTab === pattern ? 'white' : '#f1f5f9',
    color: activeTab === pattern ? 'var(--tacos-red)' : '#64748b',
    fontWeight: '900',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    borderBottom: activeTab === pattern ? 'none' : '1px solid #e2e8f0',
    marginBottom: '-1px',
    transition: 'all 0.2s',
    minWidth: '120px',
    textAlign: 'center'
  });

  const btnApplyStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    background: 'white',
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '32px', width: '95vw', maxWidth: '1200px', height: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} className="animate-pop">
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b' }}>ゾーン登録 (タイムテーブル)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>取り方ごとに曜日・時間帯を設定してください。</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '20px', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '20px 32px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', overflowX: 'auto', backgroundColor: '#fcfdfe' }}>
          {selectedPatterns.map(p => {
            const isStandard = ['ATT', '全日', 'ヨの字', 'コの字', '逆L', '一の字'].includes(p);
            const hasZones = selected[p] && Object.values(selected[p]).some(v => v);
            return (
              <div 
                key={p} 
                style={{
                  ...tabStyle(p),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: activeTab === p ? '0 -4px 10px rgba(0,0,0,0.03)' : 'none',
                  borderBottom: activeTab === p ? '1px solid white' : '1px solid #e2e8f0',
                  color: activeTab === p ? 'var(--tacos-red)' : hasZones ? '#1e293b' : '#64748b'
                }} 
                onClick={() => setActiveTab(p)}
              >
                <span style={{ fontWeight: hasZones ? '900' : '700' }}>{p} {hasZones && <span style={{ color: 'var(--tacos-red)' }}>●</span>}</span>
                {isStandard && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab(p); applyPattern(p, p); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeTab === p ? 'var(--tacos-red)' : '#cbd5e1',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      boxShadow: activeTab === p ? '0 4px 8px rgba(230, 0, 18, 0.2)' : 'none'
                    }}
                  >
                    <Icons.Zap size={12} />
                    適用
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        <div style={{ padding: '12px 32px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #eef2f6' }}>
          <button style={{ ...btnApplyStyle, border: 'none', color: '#94a3b8', background: 'transparent' }} onClick={() => { const next = {...selected}; next[activeTab] = {}; setSelected(next); }}>設定をクリア</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '4px', background: 'white' }}>
            <div style={{ padding: '12px', background: 'transparent' }}></div>
            {days.map(d => (
              <div key={d} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', fontWeight: '900', fontSize: '0.9rem', color: d === '土' ? '#228be6' : d === '日' ? '#fa5252' : '#495057' }}>
                {d}
              </div>
            ))}
            {hours.map(h => {
              const displayHour = h >= 24 ? h - 24 : h;
              const displayTime = `${h}:00`;
              return (
                <React.Fragment key={h}>
                  <div style={{ padding: '10px', background: 'transparent', textAlign: 'right', fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {displayTime}
                  </div>
                  {days.map(d => (
                    <div 
                      key={`${d}-${h}`} 
                      onClick={() => toggle(d, h)} 
                      style={{ 
                        height: '32px', 
                        background: currentZones[`${d}-${h}`] ? 'var(--tacos-red)' : '#f8fafc', 
                        cursor: 'pointer', 
                        borderRadius: '6px',
                        transition: 'all 0.1s ease',
                        border: '1px solid',
                        borderColor: currentZones[`${d}-${h}`] ? 'var(--tacos-red)' : '#eef2f6',
                        boxShadow: currentZones[`${d}-${h}`] ? '0 4px 10px rgba(230, 0, 18, 0.15)' : 'none'
                      }} 
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfdfe' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '800' }}>
            設定済み: <span style={{ color: 'var(--tacos-red)', fontSize: '1.1rem' }}>{Object.keys(currentZones).length}</span> コマ (現在のタグ: {activeTab})
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '12px 32px', borderRadius: '14px', fontWeight: '800' }}>キャンセル</button>
            <button onClick={() => { onSave(selected); onClose(); }} className="btn-primary" style={{ padding: '12px 64px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 8px 20px rgba(230, 0, 18, 0.2)' }}>ゾーンを決定</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableModal;
