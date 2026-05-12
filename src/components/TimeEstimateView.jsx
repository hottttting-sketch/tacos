import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import CalendarModal from './CalendarModal';
import AreaModal from './AreaModal';
import StationModal from './StationModal';
import ContactModal from './ContactModal';
import DuplicateModal from './DuplicateModal';
import { api } from '../utils/api';

const TimeEstimateView = ({ onBack }) => {
  const [formData, setFormData] = useState({
    sponsor: '',
    ba: '',
    budget: '',
    deadline: '',
    area: [],
    periods: [{ start: '', end: '' }],
    tg: '',
    scale: '',
    planningDetails: '',
    hearingItems: [],
    selectedStations: [],
    contacts: {}
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [activePeriodIndex, setActivePeriodIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (status = 'draft', extraContacts = {}) => {
    if (!formData.sponsor) {
      alert('スポンサー名は必須です');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createProject({
        name: `${formData.sponsor} タイムプラン`,
        sponsor_name: formData.sponsor,
        start_date: formData.periods[0].start || null,
        end_date: formData.periods[0].end || null,
        status,
        selectedStations: formData.selectedStations,
        metadata: {
          type: 'time',
          ba: formData.ba,
          budget: formData.budget,
          deadline: formData.deadline,
          area: formData.area,
          tg: formData.tg,
          scale: formData.scale,
          planningDetails: formData.planningDetails,
          hearingItems: formData.hearingItems,
          contacts: Object.keys(extraContacts).length ? extraContacts : formData.contacts
        }
      });
      alert(status === 'draft' ? 'タイム見積依頼を一時保存しました。' : 'タイム見積依頼を放送局へ送信しました。');
      if (onBack) onBack();
    } catch (e) {
      console.error('Error creating project:', e);
      alert('保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hearingItemsList = [
    '番組名', '放送曜日/日時', 'レギュラー/単発', 'ネット数',
    '秒数', '提供/PT', '提供チェンジ', 'カラーロゴ可否',
    '金額（単発/月額）', 'マージン内訳', 'セールスシート', '競合排除業種',
    '備考', 'その他'
  ];

  const toggleHearingItem = (item) => {
    const next = formData.hearingItems.includes(item)
      ? formData.hearingItems.filter(i => i !== item)
      : [...formData.hearingItems, item];
    setFormData({ ...formData, hearingItems: next });
  };

  const openCalendar = (index) => {
    setActivePeriodIndex(index);
    setIsCalendarOpen(true);
  };

  const savePeriod = (start, end) => {
    const nextPeriods = [...formData.periods];
    nextPeriods[activePeriodIndex] = { start, end };
    setFormData({ ...formData, periods: nextPeriods });
    setIsCalendarOpen(false);
  };

  const handleDuplicate = (pastData) => {
    setFormData(prev => ({
      ...prev,
      ...pastData,
      sponsor: pastData.sponsor || prev.sponsor,
    }));
    setIsDuplicateModalOpen(false);
    alert('過去のタイム見積依頼を反映しました');
  };

  const labelStyle = { fontSize: '13px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' };
  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '600', outline: 'none' };

  return (
    <div className="animate-fade" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
            <IconWrapper color="#f1f3f5" iconColor="#495057" size={36} borderRadius={18}>
              <Icons.ArrowLeft />
            </IconWrapper>
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>タイム見積依頼の作成</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>番組提供（タイム）の見積依頼、詳細条件を入力します。</p>
          </div>
        </div>
        <button
          className="btn-secondary"
          style={{ padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800' }}
          onClick={() => setIsDuplicateModalOpen(true)}
        >
          <Icons.Folder size={18} /> 過去の依頼から複製
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section className="glass-card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid #f1f5f9', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--tacos-red)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.FileText size={18} /> 基本事項
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {/* 1行目 */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={labelStyle}>スポンサー</span>
                  <input type="text" placeholder="例: 株式会社タコス商事" style={inputStyle} value={formData.sponsor} onChange={e => setFormData({...formData, sponsor: e.target.value})} />
                </div>
                <div>
                  <span style={labelStyle}>BA</span>
                  <input type="text" placeholder="担当エージェンシー" style={inputStyle} value={formData.ba} onChange={e => setFormData({...formData, ba: e.target.value})} />
                </div>
             </div>

             {/* 2行目 */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={labelStyle}>エリア</span>
                  <div onClick={() => setIsAreaModalOpen(true)} style={{ ...inputStyle, cursor: 'pointer', backgroundColor: '#f8fafc', color: formData.area.length ? '#1e293b' : '#94a3b8' }}>
                    {formData.area.length ? formData.area.join('、') : '都道府県を選択...'}
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>期間</span>
                  <div onClick={() => openCalendar(0)} style={{ ...inputStyle, cursor: 'pointer', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', color: formData.periods[0].start ? '#1e293b' : '#94a3b8' }}>
                    {formData.periods[0].start ? `${formData.periods[0].start} 〜 ${formData.periods[0].end}` : '期間を選択...'}
                    <Icons.Calendar size={16} />
                  </div>
                </div>
             </div>

             {/* 3行目 */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={labelStyle}>ターゲット</span>
                  <input type="text" placeholder="例: F1〜F2目安" style={inputStyle} value={formData.tg} onChange={e => setFormData({...formData, tg: e.target.value})} />
                </div>
                <div>
                  <span style={labelStyle}>予算 (グロス)</span>
                  <input type="text" placeholder="予算感" style={inputStyle} value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                </div>
                <div>
                  <span style={labelStyle}>回答〆切</span>
                  <input type="date" style={inputStyle} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
             </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid #f1f5f9', backgroundColor: '#fffcfc' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Check size={18} /> ヒアリング項目
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {hearingItemsList.map(item => (
              <label key={item} style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '12px', border: '1.5px solid',
                backgroundColor: formData.hearingItems.includes(item) ? 'white' : 'transparent',
                borderColor: formData.hearingItems.includes(item) ? 'var(--tacos-red)' : '#e2e8f0',
                color: formData.hearingItems.includes(item) ? 'var(--tacos-red)' : '#64748b',
                transition: 'all 0.2s'
              }}>
                <input type="checkbox" checked={formData.hearingItems.includes(item)} onChange={() => toggleHearingItem(item)} style={{ width: '18px', height: '18px', accentColor: 'var(--tacos-red)' }} />
                <span style={{ fontSize: '13px', fontWeight: '800' }}>{item}</span>
              </label>
            ))}
          </div>
        </section>

        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              className="btn-secondary"
              onClick={() => handleSave('draft')}
              disabled={isSubmitting}
              style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '800', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? '保存中...' : '一時保存'}
            </button>
            <button onClick={() => setIsStationModalOpen(true)} className="btn-secondary" style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              依頼局を設定 <span style={{ backgroundColor: 'var(--tacos-red)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>{formData.selectedStations.length}</span>
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="btn-primary"
              disabled={isSubmitting}
              style={{ padding: '14px 48px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 10px 25px rgba(230, 0, 18, 0.2)', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? '送信中...' : '局担を設定して送信'}
            </button>
          </div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>キャンセル</button>
        </div>
      </div>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onSave={savePeriod} initialStart={formData.periods[0].start} initialEnd={formData.periods[0].end} />
      <AreaModal isOpen={isAreaModalOpen} onClose={() => setIsAreaModalOpen(false)} initialAreas={formData.area} onSave={(areas) => setFormData({...formData, area: areas})} />
      <StationModal isOpen={isStationModalOpen} onClose={() => setIsStationModalOpen(false)} selectedAreas={formData.area} initialStations={formData.selectedStations} onSave={(stations) => setFormData({...formData, selectedStations: stations})} />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSend={(contacts) => {
          setFormData({ ...formData, contacts });
          handleSave('requesting', contacts);
        }}
      />
      <DuplicateModal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} onSelect={handleDuplicate} />
    </div>
  );
};

export default TimeEstimateView;
