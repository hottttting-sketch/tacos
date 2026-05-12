import React, { useState, useEffect } from 'react';

const DeadlineModal = ({ isOpen, onClose, onSave, initialValue = '' }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('12');

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        const clean = initialValue.replace('T', ' ');
        const [d, h] = clean.split(' ');
        if (d) {
          setSelectedDate(d);
          const parts = d.split('-');
          if (parts.length === 3) {
            setCurrentYear(parseInt(parts[0]));
            setCurrentMonth(parseInt(parts[1]));
          }
        }
        if (h) {
          const [hourStr] = h.split(':');
          setSelectedHour(hourStr);
        }
      } else {
        const today = new Date();
        const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setSelectedDate(ymd);
        setSelectedHour('12');
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth() + 1);
      }
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

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

  const changeMonth = (offset) => {
    let nextM = currentMonth + offset;
    let nextY = currentYear;
    if (nextM === 0) { nextM = 12; nextY -= 1; }
    else if (nextM === 13) { nextM = 1; nextY += 1; }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
  };

  const handleSave = () => {
    if (!selectedDate) return;
    const finalVal = `${selectedDate} ${selectedHour}:00`;
    onSave(finalVal);
    onClose();
  };

  const hoursOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
       <div className="animate-pop" style={{ backgroundColor: 'white', width: '90%', maxWidth: '580px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>回答期限の設定</h3>
               <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                 日付はカレンダーから選択し、時間は「分は00」固定となります。
               </p>
             </div>
             <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>×</button>
          </div>

          <div style={{ display: 'flex', gap: '24px', padding: '32px' }}>
            <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ backgroundColor: '#fcfdfe', padding: '16px', borderRadius: '20px', border: '1.5px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '4px' }}>選択中の日時</label>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--tacos-red)' }}>
                     {selectedDate || '未選択'}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1e293b', marginTop: '4px' }}>
                     {selectedHour}:00
                  </div>
               </div>

               <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px' }}>時間を選択</label>
                  <select
                     value={selectedHour}
                     onChange={e => setSelectedHour(e.target.value)}
                     style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', outline: 'none' }}
                  >
                     {hoursOptions.map(h => (
                        <option key={h} value={h}>{h}:00</option>
                     ))}
                  </select>
               </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#fcfdfe', padding: '20px', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', color: '#64748b' }}>{'<'}</button>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
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
                     const isSelected = ymd === selectedDate;

                     let bg = 'transparent';
                     let color = item.isCurrentMonth ? '#1e293b' : '#cbd5e1';
                     let borderRadius = '50%';
                     
                     if (isSelected) {
                        bg = 'var(--tacos-red)';
                        color = 'white';
                     }

                     return (
                        <div
                           key={i}
                           onClick={() => {
                              if (!item.isCurrentMonth) {
                                 setCurrentYear(item.year);
                                 setCurrentMonth(item.month);
                              }
                              setSelectedDate(ymd);
                           }}
                           style={{
                              height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: '800', cursor: item.isCurrentMonth ? 'pointer' : 'default',
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
             <button className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: '800' }}>
                キャンセル
             </button>
             <button className="btn-primary" onClick={handleSave} style={{ flex: 2, padding: '14px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 8px 20px rgba(230, 0, 18, 0.2)' }}>
                設定を保存
             </button>
          </div>
       </div>
    </div>
  );
};

export default DeadlineModal;
