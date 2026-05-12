import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const CalendarModal = ({ isOpen, onClose, onSave, initialPeriods }) => {
  const [periods, setPeriods] = useState([{ start: '', end: '' }]);
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const [activeSelect, setActiveSelect] = useState('start');

  useEffect(() => {
    if (initialPeriods && initialPeriods.length > 0) {
      setPeriods(initialPeriods);
      setActivePeriodIndex(0);
      const firstStart = initialPeriods[0]?.start;
      if (firstStart) {
        const d = new Date(firstStart);
        if (!isNaN(d.getTime())) {
          setCurrentYear(d.getFullYear());
          setCurrentMonth(d.getMonth() + 1);
        }
      }
    } else {
      setPeriods([{ start: '', end: '' }]);
      setActivePeriodIndex(0);
    }
  }, [initialPeriods, isOpen]);

  if (!isOpen) return null;

  const currentPeriod = periods[activePeriodIndex] || { start: '', end: '' };

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m - 1, 1).getDay();

  const days = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1 === 0 ? 12 : currentMonth - 1);

  const daysArray = [];

  let prevM = currentMonth - 1;
  let prevY = currentYear;
  if (prevM === 0) { prevM = 12; prevY -= 1; }
  for (let i = firstDay - 1; i >= 0; i--) {
    daysArray.push({ year: prevY, month: prevM, day: prevMonthDays - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= days; i++) {
    daysArray.push({ year: currentYear, month: currentMonth, day: i, isCurrentMonth: true });
  }

  let nextM = currentMonth + 1;
  let nextY = currentYear;
  if (nextM === 13) { nextM = 1; nextY += 1; }
  const totalSlots = daysArray.length > 35 ? 42 : 35;
  let nextD = 1;
  while (daysArray.length < totalSlots) {
    daysArray.push({ year: nextY, month: nextM, day: nextD++, isCurrentMonth: false });
  }

  const handleDayClick = (dayItem) => {
    if (!dayItem.isCurrentMonth) {
      setCurrentYear(dayItem.year);
      setCurrentMonth(dayItem.month);
    }
    const ymd = `${dayItem.year}-${String(dayItem.month).padStart(2, '0')}-${String(dayItem.day).padStart(2, '0')}`;
    
    setPeriods(prev => {
      const next = [...prev];
      const current = next[activePeriodIndex] || { start: '', end: '' };

      if (activeSelect === 'start') {
        next[activePeriodIndex] = { ...current, start: ymd };
        setActiveSelect('end');
      } else {
        if (current.start && new Date(ymd) < new Date(current.start)) {
          next[activePeriodIndex] = { start: ymd, end: '' };
          setActiveSelect('end');
        } else {
          next[activePeriodIndex] = { ...current, end: ymd };
        }
      }
      return next;
    });
  };

  const addPeriod = () => {
    const next = [...periods, { start: '', end: '' }];
    setPeriods(next);
    setActivePeriodIndex(next.length - 1);
    setActiveSelect('start');
  };

  const removePeriod = (idx) => {
    if (periods.length <= 1) {
      setPeriods([{ start: '', end: '' }]);
      setActivePeriodIndex(0);
      setActiveSelect('start');
      return;
    }
    const next = periods.filter((_, i) => i !== idx);
    setPeriods(next);
    setActivePeriodIndex(0);
    setActiveSelect('start');
  };

  const changeMonth = (offset) => {
    let nextM = currentMonth + offset;
    let nextY = currentYear;
    if (nextM === 0) {
      nextM = 12;
      nextY -= 1;
    } else if (nextM === 13) {
      nextM = 1;
      nextY += 1;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
       <div className="animate-pop" style={{ backgroundColor: 'white', width: '90%', maxWidth: '780px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>放送期間を選択</h3>
               <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                 複数の期間を追加して一括で設定・保存が可能です。
               </p>
             </div>
             <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>×</button>
          </div>

          <div style={{ display: 'flex', gap: '24px', padding: '32px', maxHeight: '500px', overflowY: 'auto' }}>
            
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase' }}>設定期間リスト</span>
                  <button 
                    onClick={addPeriod}
                    style={{ border: 'none', background: 'rgba(230,0,18,0.1)', color: 'var(--tacos-red)', fontSize: '0.75rem', fontWeight: '900', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                     + 期間を追加
                  </button>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {periods.map((p, idx) => {
                     const isActive = idx === activePeriodIndex;
                     return (
                        <div 
                           key={idx}
                           onClick={() => { setActivePeriodIndex(idx); setActiveSelect('start'); }}
                           style={{ 
                              backgroundColor: isActive ? 'rgba(230,0,18,0.05)' : '#f8fafc', 
                              padding: '12px 16px', borderRadius: '16px', border: isActive ? '2px solid var(--tacos-red)' : '2px solid transparent',
                              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                           }}
                        >
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '900', color: isActive ? 'var(--tacos-red)' : '#64748b' }}>
                                 期間 {idx + 1}
                              </span>
                              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                                 {p.start && p.end ? `${p.start} 〜 ${p.end}` : p.start ? `${p.start} 〜 未設定` : '未設定'}
                              </span>
                           </div>
                           {periods.length > 1 && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); removePeriod(idx); }}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '800', fontSize: '1.2rem' }}
                              >
                                 ×
                              </button>
                           )}
                        </div>
                     );
                  })}
               </div>

               <div style={{ marginTop: 'auto', backgroundColor: '#fcfdfe', padding: '14px', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '8px' }}>現在の選択日</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <div 
                       onClick={() => setActiveSelect('start')}
                       style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: activeSelect === 'start' ? '#fff' : '#f1f5f9', border: activeSelect === 'start' ? '1.5px solid var(--tacos-red)' : '1.5px solid transparent', cursor: 'pointer' }}
                     >
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>開始日:</span> <strong style={{ fontSize: '0.85rem' }}>{currentPeriod.start || '---'}</strong>
                     </div>
                     <div 
                       onClick={() => setActiveSelect('end')}
                       style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: activeSelect === 'end' ? '#fff' : '#f1f5f9', border: activeSelect === 'end' ? '1.5px solid var(--tacos-red)' : '1.5px solid transparent', cursor: 'pointer' }}
                     >
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>終了日:</span> <strong style={{ fontSize: '0.85rem' }}>{currentPeriod.end || '---'}</strong>
                     </div>
                  </div>
               </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#fcfdfe', padding: '20px', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', color: '#64748b' }}>{'<'}</button>
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1e293b' }}>
                     {currentYear}年 {currentMonth}月
                  </div>
                  <button onClick={() => changeMonth(1)} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', color: '#64748b' }}>{'>'}</button>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '12px' }}>
                  {['日', '月', '火', '水', '木', '金', '土'].map((w, i) => (
                     <span key={i} style={{ fontSize: '0.8rem', fontWeight: '900', color: i === 0 ? '#fa5252' : i === 6 ? '#228be6' : '#94a3b8' }}>{w}</span>
                  ))}
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {daysArray.map((item, i) => {
                     const ymd = `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                     
                     const isStart = ymd === currentPeriod.start;
                     const isEnd = ymd === currentPeriod.end;
                     const isInRange = currentPeriod.start && currentPeriod.end && new Date(ymd) > new Date(currentPeriod.start) && new Date(ymd) < new Date(currentPeriod.end);

                     let bg = 'transparent';
                     let color = item.isCurrentMonth ? '#1e293b' : '#cbd5e1';
                     let borderRadius = '50%';
                     if (isStart || isEnd) {
                        bg = 'var(--tacos-red)';
                        color = 'white';
                     } else if (isInRange) {
                        bg = 'rgba(230,0,18,0.1)';
                        color = 'var(--tacos-red)';
                        borderRadius = '0';
                     }

                     return (
                        <div
                           key={i}
                           onClick={() => handleDayClick(item)}
                           style={{
                              height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.95rem', fontWeight: '800', cursor: item.isCurrentMonth ? 'pointer' : 'default',
                              backgroundColor: bg, color: color, borderRadius: borderRadius, transition: 'all 0.1s'
                           }}
                        >
                           {item.day}
                        </div>
                     );
                  })}
               </div>
            </div>
          </div>

          <div style={{ padding: '24px 32px', backgroundColor: '#fcfdfe', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9' }}>
             <button className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: '800' }}>キャンセル</button>
             <button className="btn-primary" onClick={() => { onSave(periods); onClose(); }} style={{ flex: 2, padding: '14px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 8px 20px rgba(230, 0, 18, 0.2)' }}>
                期間を確定
             </button>
          </div>
       </div>
    </div>
  );
};

export default CalendarModal;
