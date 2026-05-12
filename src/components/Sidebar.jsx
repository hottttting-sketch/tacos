import React from 'react';
import RoleIcon from './RoleIcon';
import { Icons } from './IconLibrary';

const Sidebar = ({ currentApp = 'tacos', role, activeTab, onTabChange, isCollapsed, onToggleCollapse, currentUser, userSection, isBA, requestCount, orderCount, transferCount, examCount, broadcastMaterialCount, userScopes = [] }) => {
  const hasScope = (scope) => {
    if (!userScopes || userScopes.length === 0) return true; // Default to allow all if no scopes defined (admin or legacy)
    if (Array.isArray(scope)) {
      return scope.some(s => userScopes.includes(s));
    }
    return userScopes.includes(scope);
  };

  const getMenuItems = () => {
    const adminItems = [
      { group: '管理', items: [
        { id: 'dashboard', label: 'ダッシュボード', icon: <Icons.Dashboard />, color: '#f8f9fa' },
        { id: 'users', label: 'ユーザー管理', icon: <Icons.Users />, color: '#e7f5ff' },
        { id: 'url-management', label: '送付URL管理', icon: <Icons.Link />, color: '#fff5cc' },
        { id: 'masters', label: 'マスタ管理', icon: <Icons.Settings />, color: '#fff0f6' },
        { id: 'logs', label: 'システムログ', icon: <Icons.FileText />, color: '#ffe3e3' },
      ]},
      { group: 'コミュニケーション', items: [
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e6fcf5' },
      ]},
    ];
    const agencyItems = [
      { group: '新規依頼・探索', items: [
        { id: 'new-estimate', label: 'スポット見積作成', icon: <Icons.FileText />, color: '#fff9db' },
        { id: 'time-estimate', label: 'タイム見積作成', icon: <Icons.History />, color: '#e7f5ff' },
        { id: 'event-hearing', label: 'イベントヒアリング', icon: <Icons.Chat />, color: '#e6fcf5' },
        { id: 'on-sale-now', label: 'On sale now', icon: <Icons.Star />, color: '#ffe3e3' },
      ]},
      { group: '業務メニュー', items: [
        { id: 'dashboard', label: 'ダッシュボード', icon: <Icons.Dashboard />, color: '#f8f9fa' },
        { id: 'projects', label: '見積集約・プランニング・発注', icon: <Icons.Folder />, color: '#edf2ff' },
        { id: 'revisions', label: '初案・改案・進行', icon: <Icons.Edit />, color: '#fff0f6' },
        { id: 'transfer-docs', label: '移動書', icon: <Icons.Board />, color: '#fff9db', badge: transferCount },
      ]},
      { group: '管理', items: [
        { id: 'broadcast-material', label: 'CM素材登録・考査', icon: <Icons.Monitor />, color: '#fff4e6', badge: broadcastMaterialCount },
        { id: 'users', label: 'ユーザー管理', icon: <Icons.Users />, color: '#e7f5ff' },
      ]},
      { group: 'コミュニケーション', items: [
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e6fcf5' },
      ]},
    ];

    const stationItems = [
      { group: '登録', items: [
        { id: 'time-slot-reg', label: 'タイム枠登録', icon: <Icons.Clock />, color: '#e7f5ff' },
        { id: 'event-reg', label: 'イベント登録', icon: <Icons.Calendar />, color: '#fff9db' },
      ]},
      { group: '業務メニュー', items: [
        { id: 'dashboard', label: 'ダッシュボード', icon: <Icons.Dashboard />, color: '#f8f9fa' },
        { id: 'requests', label: '見積回答', icon: <Icons.Inbox />, color: '#edf2ff', badge: requestCount },
        { id: 'proposal-send', label: '発注書・初案・改案', icon: <Icons.Send />, color: '#e6fffa' },
        { id: 'orders', label: '進行表', icon: <Icons.Board />, color: '#fff9db', badge: orderCount },
        { id: 'transfer-docs', label: '移動書', icon: <Icons.Board />, color: '#fff9db' },
      ]},
      { group: '管理', items: [
        { id: 'material-exam', label: '素材考査', icon: <Icons.Monitor />, color: '#fff4e6', badge: examCount },
        { id: 'revenue-management', label: '売上管理', icon: <Icons.Chart />, color: '#ebfbee' },
        { id: 'external-integration', label: '外部システム連携', icon: <Icons.Link />, color: '#f8f9fa' },
        { id: 'users', label: 'ユーザー管理', icon: <Icons.Users />, color: '#e7f5ff' },
      ]},
      { group: 'コミュニケーション', items: [
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e6fcf5' },
      ]},
    ];

    const liaisonItems = [
      { group: '新規依頼・探索', items: [
        { id: 'new-estimate', label: 'スポット見積作成', icon: <Icons.FileText />, color: '#fff9db' },
        { id: 'time-estimate', label: 'タイム見積作成', icon: <Icons.History />, color: '#e7f5ff' },
        { id: 'event-hearing', label: 'イベントヒアリング', icon: <Icons.Chat />, color: '#e6fcf5' },
        { id: 'on-sale-now', label: 'On sale now', icon: <Icons.Star />, color: '#ffe3e3' },
      ]},
      { group: '業務メニュー', items: [
        { id: 'dashboard', label: 'ダッシュボード', icon: <Icons.Dashboard />, color: '#f8f9fa' },
        { id: 'projects', label: '見積集約・プランニング・発注', icon: <Icons.Folder />, color: '#edf2ff' },
        { id: 'revisions', label: '初案・改案・進行', icon: <Icons.Edit />, color: '#fff0f6' },
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e6fcf5' },
      ]},
    ];

    const puddingAgencyItems = [
      { group: '案件操作', items: [
        { id: 'new-request', label: '新規パブリシティ依頼', icon: <Icons.Plus />, color: '#e6fcf5' },
        { id: 'bulk-change-cancel', label: '一括変更・取消', icon: <Icons.Edit />, color: '#ffe3e3' },
        { id: 'copy-project', label: '案件複製', icon: <Icons.History />, color: '#e7f5ff' },
      ]},
      { group: '案件一覧', items: [
        { id: 'board', label: '案件ボード', icon: <Icons.Board />, color: '#fff9db' },
        { id: 'excel', label: 'エクセルビュー', icon: <Icons.Table />, color: '#f3f0ff' },
        { id: 'calendar', label: '放送カレンダー', icon: <Icons.Calendar />, color: '#fff9db' },
      ]},
      { group: '共通', items: [
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e6fcf5' },
        { id: 'users', label: 'ユーザー管理', icon: <Icons.Users />, color: '#e7f5ff' },
      ]},
    ];

    const puddingBroadcasterItems = [
      { group: '案件操作', items: [
        { id: 'new-request', label: '新規案件作成', icon: <Icons.Plus />, color: '#e6fcf5' },
        { id: 'slot-registration', label: '枠情報登録', icon: <Icons.Clock />, color: '#e7f5ff' },
        { id: 'slot-move-suspended', label: '枠移動・休止', icon: <Icons.History />, color: '#ffe3e3' },
        { id: 'inbox', label: 'メール依頼受領', icon: <Icons.Inbox />, color: '#edf2ff' },
      ]},
      { group: '案件一覧', items: [
        { id: 'board', label: '案件ボード', icon: <Icons.Board />, color: '#fff9db' },
        { id: 'excel', label: 'エクセルビュー', icon: <Icons.Table />, color: '#f3f0ff' },
        { id: 'calendar', label: '放送カレンダー', icon: <Icons.Calendar />, color: '#fff9db' },
      ]},
      { group: '制作管理', items: [
        { id: 'slot-management-table', label: 'スプシ連携', icon: <Icons.Link />, color: '#e6fcf5' },
        { id: 'ai-rewrite-settings', label: 'AIリライト設定', icon: <Icons.Settings />, color: '#f8f9fa' },
        { id: 'ai-narration-settings', label: 'AIナレーション', icon: <Icons.Monitor />, color: '#e7f5ff' },
      ]},
      { group: '共通', items: [
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e6fcf5' },
        { id: 'users', label: 'ユーザー管理', icon: <Icons.Users />, color: '#e7f5ff' },
      ]},
    ];

    const puddingAdminItems = [
      { group: 'システム管理', items: [
        { id: 'admin-dashboard', label: '総合ダッシュボード', icon: <Icons.Dashboard />, color: '#fff9db' },
        { id: 'stations', label: '放送局管理', icon: <Icons.Monitor />, color: '#e7f5ff' },
        { id: 'users', label: 'ユーザー管理', icon: <Icons.Users />, color: '#e6fcf5' },
        { id: 'ba-settings', label: 'BA管理', icon: <Icons.Link />, color: '#fff0f6' },
        { id: 'url-management', label: '送付URL管理', icon: <Icons.Link />, color: '#fff5cc' },
        { id: 'billing', label: '請求管理', icon: <Icons.Chart />, color: '#edf2ff' },
      ]},
      { group: 'マスタ管理', items: [
        { id: 'programs', label: '全放送局番組管理', icon: <Icons.Table />, color: '#f3f0ff' },
        { id: 'slots', label: '全放送局枠管理', icon: <Icons.Clock />, color: '#fff0f6' },
        { id: 'ai-rewrite-settings', label: 'AIリライト設定', icon: <Icons.Settings />, color: '#f8f9fa' },
        { id: 'materials', label: '資料管理', icon: <Icons.Folder />, color: '#fffec7' },
      ]},
      { group: '履歴', items: [
        { id: 'logs', label: 'システムログ', icon: <Icons.FileText />, color: '#fff9db' },
        { id: 'chat', label: 'チャット', icon: <Icons.Chat />, color: '#e1f5fe' },
      ]},
    ];

    const tempraItems = [
      { group: '外部連携', items: [
        { id: 'external', label: 'てんぷら 画面', icon: <Icons.Link />, color: '#fff9db' },
      ]},
    ];

    let items = [];
    if (currentApp === 'pudding') {
      if (role === 'admin') items = [...puddingAdminItems];
      else if (role === 'agency') items = [...puddingAgencyItems];
      else items = [...puddingBroadcasterItems];
    } else if (currentApp === 'tempra') {
      items = [...tempraItems];
    } else {
      if (role === 'admin') items = [...adminItems];
      else if (role === 'agency') items = [...agencyItems];
      else if (role === 'agency-liaison') items = [...liaisonItems];
      else if (role === 'station' || role === 'broadcaster') items = [...stationItems];
      else items = [];
    }
    
    if (!items) items = [];
    
    // Filter items based on userScopes
    const SCOPE_MAP = {
      'new-estimate': 'est',
      'time-estimate': 'est',
      'event-hearing': 'est',
      'on-sale-now': 'est',
      'projects': 'est',
      'revisions': ['ord', 'pro'],
      'transfer-docs': 'tra',
      'broadcast-material': 'exm',
      'time-slot-reg': 'slo',
      'event-reg': 'slo',
      'requests': 'res',
      'proposal-send': 'res',
      'orders': 'pro',
      'material-exam': 'exm',
      'revenue-management': 'req',
      'external-integration': 'req'
    };

    return items.map(group => ({
      ...group,
      items: group.items.filter(item => {
        const requiredScope = SCOPE_MAP[item.id];
        if (!requiredScope) return true; // Always allow dashboard, chat, users, etc.
        return hasScope(requiredScope);
      })
    })).filter(group => group.items.length > 0);
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ 
        padding: isCollapsed ? '16px 8px' : '16px',
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        backgroundColor: currentApp === 'pudding' ? '#FFF5CC' : currentApp === 'tempra' ? 'var(--tempra-header)' : 'transparent',
        borderBottom: `1px solid ${currentApp === 'pudding' ? '#F1E4C9' : currentApp === 'tempra' ? '#FFE082' : 'var(--border-color)'}`,
        justifyContent: isCollapsed ? 'center' : 'flex-start'
      }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '8px', 
          background: currentApp === 'tacos' ? 'linear-gradient(135deg, var(--tacos-brown), var(--tacos-red))' : currentApp === 'pudding' ? 'linear-gradient(135deg, #FFF9C4, #FFD93D)' : 'linear-gradient(135deg, #FFE082, #FF9800)', 
          color: currentApp === 'pudding' ? '#8B4513' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: currentApp === 'pudding' ? '0 4px 6px -1px rgba(123, 63, 0, 0.2)' : currentApp === 'tempra' ? '0 4px 6px -1px rgba(255, 152, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none',
          flexShrink: 0
        }}>
          {currentApp === 'tacos' ? <Icons.Monitor width={24} height={24} /> : currentApp === 'pudding' ? (
            <Icons.Tv width={isCollapsed ? 18 : 20} height={isCollapsed ? 18 : 20} strokeWidth={2.5} />
          ) : (
            <Icons.TempraTv width={isCollapsed ? 22 : 24} height={isCollapsed ? 22 : 24} strokeWidth={2} />
          )}
        </div>
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {currentApp === 'tacos' ? (
              <>
                <span style={{ fontSize: '8px', color: '#8c9196', marginBottom: '0px', fontWeight: '800', letterSpacing: '0.02em' }}>
                  <span style={{ color: 'var(--tacos-red)' }}>T</span>V <span style={{ color: 'var(--tacos-red)' }}>A</span>D <span style={{ color: 'var(--tacos-red)' }}>Co</span>ntrol <span style={{ color: 'var(--tacos-red)' }}>S</span>ystem
                </span>
                <span style={{ fontWeight: '900', fontSize: '27px', color: 'var(--tacos-red)', lineHeight: '1', letterSpacing: '0.05em' }}>タコス</span>
              </>
            ) : currentApp === 'pudding' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <h1 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3E2723', margin: 0, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  TV Pub Linker
                </h1>
                <div style={{ color: '#8B4513', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, marginBottom: '0.125rem' }}>ぷりん</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <h1 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--tempra-text)', margin: 0, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--tempra-accent)' }}>Te</span>levision <span style={{ color: 'var(--tempra-accent)' }}>m</span>ail order <span style={{ color: 'var(--tempra-accent)' }}>pr</span>ogram <span style={{ color: 'var(--tempra-accent)' }}>a</span>pp
                </h1>
                <div style={{ color: 'var(--tempra-accent)', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, marginBottom: '0.125rem' }}>てんぷら</div>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">

        {menuItems.map((groupOrItem, idx) => {
          if (groupOrItem.group) {
            return (
              <React.Fragment key={idx}>
                <div className="sidebar-group-title">{groupOrItem.group}</div>
                {groupOrItem.items.map((item) => (
                  <div 
                    key={item.id}
                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="sidebar-icon-wrapper" style={{ 
                      backgroundColor: item.color,
                      color: '#495057'
                    }}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                    {item.badge > 0 && !isCollapsed && (
                      <div style={{
                        marginLeft: 'auto',
                        backgroundColor: '#fa5252',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '900',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(250, 82, 82, 0.2)'
                      }}>
                        {item.badge}
                      </div>
                    )}
                    {item.badge > 0 && isCollapsed && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#fa5252',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}></div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <div 
                key={groupOrItem.id}
                className={`sidebar-item ${activeTab === groupOrItem.id ? 'active' : ''}`}
                onClick={() => onTabChange(groupOrItem.id)}
                title={isCollapsed ? groupOrItem.label : ''}
              >
                <div className="sidebar-icon-wrapper" style={{ 
                  backgroundColor: groupOrItem.color,
                  color: '#495057'
                 }}>
                  {groupOrItem.icon}
                </div>
                <span>{groupOrItem.label}</span>
              </div>
            );
          }
        })}
      </nav>

      <div className="sidebar-footer" style={{ padding: '8px 16px' }}>
        {(role === 'agency' || role === 'station') && (
          <div 
            className={`sidebar-item ${activeTab === 'update-request' ? 'active' : ''}`}
            onClick={() => onTabChange('update-request')}
            style={{ marginBottom: '2px' }}
            title={isCollapsed ? 'アップデート申請' : ''}
          >
            <div className="sidebar-icon-wrapper" style={{ backgroundColor: '#fff9db', color: '#495057' }}>
              <Icons.History />
            </div>
            <span>アップデート申請</span>
          </div>
        )}
        <div 
          className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
          style={{ marginBottom: '4px' }}
          title={isCollapsed ? '設定・マニュアル' : ''}
        >
          <div className="sidebar-icon-wrapper" style={{ backgroundColor: '#f8f9fa', color: '#495057' }}>
            <Icons.Settings />
          </div>
          <span>設定・マニュアル</span>
        </div>
        <div className="sidebar-item" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', color: '#8c9196', padding: '4px 0' }} onClick={onToggleCollapse}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
          </svg>
          <span style={{ fontSize: '13px' }}>サイドバーを閉じる</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
