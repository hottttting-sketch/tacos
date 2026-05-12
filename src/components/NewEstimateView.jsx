import React, { useState, useRef, useEffect } from 'react';
import TimetableModal from './TimetableModal';
import CalendarModal from './CalendarModal';
import IndexModal from './IndexModal';
import AreaModal from './AreaModal';
import ServiceModal from './ServiceModal';
import NGModal from './NGModal';
import StationModal from './StationModal';
import ContactModal from './ContactModal';
import DuplicateModal from './DuplicateModal';
import DeadlineModal from './DeadlineModal';
import IconWrapper from './IconWrapper';
import { Icons } from './IconLibrary';
import { api } from '../utils/api';

const NewEstimateView = ({ onBack, project, currentUser, userNetwork }) => {
  const [formData, setFormData] = useState({
    sponsor: '',
    productName: '',
    area: [],
    periods: [{ start: '', end: '' }],
    selectedTypes: [],
    scale: '',
    tg: '',
    seconds: '',
    ag: '',
    ngSelections: [],
    ngOtherText: '',
    checkPersonalAllCost: false,
    checkRefPrice: false,
    checkUpperLimit: false,
    checkHouseholdCost: false,
    checkUnitPrice: false,
    checkAUnitPrice: false,
    checkBias: false,
    checkAG: false,
    checkStraightPub: false,
    checkInterviewPub: false,
    checkTalkPub: false,
    checkPrePub: false,
    checkProgramIntegration: false,
    checkPlanning: false,
    checkProposal: false,
    customHearingItems: [],
    planningDetails: '',
    service: '',
    serviceShares: [],
    estimateDeadline: '',
    selectedStations: [],
    contacts: {},
  });

  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isNGModalOpen, setIsNGModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showUnitPrices, setShowUnitPrices] = useState(false);
  const [showStations, setShowStations] = useState(false);
  const [activePeriodIndex, setActivePeriodIndex] = useState(null);
  const [zones, setZones] = useState({});
  const aTimeRef = useRef(null);

  // AG Dependency Logic: If basic AG field has a value, disable and clear specific hearing checkboxes
  useEffect(() => {
    if (formData.ag) {
      setFormData(prev => ({
        ...prev,
        checkAUnitPrice: false,
        checkAG: false
      }));
    }
  }, [formData.ag]);
  const patternsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (aTimeRef.current && !aTimeRef.current.contains(e.target)) setShowUnitPrices(false);
      if (patternsRef.current && !patternsRef.current.contains(e.target)) setShowPatterns(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update form data if project is provided (Liaison Mode)
  useEffect(() => {
    if (project) {
      setFormData(prev => ({
        ...prev,
        sponsor: project.sponsor || '',
        productName: project.product || '',
        area: project.area || [],
        periods: project.periods || [{ start: '', end: '' }],
        scale: project.scale || '',
        tg: project.tg || '',
        seconds: project.seconds || '',
        ag: project.ag || '',
        estimateDeadline: project.deadline || '',
      }));
    }
  }, [project]);

  const patterns = ['全日', 'ヨの字', 'コの字', '逆L', '一の字', 'その他'];
  const aTimeOptions = ['単価ヒアリング', 'AGヒアリング', 'AG指定'];

  const getZoneSummary = (pattern) => {
    const pz = zones[pattern];
    if (!pz || !Object.values(pz).some(v => v)) return '';
    
    const getS = (days) => {
      const hSet = new Set();
      Object.keys(pz).forEach(k => {
        const [d, h] = k.split('-');
        if (pz[k] && days.includes(d)) hSet.add(parseInt(h));
      });
      if (hSet.size === 0) return null;
      const sorted = [...hSet].sort((a, b) => a - b);
      const res = [];
      let start = sorted[0];
      let end = sorted[0] + 1;
      for (let i = 1; i <= sorted.length; i++) {
        if (i < sorted.length && sorted[i] === end) {
          end++;
        } else {
          res.push(`${start}:00-${end}:00`);
          if (i < sorted.length) {
            start = sorted[i];
            end = sorted[i] + 1;
          }
        }
      }
      return res.join('、');
    };

    const w = getS(['月', '火', '水', '木', '金']);
    const e = getS(['土', '日']);

    if (w === e) return w ? ` (${w})` : '';
    let s = '';
    if (w) s += `平日${w}`;
    if (e) s += `${s ? ' / ' : ''}休日${e}`;
    return s ? ` (${s})` : '';
  };

  const addPeriod = () => {
    setFormData({ ...formData, periods: [...formData.periods, { start: '', end: '' }] });
  };
// ... (omitting unchanged addPeriod/removePeriod/etc for brevity in thought, but I will put the full block in replacement)

  const removePeriod = (index) => {
    const nextPeriods = formData.periods.filter((_, i) => i !== index);
    setFormData({ ...formData, periods: nextPeriods.length === 0 ? [{ start: '', end: '' }] : nextPeriods });
  };

  const openCalendar = () => {
    setIsCalendarOpen(true);
  };

  const savePeriods = (allPeriods) => {
    setFormData({ ...formData, periods: allPeriods });
    setIsCalendarOpen(false);
  };

  const toggleType = (type) => {
    const nextTypes = formData.selectedTypes.includes(type)
      ? formData.selectedTypes.filter(t => t !== type)
      : [...formData.selectedTypes, type];
    setFormData({ ...formData, selectedTypes: nextTypes });
  };

  const toggleATimeItem = (item) => {
    const next = formData.selectedATimeItems.includes(item)
      ? formData.selectedATimeItems.filter(i => i !== item)
      : [...formData.selectedATimeItems, item];
    setFormData({ ...formData, selectedATimeItems: next });
  };

  const toggleStation = (station) => {
    const next = formData.selectedStations.includes(station)
      ? formData.selectedStations.filter(s => s !== station)
      : [...formData.selectedStations, station];
    setFormData({ ...formData, selectedStations: next });
  };

  const stations = ['NTV', 'TBS', 'CX', 'EX', 'TX', 'その他'];

  const [indices, setIndices] = useState([]);

  const handleAddIndex = () => {
    setIndices([...indices, { label: '', value: '' }]);
  };

  const handleRemoveIndex = (index) => {
    setIndices(indices.filter((_, i) => i !== index));
  };

  const handleIndexChange = (index, field, value) => {
    const newIndices = [...indices];
    newIndices[index][field] = value;
    setIndices(newIndices);
  };

  const handleDuplicate = (pastData) => {
    setFormData(prev => ({
      ...prev,
      ...pastData
    }));
    setIsDuplicateModalOpen(false);
    alert('過去の依頼内容を反映しました');
  };

  const handleSave = async (status, newStations = formData.selectedStations, newContacts = formData.contacts) => {
    if (!formData.sponsor || !formData.productName) {
      alert('スポンサーと商品・CP名は必須です');
      return;
    }
    try {
      const metadata = {
        area: formData.area,
        periods: formData.periods,
        selectedTypes: formData.selectedTypes,
        scale: formData.scale,
        tg: formData.tg,
        seconds: formData.seconds,
        ag: formData.ag,
        ngSelections: formData.ngSelections,
        ngSpecificProgram: formData.ngSpecificProgram,
        checkPersonalAllCost: formData.checkPersonalAllCost,
        checkRefPrice: formData.checkRefPrice,
        checkUpperLimit: formData.checkUpperLimit,
        checkHouseholdCost: formData.checkHouseholdCost,
        checkUnitPrice: formData.checkUnitPrice,
        checkAUnitPrice: formData.checkAUnitPrice,
        checkBias: formData.checkBias,
        checkAG: formData.checkAG,
        checkStraightPub: formData.checkStraightPub,
        checkInterviewPub: formData.checkInterviewPub,
        checkTalkPub: formData.checkTalkPub,
        checkPrePub: formData.checkPrePub,
        checkProgramIntegration: formData.checkProgramIntegration,
        checkPlanning: formData.checkPlanning,
        checkProposal: formData.checkProposal,
        customHearingItems: formData.customHearingItems,
        planningDetails: formData.planningDetails,
        serviceShares: formData.serviceShares,
        estimateDeadline: formData.estimateDeadline,
        zones: zones,
        indices: indices,
        contacts: newContacts,
      };

      if (project) {
        await api.updateProject(project.id, {
          name: formData.productName,
          sponsor_name: formData.sponsor,
          status,
          metadata
        });
        alert('変更を保存しました');
      } else {
        await api.createProject({
          name: formData.productName,
          sponsor_name: formData.sponsor,
          start_date: formData.periods[0]?.start || null,
          end_date: formData.periods[0]?.end || null,
          status,
          selectedStations: newStations,
          metadata
        });
        alert(status === 'draft' ? '下書き保存しました' : '見積依頼を保存しました');
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('保存に失敗しました: ' + err.message);
    }
  };

  const addCustomHearingItem = () => {
    const label = prompt('追加する項目名を入力してください');
    if (label) {
      const id = `custom_${Date.now()}`;
      setFormData(prev => ({
        ...prev,
        customHearingItems: [...prev.customHearingItems, { id, label }],
        [id]: true
      }));
    }
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle = {
    fontWeight: '700',
    fontSize: '14px',
    color: '#495057',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e1e4e8',
    fontSize: '14px',
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
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#212529', margin: 0 }}>
            {project ? `見積依頼内容の確認 (${project.id})` : '新規見積依頼の作成'}
          </h2>
        </div>
        <button
          className="btn-secondary"
          style={{
            padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', fontWeight: '800', backgroundColor: 'white', border: '1.5px solid #e1e4e8', cursor: 'pointer'
          }}
          onClick={() => setIsDuplicateModalOpen(true)}
        >
          <IconWrapper color="#edf2ff" iconColor="#448aff" size={28} borderRadius={6}>
            <Icons.Folder />
          </IconWrapper>
          過去の依頼から見積複製
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Upper Section: 基本事項 */}
        <section className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e1e4e8', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tacos-red)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconWrapper color="rgba(230,0,18,0.1)" iconColor="var(--tacos-red)"><Icons.FileText /></IconWrapper>
            基本事項
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
            {/* ... (existing fields) ... */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '14px', color: '#495057' }}>スポンサー</label>
              <input
                type="text"
                disabled={!!project}
                placeholder="例: 株式会社タコス食品"
                value={formData.sponsor}
                onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e1e4e8', fontSize: '14px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '14px', color: '#495057' }}>商品・CP名</label>
              <input
                type="text"
                disabled={!!project}
                placeholder="例: タコス新製品発売キャンペーン"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e1e4e8', fontSize: '14px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>エリア</label>
              <div
                onClick={() => !project && setIsAreaModalOpen(true)}
                style={{ ...inputStyle, cursor: !!project ? 'default' : 'pointer', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', minHeight: '40px', padding: '6px 14px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
              >
                {formData.area.length === 0 ? <span style={{ color: '#adb5bd', fontSize: '13px' }}>都道府県を選択</span> :
                  formData.area.length === 47 ? <span style={{ fontWeight: '800', color: 'var(--tacos-red)' }}>全国</span> :
                    formData.area.length > 5 ? (
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>
                        {formData.area.slice(0, 5).join('、')} <span style={{ color: '#adb5bd', fontWeight: '400' }}>他 {formData.area.length - 5} 箇所</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>{formData.area.join('、')}</span>
                    )
                }
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: '700', fontSize: '14px', color: '#495057' }}>期間</label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.periods.map((period, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => !project && openCalendar()}
                      style={{
                        flex: 1, height: '42px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e1e4e8',
                        backgroundColor: !!project ? '#f8f9fa' : 'white', textAlign: 'left', fontSize: '14px', cursor: !!project ? 'default' : 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ color: period.start ? '#212529' : '#adb5bd' }}>{period.start && period.end ? `${period.start} 〜 ${period.end}` : '日付を選択'}</span>
                      <Icons.Calendar style={{ color: '#888' }} />
                    </button>
                    {formData.periods.length > 1 && !project && (
                      <button onClick={() => removePeriod(idx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                        <Icons.Edit style={{ color: '#ff6b6b' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div ref={patternsRef} className="form-group" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '14px', color: '#495057' }}>取り方</label>
              <div
                onClick={() => !project && setShowPatterns(!showPatterns)}
                style={{
                  width: '100%', minHeight: '44px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e1e4e8',
                  backgroundColor: !!project ? '#f8f9fa' : 'white', cursor: !!project ? 'default' : 'pointer', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px'
                }}
              >
                {formData.selectedTypes.length === 0 ? <span style={{ color: '#adb5bd', fontSize: '14px' }}>選択...</span> :
                  formData.selectedTypes.map(tag => (
                    <span key={tag} style={{ backgroundColor: 'rgba(230,0,18,0.1)', color: 'var(--tacos-red)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {tag}{getZoneSummary(tag)} {!project && <span onClick={(e) => { e.stopPropagation(); toggleType(tag); }} style={{ marginLeft: '4px', opacity: 0.5 }}>×</span>}
                    </span>
                  ))
                }
              </div>
              {showPatterns && !project && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e1e4e8', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, marginTop: '8px', padding: '8px', maxHeight: '200px', overflowY: 'auto' }} className="custom-scrollbar">
                  {patterns.map(p => (
                    <div key={p} onClick={(e) => { e.stopPropagation(); toggleType(p); }} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: formData.selectedTypes.includes(p) ? 'rgba(230,0,18,0.05)' : 'transparent', color: formData.selectedTypes.includes(p) ? 'var(--tacos-red)' : '#495057', fontSize: '13px', cursor: 'pointer' }}>{p}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '14px', color: '#495057' }}>ゾーン登録</label>
              <button
                onClick={() => !project && setIsTimetableOpen(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: Object.values(zones).some(z => z && Object.values(z).some(v => v)) ? '2px solid var(--tacos-red)' : '1px dashed #ced4da',
                  backgroundColor: !!project ? '#f8f9fa' : (Object.values(zones).some(z => z && Object.values(z).some(v => v)) ? 'rgba(230, 0, 18, 0.05)' : '#f8f9fa'),
                  color: Object.values(zones).some(z => z && Object.values(z).some(v => v)) ? 'var(--tacos-red)' : '#888',
                  fontSize: '14px', fontWeight: '700', cursor: !!project ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                <Icons.Radio />
                {Object.values(zones).some(z => z && Object.values(z).some(v => v)) ? `${Object.values(zones).filter(z => z && Object.values(z).some(v => v)).length}個のパターン枠が登録済み` : 'タイムテーブルから選択'}
              </button>
            </div>
            {/* ... stats fields ... */}
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', gridColumn: 'span 2' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#666' }}>規模</label>
                <input
                  type="text" placeholder="例: 1000GRP"
                  disabled={!!project}
                  value={formData.scale} onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e1e4e8', fontSize: '13px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#666' }}>TG</label>
                <input
                  type="text" placeholder="例: F1, M1"
                  disabled={!!project}
                  value={formData.tg} onChange={(e) => setFormData({ ...formData, tg: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e1e4e8', fontSize: '13px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#666' }}>秒数</label>
                <input
                  type="text" placeholder="例: 15s"
                  disabled={!!project}
                  value={formData.seconds} onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e1e4e8', fontSize: '13px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#666' }}>AG</label>
                <input
                  type="text" placeholder="例: AG入力"
                  disabled={!!project}
                  value={formData.ag} onChange={(e) => setFormData({ ...formData, ag: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e1e4e8', fontSize: '13px', backgroundColor: !!project ? '#f8f9fa' : 'white' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#495057' }}>NG項目</label>
              <div
                onClick={() => !project && setIsNGModalOpen(true)}
                style={{
                  width: '100%', minHeight: '44px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e1e4e8',
                  backgroundColor: !!project ? '#f8f9fa' : 'white', cursor: !!project ? 'default' : 'pointer', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center'
                }}
              >
                {formData.ngSelections.length === 0 ? <span style={{ color: '#adb5bd', fontSize: '14px' }}>設定...</span> :
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {formData.ngSelections.map(sel => (
                      <span key={sel} style={{ backgroundColor: '#f1f3f5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', color: '#495057', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {sel}
                      </span>
                    ))}
                  </div>
                }
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#495057' }}>見積〆切</label>
              <div
                onClick={() => setIsDeadlineModalOpen(true)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: project ? '1.5px solid var(--tacos-red)' : '1px solid #e1e4e8',
                  fontSize: '14px', backgroundColor: project ? 'rgba(230,0,18,0.02)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span style={{ color: formData.estimateDeadline ? '#212529' : '#adb5bd', fontWeight: project ? '700' : 'normal' }}>
                  {formData.estimateDeadline ? formData.estimateDeadline.replace('T', ' ') : '日時を選択'}
                </span>
                <Icons.Clock style={{ color: project ? 'var(--tacos-red)' : '#adb5bd' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Lower Section: ヒアリング事項 */}
        <section className="glass-card" style={{ padding: '28px', borderRadius: '28px', border: '1.5px solid #f1f5f9', backgroundColor: '#fffcfc' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icons.Chat size={20} /> ヒアリング事項
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { id: 'checkPersonalAllCost', label: '個人ALLコスト' },
                  { id: 'checkRefPrice', label: '目安一本単価' },
                  { id: 'checkAUnitPrice', label: 'A単価', disabled: !!formData.ag },
                  { id: 'checkAG', label: 'AG', disabled: !!formData.ag },
                  { id: 'checkUpperLimit', label: '上限' },
                  { id: 'checkBias', label: '30秒バイアス' },
                  { id: 'checkHouseholdCost', label: '世帯コスト' },
                  { id: 'checkUnitPrice', label: '単価（60s〜）' },
                  { id: 'checkStraightPub', label: 'ストパブ' },
                  { id: 'checkInterviewPub', label: '取材パブ' },
                  { id: 'checkTalkPub', label: '対談パブ' },
                  { id: 'checkPrePub', label: 'プレパブ' },
                  { id: 'checkProgramIntegration', label: '番組仕込み' },
                  { id: 'checkPlanning', label: '企画' },
                  { id: 'checkProposal', label: '企画書' },
                  ...formData.customHearingItems
                ].map(item => (
                  <label key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: (item.disabled || !!project) ? 'not-allowed' : 'pointer',
                    padding: '12px', borderRadius: '14px', border: '2px solid',
                    backgroundColor: formData[item.id] ? 'white' : 'transparent',
                    borderColor: formData[item.id] ? 'var(--tacos-red)' : '#f1f5f9',
                    color: formData[item.id] ? 'var(--tacos-red)' : (item.disabled || !!project) ? '#cbd5e1' : '#475569',
                    transition: 'all 0.2s', opacity: (item.disabled || !!project) ? 0.6 : 1
                  }}>
                    <input
                      type="checkbox"
                      checked={formData[item.id]}
                      disabled={item.disabled || !!project}
                      onChange={(e) => setFormData({ ...formData, [item.id]: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--tacos-red)' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>{item.label}</span>
                  </label>
                ))}
                
                {/* 項目追加ボタン */}
                {!project && (
                  <button 
                    onClick={addCustomHearingItem}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      padding: '12px', borderRadius: '14px', border: '2px dashed #cbd5e1',
                      backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '800', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--tacos-red)'; e.currentTarget.style.color = 'var(--tacos-red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <Icons.Plus size={16} />
                    <span>項目追加</span>
                  </button>
                )}
            </div>

            {formData.checkPlanning && (
              <div style={{ marginTop: '12px', padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid rgba(230,0,18,0.2)' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '14px', color: 'var(--tacos-red)' }}>企画の内容 (自由記述)</label>
                <textarea
                  placeholder="企画内容の詳細、条件、放送枠の希望などを入力してください..."
                  disabled={!!project}
                  value={formData.planningDetails}
                  onChange={(e) => setFormData({ ...formData, planningDetails: e.target.value })}
                  style={{ width: '100%', minHeight: '100px', padding: '14px', borderRadius: '12px', border: '1px solid #ffc9c9', fontSize: '14px', outline: 'none', resize: 'none' }}
                />
              </div>
            )}

            {/* INDEX設定 */}
            <div style={{ marginTop: '16px', borderTop: '1.5px solid #f1f5f9', paddingTop: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>INDEX設定</label>
              <div
                onClick={() => !project && setIsIndexModalOpen(true)}
                style={{
                  width: '100%', minHeight: '52px', padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #e1e4e8',
                  backgroundColor: !!project ? '#f8fafc' : 'white', cursor: !!project ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {indices.length === 0 ? <span style={{ color: '#adb5bd', fontSize: '14px', fontWeight: '600' }}>未設定 (タップして項目を選択)</span> :
                    indices.map((idx, i) => (
                      <span key={i} style={{ fontSize: '12px', color: '#495057', backgroundColor: '#f1f3f5', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                        {idx.label}{idx.value && <>: <span style={{ color: 'var(--tacos-red)' }}>{idx.value}</span></>}
                      </span>
                    ))
                  }
                </div>
                {!project && <Icons.Edit size={18} style={{ color: '#94a3b8' }} />}
              </div>
            </div>

            {/* Service */}
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>サービス</label>
              <div
                onClick={() => !project && setIsServiceModalOpen(true)}
                style={{
                  width: '100%', minHeight: '52px', padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #e1e4e8',
                  backgroundColor: !!project ? '#f8fafc' : 'white', cursor: !!project ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {formData.serviceShares.length === 0 ? <span style={{ color: '#adb5bd', fontSize: '14px', fontWeight: '600' }}>未設定 (タップして金額シェアを設定)</span> :
                    formData.serviceShares.map((s, i) => (
                      <span key={i} style={{ fontSize: '12px', color: '#495057', backgroundColor: 'rgba(230,0,18,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1.5px solid rgba(230,0,18,0.1)', fontWeight: '800' }}>
                        {s.label}: <span style={{ color: 'var(--tacos-red)' }}>{s.value}%</span>
                      </span>
                    ))
                  }
                </div>
                {!project && <Icons.Edit size={18} style={{ color: '#94a3b8' }} />}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '24px 0', borderTop: '1px solid #f1f3f5' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          {/* Group: 一時保存 */}
          {!project && (
            <button
              style={{
                height: '46px', padding: '0 24px', borderRadius: '12px', border: '1.5px solid #e1e4e8',
                backgroundColor: 'white', color: '#495057', fontSize: '14px', fontWeight: '800',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#dee2e6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e1e4e8'}
              onClick={async () => {
                await handleSave('draft');
                if (onBack) onBack();
              }}
            >
              <IconWrapper color="#f1f3f5" size={28} borderRadius={6}><Icons.Shield /></IconWrapper>
              一時保存
            </button>
          )}

          {/* Group 1: 放送局を設定する */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsStationModalOpen(true)}
              style={{
                height: '52px', padding: project ? '0 48px' : '0 28px', borderRadius: '16px', border: project ? 'none' : '2px solid #e1e4e8',
                backgroundColor: project ? 'var(--tacos-red)' : 'white', color: project ? 'white' : '#495057', fontSize: '15px', fontWeight: '900',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: project ? '0 10px 25px rgba(230, 0, 18, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = project ? '0 15px 30px rgba(230, 0, 18, 0.35)' : '0 5px 15px rgba(0,0,0,0.1)';
                if (!project) e.currentTarget.style.borderColor = 'var(--tacos-red)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = project ? '0 10px 25px rgba(230, 0, 18, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)';
                if (!project) e.currentTarget.style.borderColor = '#e1e4e8';
              }}
            >
              <IconWrapper color={project ? 'rgba(255,255,255,0.2)' : '#ebfbee'} iconColor={project ? 'white' : '#087f5b'} size={32} borderRadius={8}><Icons.Tv /></IconWrapper>
              {project ? '放送局を設定する' : '依頼局を設定する'} {formData.selectedStations.length > 0 && <span style={{ backgroundColor: project ? 'white' : 'var(--tacos-red)', color: project ? 'var(--tacos-red)' : 'white', padding: '2px 10px', borderRadius: '8px', fontSize: '12px', marginLeft: '6px', fontWeight: '900' }}>{formData.selectedStations.length}</span>}
            </button>
          </div>

          {/* Group 2: 局担を設定する */}
          {!project && (
            <button
              style={{
                height: '52px', padding: '0 36px', borderRadius: '16px', border: 'none',
                backgroundColor: 'var(--tacos-red)', color: 'white', fontWeight: '900', fontSize: '15px',
                cursor: 'pointer', boxShadow: '0 10px 25px rgba(230, 0, 18, 0.3)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(230, 0, 18, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(230, 0, 18, 0.3)';
              }}
              onClick={() => setIsContactModalOpen(true)}
            >
              <IconWrapper color="rgba(255,255,255,0.2)" iconColor="white" size={32} borderRadius={8}><Icons.Users /></IconWrapper>
              局担を設定して送信
            </button>
          )}

          {/* Group 3: キャンセル */}
          <button
            onClick={onBack}
            style={{
              height: '46px', padding: '0 24px', borderRadius: '12px', border: '1px solid #e1e4e8',
              backgroundColor: 'white', color: '#495057', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
        </div>

        {/* Selected Stations Display */}
        {formData.selectedStations.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
            {formData.selectedStations.map((s, i) => (
              <span key={i} style={{ backgroundColor: '#f1f3f5', border: '1px solid #e1e4e8', color: '#495057', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {s}
                <span onClick={(e) => { e.stopPropagation(); toggleStation(s); }} style={{ cursor: 'pointer', fontSize: '16px', lineHeight: 1, opacity: 0.5 }}>×</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <TimetableModal
        isOpen={isTimetableOpen}
        onClose={() => setIsTimetableOpen(false)}
        selectedPatterns={formData.selectedTypes}
        initialZones={zones}
        onSave={(newZones) => {
          setZones(newZones);
        }}
      />
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSave={savePeriods}
        initialPeriods={formData.periods}
      />
      <IndexModal
        isOpen={isIndexModalOpen}
        onClose={() => setIsIndexModalOpen(false)}
        initialIndices={indices}
        onSave={(newIndices) => setIndices(newIndices)}
      />
      <AreaModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        initialAreas={formData.area}
        onSave={(newAreas) => setFormData({ ...formData, area: newAreas })}
      />
      <StationModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        selectedAreas={formData.area}
        initialStations={formData.selectedStations}
        isLiaisonMode={!!project}
        userNetwork={userNetwork}
        onSave={async (newStations) => {
          setFormData({ ...formData, selectedStations: newStations });
          await handleSave('requesting', newStations);
          alert('設定局へ送信しました。ステータスが「放送局回答待ち」に更新されました。');
          onBack();
        }}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialContacts={formData.contacts}
        onSend={async (newContacts) => {
          setFormData({ ...formData, contacts: newContacts });
          await handleSave('planning', formData.selectedStations, newContacts);
          alert('設定した内容で局担へ送信しました。ステータスが「局担送付待ち」に更新されました。');
          onBack(); // Return to project list
        }}
      />
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        initialShares={formData.serviceShares}
        onSave={(newShares) => setFormData({ ...formData, serviceShares: newShares })}
      />
      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        initialValue={formData.estimateDeadline}
        onSave={(newDeadline) => setFormData({ ...formData, estimateDeadline: newDeadline })}
      />
      <NGModal
        isOpen={isNGModalOpen}
        onClose={() => setIsNGModalOpen(false)}
        initialSelections={formData.ngSelections}
        initialOtherText={formData.ngOtherText}
        onSave={(selected, otherText) => setFormData({ ...formData, ngSelections: selected, ngOtherText: otherText })}
      />
      <DuplicateModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onSelect={handleDuplicate}
      />
    </div>
  );
};

export default NewEstimateView;
