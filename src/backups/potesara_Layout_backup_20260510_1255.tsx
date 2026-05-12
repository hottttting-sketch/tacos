import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Upload, 
  Settings, 
  LayoutDashboard,
  UserCircle,
  Share2,
  TrendingUp,
  Package,
  TableProperties,
  MessageSquare,
  ClipboardList,
  Zap,
  Users,
  LogOut,
  Bell,
  Building2,
  CheckCheck,
  FileSpreadsheet,
  Clock,
  RefreshCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import RoleSwitcher from './RoleSwitcher';
import type { UserRole } from './RoleSwitcher';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onRoleChange, onLogout }) => {
  const location = useLocation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [userName, setUserName] = useState('読み込み中...');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchUnreadCount = async (userId: string) => {
    // --- BACKEND INTEGRATION: Scoped notification count ---
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .or(`user_id.eq.${userId},user_id.is.null`); // 自分宛て、または全体向け
    
    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  const fetchNotifications = async (userId: string) => {
    // --- BACKEND INTEGRATION: Scoped notification list ---
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setNotifications(data);
    }
  };

  React.useEffect(() => {
    let isActive = true;

    const initUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserName('開発用ユーザー');
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('public_users')
        .select('name, avatar_url, organization_id')
        .eq('id', user.id)
        .single();
      
      if (!isActive) return;

      if (!error && data) {
        if (data.name) setUserName(data.name);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        if (data.organization_id) setOrganizationId(data.organization_id);
      }

      // 初回取得
      fetchUnreadCount(user.id);
    };

    initUserData();

    // 通知のリアルタイム購読（全体を監視）
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        const userId = currentUserId || '';
        if (userId) fetchUnreadCount(userId);
      })
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [userRole, currentUserId]);

  const markAsRead = async (id: number) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (currentUserId) fetchUnreadCount(currentUserId);
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .or(`user_id.eq.${currentUserId},user_id.is.null`);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const mainNavItems = [
    { name: 'ダッシュボード', path: '/', icon: <LayoutDashboard size={20} />, roles: ['STATION', 'VENDOR', 'ADMIN'] },
    { name: '枠出し・進行', path: '/schedule', icon: <Calendar size={20} />, roles: ['STATION', 'ADMIN'] },
    { name: '受注確認', path: '/order-confirmation', icon: <ClipboardList size={20} />, roles: ['STATION', 'ADMIN'] },
    { name: 'LTV売上確認', path: '/performance', icon: <TrendingUp size={20} />, roles: ['STATION', 'ADMIN'] },
    { name: '放送枠確認', path: '/slots-overview', icon: <TableProperties size={20} />, roles: ['VENDOR', 'ADMIN'] },
    { name: '素材管理', path: '/materials', icon: <Package size={20} />, roles: ['VENDOR', 'ADMIN'] },
    { name: '一括変更・取消', path: '/bulk-actions', icon: <RefreshCcw size={20} />, roles: ['VENDOR', 'ADMIN'] },
    { name: '実績インポート', path: '/import', icon: <Upload size={20} />, roles: ['VENDOR', 'ADMIN'] },
    { name: 'ヒートマップ', path: '/analytics', icon: <BarChart3 size={20} />, roles: ['STATION', 'VENDOR', 'ADMIN'] },
    { name: 'チャット', path: '/chat', icon: <MessageSquare size={20} />, roles: ['STATION', 'VENDOR', 'ADMIN'] },
    { name: 'ユーザー管理', path: '/users', icon: <Users size={20} />, roles: ['STATION', 'VENDOR', 'ADMIN'] },
    { name: 'スプシ連携', path: '/sheets-integration', icon: <FileSpreadsheet size={20} />, roles: ['VENDOR', 'ADMIN'] },
    { name: 'データー同期', path: '/data-sync', icon: <Clock size={20} />, roles: ['ADMIN'] },
  ];

  const ruleNavItems = [
    { name: 'アップデート申請', path: '/update-request', icon: <Zap size={20} />, roles: ['STATION', 'VENDOR', 'ADMIN'] },
    { name: '枠出しルール', path: '/export-rules', icon: <ClipboardList size={20} />, roles: ['STATION', 'ADMIN'] },
  ];

  const filteredMainNav = mainNavItems.filter(item => item.roles.includes(userRole));
  const filteredRuleNav = ruleNavItems.filter(item => item.roles.includes(userRole));

  const roleLabels: Record<UserRole, string> = {
    STATION: '放送局 担当者',
    VENDOR: '東京テレビランド担当',
    ADMIN: 'システム管理者'
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">P</div>
          <div className="brand-text-wrapper">
            <span className="brand-name">ポテサラ</span>
            <span className="brand-subtitle">TV Potential SHARE by Tokyo TV Land</span>
          </div>
        </div>
        
        <nav className="sidebar-nav main">
          {filteredMainNav.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <nav className="sidebar-nav secondary">
            {filteredRuleNav.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="admin-menu-wrapper">
            {userRole === 'ADMIN' && (
              <Link to="/organizations" className={`admin-menu-btn ${location.pathname === '/organizations' ? 'active' : ''}`}>
                <Building2 size={20} />
                <span>組織・放送局管理</span>
              </Link>
            )}
            <Link to="/settings" className={`admin-menu-btn ${location.pathname === '/settings' ? 'active' : ''}`}>
              <Settings size={20} />
              <span>設定</span>
            </Link>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="main-header">
          <div className="header-left-group">
            <h1>
              {(() => {
                const allItems = [...(mainNavItems || []), ...(ruleNavItems || [])];
                const current = allItems.find(item => item.path === location.pathname);
                return current ? current.name : 'ポテサラ';
              })()}
            </h1>
          </div>
          <div className="header-actions">
             <div className="notification-wrapper">
               <button 
                 className="icon-btn-header" 
                 title="通知"
                 onClick={() => {
                   if (!showNotifications && currentUserId) fetchNotifications(currentUserId);
                   setShowNotifications(!showNotifications);
                 }}
               >
                 <Bell size={20} />
                 {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
               </button>
               
               {showNotifications && (
                 <div className="notification-dropdown">
                   <div className="notification-dropdown-header">
                     <span>通知</span>
                     {unreadCount > 0 && (
                       <button className="mark-all-read-btn" onClick={markAllAsRead}>
                         <CheckCheck size={14} /> すべて既読
                       </button>
                     )}
                   </div>
                   <div className="notification-list">
                     {notifications.length === 0 ? (
                       <div className="notification-empty">通知はありません</div>
                     ) : (
                       notifications.map(n => (
                         <div key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`} onClick={() => markAsRead(n.id)}>
                           <div className="notification-item-title">{n.title}</div>
                           <div className="notification-item-content">{n.content}</div>
                           <div className="notification-item-time">{new Date(n.created_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               )}
             </div>
             <RoleSwitcher currentRole={userRole} onRoleChange={onRoleChange} />
             <div className="header-user-profile">
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
               ) : (
                 <UserCircle size={32} className="user-avatar" />
               )}
               <div className="user-info-header">
                 <span className="user-name">{userName}</span>
                 <span className="user-role">{roleLabels[userRole]}</span>
               </div>
               <button className="logout-btn" onClick={onLogout} title="ログアウト">
                 <LogOut size={18} />
               </button>
             </div>
          </div>
        </header>
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
