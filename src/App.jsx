import React, { useState, useEffect, Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fffcfc', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#fff5f5', color: '#fa5252', padding: '1.5rem', borderRadius: '24px', maxWidth: '600px', width: '100%', boxShadow: '0 15px 35px rgba(250, 82, 82, 0.15)', border: '1.5px solid #ffc9c9' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>表示エラーが発生しました</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: '600' }}>申し訳ありません。予期せぬエラーが発生しました。最新のデータを再読み込みするか、キャッシュをクリアして再試行してください。</p>
            
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: '#adb5bd', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Error Details</label>
              <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'monospace' }}>
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{ flex: 1, padding: '12px', background: '#fa5252', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 16px rgba(250, 82, 82, 0.2)' }}
              >
                再読み込み
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }} 
                style={{ flex: 1, padding: '12px', background: 'white', color: '#fa5252', border: '1.5px solid #fa5252', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
              >
                キャッシュクリア
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import SettingsView from './components/SettingsView';
import NewEstimateView from './components/NewEstimateView';
import StationResponseView from './components/StationResponseView';
import EventHearingView from './components/EventHearingView';
import TimeEstimateView from './components/TimeEstimateView';
import OnSaleNowView from './components/OnSaleNowView';
import TimeSlotRegView from './components/TimeSlotRegView';
import EventRegView from './components/EventRegView';
import ProposalSendView from './components/ProposalSendView';
import DashboardView from './components/DashboardView';
import PuddingView from './components/PuddingView';
import TempraView from './components/TempraView';
import ProjectsView from './components/ProjectsView';
import RevenueView from './components/RevenueView';
import ExternalIntegrationView from './components/ExternalIntegrationView';
import RevisionsView from './components/RevisionsView';
import OrdersView from './components/OrdersView';
import TransferView from './components/TransferView';
import MaterialView from './components/MaterialView';
import UserManagementView from './components/UserManagementView';
import ChatView from './components/ChatView';
import ManualView from './components/ManualView';
import UpdateRequestView from './components/UpdateRequestView';
import UrlManagementView from './components/UrlManagementView';
import { api } from './utils/api';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [broadcasterName, setBroadcasterName] = useState('');
  const [fullProfile, setFullProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChannel, setActiveChannel] = useState(null);
  const [currentApp, setCurrentApp] = useState('tacos');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [badgeCounts, setBadgeCounts] = useState({
    requestCount: 0,
    orderCount: 0,
    transferCount: 0,
    examCount: 0,
    broadcastMaterialCount: 0
  });

  async function restoreSession() {
    try {
      const activeSession = await api.getCurrentSession();
      if (activeSession) {
        const email = activeSession.user?.email;
        if (email) {
          try {
            const profile = await api.getProfileByEmail(email);
            if (profile) {
              setFullProfile(profile);
              setRole(profile.role);
              if (profile.role === 'admin') setIsAdmin(true);
              setUsername(profile.name || email.split('@')[0]);
              setCompany(profile.company_name || '');
              setBroadcasterName(profile.broadcaster_name || '');
            } else {
              // プロファイルがない場合はログアウトさせるか、エラーを表示
              console.error('Profile not found for authenticated user:', email);
              await api.logout();
              setSession(null);
              return;
            }
          } catch (profileErr) {
            console.error('Profile fetch failed during restoration:', profileErr);
            // ネットワークエラーなどの場合はリトライ可能にするため何もしないか、セッションをクリア
            setSession(null);
            return;
          }
          setSession(activeSession);
        }
      }
    } catch (e) {
      console.error('Session restore failed:', e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const titles = { tacos: 'タコス', pudding: 'ぷりん', tempra: 'てんぷら' };
    document.title = titles[currentApp] || 'タコス';
  }, [currentApp]);

  useEffect(() => {
    if (session && role) {
      const orgName = role === 'station' ? broadcasterName : company;
      api.getBadgeCounts(role, orgName).then(setBadgeCounts);
    }
  }, [session, role, broadcasterName, company]);

  async function handleLogout() {
    try {
      await api.logout();
      setSession(null);
      setRole(null);
      setFullProfile(null);
      setUsername('');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#64748b' }}>データを読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginView 
        setSession={setSession} 
        setRole={setRole} 
        setIsAdmin={setIsAdmin}
        setUsername={setUsername} 
        setCompany={setCompany} 
        setBroadcasterName={setBroadcasterName} 
        setFullProfile={setFullProfile} 
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        if (currentApp === 'pudding') return <PuddingView activeTab={activeTab} role={role} setActiveTab={setActiveTab} fullProfile={fullProfile} />;
        return <UserManagementView role={role} />;
      case 'url-management':
        return <UrlManagementView onTabChange={setActiveTab} setRole={setRole} />;
      case 'settings':
        return <SettingsView fullProfile={fullProfile} setFullProfile={setFullProfile} />;
      case 'new-estimate': return <NewEstimateView onBack={() => setActiveTab('dashboard')} />;
      case 'time-estimate': return <TimeEstimateView onBack={() => setActiveTab('dashboard')} />;
      case 'requests': return <StationResponseView role={role} onNavigateToChat={(channel) => { setActiveChannel(channel); setActiveTab('chat'); }} />;
      case 'event-hearing': return <EventHearingView onBack={() => setActiveTab('dashboard')} />;
      case 'on-sale-now': return <OnSaleNowView onBack={() => setActiveTab('dashboard')} onNavigateToChat={(channel) => { setActiveChannel(channel); setActiveTab('chat'); }} />;
      case 'time-slot-reg': return <TimeSlotRegView onBack={() => setActiveTab('dashboard')} />;
      case 'event-reg': return <EventRegView onBack={() => setActiveTab('dashboard')} />;
      case 'proposal-send': return <ProposalSendView broadcasterName={broadcasterName} onNavigateToChat={(channel) => { setActiveChannel(channel); setActiveTab('chat'); }} />;
      case 'projects': return <ProjectsView role={role} />;
      case 'revisions': return <RevisionsView role={role} onNavigateToChat={(channel) => { setActiveChannel(channel); setActiveTab('chat'); }} />;
      case 'orders': return <OrdersView />;
      case 'transfer-docs': return <TransferView role={role} />;
      case 'broadcast-material': return <MaterialView role={role} />;
      case 'material-exam': return <MaterialView role={role} isExam={true} />;
      case 'user-management': return <UserManagementView role={role} />;
      case 'chat': return <ChatView activeChannel={activeChannel} fullProfile={fullProfile} />;
      case 'manual': return <ManualView />;
      case 'update-request': return <UpdateRequestView />;
      case 'revenue-management': return <RevenueView />;
      case 'external-integration':
        if (currentApp === 'pudding') return <PuddingView activeTab={activeTab} role={role} setActiveTab={setActiveTab} fullProfile={fullProfile} />;
        return <ExternalIntegrationView />;
      case 'dashboard':
      default:
        if (currentApp === 'pudding') return <PuddingView activeTab={activeTab} role={role} setActiveTab={setActiveTab} fullProfile={fullProfile} />;
        if (currentApp === 'tempra') return <TempraView />;
        return <DashboardView role={role} fullProfile={fullProfile} />;
    }
  };

  return (
    <ErrorBoundary key={currentApp + '-' + role}>
    <div className={`layout-wrapper theme-${currentApp}`} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        currentApp={currentApp}
        role={role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentUser={username}
        userScopes={fullProfile?.scopes || []}
        {...badgeCounts}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 2rem', height: '64px', background: 'white', borderBottom: '1px solid var(--border-color)', zIndex: 10 
        }}>
          {/* App Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '200px' }}>
            <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--brand-primary)', textTransform: 'capitalize' }}>
              {currentApp === 'tacos' ? 'タコス' : currentApp === 'pudding' ? 'ぷりん' : 'てんぷら'}
            </div>
          </div>

          {/* Segmented Control - App Switch */}
          <div className="segmented-control" style={{ width: '280px' }}>
            <div 
              className="segmented-slider" 
              style={{ 
                width: '33.33%',
                transform: `translateX(${currentApp === 'tacos' ? '0' : currentApp === 'pudding' ? '100%' : '200%'})`
              }} 
            />
            <div className={`segmented-item ${currentApp === 'tacos' ? 'active' : ''}`} onClick={() => { setCurrentApp('tacos'); setActiveTab('dashboard'); }}>タコス</div>
            <div className={`segmented-item ${currentApp === 'pudding' ? 'active' : ''}`} onClick={() => { setCurrentApp('pudding'); setActiveTab('dashboard'); }}>ぷりん</div>
            <div className={`segmented-item ${currentApp === 'tempra' ? 'active' : ''}`} onClick={() => { setCurrentApp('tempra'); setActiveTab('dashboard'); }}>てんぷら</div>
          </div>

          {/* Role Switcher - Always Visible in Test */}
          {(isAdmin || true) && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#f1f3f5', borderRadius: '10px', padding: '3px'
            }}>
              {[
                { id: 'admin', label: '管理者', color: '#8b5cf6' },
                { id: 'agency', label: '代理店', color: '#0ea5e9' },
                { id: 'station', label: '放送局', color: '#f59e0b' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setActiveTab('dashboard'); }}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: role === r.id ? 'white' : 'transparent',
                    color: role === r.id ? r.color : '#94a3b8',
                    boxShadow: role === r.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '200px', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.8125rem', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{username}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                {isAdmin ? (role === 'admin' ? '👑 管理者モード' : role === 'agency' ? '🏢 代理店モード' : '📡 放送局モード') : company || broadcasterName}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', 
                background: 'white', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
              }}
            >
              ログアウト
            </button>
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--sidebar-bg)' }}>
          <ErrorBoundary key={currentApp === 'pudding' ? 'pudding-main' : (currentApp + '-' + activeTab)}>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default App;
