import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { supabase } from '../utils/supabaseClient';
import { 
  Plus, Search, Filter, Monitor, FileText, CheckCircle, 
  AlertCircle, Clock, Video, Trash2, Edit, ChevronRight,
  Download, ExternalLink, RefreshCw, Upload, Image as ImageIcon,
  Play, Settings, History, Check, X, Send, Scissors, Info, Calendar, Camera, Square, Type, Save, MousePointer, Edit3, Paperclip
} from 'lucide-react';

// --- SUB-COMPONENT: REQUEST EXAM MODAL ---
const RequestExamModal = ({ material, onClose, onSend }) => {
  const [selectedStations, setSelectedStations] = useState([]);
  const [broadcasters, setBroadcasters] = useState([]);
  const [deadline, setDeadline] = useState('');
  
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
    '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  const networks = ['N系', 'J系', 'CX系', 'EX系', 'TX系', '独U'];

  // 放送局が存在するかどうかの判定を安定させるためのロジック
  const checkHasStation = (pref, net) => {
    // デモ用: 主要都市は全系列、その他はランダム
    if (pref === '東京都' || pref === '大阪府' || pref === '愛知県') return true;
    if (net === '独U') return ['埼玉県', '千葉県', '神奈川県', '京都府', '兵庫県', '三重県', '岐阜県', '奈良県', '和歌山県', '滋賀県', '栃木県', '群馬県'].includes(pref);
    const hash = (pref.length * net.length * 31) % 100;
    return hash > 40;
  };

  useEffect(() => { const load = async () => { const data = await api.getBroadcasters(); setBroadcasters(data || []); }; load(); }, []);
  
  const toggleStation = (key) => setSelectedStations(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);

  const selectBulk = (excludeDokuU = false) => {
    const allPossible = [];
    prefectures.forEach(pref => {
      networks.forEach(net => {
        if (excludeDokuU && net === '独U') return;
        if (checkHasStation(pref, net)) {
          allPossible.push(`${pref}_${net}`);
        }
      });
    });
    setSelectedStations(allPossible);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
      <div style={{ width: '900px', height: '90vh', backgroundColor: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <header style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div><h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '950' }}>考査依頼の送信</h3><div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '700' }}>{material?.name}</div></div>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
              <button onClick={() => selectBulk(false)} style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', fontSize: '12px', fontWeight: '900', color: '#475569', cursor: 'pointer' }}>全局を選択</button>
              <button onClick={() => selectBulk(true)} style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', fontSize: '12px', fontWeight: '900', color: '#475569', cursor: 'pointer' }}>全局（独U除き）を選択</button>
              <button onClick={() => setSelectedStations([])} style={{ padding: '6px 16px', borderRadius: '8px', border: '1.5px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '12px', fontWeight: '900', color: '#94a3b8', cursor: 'pointer' }}>リセット</button>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X /></button>
        </header>
        <div style={{ flex: 1, padding: '0', overflowY: 'auto', backgroundColor: '#fcfdfe' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', width: '100px' }}>都道府県</th>
                {networks.map(n => <th key={n} style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {prefectures.map(pref => (
                <tr key={pref} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '900', backgroundColor: '#f8fafc', textAlign: 'center' }}>{pref}</td>
                  {networks.map(net => {
                    const key = `${pref}_${net}`;
                    const hasStation = checkHasStation(pref, net);
                    if (!hasStation) return <td key={net} style={{ backgroundColor: 'white' }}></td>;
                    const isSel = selectedStations.includes(key);
                    return (
                      <td key={net} style={{ padding: '4px', backgroundColor: 'white' }}>
                        <button 
                          onClick={() => toggleStation(key)} 
                          style={{ 
                            width: '100%', padding: '6px 2px', borderRadius: '6px', border: '1.5px solid', 
                            borderColor: isSel ? 'var(--tacos-red)' : '#e2e8f0', 
                            backgroundColor: isSel ? '#fff5f5' : 'white', 
                            color: isSel ? 'var(--tacos-red)' : '#64748b', 
                            fontWeight: '900', cursor: 'pointer', fontSize: '10px'
                          }}
                        >
                          {isSel ? '選択中' : '選択'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '800', fontSize: '14px' }}>キャンセル</button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#64748b' }}>考査〆切：</span>
            <input 
              type="date" 
              value={deadline} 
              onChange={e => setDeadline(e.target.value)} 
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontWeight: '800', fontSize: '13px', outline: 'none' }} 
            />
          </div>

          <button 
            disabled={selectedStations.length === 0 || !deadline} 
            onClick={() => onSend(selectedStations, deadline)} 
            style={{ 
              padding: '10px 32px', borderRadius: '12px', border: 'none', 
              backgroundColor: (selectedStations.length > 0 && deadline) ? 'var(--tacos-red)' : '#cbd5e1', 
              color: 'white', fontWeight: '900', fontSize: '14px', boxShadow: '0 4px 12px rgba(230,0,18,0.2)' 
            }}
          >
            依頼を送信
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: DETAIL MODAL ---
const MaterialDetailModal = ({ material, onClose, role, onReAnswer }) => {
  const req = material?.requestedStations || [];
  const reviewed = material?.reviewedStations || {};
  const [selectedStation, setSelectedStation] = useState(req[0] || 'EX系');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [localStatuses, setLocalStatuses] = useState({});
  const [pointMessages, setPointMessages] = useState({}); // { pointIdx: string }
  const [selectedFiles, setSelectedFiles] = useState({}); // { pointIdx: File, global: File }
  const [globalMessage, setGlobalMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeFileTarget, setActiveFileTarget] = useState(null); // { idx: number | 'global' }

  const displayStations = role === 'agency' ? req : (reviewed['自社'] ? ['自社'] : []);
  
  // 名寄せ対応
  const currentResponse = reviewed[selectedStation] || reviewed['自社'] || (Object.keys(reviewed).length > 0 ? Object.values(reviewed)[0] : null);

  const handleFileClick = (target) => {
    setActiveFileTarget(target);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && activeFileTarget) {
      setSelectedFiles(prev => ({ ...prev, [activeFileTarget.idx]: file }));
    }
  };

  useEffect(() => {
    if (currentResponse) {
      const initial = currentResponse.results || (currentResponse.selectedStatuses ? {
        accepted: currentResponse.selectedStatuses.includes('accepted'),
        conditional: currentResponse.selectedStatuses.includes('conditional'),
        revision: currentResponse.selectedStatuses.includes('revision'),
        requestInfo: currentResponse.selectedStatuses.includes('requestInfo'),
        rejected: currentResponse.selectedStatuses.includes('rejected'),
        other: currentResponse.selectedStatuses.includes('other')
      } : {});
      setLocalStatuses(initial);
    }
  }, [currentResponse]);

  const handleSend = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const messages = [];

      // ポイント別メッセージ & ファイルを収集
      const pointIndices = new Set([...Object.keys(pointMessages), ...Object.keys(selectedFiles)]);
      for (const idx of pointIndices) {
        if (idx === 'global') continue;
        const text = pointMessages[idx] || '';
        const file = selectedFiles[idx];
        
        if (text.trim() || file) {
          let fileData = null;
          if (file) {
            fileData = await api.uploadAttachment(file);
          }

          const point = currentResponse.screenshots[idx];
          messages.push({
            id: Date.now() + Math.random(),
            role: role,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            pointTime: point?.time,
            pointIdx: parseInt(idx),
            file: fileData // { url, name }
          });
        }
      }

      // 全体メッセージ & ファイルを収集
      if (globalMessage.trim() || selectedFiles['global']) {
        let fileData = null;
        if (selectedFiles['global']) {
          fileData = await api.uploadAttachment(selectedFiles['global']);
        }

        messages.push({
          id: Date.now() + Math.random(),
          role: role,
          text: globalMessage.trim(),
          timestamp: new Date().toISOString(),
          file: fileData
        });
      }

      const activeStation = selectedStation || '自社';
      const selectedStatusesArray = Object.entries(localStatuses)
        .filter(([_, val]) => val)
        .map(([key, _]) => key);

      await api.updateExaminationResponse(material.id, activeStation, {
        results: localStatuses,
        selectedStatuses: selectedStatusesArray,
        messages: messages
      });

      // 送信成功
      setPointMessages({});
      setSelectedFiles({});
      setGlobalMessage('');
      setIsEditingStatus(false);
      if (onReAnswer) onReAnswer('success'); // 通知用
    } catch (error) {
      console.error('[UI] handleSend failed:', error);
      alert('送信に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const options = [
    { id: 'accepted', label: '受理', color: '#10b981' },
    { id: 'conditional', label: '条件付き受理', color: '#3b82f6' },
    { id: 'revision', label: '改稿', color: '#f59e0b' },
    { id: 'requestInfo', label: '資料請求', color: '#8b5cf6' }
  ];

  const getStatusLabels = (res) => {
    if (!res) return [];
    const statuses = res.results || (res.selectedStatuses ? {
      accepted: res.selectedStatuses.includes('accepted'),
      conditional: res.selectedStatuses.includes('conditional'),
      revision: res.selectedStatuses.includes('revision'),
      requestInfo: res.selectedStatuses.includes('requestInfo')
    } : {});
    return options.filter(opt => statuses[opt.id]);
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileChange} />
      
      <div style={{ width: '1280px', height: '850px', backgroundColor: 'white', borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <header style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '950' }}>放送局別 考査回答詳細</h3>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '700' }}>{material?.name} / {material?.sponsor}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左サイドバー: 局リスト */}
          <div style={{ width: '260px', backgroundColor: '#f8fafc', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>放送局一覧</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {displayStations.map(station => {
                const isSelected = selectedStation === station;
                const ans = reviewed[station] || reviewed['自社'];
                const statusLabels = getStatusLabels(ans);
                const primaryStatus = statusLabels[0]?.label || (ans ? '回答済' : '未回答');

                return (
                  <button 
                    key={station}
                    onClick={() => setSelectedStation(station)}
                    style={{ 
                      width: '100%', padding: '14px 20px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                      backgroundColor: isSelected ? 'white' : 'transparent',
                      color: isSelected ? '#1e293b' : '#64748b',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      borderLeft: isSelected ? '4px solid var(--tacos-red)' : '4px solid transparent',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ans ? (statusLabels[0]?.color || '#10b981') : '#cbd5e1', flexShrink: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', overflow: 'hidden' }}>
                      <span style={{ fontWeight: isSelected ? '900' : '700', fontSize: '14px', whiteSpace: 'nowrap' }}>{station}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: ans ? (statusLabels[0]?.color || '#10b981') : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {primaryStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 中央 & 右: 回答詳細エリア (スクロール共有) */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#fcfdfe' }}>
            {/* 左: ビデオ固定 */}
            <div style={{ width: '60%', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {material?.videoUrl ? (
                  <video ref={videoRef} src={material.videoUrl} controls style={{ width: '100%', maxHeight: '100%' }} />
                ) : (
                  <div style={{ color: '#475469', textAlign: 'center' }}>
                    <Video size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>動画データが見つかりません</div>
                  </div>
                )}
              </div>
            </div>

            {/* 右: 指摘事項カードリスト & 返信 */}
            <div style={{ width: '40%', borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>考査判定</label>
                  {(role === 'station' || role === 'broadcaster') && (
                    <button 
                      onClick={() => setIsEditingStatus(!isEditingStatus)}
                      style={{ 
                        padding: '4px 10px', borderRadius: '8px', border: '1.5px solid #0ea5e9', backgroundColor: isEditingStatus ? '#0ea5e9' : '#f0f9ff', 
                        color: isEditingStatus ? 'white' : '#0369a1', fontWeight: '800', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <RefreshCw size={10} /> {isEditingStatus ? '編集完了' : '回答変更'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {isEditingStatus ? (
                    options.map(opt => {
                      const isActive = localStatuses[opt.id];
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setLocalStatuses(prev => ({ ...prev, [opt.id]: !prev[opt.id] }))}
                          style={{
                            padding: '6px 12px', borderRadius: '10px', border: `1.5px solid ${opt.color}`,
                            backgroundColor: isActive ? opt.color : 'white',
                            color: isActive ? 'white' : opt.color,
                            fontWeight: '900', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })
                  ) : (
                    getStatusLabels(currentResponse).map(l => (
                      <span key={l.id} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: `${l.color}15`, color: l.color, border: `1.5px solid ${l.color}`, fontWeight: '900', fontSize: '12px' }}>{l.label}</span>
                    ))
                  )}
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#64748b', marginBottom: '16px', textTransform: 'uppercase' }}>指摘項目・やり取り</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* スクリーンショットごとのポイントカード */}
                {currentResponse?.screenshots?.map((s, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', borderRadius: '20px', border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ position: 'relative', height: '140px' }}>
                      <img src={s.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div onClick={() => seekTo(s.time)} style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Play size={10} fill="white" /> {Math.floor(s.time)}s
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', lineHeight: '1.5' }}>
                        {currentResponse?.comment?.split('\n').find(l => l.includes(`[${Math.floor(s.time)}s`)) || 'コメントが入力されていません。'}
                      </div>
                      
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {(currentResponse.messages || []).filter(msg => msg.pointIdx === idx).map(msg => (
                            <div key={msg.id} style={{ alignSelf: msg.role === role ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                              <div style={{ 
                                padding: '8px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', lineHeight: '1.4',
                                backgroundColor: msg.role === role ? '#f1f5f9' : '#fff',
                                border: msg.role === role ? 'none' : '1px solid #e2e8f0',
                                color: '#1e293b'
                              }}>
                                {msg.text}
                                {msg.file && (
                                  <div style={{ marginTop: '8px', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <File size={14} color="#3b82f6" />
                                    <a href={msg.file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.file.name}</a>
                                  </div>
                                )}
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', textAlign: msg.role === role ? 'right' : 'left' }}>
                                {msg.role === 'agency' ? '代理店' : '放送局'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            placeholder="この指摘に返信..." 
                            value={pointMessages[idx] || ''}
                            onChange={(e) => setPointMessages({ ...pointMessages, [idx]: e.target.value })}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #f1f5f9', fontSize: '12px', fontWeight: '700', backgroundColor: '#fcfdfe', outline: 'none' }}
                          />
                          <button 
                            onClick={() => handleFileClick({ idx })}
                            style={{ padding: '8px', borderRadius: '10px', border: 'none', backgroundColor: selectedFiles[idx] ? '#e0f2fe' : '#f1f5f9', color: selectedFiles[idx] ? '#0ea5e9' : '#64748b', cursor: 'pointer', position: 'relative' }}
                          >
                            <Paperclip size={14} />
                            {selectedFiles[idx] && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0ea5e9', border: '2px solid white' }} />}
                          </button>
                        </div>
                        {selectedFiles[idx] && (
                          <div style={{ marginTop: '8px', fontSize: '11px', color: '#0ea5e9', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <File size={12} /> {selectedFiles[idx].name}
                            <button onClick={() => setSelectedFiles(prev => { const n = { ...prev }; delete n[idx]; return n; })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}><X size={12} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 全体メッセージ履歴（ポイントに紐づかないもの） */}
                {(currentResponse?.messages || []).filter(msg => msg.pointIdx === undefined).length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>全体メッセージ履歴</label>
                    {(currentResponse.messages || []).filter(msg => msg.pointIdx === undefined).map(msg => (
                      <div key={msg.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: msg.role === 'agency' ? '#3b82f6' : 'var(--tacos-red)', marginBottom: '4px' }}>
                          {msg.role === 'agency' ? '代理店' : '放送局'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{msg.text}</div>
                        {msg.file && (
                          <div style={{ marginTop: '8px', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <File size={14} color="#3b82f6" />
                            <a href={msg.file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'none', fontWeight: '800' }}>{msg.file.name}</a>
                          </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* フッター: 返信入力 & 送付ボタン */}
        <footer style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea 
                placeholder="全体への返信を入力..." 
                value={globalMessage}
                onChange={(e) => setGlobalMessage(e.target.value)}
                style={{ 
                  width: '100%', height: '60px', padding: '12px 16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', 
                  backgroundColor: '#fcfdfe', fontSize: '13px', fontWeight: '700', outline: 'none', resize: 'none'
                }}
              />
              <button 
                onClick={() => handleFileClick({ idx: 'global' })}
                style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '6px', borderRadius: '8px', border: 'none', background: selectedFiles['global'] ? '#e0f2fe' : 'none', color: selectedFiles['global'] ? '#0ea5e9' : '#64748b', cursor: 'pointer' }} 
                title="ファイルを添付"
              >
                <Paperclip size={16} />
                {selectedFiles['global'] && <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', border: '1.5px solid white' }} />}
              </button>
            </div>
          </div>
          {selectedFiles['global'] && (
            <div style={{ marginBottom: '16px', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#0369a1' }}>
              <File size={14} /> {selectedFiles['global'].name}
              <button onClick={() => setSelectedFiles(prev => { const n = { ...prev }; delete n['global']; return n; })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: ANNOTATION EDITOR ---
const AnnotationEditor = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('rect'); // 'rect' or 'text'
  const [annotations, setAnnotations] = useState([]);
  const [points, setPoints] = useState([]);
  const [hoverPos, setHoverPos] = useState(null);
  const [typingPos, setTypingPos] = useState(null); // { x, y, viewX, viewY }
  const [tempText, setTempText] = useState('');
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImageSize({ w: img.width, h: img.height });
  }, [imageUrl]);

  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewX = e.clientX - rect.left;
    const viewY = e.clientY - rect.top;
    const scaleX = (imageSize.w || 1920) / rect.width;
    const scaleY = (imageSize.h || 1080) / rect.height;
    const canvasX = viewX * scaleX;
    const canvasY = viewY * scaleY;

    if (mode === 'rect') {
      if (points.length === 0) {
        setPoints([{ x: canvasX, y: canvasY }]);
      } else {
        const newAnn = {
          id: Date.now(),
          type: 'rect',
          x1: points[0].x,
          y1: points[0].y,
          x2: canvasX,
          y2: canvasY,
          color: '#ef4444'
        };
        setAnnotations([...annotations, newAnn]);
        setPoints([]);
      }
    } else if (mode === 'text') {
      if (typingPos) {
        finalizeText();
        return;
      }
      setTypingPos({ x: canvasX, y: canvasY, viewX, viewY });
    }
  };

  const finalizeText = () => {
    if (tempText.trim() && typingPos) {
      const newAnn = {
        id: Date.now(),
        type: 'text',
        x: typingPos.x,
        y: typingPos.y,
        content: tempText,
        color: '#ef4444'
      };
      setAnnotations([...annotations, newAnn]);
    }
    setTypingPos(null);
    setTempText('');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewX = e.clientX - rect.left;
    const viewY = e.clientY - rect.top;
    const scaleX = (imageSize.w || 1920) / rect.width;
    const scaleY = (imageSize.h || 1080) / rect.height;
    setHoverPos({ x: viewX * scaleX, y: viewY * scaleY });
  };

  const removeAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = imageSize.w;
    canvas.height = imageSize.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      ctx.lineWidth = 5;
      ctx.font = 'bold 32px sans-serif';
      
      annotations.forEach(ann => {
        ctx.strokeStyle = ann.color;
        ctx.fillStyle = ann.color;
        if (ann.type === 'rect') {
          ctx.strokeRect(ann.x1, ann.y1, ann.x2 - ann.x1, ann.y2 - ann.y1);
        } else if (ann.type === 'text') {
          // 背景（マット）の描画
          ctx.font = 'bold 32px sans-serif';
          const metrics = ctx.measureText(ann.content);
          const bgW = metrics.width + 24;
          const bgH = 44;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(ann.x - 12, ann.y - 22, bgW, bgH);
          
          // テキストの描画
          ctx.fillStyle = ann.color;
          ctx.textBaseline = 'middle';
          ctx.fillText(ann.content, ann.x, ann.y);
        }
      });
      onSave(canvas.toDataURL('image/jpeg'));
    };
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.98)', zIndex: 20000, display: 'flex', flexDirection: 'column', padding: '20px' }}>
      {/* ヘッダー */}
      <div style={{ alignSelf: 'center', backgroundColor: '#1e293b', padding: '12px 32px', borderRadius: '24px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <button onClick={() => { setMode('rect'); setPoints([]); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: mode === 'rect' ? '#ef4444' : 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '14px' }}>
          <Square size={20} /> 図形
        </button>
        <button onClick={() => { setMode('text'); setPoints([]); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: mode === 'text' ? '#ef4444' : 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '14px' }}>
          <Type size={20} /> テキスト
        </button>
        <div style={{ width: '2px', height: '30px', backgroundColor: '#334155' }} />
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 24px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '950', cursor: 'pointer', fontSize: '14px' }}>
          <Save size={20} /> 保存して反映
        </button>
        <button onClick={onClose} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
        {/* 左側: 編集エリア */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div 
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', cursor: mode === 'text' ? 'text' : 'crosshair' }}
          >
            <img src={imageUrl} style={{ display: 'block', maxWidth: '100%', maxHeight: '75vh', pointerEvents: 'none' }} />
            
            <svg 
              viewBox={`0 0 ${imageSize.w || 1920} ${imageSize.h || 1080}`} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              {annotations.map(ann => (
                <g key={ann.id}>
                  {ann.type === 'rect' && (
                    <rect x={Math.min(ann.x1, ann.x2)} y={Math.min(ann.y1, ann.y2)} width={Math.abs(ann.x2 - ann.x1)} height={Math.abs(ann.y2 - ann.y1)} fill="none" stroke={ann.color} strokeWidth="5" />
                  )}
                  {ann.type === 'text' && (
                    <g>
                      <rect 
                        x={ann.x - 12} 
                        y={ann.y - 22} 
                        width={ann.content.length * 24 + 20} 
                        height="44" 
                        fill="rgba(255, 255, 255, 0.3)" 
                        rx="6"
                      />
                      <text x={ann.x} y={ann.y} fill={ann.color} fontSize="32" fontWeight="bold" dominantBaseline="middle">{ann.content}</text>
                    </g>
                  )}
                  {/* 画像上の削除ボタン */}
                  <circle 
                    cx={ann.type === 'rect' ? Math.max(ann.x1, ann.x2) : ann.x + 20} 
                    cy={ann.type === 'rect' ? Math.min(ann.y1, ann.y2) : ann.y - 20} 
                    r="15" fill="#ef4444" cursor="pointer" pointerEvents="auto"
                    onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id); }} 
                  />
                  <text 
                    x={ann.type === 'rect' ? Math.max(ann.x1, ann.x2) : ann.x + 20} 
                    y={ann.type === 'rect' ? Math.min(ann.y1, ann.y2) : ann.y - 20} 
                    fill="white" fontSize="20" textAnchor="middle" dominantBaseline="central" pointerEvents="none"
                  >×</text>
                </g>
              ))}

              {points.length === 1 && hoverPos && mode === 'rect' && (
                <rect 
                  x={Math.min(points[0].x, hoverPos.x)} y={Math.min(points[0].y, hoverPos.y)} 
                  width={Math.abs(hoverPos.x - points[0].x)} height={Math.abs(hoverPos.y - points[0].y)} 
                  fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 5" 
                />
              )}
            </svg>

            {typingPos && (
              <input
                autoFocus
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                onBlur={(e) => { if (!e.relatedTarget) finalizeText(); }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') { e.preventDefault(); finalizeText(); }
                  if (e.key === 'Escape') { setTypingPos(null); setTempText(''); }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: typingPos.viewX,
                  top: typingPos.viewY,
                  transform: 'translate(-12px, -50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(2px)',
                  border: '2px solid #ef4444',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '20px',
                  fontWeight: '900',
                  color: '#ef4444',
                  minWidth: '200px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  outline: 'none',
                  zIndex: 30000
                }}
                placeholder="ここに内容を入力..."
              />
            )}
          </div>
          
          <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '13px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 24px', borderRadius: '20px' }}>
            {mode === 'rect' ? (
              points.length === 0 ? '① クリックして始点を指定' : '② もう一度クリックして範囲を確定'
            ) : (
              '画像上の書き込みたい地点をクリックしてください'
            )}
          </div>
        </div>

        {/* 右側: 指摘リスト */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '900' }}>指摘事項一覧</h4>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>{annotations.length} 件</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {annotations.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569', textAlign: 'center' }}>
                <Edit3 size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <div style={{ fontSize: '13px', fontWeight: '700' }}>指摘事項がありません</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {annotations.map((ann, idx) => (
                  <div key={ann.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: ann.type === 'rect' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ann.type === 'rect' ? '#ef4444' : '#3b82f6' }}>
                        {ann.type === 'rect' ? <Square size={14} /> : <Type size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>#{idx + 1} {ann.type === 'rect' ? '図形' : 'テキスト'}</div>
                        <div style={{ fontSize: '13px', color: 'white', fontWeight: '700', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ann.type === 'rect' ? `範囲指定 (${Math.floor(ann.x1)}, ${Math.floor(ann.y1)})` : ann.content}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAnnotation(ann.id)} 
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px', borderRadius: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: BROADCASTER EXAM MODAL ---
const BroadcasterExamModal = ({ material, onClose, onSubmit, isProcessing }) => {
  const [comment, setComment] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // number or 'new'
  const [tempScreenshot, setTempScreenshot] = useState(null); // { url, time }
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const options = [
    { id: 'accepted', label: '受理', color: '#10b981' },
    { id: 'conditional', label: '条件付き受理', color: '#3b82f6' },
    { id: 'revision', label: '改稿', color: '#f59e0b' },
    { id: 'requestInfo', label: '資料請求', color: '#8b5cf6' },
    { id: 'rejected', label: '謝絶', color: '#ef4444' },
    { id: 'other', label: 'その他', color: '#64748b' }
  ];

  const toggleStatus = (id) => {
    setSelectedStatuses(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    video.pause();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // 同時に更新
    const time = video.currentTime;
    setTempScreenshot({ url: dataUrl, time });
    setEditingIndex('new');
  };

  const addScreenshot = (annotatedUrl) => {
    if (editingIndex === 'new') {
      const time = tempScreenshot.time;
      setScreenshots(prev => [...prev, { id: Date.now(), url: annotatedUrl, time }]);
      setComment(prev => prev + `\n[${Math.floor(time)}s付近の指摘]: `);
    } else {
      setScreenshots(prev => {
        const copy = [...prev];
        copy[editingIndex] = { ...copy[editingIndex], url: annotatedUrl };
        return copy;
      });
    }
    setEditingIndex(null);
    setTempScreenshot(null);
  };

  const removeScreenshot = (id) => setScreenshots(prev => prev.filter(s => s.id !== id));

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
      <div style={{ width: '1200px', height: '850px', backgroundColor: 'white', borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <header style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '950' }}>素材考査</h3><div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '700' }}>{material?.name} / {material?.sponsor}</div></div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X /></button>
        </header>
        
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左側: プレイヤー & スクショ管理 */}
          <div style={{ flex: '1.6', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {material?.videoUrl ? (
                <video ref={videoRef} src={material.videoUrl} controls style={{ width: '100%', maxHeight: '100%' }} />
              ) : (
                <div style={{ color: '#475569', textAlign: 'center' }}>
                  <Video size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>動画データが見つかりません</div>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            
            {/* スクショ一覧エリア */}
            <div style={{ height: '160px', backgroundColor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
              <button 
                onClick={takeScreenshot} 
                style={{ minWidth: '100px', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Camera size={20} />
                <span style={{ fontSize: '10px', fontWeight: '800' }}>撮影</span>
              </button>
              {screenshots.map((s, idx) => (
                <div key={s.id} style={{ position: 'relative', minWidth: '200px', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.2s' }} className="screenshot-card">
                  <img src={s.url} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setEditingIndex(idx)} />
                  <div 
                    onClick={(e) => { e.stopPropagation(); seekTo(s.time); }}
                    style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.9)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  >
                    <Play size={12} fill="white" /> {Math.floor(s.time)}s
                  </div>
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '4px' }}>
                    <button onClick={() => setEditingIndex(idx)} style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#1e293b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={12} /></button>
                    <button onClick={() => removeScreenshot(s.id)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 右側: 回答フォーム */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfdfe', padding: '32px', overflowY: 'auto' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#64748b', marginBottom: '16px', letterSpacing: '0.05em' }}>1. 考査回答 (複数選択可)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
                {options.map(opt => {
                  const isSel = selectedStatuses.includes(opt.id);
                  return (
                    <button 
                      key={opt.id} 
                      onClick={() => toggleStatus(opt.id)} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', 
                        border: '2.5px solid', 
                        borderColor: isSel ? opt.color : '#e2e8f0', 
                        backgroundColor: isSel ? `${opt.color}10` : 'white', 
                        color: isSel ? opt.color : '#64748b', 
                        fontWeight: '950', fontSize: '13px', transition: 'all 0.2s', textAlign: 'left', cursor: 'pointer' 
                      }}
                    >
                      <div style={{ 
                        width: '20px', height: '20px', borderRadius: '6px', 
                        border: '2px solid', 
                        borderColor: isSel ? opt.color : '#cbd5e1', 
                        backgroundColor: isSel ? opt.color : 'transparent', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        {isSel && <Check size={14} color="white" strokeWidth={4} />}
                      </div>
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#64748b', marginBottom: '8px', letterSpacing: '0.05em' }}>2. 考査コメント・修正指示</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="修正指示や承認理由を入力してください..." style={{ width: '100%', height: '220px', padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', backgroundColor: 'white', fontWeight: '700', fontSize: '14px', outline: 'none', resize: 'none', lineHeight: '1.6' }} />
              
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', marginBottom: '4px' }}><Info size={14} /><span style={{ fontSize: '11px', fontWeight: '900' }}>ヒント</span></div>
                <p style={{ fontSize: '11px', color: '#1e40af', margin: 0, fontWeight: '700', lineHeight: '1.4' }}>
                  撮影したスクショの<strong>秒数をクリック</strong>すると、動画の該当箇所へジャンプします。画像を直接クリックすると<strong>赤枠や文字を書き込めます</strong>。
                </p>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>キャンセル</button>
              <button 
                onClick={() => onSubmit(selectedStatuses, { comment, screenshots })} 
                disabled={isProcessing || selectedStatuses.length === 0} 
                style={{ 
                  flex: 2, padding: '14px', borderRadius: '16px', border: 'none', 
                  backgroundColor: selectedStatuses.length > 0 ? '#1e293b' : '#cbd5e1', 
                  color: 'white', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
                }}
              >
                {isProcessing ? '送信中...' : '考査結果を確定する'}
              </button>
            </div>
          </div>
        </div>
        {console.log('[UI:BroadcasterExamModal] Rendering editor check:', { editingIndex, hasTemp: !!tempScreenshot })}
        {editingIndex !== null && (
          <AnnotationEditor 
            imageUrl={editingIndex === 'new' ? tempScreenshot?.url : screenshots[editingIndex]?.url} 
            onSave={(newUrl) => addScreenshot(newUrl)} 
            onClose={() => { setEditingIndex(null); setTempScreenshot(null); }} 
          />
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const MaterialView = ({ role = 'agency' }) => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState({ sponsor: '', name: '', code: '', duration: '15', videoUrl: '', file: null });
  const [examResult, setExamResult] = useState({ comment: '', results: { accepted: false, conditional: false, revision: false, requestInfo: false, rejected: false } });
  const videoRef = useRef(null);

  const fetchMaterials = async () => {
    console.log('[UI:MaterialView] fetchMaterials started');
    setIsLoading(true);
    try { 
      const data = await api.getMaterials(); 
      console.log('[UI:MaterialView] getMaterials returned:', data);
      const materialsArray = Array.isArray(data) ? data : [];
      setMaterials(materialsArray); 
      
      // 開いている詳細モーダルのデータを更新
      if (selectedMaterial) {
        const updated = materialsArray.find(m => m.id === selectedMaterial.id);
        if (updated) setSelectedMaterial(updated);
      }
    } catch (error) { 
      console.error('[UI:MaterialView] Failed to fetch materials:', error); 
      setMaterials([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
    const channel = api.subscribeToMaterials(() => { fetchMaterials(); });
    return () => { if (channel && channel.unsubscribe) channel.unsubscribe(); };
  }, []);

  const handleSave = async () => {
    console.log('[UI:MaterialView] handleSave started', { editingId, formState });
    if (!formState.sponsor || !formState.name || !formState.code) {
      console.warn('[UI:MaterialView] Validation failed: missing fields');
      return alert('スポンサー名、素材名、10桁素材コードは必須です');
    }
    setIsProcessing(true);
    try {
      if (editingId) { 
        console.log('[UI:MaterialView] Updating material:', editingId);
        await api.updateMaterial(editingId, formState); 
        setSuccessMessage('素材を更新しました'); 
      } else { 
        console.log('[UI:MaterialView] Creating new material');
        await api.createMaterial(formState, formState.file); 
        setSuccessMessage('素材を新規登録しました'); 
      }
      console.log('[UI:MaterialView] Save successful, refreshing list...');
      setTimeout(() => setSuccessMessage(''), 3000);
      setFormState({ sponsor: '', name: '', code: '', duration: '15', videoUrl: '', file: null });
      setShowRegisterForm(false); 
      setEditingId(null); 
      await fetchMaterials();
    } catch (error) { 
      console.error('[UI:MaterialView] Save failed:', error);
      alert(`保存に失敗しました: ${error.message}`); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleEdit = (m) => {
    setFormState({ sponsor: m.sponsor || '', name: m.name || '', code: m.code || '', duration: m.duration || '15', videoUrl: m.videoUrl || '', file: null });
    setEditingId(m.id); setShowRegisterForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (m) => {
    setSelectedMaterial(m);
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    if (!selectedMaterial) return;
    setIsProcessing(true);
    try { 
      console.log('[UI:MaterialView] Executing delete for:', selectedMaterial.id);
      await api.deleteMaterial(selectedMaterial.id); 
      setSuccessMessage('素材を削除しました'); 
      setTimeout(() => setSuccessMessage(''), 3000); 
      setShowConfirmDelete(false);
      setSelectedMaterial(null);
      await fetchMaterials(); 
    } catch (error) { 
      console.error('[UI:MaterialView] Delete failed:', error);
      alert('削除に失敗しました'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleExamSubmit = async () => {
    setIsProcessing(true);
    try { await api.submitStationResponse(selectedMaterial.id, '自社', examResult); setSuccessMessage('回答を送信しました'); setTimeout(() => setSuccessMessage(''), 3000); setShowExamModal(false); fetchMaterials(); } 
    catch (error) { alert('送信失敗'); } finally { setIsProcessing(false); }
  };

  const filteredMaterials = (materials || []).filter(m => {
    const matchesSearch = (
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (m.sponsor || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (m.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // 放送局（broadcaster または station）の場合のフィルタリング
    if (role === 'broadcaster' || role === 'station') {
      // 依頼送信済み（requestedStationsが1つ以上ある）素材のみを表示
      const hasRequests = Array.isArray(m.requestedStations) && m.requestedStations.length > 0;
      const isVisible = matchesSearch && hasRequests;
      
      if (isVisible) {
        console.log(`[UI:MaterialView] Broadcaster item visible: ${m.name} (Requests: ${m.requestedStations.length})`);
      }
      return isVisible;
    }
    
    return matchesSearch;
  });

  console.log(`[UI:MaterialView] Role: ${role}, Total: ${materials.length}, Filtered: ${filteredMaterials.length}`);

  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '900', color: '#1e293b', marginBottom: '0.5rem' }}>素材考査</h2>
          <p style={{ color: '#64748b', fontWeight: '500' }}>{isLoading ? 'データを読み込み中...' : '素材一覧を表示しています。'}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {successMessage && <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 20px', borderRadius: '12px', fontWeight: '800' }}>{successMessage}</div>}
          {role === 'agency' && (
            <button 
              onClick={() => {
                if(showRegisterForm) {
                  setEditingId(null);
                  setFormState({sponsor:'', name:'', code:'', duration:'15', videoUrl:'', file: null});
                }
                setShowRegisterForm(!showRegisterForm);
              }} 
              style={{ padding: '0.875rem 1.5rem', borderRadius: '14px', fontWeight: '800', backgroundColor: showRegisterForm ? '#64748b' : 'var(--tacos-red)', color: 'white', border: 'none' }}
            >
              {showRegisterForm ? '閉じる' : '新規登録'}
            </button>
          )}
        </div>
      </header>
      
      {showRegisterForm && (
        <div className="animate-fade" style={{ marginBottom: '24px', padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#1e293b', margin: 0 }}>{editingId ? '素材情報の編集' : '新規素材の登録'}</h3>
            <button onClick={() => setShowRegisterForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1行目: スポンサー名, 素材名, 10桁素材コード, 尺 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '6px' }}>スポンサー名</label>
                <input type="text" value={formState.sponsor} onChange={e => setFormState({ ...formState, sponsor: e.target.value })} placeholder="サントリー" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', fontWeight: '700', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '6px' }}>素材名</label>
                <input type="text" value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} placeholder="プレモル 2026夏CM" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', fontWeight: '700', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '6px' }}>10桁素材コード</label>
                <input type="text" value={formState.code} onChange={e => setFormState({ ...formState, code: e.target.value })} placeholder="SNT0001ABC" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', fontWeight: '700', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '6px' }}>尺</label>
                <select value={formState.duration} onChange={e => setFormState({ ...formState, duration: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', fontWeight: '700', fontSize: '13px' }}>
                  <option value="15">15秒</option>
                  <option value="30">30秒</option>
                  <option value="60">60秒</option>
                </select>
              </div>
            </div>

            {/* 2行目: URL, アップロード, 登録ボタン */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '6px' }}>動画URL</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={formState.videoUrl} onChange={e => setFormState({ ...formState, videoUrl: e.target.value })} placeholder="URLを入力、または右からファイルをアップロード" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #f1f5f9', backgroundColor: '#fcfdfe', fontWeight: '700', fontSize: '13px', paddingRight: '40px' }} />
                  <Upload size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const blobUrl = URL.createObjectURL(file);
                      setFormState({ ...formState, videoUrl: blobUrl, file: file });
                    }
                  };
                  input.click();
                }}
                style={{ height: '40px', padding: '0 20px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '800', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Upload size={14} /> ファイル選択
              </button>

              <button onClick={handleSave} disabled={isProcessing} style={{ height: '40px', padding: '0 40px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', fontWeight: '900', fontSize: '14px', boxShadow: '0 4px 12px rgba(230,0,18,0.15)', cursor: 'pointer' }}>
                {isProcessing ? '処理中...' : editingId ? '変更を保存' : '素材を登録'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>CM素材</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>10桁コード</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>尺</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>考査状況</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>詳細</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>考査〆切</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'right' }}>操作</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'right' }}>削除</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map(m => {
              const reqCount = (m.requestedStations || []).length; 
              const revCount = Object.keys(m.reviewedStations || {}).length;
              const deadline = m.metadata?.deadline || '-';
              
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f8fafc' }} className="hover-row">
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => setPreviewMaterial(m)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Play size={14} fill="currentColor" />
                      </button>
                      <div>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{m.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{m.sponsor}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: '#475569', fontSize: '13px' }}>{m.code}</td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>{m.duration}s</td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {role === 'agency' ? (
                        <button 
                          onClick={() => { setSelectedMaterial(m); setShowDetailModal(true); }}
                          style={{ 
                            padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '950', cursor: 'pointer',
                            backgroundColor: reqCount > 0 ? (revCount === reqCount ? '#f0fdf4' : '#fff7ed') : '#f1f5f9',
                            color: reqCount > 0 ? (revCount === reqCount ? '#166534' : '#9a3412') : '#64748b',
                            border: reqCount > 0 ? (revCount === reqCount ? '1px solid #bbf7d0' : '1px solid #ffedd5') : '1px solid #e2e8f0',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {reqCount > 0 ? `回答数 ${revCount} / 依頼局数 ${reqCount}` : '未依頼'}
                        </button>
                      ) : (
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '950',
                          backgroundColor: (m.reviewedStations['EX系'] || m.reviewedStations['自社']) ? '#f0fdf4' : '#fff7ed',
                          color: (m.reviewedStations['EX系'] || m.reviewedStations['自社']) ? '#166534' : '#9a3412',
                          border: (m.reviewedStations['EX系'] || m.reviewedStations['自社']) ? '1px solid #bbf7d0' : '1px solid #ffedd5'
                        }}>
                          {(m.reviewedStations['EX系'] || m.reviewedStations['自社']) ? '回答済' : '未回答'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => { setSelectedMaterial(m); setShowDetailModal(true); }}
                      disabled={reqCount === 0 && role === 'agency'}
                      style={{ background: 'none', border: 'none', color: (reqCount > 0 || role !== 'agency') ? '#0ea5e9' : '#cbd5e1', cursor: 'pointer', fontWeight: '800', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FileText size={14} /> 回答状況
                    </button>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: '700', color: '#ef4444', fontSize: '12px' }}>{deadline}</td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {role === 'agency' ? (
                        <>
                          <button 
                            onClick={() => { setSelectedMaterial(m); setShowExamModal(true); }} 
                            style={{ 
                              padding: '6px 14px', borderRadius: '10px', border: 'none', 
                              backgroundColor: 'var(--tacos-red)', color: 'white', 
                              cursor: 'pointer', fontWeight: '900', fontSize: '12px',
                              display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <Send size={14} /> 考査依頼
                          </button>
                          <button onClick={() => handleEdit(m)} title="編集" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit size={14} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { setSelectedMaterial(m); setShowExamModal(true); }} 
                          style={{ 
                            padding: '6px 14px', borderRadius: '10px', border: 'none', 
                            backgroundColor: '#1e293b', color: 'white', 
                            cursor: 'pointer', fontWeight: '900', fontSize: '12px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <CheckCircle size={14} /> 考査する
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    {role === 'agency' && (
                      <button onClick={() => handleDeleteClick(m)} title="削除" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fff5f5', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 0 auto' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && filteredMaterials.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>データがありません。</div>}
      </div>

      {showExamModal && selectedMaterial && (
        role === 'agency' ? (
          <RequestExamModal 
            material={selectedMaterial} 
            onClose={() => setShowExamModal(false)} 
            onSend={async (stations, deadline) => {
              setIsProcessing(true);
              try {
                await api.requestMaterialExam(selectedMaterial.id, stations, deadline);
                setSuccessMessage('考査依頼を送信しました');
                setTimeout(() => setSuccessMessage(''), 3000);
                setShowExamModal(false);
                fetchMaterials();
              } catch (e) {
                alert('送信に失敗しました');
              } finally {
                setIsProcessing(false);
              }
            }} 
          />
        ) : (
          <BroadcasterExamModal 
            material={selectedMaterial} 
            onClose={() => setShowExamModal(false)}
            isProcessing={isProcessing}
            onSubmit={async (statuses, results) => {
              setIsProcessing(true);
              try {
                // デモ用に 'EX系' として回答を保存（依頼された名前に合わせる）
                const stationId = selectedMaterial.requestedStations?.[0] || 'EX系';
                await api.submitStationResponse(selectedMaterial.id, stationId, { 
                  comment: results.comment, 
                  selectedStatuses: statuses,
                  screenshots: results.screenshots,
                  results: { 
                    accepted: statuses.includes('accepted'), 
                    revision: statuses.includes('revision'), 
                    rejected: statuses.includes('rejected'),
                    conditional: statuses.includes('conditional'),
                    requestInfo: statuses.includes('requestInfo')
                  } 
                });
                setSuccessMessage('回答を送信しました');
                setTimeout(() => setSuccessMessage(''), 3000);
                setShowExamModal(false);
                fetchMaterials();
              } catch (e) {
                alert('回答の送信に失敗しました');
              } finally {
                setIsProcessing(false);
              }
            }}
          />
        )
      )}
      {showDetailModal && selectedMaterial && (
        <MaterialDetailModal 
          material={selectedMaterial} 
          onClose={() => setShowDetailModal(false)} 
          role={role}
          onReAnswer={(res) => {
            if (res === 'success') {
              setSuccessMessage('回答を送付しました');
              fetchMaterials();
              setTimeout(() => setSuccessMessage(''), 3000);
            } else {
              setShowDetailModal(false);
              setShowExamModal(true);
            }
          }}
        />
      )}
      {previewMaterial && (<div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 }} onClick={() => setPreviewMaterial(null)}><div style={{ width: '90%', maxWidth: '1100px', backgroundColor: '#000', borderRadius: '32px', overflow: 'hidden' }}>{previewMaterial.videoUrl && <video src={previewMaterial.videoUrl} controls autoPlay style={{ width: '100%' }} />}</div></div>)}
      {showConfirmDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '20px' }}>
          <div style={{ width: '400px', backgroundColor: 'white', borderRadius: '24px', padding: '32px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '950', marginBottom: '12px' }}>素材を削除しますか？</h3>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', marginBottom: '32px', lineHeight: '1.6' }}>
              素材「<span style={{ color: '#1e293b' }}>{selectedMaterial?.name}</span>」を削除します。この操作は取り消せません。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowConfirmDelete(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>キャンセル</button>
              <button onClick={executeDelete} disabled={isProcessing} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>
                {isProcessing ? '処理中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialView;
