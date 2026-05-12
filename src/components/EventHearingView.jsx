import React, { useState } from 'react';
import AreaModal from './AreaModal';
import StationModal from './StationModal';
import ContactModal from './ContactModal';
import MonthModal from './MonthModal';
import DuplicateModal from './DuplicateModal';
import IconWrapper from './IconWrapper';
import { Icons } from './IconLibrary';
import { api } from '../utils/api';

const EventHearingView = ({ onBack }) => {
  const [formData, setFormData] = useState({
    sponsor: '',
    ba: '',
    budget: '',
    area: [],
    period: { start: '', end: '' },
    target: '',
    estimateDeadline: '',
    selectedStations: [],
    contacts: {},
    hearingItems: [],
  });

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const openMonthModal = () => {
    setIsMonthModalOpen(true);
  };

  const saveMonth = (range) => {
    setFormData({ ...formData, period: range });
    setIsMonthModalOpen(false);
  };

  const toggleHearingItem = (item) => {
    const next = (formData.hearingItems || []).includes(item)
      ? (formData.hearingItems || []).filter(i => i !== item)
      : [...(formData.hearingItems || []), item];
    setFormData({ ...formData, hearingItems: next });
  };

  const hearingItemsList = [
    { row: 1, items: ['イベント名', '開催日', '開催時間', '開催場所'] },
    { row: 2, items: ['イベント種別', '想定来場者数', '来場者属性', '競合排除業種'] },
    { row: 3, items: ['ブース料金', 'ブースサイズ', 'ブース内飲食', 'ブース内契約行為'] },
    { row: 4, items: ['車両展示料金', '車両オプション', 'サンプリングのみ料金', 'サービス'] },
    { row: 5, items: ['マージン', 'キャンセルポリシー', '企画書', '過去資料'] },
    { row: 6, items: ['郵送搬入可否', 'スタンプラリー', 'その他特筆事項'] }
  ];

  const [customItems, setCustomItems] = useState([]);

  const addCustomItem = () => {
    const newId = `custom-${Date.now()}`;
    setCustomItems([...customItems, { id: newId, label: '', checked: true }]);
  };

  const updateCustomLabel = (id, newLabel) => {
    setCustomItems(customItems.map(item => item.id === id ? { ...item, label: newLabel } : item));
  };

  const toggleCustomChecked = (id) => {
    setCustomItems(customItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleDuplicate = (pastData) => {
    setFormData(prev => ({
      ...prev,
      ...pastData,
      sponsor: pastData.sponsor || prev.sponsor,
      ba: pastData.ba || prev.ba,
    }));
    setIsDuplicateModalOpen(false);
    alert('過去のイベントヒアリング票を反映しました');
  };

  const handleSave = async (status, newStations = formData.selectedStations, newContacts = formData.contacts) => {
    if (!formData.sponsor) {
      alert('スポンサー名は必須です');
      return;
    }
    try {
      const metadata = {
        type: 'event',
        ba: formData.ba,
        area: formData.area,
        budget: formData.budget,
        target: formData.target,
        hearingItems: formData.hearingItems,
        customItems: customItems,
        estimateDeadline: formData.estimateDeadline,
        contacts: newContacts
      };

      await api.createProject({
        name: `${formData.sponsor} イベント協賛`,
        sponsor_name: formData.sponsor,
        start_date: formData.period?.start || null,
        end_date: formData.period?.end || null,
        status,
        selectedStations: newStations,
        metadata
      });

      alert(status === 'draft' ? '一時保存しました' : 'イベントヒアリング票を送信しました');
      if (onBack) onBack();
    } catch (err) {
      console.error('Failed to save event hearing:', err);
      alert('保存に失敗しました: ' + err.message);
    }
  };

  const labelStyle = {
    fontWeight: '900', fontSize: '13px', color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '8px', display: 'block'
  };
  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', fontWeight: '700', backgroundColor: 'white', outline: 'none', transition: 'all 0.2s'
  };

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
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 }}>イベントヒアリング票の作成</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>イベント協賛の相談・詳細共有のための情報を入力します。</p>
          </div>
        </div>
        <button
          className="btn-secondary"
          style={{ padding: '12px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800' }}
          onClick={() => setIsDuplicateModalOpen(true)}
        >
          <Icons.Folder size={20} /> 過去の依頼から複製
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section className="glass-card" style={{ padding: '28px', borderRadius: '28px', border: '1.5px solid #f1f5f9', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--tacos-red)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icons.FileText size={20} /> 基本事項
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1行目 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>スポンサー</label>
                <input type="text" placeholder="例: 株式会社タコス商事" value={formData.sponsor} onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>BA</label>
                <input type="text" placeholder="例: TACOSエージェンシー" value={formData.ba} onChange={(e) => setFormData({ ...formData, ba: e.target.value })} style={inputStyle} />
              </div>
            </div>

            {/* 2行目 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>エリア</label>
                <div onClick={() => setIsAreaModalOpen(true)} style={{ ...inputStyle, cursor: 'pointer', backgroundColor: '#f8fafc', color: formData.area.length ? '#1e293b' : '#94a3b8' }}>
                  {formData.area.length === 0 ? 'エリアを選択...' : formData.area.join('、')}
                </div>
              </div>
              <div>
                <label style={labelStyle}>ヒアリング期間</label>
                <div onClick={() => openMonthModal()} style={{ ...inputStyle, cursor: 'pointer', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', color: formData.period.start ? '#1e293b' : '#94a3b8' }}>
                  {formData.period.start ? `${formData.period.start} 〜 ${formData.period.end}` : '月を選択...'}
                  <Icons.Calendar size={18} />
                </div>
              </div>
            </div>

            {/* 3行目 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>ターゲット</label>
                <input type="text" placeholder="目安属性" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>予算</label>
                <input type="text" placeholder="予算感" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>回答〆切</label>
                <input type="date" value={formData.estimateDeadline} onChange={(e) => setFormData({ ...formData, estimateDeadline: e.target.value })} style={inputStyle} />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: '28px', borderRadius: '28px', border: '1.5px solid #f1f5f9', backgroundColor: '#fffcfc' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icons.Check size={20} /> ヒアリング事項
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hearingItemsList.map(rowGroup => (
              <div key={rowGroup.row} style={{
                display: 'grid',
                gridTemplateColumns: `repeat(4, 1fr)`,
                gap: '14px'
              }}>
                {rowGroup.items.map(item => (
                  <label key={item} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '14px', borderRadius: '16px', border: '2px solid',
                    backgroundColor: (formData.hearingItems || []).includes(item) ? 'white' : 'transparent',
                    borderColor: (formData.hearingItems || []).includes(item) ? 'var(--tacos-red)' : '#e2e8f0',
                    color: (formData.hearingItems || []).includes(item) ? 'var(--tacos-red)' : '#475569',
                    transition: 'all 0.2s'
                  }}>
                    <input type="checkbox" checked={(formData.hearingItems || []).includes(item)} onChange={() => toggleHearingItem(item)} style={{ width: '20px', height: '22px', accentColor: 'var(--tacos-red)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>{item}</span>
                  </label>
                ))}
                {rowGroup.row === 6 && (
                  <button onClick={addCustomItem} style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', background: 'white', color: '#64748b', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    <Icons.Plus size={16} /> 項目追加
                  </button>
                )}
              </div>
            ))}

            {/* Row 7+ (Custom Items) */}
            {customItems.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1.5px solid #f1f5f9'
              }}>
                {customItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '16px', border: '2px solid',
                    backgroundColor: item.checked ? 'white' : 'transparent',
                    borderColor: item.checked ? 'var(--tacos-red)' : '#e2e8f0',
                    transition: 'all 0.2s'
                  }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCustomChecked(item.id)} style={{ width: '20px', height: '22px', accentColor: 'var(--tacos-red)', cursor: 'pointer' }} />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateCustomLabel(item.id, e.target.value)}
                      placeholder="新規項目名..."
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '800', fontSize: '13px', width: '100%', color: item.checked ? 'var(--tacos-red)' : '#475569' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={async () => {
                await handleSave('draft');
              }}
              className="btn-secondary"
              style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}
            >
              一時保存
            </button>
            <button onClick={() => setIsStationModalOpen(true)} className="btn-secondary" style={{ padding: '14px 28px', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              依頼局を設定 <span style={{ backgroundColor: 'var(--tacos-red)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>{formData.selectedStations.length}</span>
            </button>
            <button onClick={() => setIsContactModalOpen(true)} className="btn-primary" style={{ padding: '14px 48px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 10px 25px rgba(230, 0, 18, 0.2)' }}>
              局担を設定して送信
            </button>
          </div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>キャンセル</button>
        </div>
      </div>

      <AreaModal isOpen={isAreaModalOpen} onClose={() => setIsAreaModalOpen(false)} initialAreas={formData.area} onSave={(newAreas) => setFormData({ ...formData, area: newAreas })} />
      <MonthModal isOpen={isMonthModalOpen} onClose={() => setIsMonthModalOpen(false)} onSave={saveMonth} initialRange={formData.period} title="ヒアリング期間の選択" />
      <StationModal isOpen={isStationModalOpen} onClose={() => setIsStationModalOpen(false)} selectedAreas={formData.area} initialStations={formData.selectedStations} onSave={(newStations) => setFormData({ ...formData, selectedStations: newStations })} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onSend={async (newContacts) => {
        setFormData(prev => ({ ...prev, contacts: newContacts }));
        await handleSave('requesting', formData.selectedStations, newContacts);
      }} />
      <DuplicateModal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} onSelect={handleDuplicate} />
    </div>
  );
};

export default EventHearingView;
