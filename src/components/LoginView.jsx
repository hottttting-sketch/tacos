import React, { useState } from 'react';
import { api } from '../utils/api';
import { 
  Users, Building2, Building, Shield, Mail, Lock, 
  UserPlus, LogIn, ChevronRight, User 
} from 'lucide-react';
import { TacosLogo, PuddingLogo, TempraLogo } from './BrandLogos';

const LoginView = ({ setSession, setRole, setIsAdmin, setUsername, setCompany, setBroadcasterName, setFullProfile }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [selectedRole, setSelectedRole] = useState('agency');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const topBrands = [
    { label: 'タコス', color: '#E21C26', component: <TacosLogo size={24} /> },
    { label: 'ぷりん', color: '#FFD93D', component: <PuddingLogo size={24} /> },
    { label: 'てんぷら', color: '#FFB74D', component: <TempraLogo size={24} /> }
  ];

  const roles = [
    { id: 'agency', label: '代理店', icon: <Users size={20} />, color: '#0ea5e9' },
    { id: 'station', label: '放送局', icon: <Building2 size={20} />, color: '#f59e0b' },
    { id: 'admin', label: '管理者', icon: <Shield size={20} />, color: '#8b5cf6' }
  ];

  const handleAction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const data = await api.login(email, password);
        if (data?.session) {
          try {
            const profile = await api.getProfileByEmail(email);
            if (profile) {
              setFullProfile(profile);
              setRole(profile.role);
              if (profile.role === 'admin') setIsAdmin?.(true);
              setUsername(profile.name || email.split('@')[0]);
              setCompany(profile.company_name || '');
              setBroadcasterName(profile.broadcaster_name || '');
            } else {
              // No profile found - use defaults so user can still log in
              setRole('admin');
              setIsAdmin?.(true);
              setUsername(email.split('@')[0]);
            }
          } catch (profileErr) {
            console.warn('Profile fetch failed, using defaults:', profileErr);
            setRole('admin');
            setIsAdmin?.(true);
            setUsername(email.split('@')[0]);
          }
          // Always set session if auth succeeded
          setSession(data.session);
        }
      } else {
        // Signup logic would go here, currently just alerting
        alert('新規登録リクエストを送信しました。管理者の承認をお待ちください。');
        setMode('login');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (err.message?.includes('JSON object requested, multiple (or no) rows returned')) {
        setError('ユーザープロファイルが見つかりません。管理者に連絡してください。');
      } else {
        setError(mode === 'login' ? 'ログインに失敗しました。' : 'アカウント作成に失敗しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFDEB', // Cream background from image
      fontFamily: "'Inter', 'sans-serif'",
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        borderRadius: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        {/* Top Brands Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {topBrands.map(b => (
            <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: `1.5px solid ${b.color}22`
              }}>{b.component}</div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#666' }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#333', marginBottom: '0.25rem' }}>
            {mode === 'login' ? 'テレビ営業支援プラットフォーム' : 'タコス'}
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {mode === 'login' ? 'TV Sales Enablement Platform' : '新規アカウント作成'}
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '1rem 0.5rem',
                borderRadius: '16px',
                border: selectedRole === r.id ? `2px solid ${r.color}` : '1.5px solid #f0f0f0',
                backgroundColor: selectedRole === r.id ? `${r.color}08` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: r.color
              }}
            >
              <div style={{ 
                color: selectedRole === r.id ? r.color : '#cbd5e1',
                transition: 'color 0.2s'
              }}>{r.icon}</div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: selectedRole === r.id ? r.color : '#94a3b8' }}>
                {r.label}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleAction} style={{ textAlign: 'left' }}>
          {mode === 'signup' && (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>氏名</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="田中 太郎"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #f0f0f0', outline: 'none', fontSize: '0.875rem' }} 
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>会社・組織名</label>
                <input 
                  type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="株式会社〇〇"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #f0f0f0', outline: 'none', fontSize: '0.875rem' }} 
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>メールアドレス</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@tacos.jp"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #f0f0f0', outline: 'none', fontSize: '0.875rem' }} 
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>パスワード</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '8文字以上の英数字' : '••••••••'}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #f0f0f0', outline: 'none', fontSize: '0.875rem' }} 
            />
          </div>

          {error && <div style={{ color: '#E21C26', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <button 
            type="submit"
            style={{
              width: '100%', padding: '0.9rem', backgroundColor: '#E21C26', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            {mode === 'login' ? 'ログインする' : 'アカウントを作成する'}
          </button>

          {mode === 'login' ? (
            <button 
              type="button"
              onClick={() => setMode('signup')}
              style={{
                width: '100%', padding: '0.9rem', backgroundColor: 'white', color: '#00B06B',
                border: '2px solid #00B06B', borderRadius: '12px', fontWeight: '800', cursor: 'pointer'
              }}
            >
              新規アカウントを作成する
            </button>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>既にアカウントをお持ちの方、は</span>
              <button 
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#E21C26', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ログイン
              </button>
            </div>
          )}
        </form>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', textAlign: 'left', opacity: 0.4 }}>
           <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>OS</div>
              <div style={{ fontSize: '0.5rem' }}>Windows 10/11<br/>macOS Monterey 以降</div>
           </div>
           <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>ブラウザ</div>
              <div style={{ fontSize: '0.5rem' }}>Chrome 最新版 (推奨)<br/>Edge, Safari 最新版</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
