import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Icons } from './IconLibrary';
import PuddingView from './PuddingView';
import StationResponseView from './StationResponseView';
import UrlSlotIssuanceDemo from './UrlSlotIssuanceDemo';
import UrlMaterialRewriteDemo from './UrlMaterialRewriteDemo';
import UrlRecordingUploadDemo from './UrlRecordingUploadDemo';

const UrlManagementView = ({ onTabChange, setRole }) => {
  const [activePreview, setActivePreview] = useState(null);
  const [sentUrls, setSentUrls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [broadcasters, setBroadcasters] = useState([]);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedUrlType, setSelectedUrlType] = useState('slots');
  const [isLoading, setIsLoading] = useState(false);
  const [systemConfig, setSystemConfig] = useState({
    defaultAiModel: 'Claude 3.5 Sonnet',
    defaultTtsEngine: 'OpenAI TTS',
    aiTemperature: 0.7
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [config, urls, projs, bcs] = await Promise.all([
        api.getSystemConfig(),
        api.getSentUrls(),
        api.getProjects(),
        api.getBroadcasters()
      ]);
      
      if (config && Object.keys(config).length > 0) setSystemConfig(config);
      setSentUrls(urls || []);
      setProjects(projs || []);
      setBroadcasters(bcs || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProjectId || !selectedStation) return;
    setIsLoading(true);
    const newUrl = await api.generateSentUrl(selectedProjectId, selectedStation, selectedUrlType);
    if (newUrl) {
      setSentUrls([...sentUrls, newUrl]);
      setShowGenModal(false);
      setSelectedProjectId('');
      setSelectedStation('');
    }
    setIsLoading(false);
  };

  const handleDeleteUrl = async (id) => {
    if (!window.confirm('このURLを無効化してもよろしいですか？')) return;
    const success = await api.deleteSentUrl(id);
    if (success) {
      setSentUrls(sentUrls.filter(u => u.id !== id));
    }
  };

  const handleSaveConfig = async () => {
    const success = await api.updateSystemConfig(systemConfig);
    if (success) {
       alert('システム設定を保存しました。');
    }
  };

  const links = [
    {
      id: 'slots-base',
      label: '枠出し画面ベース',
      desc: '放送局が枠情報を入力・提示する画面のベース',
      icon: <Icons.Clock />,
      color: '#e7f5ff',
      iconColor: '#1971c2',
      targetRole: 'broadcaster'
    },
    {
      id: 'materials-base',
      label: '素材DLリライトUP画面ベース',
      desc: '素材のダウンロードおよびリライト稿のアップロード画面のベース',
      icon: <Icons.FileText />,
      color: '#fff9db',
      iconColor: '#f59f00',
      targetRole: 'agency'
    },
    {
      id: 'recordings-base',
      label: '同録UP画面ベース',
      desc: '放送後の同録ファイルをアップロードする画面のベース',
      icon: <Icons.Monitor />,
      color: '#eef2ff',
      iconColor: '#4338ca',
      targetRole: 'broadcaster'
    }
  ];

  const handleOpenPreview = (linkId, targetRole) => {
    setActivePreview(linkId);
  };

  const handleBackToUrlManagement = () => {
    setActivePreview(null);
  };

  if (activePreview) {
    return (
      <div className="animate-fade" style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Top bar for returning back to URL management view */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '12px 24px',
          borderRadius: '16px',
          border: '2px solid #eef1f6',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleBackToUrlManagement}
              style={{
                backgroundColor: '#f1f3f5',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '14px',
                color: '#495057',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e9ecef'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f1f3f5'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              ← 送付URL管理画面に戻る
            </button>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '800' }}>
              |
            </span>
            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '800' }}>
              {links.find(l => l.id === activePreview)?.label} プレビュー表示中
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
            ※実際にURLを受け取った相手の画面表示ベースとなります
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '2px solid #eef1f6', padding: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.02)' }}>
          {activePreview === 'slots-base' && (() => {
             const latestProj = projects.find(p => p.status === 'requesting' || p.status === 'slots') || projects[0];
             const projId = latestProj?.id;
             const station = latestProj?.metadata?.selectedStations?.[0] || '札幌テレビ';
             return <UrlSlotIssuanceDemo projectId={projId} stationName={station} />;
          })()}
          {activePreview === 'materials-base' && <UrlMaterialRewriteDemo />}
          {activePreview === 'recordings-base' && <UrlRecordingUploadDemo />}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#2b2d42', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff5cc', color: '#f59f00' }}>
            <Icons.Link />
          </span>
          送付URL管理画面
        </h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>
          発行された送付URLからアクセスされる各画面のベースへ遷移し、表示内容を確認することができます。
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {links.map((link) => (
          <div 
            key={link.id}
            onClick={() => handleOpenPreview(link.id, link.targetRole)}
            style={{ 
              backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '2px solid #eef1f6', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = link.iconColor; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#eef1f6'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.02)'; }}
          >
             <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: link.color, color: link.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {link.icon}
             </div>
             <div>
                <h3 style={{ fontSize: '16px', fontWeight: '950', color: '#1e293b', marginBottom: '4px' }}>{link.label}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{link.desc}</p>
             </div>
             <div style={{ alignSelf: 'flex-end', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '950', color: link.iconColor }}>
                プレビューを表示する →
             </div>
          </div>
        ))}
      </div>

      {/* Real Sent URL List */}
      <section style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '2px solid #eef1f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Link size={20} color="#f59f00" /> 発行済み送付URL一覧
          </h3>
          <button 
            onClick={() => setShowGenModal(true)}
            style={{ padding: '12px 24px', borderRadius: '14px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontWeight: '950', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Icons.Plus size={18} /> 新規URL発行
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '950' }}>対象案件</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '950' }}>放送局</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '950' }}>画面タイプ</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '950' }}>URL / スラグ</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '950' }}>有効期限</th>
                <th style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '950' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sentUrls.map((url) => {
                const project = projects.find(p => p.id === url.projectId);
                return (
                  <tr key={url.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{project?.name || '不明な案件'}</td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{url.stationName}</td>
                    <td style={{ padding: '16px' }}>
                       <span style={{ fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '8px', backgroundColor: url.type === 'slots' ? '#e7f5ff' : url.type === 'materials' ? '#fff9db' : '#eef2ff', color: url.type === 'slots' ? '#1971c2' : url.type === 'materials' ? '#f59f00' : '#4338ca' }}>
                          {url.type === 'slots' ? '枠出し' : url.type === 'materials' ? '素材/リライト' : '同録UP'}
                       </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>
                       pudding.io/s/{url.slug}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>
                       {new Date(url.expiresAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                       <button 
                        onClick={() => handleDeleteUrl(url.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                       >
                          <Icons.Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {sentUrls.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>発行済みのURLはありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* URL Generation Modal */}
      {showGenModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
           <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#1e293b', marginBottom: '24px' }}>送付URLの新規発行</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '12px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '8px' }}>対象案件</label>
                    <select 
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '800' }}
                    >
                       <option value="">案件を選択してください</option>
                       {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>

                 <div>
                    <label style={{ fontSize: '12px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '8px' }}>対象放送局</label>
                    <select 
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '800' }}
                    >
                       <option value="">放送局を選択してください</option>
                       {broadcasters.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                 </div>

                 <div>
                    <label style={{ fontSize: '12px', fontWeight: '950', color: '#64748b', display: 'block', marginBottom: '8px' }}>画面タイプ</label>
                    <select 
                      value={selectedUrlType}
                      onChange={(e) => setSelectedUrlType(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '800' }}
                    >
                       <option value="slots">枠出し登録画面</option>
                       <option value="materials">素材DL/リライトUP画面</option>
                       <option value="recordings">同録UP画面</option>
                    </select>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                 <button 
                  onClick={() => setShowGenModal(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '950', cursor: 'pointer' }}
                 >
                   キャンセル
                 </button>
                 <button 
                  onClick={handleGenerate}
                  disabled={!selectedProjectId || !selectedStation || isLoading}
                  style={{ flex: 2, padding: '14px', borderRadius: '12px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontWeight: '950', cursor: 'pointer', opacity: (selectedProjectId && selectedStation) ? 1 : 0.5 }}
                 >
                   {isLoading ? '発行中...' : 'URLを発行する'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Settings section for AI system settings */}
      <section style={{ marginTop: '64px', borderTop: '2px solid #f1f5f9', paddingTop: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f8f9fa', color: '#3E2723' }}>
            <Icons.Settings size={18} />
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#1e293b', margin: 0 }}>AIリライト/ナレッジ設定</h3>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '2px solid #eef1f6' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '950', color: '#3E2723' }}>デフォルトAIモデル</label>
                <select 
                  value={systemConfig.defaultAiModel}
                  onChange={(e) => setSystemConfig({ ...systemConfig, defaultAiModel: e.target.value })}
                  style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #F1E4C9', outline: 'none', backgroundColor: '#fcfcfc', fontSize: '14px', fontWeight: '800' }}
                >
                  <option>Claude 3.5 Sonnet</option>
                  <option>GPT-4o</option>
                  <option>Gemini 1.5 Pro</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '950', color: '#3E2723' }}>デフォルト読み上げAI</label>
                <select 
                  value={systemConfig.defaultTtsEngine}
                  onChange={(e) => setSystemConfig({ ...systemConfig, defaultTtsEngine: e.target.value })}
                  style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #F1E4C9', outline: 'none', backgroundColor: '#fcfcfc', fontSize: '14px', fontWeight: '800' }}
                >
                  <option>OpenAI TTS</option>
                  <option>ElevenLabs</option>
                  <option>Google Cloud TTS</option>
                </select>
              </div>
           </div>
           
           <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSaveConfig}
                style={{ padding: '12px 32px', borderRadius: '14px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontWeight: '950', cursor: 'pointer', boxShadow: '0 8px 20px rgba(62,39,35,0.15)' }}
              >
                システム設定を保存
              </button>
           </div>
        </div>
      </section>

      <footer style={{ marginTop: '64px', textAlign: 'center', paddingBottom: '32px' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
          Powered by Pudding Admin Console
        </p>
      </footer>
    </div>
  );
};

export default UrlManagementView;
