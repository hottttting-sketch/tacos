import React, { useState, useEffect } from 'react';
import { Plus, Clock, Trash2, AlertCircle, Calendar, Info, MapPin, User, ChevronRight, Briefcase, Layout, Mail, Lock, Unlock, Edit3 } from 'lucide-react';

import { api } from '../utils/api';

const Icons = { Plus, Clock, Trash2, AlertCircle, Calendar, Info, MapPin, User, ChevronRight, Briefcase, Layout, Mail, Lock, Unlock, Edit3 };

const UrlSlotIssuanceDemo = ({ projectId = '8d0727d8-33d4-4147-ac05-65b12f3e930c', stationName = '札幌テレビ' }) => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [slots, setSlots] = useState([
    { 
      id: 1, 
      programName: '', 
      pubType: '',
      oaDate: '', 
      startTime: '',
      endTime: '',
      oaDuration: '30秒',
      materialDest: '',
      revisionDest: '',
      note: ''
    }
  ]);

  // Load project details and existing response
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch project details
        const proj = await api.getProjectById(projectId);
        setProject(proj);

        // Determine dynamic initial pubType
        const pubTypes = proj?.metadata?.pub_types || [];
        const defaultPubType = pubTypes.length > 0 ? pubTypes[0] : '生CM';

        // Fetch existing station responses
        const responses = await api.getStationResponses(projectId);
        const myResp = responses.find(r => r.station_name === stationName);

        if (myResp && myResp.response_data && myResp.response_data.slots) {
          setSlots(myResp.response_data.slots);
          if (myResp.status === 'registered') {
            setIsLocked(true);
          }
        } else {
          // Setup initial empty slot with default pubType
          setSlots([
            {
              id: Date.now(),
              programName: '',
              pubType: defaultPubType,
              oaDate: '',
              startTime: '',
              endTime: '',
              oaDuration: '30秒',
              materialDest: '',
              revisionDest: '',
              note: ''
            }
          ]);
        }
      } catch (err) {
        console.error('[UrlSlotIssuance] Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [projectId, stationName]);

  const addSlot = () => {
    if (isLocked) return;
    const pubTypes = project?.metadata?.pub_types || [];
    const defaultPubType = pubTypes.length > 0 ? pubTypes[0] : '生CM';

    setSlots([...slots, { 
      id: Date.now(), 
      programName: '', 
      pubType: defaultPubType,
      oaDate: '', 
      startTime: '',
      endTime: '',
      oaDuration: '30秒',
      materialDest: '',
      revisionDest: '',
      note: ''
    }]);
  };

  const removeSlot = (id) => {
    if (isLocked) return;
    if (slots.length > 1) {
      setSlots(slots.filter(s => s.id !== id));
    }
  };

  const handleInputChange = (id, field, value) => {
    if (isLocked) return;
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Helper validation for email address
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleConfirm = async () => {
    if (isLocked || isSaving) return;

    // Validation
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const num = i + 1;
      if (!slot.programName.trim()) {
        alert(`枠 #${num} の番組名を入力してください。`);
        return;
      }
      if (!slot.pubType) {
        alert(`枠 #${num} のパブ種別を選択してください。`);
        return;
      }
      if (!slot.oaDate) {
        alert(`枠 #${num} のOA日を入力してください。`);
        return;
      }
      if (!slot.startTime.trim() || !slot.endTime.trim()) {
        alert(`枠 #${num} の開始・終了時間を入力してください。`);
        return;
      }
      if (!slot.oaDuration.trim()) {
        alert(`枠 #${num} のOA尺を入力してください。`);
        return;
      }
      
      // Email validation for materialDest and revisionDest (Request 3 requirement)
      if (!slot.materialDest.trim()) {
        alert(`枠 #${num} の素材送付先メールアドレスを入力してください。`);
        return;
      }
      if (!isValidEmail(slot.materialDest.trim())) {
        alert(`枠 #${num} の素材送付先メールアドレスが有効なメールアドレス形式ではありません。`);
        return;
      }
      if (!slot.revisionDest.trim()) {
        alert(`枠 #${num} の修正稿送付先メールアドレスを入力してください。`);
        return;
      }
      if (!isValidEmail(slot.revisionDest.trim())) {
        alert(`枠 #${num} の修正稿送付先メールアドレスが有効なメールアドレス形式ではありません。`);
        return;
      }
    }

    setIsSaving(true);
    try {
      // 1. Save slots to station_responses with 'registered' status
      await api.saveStationResponse(projectId, stationName, {
        status: 'registered',
        slots: slots,
        confirmedAt: new Date().toISOString()
      });
      
      // 2. Update project status to 'materials' (素材待ち)
      await api.updateProjectStatus(projectId, 'materials');
      
      setIsLocked(true);
      alert('回答を確定し、枠出しを行いました。入力内容は即座に共有され、ステータスが「素材待ち」に更新されました。');
    } catch (e) {
      alert('保存に失敗しました。詳細: ' + (e.message || e));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlock = async () => {
    if (!isLocked) return;
    if (!confirm('回答確定ロックを解除して内容を変更しますか？\n(ステータスは「枠出し待ち」に更新されます)')) {
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update response status to 'pending'
      await api.saveStationResponse(projectId, stationName, {
        status: 'pending',
        slots: slots,
        unlockedAt: new Date().toISOString()
      });

      // 2. Update project status back to 'requesting' (枠出し待ち)
      await api.updateProjectStatus(projectId, 'requesting');

      setIsLocked(false);
      alert('ロックを解除しました。内容を変更して再確定してください。');
    } catch (e) {
      alert('ロック解除に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fdfbf7', color: '#8B4513', fontWeight: '950', fontSize: '18px' }}>
        データを読み込み中...
      </div>
    );
  }

  // Get publicity types set during project creation
  const pubTypes = project?.metadata?.pub_types || [];
  const displayPubTypes = pubTypes.length > 0 ? pubTypes : ['生CM', 'VTR'];

  return (
    <div style={{ padding: '32px', backgroundColor: '#fdfbf7', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* UPPER: Project Information (案件情報) */}
        <section style={{ marginBottom: '40px', backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1.5px solid #F1E4C9', boxShadow: '0 10px 30px rgba(62,39,35,0.05)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#3E2723', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Icons.Info size={20} color="#8B4513" /> 案件情報
              </h2>
              {isLocked ? (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2', color: '#ef4444', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', border: '1px solid #fee2e2' }}>
                    <Icons.Lock size={14} /> 回答確定済み (ロック中)
                 </div>
              ) : (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', border: '1px solid #d1fae5' }}>
                    <Icons.Unlock size={14} /> 編集可能
                 </div>
              )}
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Row 1: Sponsor/Agency, Project Name, Pub Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                 <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>スポンサー/代理店</label>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#3E2723' }}>
                       {project?.sponsor_name || '---'} / {project?.metadata?.agency_name || project?.metadata?.ba || '---'}
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>案件名</label>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#3E2723' }}>{project?.name || '---'}</div>
                  </div>
                 <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>案件のパブ種別</label>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                       {displayPubTypes.map(t => (
                          <span key={t} style={{ fontSize: '11px', backgroundColor: '#FFF5CC', color: '#8B4513', padding: '4px 10px', borderRadius: '8px', fontWeight: '900', border: '1px solid #FFD93D' }}>{t}</span>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Row 2: Request Period, Request Zone, Material In-date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                 <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>依頼期間</label>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#3E2723' }}>
                       {project?.start_date ? project.start_date.replace(/-/g, '/') : '---'} 〜 {project?.end_date ? project.end_date.replace(/-/g, '/') : '---'}
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>依頼ゾーン</label>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#3E2723' }}>
                       {project?.metadata?.start_hour ? `${project.metadata.start_hour}:00 〜 ${project.metadata.end_hour || '24'}:00` : '全日（06:00〜24:00）'}
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>素材搬入開始日</label>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#ef4444' }}>
                       {project?.metadata?.material_start_date ? project.metadata.material_start_date.replace(/-/g, '/') : '---'}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* LOWER: Slot Information Input (枠情報入力) */}
        <section>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#3E2723', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Icons.Layout size={20} color="#8B4513" /> 枠情報入力
              </h2>
              <button 
                 onClick={addSlot}
                 disabled={isLocked}
                 style={{ padding: '10px 24px', borderRadius: '12px', backgroundColor: isLocked ? '#f1f5f9' : '#3E2723', color: isLocked ? '#94a3b8' : 'white', border: 'none', fontWeight: '950', fontSize: '13px', cursor: isLocked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                 <Icons.Plus size={16} /> 枠を追加
              </button>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {slots.map((slot, index) => (
                 <div key={slot.id} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1.5px solid #F1E4C9', boxShadow: '0 8px 25px rgba(62,39,35,0.04)', position: 'relative', opacity: isLocked ? 0.8 : 1 }}>
                    
                    {slots.length > 1 && !isLocked && (
                       <button 
                          onClick={() => removeSlot(slot.id)}
                          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                       >
                          <Icons.Trash2 size={20} />
                       </button>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                       
                       {/* 1行目: 番組名, パブ種別 */}
                       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>番組名</label>
                             <input 
                                disabled={isLocked}
                                type="text" 
                                placeholder="番組名を入力してください" 
                                value={slot.programName} 
                                onChange={(e) => handleInputChange(slot.id, 'programName', e.target.value)}
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} 
                             />
                          </div>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>パブ種別 (案件設定より選択)</label>
                             <select 
                                disabled={isLocked}
                                value={slot.pubType} 
                                onChange={(e) => handleInputChange(slot.id, 'pubType', e.target.value)}
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#FFFBE6', fontSize: '14px', fontWeight: '900', color: '#8B4513', outline: 'none', cursor: isLocked ? 'default' : 'pointer' }}
                             >
                                {displayPubTypes.map(t => (
                                   <option key={t} value={t}>{t}</option>
                                ))}
                             </select>
                          </div>
                       </div>

                       {/* 2行目: OA日, 開始・終了時間, OA尺 */}
                       <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '24px' }}>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>OA日</label>
                             <input 
                                disabled={isLocked}
                                type="date" 
                                value={slot.oaDate} 
                                onChange={(e) => handleInputChange(slot.id, 'oaDate', e.target.value)}
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} 
                             />
                          </div>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>開始・終了時間</label>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                   disabled={isLocked}
                                   type="text" 
                                   placeholder="00:00" 
                                   value={slot.startTime} 
                                   onChange={(e) => handleInputChange(slot.id, 'startTime', e.target.value)}
                                   style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', textAlign: 'center' }} 
                                />
                                <span style={{ color: '#94a3b8', fontWeight: '950' }}>〜</span>
                                <input 
                                   disabled={isLocked}
                                   type="text" 
                                   placeholder="00:00" 
                                   value={slot.endTime} 
                                   onChange={(e) => handleInputChange(slot.id, 'endTime', e.target.value)}
                                   style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', textAlign: 'center' }} 
                                />
                             </div>
                          </div>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>OA尺</label>
                             <input 
                                disabled={isLocked}
                                type="text" 
                                placeholder="30秒" 
                                value={slot.oaDuration} 
                                onChange={(e) => handleInputChange(slot.id, 'oaDuration', e.target.value)}
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} 
                             />
                          </div>
                       </div>

                       {/* 3行目: 素材送付先, 修正稿送付先 */}
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>素材送付先 (メールアドレス)</label>
                             <div style={{ position: 'relative' }}>
                                <Icons.Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                                <input 
                                   disabled={isLocked}
                                   type="email" 
                                   placeholder="example@broadcaster.co.jp" 
                                   value={slot.materialDest} 
                                   onChange={(e) => handleInputChange(slot.id, 'materialDest', e.target.value)}
                                   style={{ width: '100%', padding: '14px 18px 14px 44px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} 
                                />
                             </div>
                          </div>
                          <div>
                             <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>修正稿送付先 (メールアドレス)</label>
                             <div style={{ position: 'relative' }}>
                                <Icons.Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                                <input 
                                   disabled={isLocked}
                                   type="email" 
                                   placeholder="example@broadcaster.co.jp" 
                                   value={slot.revisionDest} 
                                   onChange={(e) => handleInputChange(slot.id, 'revisionDest', e.target.value)}
                                   style={{ width: '100%', padding: '14px 18px 14px 44px', borderRadius: '14px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} 
                                />
                             </div>
                          </div>
                       </div>

                       {/* 4行目: 連絡事項 */}
                       <div>
                          <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '8px' }}>連絡事項</label>
                          <textarea 
                             disabled={isLocked}
                             placeholder="連絡事項があれば入力してください"
                             value={slot.note}
                             onChange={(e) => handleInputChange(slot.id, 'note', e.target.value)}
                             style={{ width: '100%', height: '80px', padding: '16px', borderRadius: '18px', border: '1.5px solid #F1E4C9', backgroundColor: isLocked ? '#f1f5f9' : '#fcfcfc', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', resize: 'none' }}
                          ></textarea>
                       </div>

                    </div>
                 </div>
              ))}

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', backgroundColor: '#FFFBE6', borderRadius: '16px', border: '1px solid #FFD93D' }}>
                    <Icons.AlertCircle size={18} color="#8B4513" />
                    <p style={{ fontSize: '13px', color: '#8B4513', fontWeight: '800', margin: 0 }}>
                       入力内容は即座に共有され、ステータスが「素材待ち」に更新されます。
                    </p>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button 
                       onClick={handleConfirm}
                       disabled={isLocked || isSaving}
                       style={{ width: '400px', padding: '20px', borderRadius: '24px', backgroundColor: isLocked ? '#94a3b8' : '#34D399', color: 'white', border: 'none', fontSize: '18px', fontWeight: '950', cursor: (isLocked || isSaving) ? 'default' : 'pointer', boxShadow: isLocked ? 'none' : '0 15px 35px rgba(52, 211, 153, 0.25)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                       onMouseOver={(e) => { if (!isLocked && !isSaving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 45px rgba(52, 211, 153, 0.35)'; } }}
                       onMouseOut={(e) => { if (!isLocked && !isSaving) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(52, 211, 153, 0.25)'; } }}
                    >
                       {isSaving ? '保存中...' : isLocked ? <><Icons.Lock size={20} /> 回答確定済み</> : '回答を確定して枠出しする'}
                    </button>
                    
                    {isLocked && (
                       <button 
                          onClick={handleUnlock}
                          disabled={isSaving}
                          style={{ padding: '20px 32px', borderRadius: '24px', backgroundColor: 'white', color: '#3E2723', border: '2px solid #F1E4C9', fontSize: '16px', fontWeight: '950', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fdfbf7'; e.currentTarget.style.borderColor = '#8B4513'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#F1E4C9'; }}
                       >
                          <Icons.Edit3 size={20} /> 内容変更
                       </button>
                    )}
                 </div>
              </div>

           </div>
        </section>

        <footer style={{ marginTop: '60px', textAlign: 'center', paddingBottom: '60px' }}>
           <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
              Powered by ぷりん (TV Pub Linker)
           </div>
        </footer>
      </div>
    </div>
  );
};

export default UrlSlotIssuanceDemo;

