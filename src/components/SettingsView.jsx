import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User, Mail, Building, Briefcase } from 'lucide-react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';

const DEFAULT_NOTIFICATIONS = [
  { id: 'email', title: 'メール通知', desc: '重要な更新情報をメールで受信します', current: true },
  { id: 'push', title: 'プッシュ通知', desc: 'ブラウザ通知でリアルタイムに把握します', current: false },
  { id: 'estimate', title: '見積依頼・回答の通知', desc: '新規の見積依頼や回答があった際に通知します', current: true },
  { id: 'deadline', title: '〆切アラート', desc: '〆切の24時間前と3時間前に通知します', current: true }
];

const SettingsView = ({ fullProfile, setFullProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: fullProfile?.name || '',
    department: fullProfile?.department || ''
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (fullProfile?.metadata?.notifications) {
      setNotifications(fullProfile.metadata.notifications);
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  }, [fullProfile]);

  const isStation = fullProfile?.role === 'broadcaster' || fullProfile?.role === 'station';
  const orgName = isStation ? fullProfile?.broadcaster_name : fullProfile?.company_name;

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(fullProfile.id, {
        name: formData.name,
        department: formData.department
      });
      setFullProfile(updated);
      setIsEditing(false);
      alert('プロフィールを更新しました。');
    } catch (err) {
      alert('エラーが発生しました: ' + err.message);
    }
  };

  const sections = [
    { title: '基本的な使い方', icon: <Icons.Dashboard />, items: ['ログインと初期設定', 'ダッシュボードの見方', '通知・設定の変更'] },
    { title: 'パブリシティ依頼', icon: <Icons.Plus />, items: ['新規依頼の作成手順', '期間・パブ種別の選択', '共有者の個別設定'] },
    { title: '案件進行・素材管理', icon: <Icons.Board />, items: ['案件ボードの活用方法', '素材搬入予定日の管理', '同録データの確認・DL'] },
    { title: '高度な機能・AI', icon: <Icons.Zap />, items: ['AIリライト・学習設定', 'AIナレーションの一括生成', 'スプレッドシート自動連携'] },
  ];

  return (
    <div className="animate-fade" style={{ padding: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#1e293b', margin: 0 }}>設定・マニュアル</h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '14px', fontWeight: '800' }}>各種設定およびプラットフォームの利用ガイドです。</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        <button
          onClick={() => setActiveSubTab('account')}
          style={{
            padding: '1rem', borderRadius: '16px', border: activeSubTab === 'account' ? '2px solid var(--tacos-red)' : '1.5px solid #cbd5e1',
            backgroundColor: activeSubTab === 'account' ? 'white' : '#f8fafc',
            color: activeSubTab === 'account' ? 'var(--tacos-red)' : '#64748b',
            fontWeight: '900', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', outline: 'none'
          }}
        >
          👤 アカウント設定
        </button>
        <button
          onClick={() => setActiveSubTab('notification')}
          style={{
            padding: '1rem', borderRadius: '16px', border: activeSubTab === 'notification' ? '2px solid var(--tacos-red)' : '1.5px solid #cbd5e1',
            backgroundColor: activeSubTab === 'notification' ? 'white' : '#f8fafc',
            color: activeSubTab === 'notification' ? 'var(--tacos-red)' : '#64748b',
            fontWeight: '900', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', outline: 'none'
          }}
        >
          🔔 通知設定
        </button>
        <button
          onClick={() => setActiveSubTab('manual')}
          style={{
            padding: '1rem', borderRadius: '16px', border: activeSubTab === 'manual' ? '2px solid var(--tacos-red)' : '1.5px solid #cbd5e1',
            backgroundColor: activeSubTab === 'manual' ? 'white' : '#f8fafc',
            color: activeSubTab === 'manual' ? 'var(--tacos-red)' : '#64748b',
            fontWeight: '900', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', outline: 'none'
          }}
        >
          📖 マニュアル
        </button>
      </div>

      {activeSubTab === 'account' && (
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '950', marginBottom: '1.5rem', color: '#1e293b' }}>アカウント詳細</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '13px', fontWeight: '800', marginBottom: '0.5rem' }}>
                <Building size={16} /> 組織名
              </label>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800', padding: '0.5rem 0' }}>
                {orgName || '未設定'}
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '13px', fontWeight: '800', marginBottom: '0.5rem' }}>
                <Mail size={16} /> メールアドレス
              </label>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800', padding: '0.5rem 0' }}>
                {fullProfile?.email || '未設定'}
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '13px', fontWeight: '800', marginBottom: '0.5rem' }}>
                <User size={16} /> 氏名
              </label>
              {isEditing ? (
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', outline: 'none', fontSize: '14px', fontWeight: '800' }}
                />
              ) : (
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800', padding: '0.5rem 0' }}>
                  {fullProfile?.name || '未設定'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '13px', fontWeight: '800', marginBottom: '0.5rem' }}>
                <Briefcase size={16} /> 部署・役職
              </label>
              {isEditing ? (
                <input 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', outline: 'none', fontSize: '14px', fontWeight: '800' }}
                />
              ) : (
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800', padding: '0.5rem 0' }}>
                  {fullProfile?.department || '未設定'}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} style={{ padding: '12px 28px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '900' }}>キャンセル</button>
                <button onClick={handleSave} style={{ padding: '12px 28px', background: 'var(--tacos-red)', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '900' }}>保存する</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} style={{ padding: '12px 28px', background: '#1e293b', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '900' }}>編集する</button>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'notification' && (
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '950', marginBottom: '1.5rem', color: '#1e293b' }}>通知設定一覧</h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            {notifications.map(notif => (
              <div key={notif.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f8fafc' }}>
                <div>
                  <div style={{ fontWeight: '950', color: '#1e293b', fontSize: '16px' }}>{notif.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>{notif.desc}</div>
                </div>
                <div 
                  style={{ 
                    width: '48px', height: '26px', backgroundColor: notif.current ? 'var(--tacos-red)' : '#e2e8f0',
                    borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onClick={async () => {
                    const updated = notifications.map(n => n.id === notif.id ? { ...n, current: !n.current } : n);
                    setNotifications(updated);
                    if (fullProfile?.id) {
                      try {
                        const updatedProfile = await api.updateProfile(fullProfile.id, {
                          metadata: {
                            ...fullProfile.metadata,
                            notifications: updated
                          }
                        });
                        setFullProfile(updatedProfile);
                      } catch (err) {
                        console.warn('Failed to sync notifications to profile:', err);
                      }
                    }
                  }}
                >
                  <div style={{ 
                    width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
                    position: 'absolute', top: '3px', left: notif.current ? '25px' : '3px',
                    transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button className="btn-secondary" style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: '900' }}>通知をテスト送信</button>
          </div>
        </div>
      )}

      {activeSubTab === 'manual' && (
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '950', marginBottom: '1.5rem', color: '#1e293b' }}>操作ガイド・マニュアル</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {sections.map((section, i) => (
              <div key={i} style={{ 
                padding: '2rem', borderRadius: '20px', border: '1.5px solid #f1eef8', 
                backgroundColor: 'white', transition: 'transform 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  <IconWrapper size={44} color="#f8fafc" iconColor="#1e293b">{section.icon}</IconWrapper>
                  <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#1e293b', margin: 0 }}>{section.title}</h4>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ 
                      padding: '10px 0', borderBottom: j === section.items.length - 1 ? 'none' : '1px solid #f1f5f9',
                      color: '#475569', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <Icons.Check size={14} style={{ color: 'var(--tacos-red)' }} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
