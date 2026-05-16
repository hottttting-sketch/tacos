import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const TimeSlotRegView = ({ onBack }) => {
  const [slots, setSlots] = useState([]);
  const [showList, setShowList] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(true);

  const [formData, setFormData] = useState({
    programName: '',
    broadcastTime: '',
    type: 'レギュラー',
    networks: '',
    seconds: '15',
    sponsorType: '提供',
    sponsorChange: '不可',
    colorLogo: '可',
    amount: '',
    marginBreakdown: '',
    industryExclusion: '',
    notes: ''
  });

  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [visibility, setVisibility] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const registeredAgencies = [
    { id: 1, name: '電通', kana: 'デンツウ' },
    { id: 2, name: '博報堂', kana: 'ハクホウドウ' },
    { id: 3, name: 'ADKホールディングス', kana: 'エーディーケー' },
    { id: 4, name: '東急エージェンシー', kana: 'トウキュウエージェンシー' },
    { id: 5, name: 'ジェイアール東日本企画', kana: 'ジェイアールヒガシニホンキカク' },
    { id: 6, name: '大広', kana: 'ダイコウ' },
    { id: 7, name: '読売広告社', kana: 'ヨミウリアド' },
    { id: 8, name: '朝日広告社', kana: 'アサヒアド' },
    { id: 9, name: 'メディックス', kana: 'メディックス' },
    { id: 10, name: 'セプテーニ', kana: 'セプテーニ' }
  ];

  const filteredAgencies = registeredAgencies.filter(a => 
    a.name.includes(searchQuery) || a.kana.includes(searchQuery)
  );

  const toggleAgency = (agencyName) => {
    setSelectedAgencies(prev => 
      prev.includes(agencyName) ? prev.filter(a => a !== agencyName) : [...prev, agencyName]
    );
  };

  const fetchSlots = async () => {
    try {
      const projs = await api.getProjects();
      const slotProjects = projs.filter(p => p.metadata?.type === 'timeSlot').map(p => ({
        id: p.id,
        program: p.metadata?.programName || p.name,
        day: p.metadata?.broadcastTime || '',
        time: p.metadata?.broadcastTime || '',
        sec: p.metadata?.seconds || '',
        price: p.metadata?.amount || '',
        index: '100',
        ...p.metadata
      }));

      setSlots(slotProjects.length > 0 ? slotProjects : [
        { id: 1, program: 'ゴールデンタイム特選', day: '月曜', time: '19:00', sec: '15', price: '450,000', index: '1.8' },
        { id: 2, program: '夜のニュースサマリー', day: '火曜', time: '21:00', sec: '15', price: '600,000', index: '2.1' }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSaveSlot = async () => {
    if (!formData.programName) {
      alert('番組名は必須です');
      return;
    }
    try {
      await api.createProject({
        name: formData.programName,
        sponsor_name: 'TimeSlot',
        status: 'published',
        metadata: {
          type: 'timeSlot',
          programName: formData.programName,
          broadcastTime: formData.broadcastTime,
          timeType: formData.type,
          networks: formData.networks,
          seconds: formData.seconds,
          sponsorType: formData.sponsorType,
          sponsorChange: formData.sponsorChange,
          colorLogo: formData.colorLogo,
          amount: formData.amount,
          marginBreakdown: formData.marginBreakdown,
          industryExclusion: formData.industryExclusion,
          notes: formData.notes,
          visibility: visibility,
          selectedAgencies: selectedAgencies
        }
      });
      alert('新しいタイム提案枠を公開しました。');
      fetchSlots();
      setShowList(true);
    } catch (e) {
      console.error(e);
      alert('公開に失敗しました。');
    }
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '10px' };
  const fieldStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #F1E4C9', fontWeight: '800', fontSize: '15px', outline: 'none', backgroundColor: '#fcfcfc' };

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 共通ヘッダー */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
              <Icons.ArrowLeft size={24} />
            </div>
          </button>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>タイム枠登録</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>タイム枠の詳細情報を登録・管理します。</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             onClick={() => setShowList(!showList)}
             style={{ 
               padding: '12px 24px', borderRadius: '14px', border: '1.5px solid #e2e8f0', 
               backgroundColor: showList ? '#1e293b' : 'white', 
               color: showList ? 'white' : '#1e293b', 
               fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
             }}
           >
             <Icons.Board size={18} /> {showList ? '入力を続ける' : '登録一覧を確認'} {slots.length > 0 && `(${slots.length})`}
           </button>
        </div>
      </header>

      {!showList ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section style={{ backgroundColor: 'white', borderRadius: '28px', padding: '40px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '1.5px solid #f8fafc', paddingBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eef2ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Edit size={20} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', margin: 0 }}>登録項目</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
               {/* 1行目 */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>番組名</label>
                     <input type="text" style={fieldStyle} placeholder="番組名を入力..." value={formData.programName} onChange={e => setFormData({...formData, programName: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>放送曜日/日時</label>
                     <input type="text" style={fieldStyle} placeholder="例: 月曜 19:00〜20:00" value={formData.broadcastTime} onChange={e => setFormData({...formData, broadcastTime: e.target.value})} />
                  </div>
               </div>

               {/* 2行目 */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>レギュラー/単発</label>
                     <select style={fieldStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>レギュラー</option>
                        <option>単発</option>
                     </select>
                  </div>
                  <div>
                     <label style={labelStyle}>ネット数</label>
                     <input type="text" style={fieldStyle} placeholder="28局ネット 等" value={formData.networks} onChange={e => setFormData({...formData, networks: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>秒数</label>
                     <input type="text" style={fieldStyle} placeholder="秒数 (15, 30...)" value={formData.seconds} onChange={e => setFormData({...formData, seconds: e.target.value})} />
                  </div>
               </div>

               {/* 3行目 */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>提供/PT</label>
                     <select style={fieldStyle} value={formData.sponsorType} onChange={e => setFormData({...formData, sponsorType: e.target.value})}>
                        <option>提供</option>
                        <option>PT</option>
                     </select>
                  </div>
                  <div>
                     <label style={labelStyle}>提供チェンジ</label>
                     <select style={fieldStyle} value={formData.sponsorChange} onChange={e => setFormData({...formData, sponsorChange: e.target.value})}>
                        <option>可</option>
                        <option>不可</option>
                     </select>
                  </div>
                  <div>
                     <label style={labelStyle}>カラーロゴ可否</label>
                     <select style={fieldStyle} value={formData.colorLogo} onChange={e => setFormData({...formData, colorLogo: e.target.value})}>
                        <option>可</option>
                        <option>不可</option>
                     </select>
                  </div>
               </div>

               {/* 4行目 */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>金額（単発/月額）</label>
                     <input type="text" style={fieldStyle} placeholder="金額を入力..." value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>マージン内訳</label>
                     <input type="text" style={fieldStyle} placeholder="ネット・グロス内訳 等" value={formData.marginBreakdown} onChange={e => setFormData({...formData, marginBreakdown: e.target.value})} />
                  </div>
               </div>

               {/* 5行目 */}
               <div>
                  <label style={labelStyle}>競合排除業種</label>
                  <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'none' }} placeholder="排除業種を記入..." value={formData.industryExclusion} onChange={e => setFormData({...formData, industryExclusion: e.target.value})} />
               </div>

               {/* 6行目 */}
               <div style={{ marginBottom: '8px' }}>
                  <label style={labelStyle}>備考</label>
                  <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'none' }} placeholder="その他補足事項..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
               </div>
            </div>
          </section>

          {/* 追加設定項目：企画書と公開範囲 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
             <section style={{ backgroundColor: 'white', borderRadius: '28px', padding: '40px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fff9db', color: '#f08c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Upload size={18} /></div>
                   <h3 style={{ fontSize: '17px', fontWeight: '950', color: '#1e293b', margin: 0 }}>企画書アップロード</h3>
                </div>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '20px', padding: '32px', textAlign: 'center', backgroundColor: '#fcfdfe', cursor: 'pointer' }}>
                   <Icons.Upload size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                   <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>ファイルをドラッグ＆ドロップ</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>またはファイルを選択 (最大10MB)</div>
                </div>
             </section>

             <section style={{ backgroundColor: 'white', borderRadius: '28px', padding: '40px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Shield size={18} /></div>
                   <h3 style={{ fontSize: '17px', fontWeight: '950', color: '#1e293b', margin: 0 }}>公開範囲設定</h3>
                </div>
                
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', border: '1.5px solid', borderColor: visibility === 'all' ? '#8B4513' : '#F1E4C9', backgroundColor: visibility === 'all' ? '#FFFBE6' : 'transparent', cursor: 'pointer' }}>
                         <input type="radio" name="visibility" checked={visibility === 'all'} onChange={() => setVisibility('all')} style={{ width: '18px', height: '18px', accentColor: '#8B4513' }} />
                         <div style={{ fontSize: '14px', fontWeight: '950', color: visibility === 'all' ? '#3E2723' : '#1e293b' }}>全代理店に公開</div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', border: '1.5px solid', borderColor: visibility === 'limited' ? '#8B4513' : '#F1E4C9', backgroundColor: visibility === 'limited' ? '#FFFBE6' : 'transparent', cursor: 'pointer' }}>
                         <input type="radio" name="visibility" checked={visibility === 'limited'} onChange={() => setVisibility('limited')} style={{ width: '18px', height: '18px', accentColor: '#8B4513' }} />
                         <div style={{ fontSize: '14px', fontWeight: '950', color: visibility === 'limited' ? '#3E2723' : '#1e293b' }}>特定の代理店に限定</div>
                      </label>

                      {visibility === 'limited' && (
                        <div className="animate-fade" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                           <div style={{ position: 'relative' }}>
                              <Icons.Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                              <input 
                                 type="text" 
                                 placeholder="システム登録済みの代理店を検索..." 
                                 value={searchQuery}
                                 onChange={e => setSearchQuery(e.target.value)}
                                 style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontWeight: '700', outline: 'none' }} 
                              />
                           </div>
                           <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '4px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1.5px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {filteredAgencies.map(agency => (
                                <label key={agency.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', backgroundColor: selectedAgencies.includes(agency.name) ? 'white' : 'transparent', border: '1.5px solid', borderColor: selectedAgencies.includes(agency.name) ? 'var(--tacos-red)' : 'transparent', transition: 'all 0.2s', boxShadow: selectedAgencies.includes(agency.name) ? '0 4px 10px rgba(0,0,0,0.03)' : 'none' }}>
                                  <input type="checkbox" checked={selectedAgencies.includes(agency.name)} onChange={() => toggleAgency(agency.name)} style={{ width: '16px', height: '16px', accentColor: 'var(--tacos-red)' }} />
                                  <span style={{ fontSize: '12px', fontWeight: '800', color: selectedAgencies.includes(agency.name) ? 'var(--tacos-red)' : '#475569' }}>{agency.name}</span>
                                </label>
                              ))}
                              {filteredAgencies.length === 0 && (
                                 <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>一致する代理店が見つかりません</div>
                              )}
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <button onClick={handleSaveSlot} style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', backgroundColor: '#3E2723', color: 'white', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 8px 25px rgba(62,39,35,0.25)', fontSize: '16px', transition: 'all 0.2s' }}>
                   <Icons.Send size={20} /> 公開する
                </button>
             </section>
          </div>
        </div>
      ) : (
        /* リスト表示（デフォルト非表示、ボタンで展開） */
        <div className="animate-pop" style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' }}>
           <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Board size={20} color="#4338ca" />
                <h3 style={{ fontWeight: '950', fontSize: '17px', margin: 0 }}>現在の提案枠一覧</h3>
              </div>
              <button style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#3E2723', color: 'white', fontWeight: '950', fontSize: '13px' }}>+ 新しい枠を追加</button>
           </div>
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead style={{ backgroundColor: '#fff', borderBottom: '2.5px solid #f1f5f9' }}>
               <tr>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>番組名</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>曜日・時間</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'right' }}>単価 (GROSS)</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>回答INDEX</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>操作</th>
               </tr>
             </thead>
             <tbody>
               {slots.map(slot => (
                 <tr key={slot.id} className="hover-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                   <td style={{ padding: '20px 24px', fontWeight: '950', fontSize: '15px' }}>{slot.program}</td>
                   <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '800' }}>{slot.day}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>{slot.time}</div>
                   </td>
                   <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: '950', color: '#8B4513', fontSize: '17px' }}>¥{slot.price}</td>
                   <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: '950', fontSize: '14px' }}>{slot.index}%</span>
                   </td>
                   <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Icons.Edit size={16} /></button>
                        <button style={{ border: 'none', background: '#fff5f5', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#fa5252' }}><Icons.Trash size={16} /></button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      <style>{`.hover-row:hover { background-color: #fcfdfe; }`}</style>
    </div>
  );
};

export default TimeSlotRegView;
