import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const EventRegView = ({ onBack }) => {
  const [showList, setShowList] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allProjects = await api.getProjects();
        const evProjects = (allProjects || [])
          .filter(p => p.metadata?.type === 'event_master')
          .map(p => ({
            id: p.id,
            name: p.name,
            period: p.start_date ? `${p.start_date}-${p.end_date}` : '2026/10/01',
            venue: p.metadata?.venue || '未定',
            status: p.status === 'published' ? 'published' : 'draft',
            visitorCount: p.metadata?.visitorCount
          }));

        if (evProjects.length > 0) {
          setEvents(evProjects);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch events from API', e);
      }
      setEvents([]);
    };

    fetchEvents();
  }, []);

  const [formData, setFormData] = useState({
    eventName: '',
    date: '',
    time: '',
    location: '',
    type: '大型フェス',
    visitorCount: '',
    demographics: '',
    industryExclusion: '',
    boothFee: '',
    boothSize: '',
    foodAndBeverage: '不可',
    contracting: '不可',
    vehicleDisplayFee: '',
    vehicleOptions: '',
    samplingOnlyFee: '',
    service: '',
    margin: '',
    cancellationPolicy: '',
    pastMaterials: '',
    mailingAvailable: '不可',
    stampRally: '無',
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

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '900', color: '#64748b', marginBottom: '10px' };
  const fieldStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontWeight: '700', fontSize: '15px', outline: 'none' };

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
            <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>イベント登録</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>貴社主催・協賛イベントの詳細情報を登録します。</p>
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
             <Icons.Board size={18} /> {showList ? '入力を続ける' : '登録一覧を確認'} {events.length > 0 && `(${events.length})`}
           </button>
        </div>
      </header>

      {!showList ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section style={{ backgroundColor: 'white', borderRadius: '28px', padding: '40px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '1.5px solid #f8fafc', paddingBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff9db', color: '#f08c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Calendar size={20} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', margin: 0 }}>登録項目</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
               {/* 1行目: 基本情報 */}
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>イベント名</label>
                     <input type="text" style={fieldStyle} placeholder="イベント名を入力..." value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>開催日</label>
                     <input type="text" style={fieldStyle} placeholder="例: 2024/08/10〜12" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>開催時間</label>
                     <input type="text" style={fieldStyle} placeholder="例: 10:00〜18:00" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
               </div>

               {/* 2行目 */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>開催場所</label>
                     <input type="text" style={fieldStyle} placeholder="会場名・住所等" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>イベント種別</label>
                     <select style={fieldStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>大型フェス</option>
                        <option>展示会・見本市</option>
                        <option>地域振興・祭り</option>
                        <option>スポーツイベント</option>
                        <option>セミナー・講演</option>
                        <option>その他</option>
                     </select>
                  </div>
                  <div>
                     <label style={labelStyle}>想定来場者数</label>
                     <input type="text" style={fieldStyle} placeholder="例: 3万人" value={formData.visitorCount} onChange={e => setFormData({...formData, visitorCount: e.target.value})} />
                  </div>
               </div>

               {/* 3行目 */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>来場者属性</label>
                     <input type="text" style={fieldStyle} placeholder="ファミリー層, 20代女性 等" value={formData.demographics} onChange={e => setFormData({...formData, demographics: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>競合排除業種</label>
                     <input type="text" style={fieldStyle} placeholder="排除業種を記入..." value={formData.industryExclusion} onChange={e => setFormData({...formData, industryExclusion: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>キャンセルポリシー</label>
                     <input type="text" style={fieldStyle} placeholder="例: 30日前から50%発生" value={formData.cancellationPolicy} onChange={e => setFormData({...formData, cancellationPolicy: e.target.value})} />
                  </div>
               </div>

               <div style={{ padding: '24px', backgroundColor: '#fcfdfe', borderRadius: '20px', border: '1.5px solid #f1f5f9' }}>
                  <div style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{ width: '6px', height: '16px', backgroundColor: 'var(--tacos-red)', borderRadius: '3px' }}></div>
                     出展ブース・料金詳細
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                     <div>
                        <label style={labelStyle}>ブース料金</label>
                        <input type="text" style={fieldStyle} placeholder="金額を入力..." value={formData.boothFee} onChange={e => setFormData({...formData, boothFee: e.target.value})} />
                     </div>
                     <div>
                        <label style={labelStyle}>ブースサイズ</label>
                        <input type="text" style={fieldStyle} placeholder="例: 3m x 3m" value={formData.boothSize} onChange={e => setFormData({...formData, boothSize: e.target.value})} />
                     </div>
                     <div>
                        <label style={labelStyle}>ブース内飲食</label>
                        <select style={fieldStyle} value={formData.foodAndBeverage} onChange={e => setFormData({...formData, foodAndBeverage: e.target.value})}>
                           <option>可</option>
                           <option>不可</option>
                           <option>火気厳禁</option>
                        </select>
                     </div>
                     <div>
                        <label style={labelStyle}>契約行為</label>
                        <select style={fieldStyle} value={formData.contracting} onChange={e => setFormData({...formData, contracting: e.target.value})}>
                           <option>可</option>
                           <option>不可</option>
                           <option>要相談</option>
                        </select>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '20px', marginTop: '20px' }}>
                     <div>
                        <label style={labelStyle}>車両展示料金</label>
                        <input type="text" style={fieldStyle} placeholder="金額を入力..." value={formData.vehicleDisplayFee} onChange={e => setFormData({...formData, vehicleDisplayFee: e.target.value})} />
                     </div>
                     <div>
                        <label style={labelStyle}>車両オプション</label>
                        <input type="text" style={fieldStyle} placeholder="電源, 洗車スペース 等" value={formData.vehicleOptions} onChange={e => setFormData({...formData, vehicleOptions: e.target.value})} />
                     </div>
                     <div>
                        <label style={labelStyle}>サンプリングのみ料金</label>
                        <input type="text" style={fieldStyle} placeholder="金額を入力..." value={formData.samplingOnlyFee} onChange={e => setFormData({...formData, samplingOnlyFee: e.target.value})} />
                     </div>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>サービス</label>
                     <input type="text" style={fieldStyle} placeholder="運営、告知 等" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>マージン</label>
                     <input type="text" style={fieldStyle} placeholder="例: 15%" value={formData.margin} onChange={e => setFormData({...formData, margin: e.target.value})} />
                  </div>
                  <div>
                     <label style={labelStyle}>郵送搬入可否</label>
                     <select style={fieldStyle} value={formData.mailingAvailable} onChange={e => setFormData({...formData, mailingAvailable: e.target.value})}>
                        <option>可</option>
                        <option>不可</option>
                     </select>
                  </div>
                  <div>
                     <label style={labelStyle}>スタンプラリー</label>
                     <select style={fieldStyle} value={formData.stampRally} onChange={e => setFormData({...formData, stampRally: e.target.value})}>
                        <option>有</option>
                        <option>無</option>
                        <option>公式のみ</option>
                     </select>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                  <div>
                     <label style={labelStyle}>その他特筆事項</label>
                     <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'none' }} placeholder="その他、ブースの場所指定や備品貸出について等..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                  </div>
               </div>
            </div>
          </section>

          {/* 追加設定項目：企画書と公開範囲 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
             <section style={{ backgroundColor: 'white', borderRadius: '28px', padding: '40px', border: '1.5 solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fff9db', color: '#f08c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Upload size={18} /></div>
                   <h3 style={{ fontSize: '17px', fontWeight: '950', color: '#1e293b', margin: 0 }}>企画書・過去資料アップロード</h3>
                </div>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '20px', padding: '32px', textAlign: 'center', backgroundColor: '#fcfdfe', cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', border: '1.5px solid', borderColor: visibility === 'all' ? 'var(--tacos-red)' : '#e2e8f0', backgroundColor: visibility === 'all' ? 'rgba(230,0,18,0.02)' : 'transparent', cursor: 'pointer' }}>
                         <input type="radio" name="visibility" checked={visibility === 'all'} onChange={() => setVisibility('all')} style={{ width: '18px', height: '18px', accentColor: 'var(--tacos-red)' }} />
                         <div style={{ fontSize: '14px', fontWeight: '900', color: visibility === 'all' ? 'var(--tacos-red)' : '#1e293b' }}>全代理店に公開</div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', border: '1.5px solid', borderColor: visibility === 'limited' ? 'var(--tacos-red)' : '#e2e8f0', backgroundColor: visibility === 'limited' ? 'rgba(230,0,18,0.02)' : 'transparent', cursor: 'pointer' }}>
                         <input type="radio" name="visibility" checked={visibility === 'limited'} onChange={() => setVisibility('limited')} style={{ width: '18px', height: '18px', accentColor: 'var(--tacos-red)' }} />
                         <div style={{ fontSize: '14px', fontWeight: '900', color: visibility === 'limited' ? 'var(--tacos-red)' : '#1e293b' }}>特定の代理店に限定</div>
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

                <button onClick={async () => {
                   if (!formData.eventName) {
                     alert('イベント名を入力してください');
                     return;
                   }
                   try {
                     const newProject = await api.createProject({
                       name: formData.eventName,
                       sponsor_name: '主催・自社',
                       start_date: formData.date ? formData.date.split('〜')[0] : '2026-10-01',
                       end_date: formData.date ? formData.date.split('〜')[1] : '2026-10-01',
                       status: 'published',
                       metadata: {
                         type: 'event_master',
                         venue: formData.location || '未定',
                         visitorCount: formData.visitorCount,
                         ...formData
                       }
                     });

                     const newEv = {
                       id: newProject.id,
                       name: newProject.name,
                       period: formData.date || '2026/10/01',
                       venue: formData.location || '未定',
                       status: 'published'
                     };
                     const updated = [...events, newEv];
                     setEvents(updated);
                     alert('イベントを公開しました！');
                     setShowList(true);
                   } catch (err) {
                     console.error('Failed to create event:', err);
                     alert('公開に失敗しました: ' + err.message);
                   }
                 }} style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 8px 25px rgba(230,0,18,0.25)', fontSize: '16px', transition: 'all 0.2s' }}>
                    <Icons.Send size={20} /> 公開する
                 </button>
             </section>
          </div>
        </div>
      ) : (
        /* リスト表示（デモ用） */
        <div className="animate-pop" style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' }}>
           <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Board size={20} color="#4338ca" />
                <h3 style={{ fontWeight: '950', fontSize: '17px', margin: 0 }}>現在の登録済みイベント一覧</h3>
              </div>
              <button style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--tacos-red)', color: 'white', fontWeight: '900', fontSize: '13px' }}>+ 新しいイベントを追加</button>
           </div>
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead style={{ backgroundColor: '#fff', borderBottom: '2.5px solid #f1f5f9' }}>
               <tr>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>イベント名</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>開催期間</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>会場</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>想定来場</th>
                 <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>状態</th>
               </tr>
             </thead>
             <tbody>
               {events.map(ev => (
                 <tr key={ev.id} className="hover-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                   <td style={{ padding: '20px 24px', fontWeight: '950', fontSize: '15px' }}>{ev.name}</td>
                   <td style={{ padding: '20px 24px', fontWeight: '800', color: '#475569' }}>{ev.period}</td>
                   <td style={{ padding: '20px 24px', fontWeight: '800', color: '#475569' }}>{ev.venue}</td>
                   <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: '950', fontSize: '14px' }}>3万人</span>
                   </td>
                   <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900',
                        backgroundColor: ev.status === 'published' ? 'rgba(0,180,0,0.1)' : '#f1f5f9',
                        color: ev.status === 'published' ? '#087f5b' : '#64748b'
                      }}>
                        {ev.status === 'published' ? '公開中' : '下書き'}
                      </span>
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

export default EventRegView;
