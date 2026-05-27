import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';

const UserManagementView = ({ role: userRole, currentApp }) => {
  const primaryColor = currentApp === 'pudding' ? '#3E2723' : 'var(--tacos-red)';
  const primaryShadow = currentApp === 'pudding' ? '0 8px 20px rgba(62,39,35,0.15)' : '0 8px 20px rgba(230,0,18,0.15)';

  const [activeTab, setActiveTab] = useState('sponsor'); // 'sponsor', 'internal', 'broadcaster'
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ユーザーの役割（放送局or代理店）に応じた設定
  const isStationUI = userRole === 'station';

  const config = React.useMemo(() => ({
    tabs: [
      { id: 'sponsor', label: 'スポンサー', icon: <Icons.Star /> },
      { 
        id: 'internal', 
        label: isStationUI ? '自社（放送局）' : '自社（代理店）', 
        icon: <Icons.Role /> 
      },
      { 
        id: 'broadcaster', 
        label: isStationUI ? '代理店' : '放送局', 
        icon: <Icons.Monitor /> 
      }
    ],
    roleMap: {
      'sponsor': 'sponsor',
      'internal': isStationUI ? 'station' : 'agency',
      'broadcaster': isStationUI ? 'agency' : 'station'
    },
    // セクションを表示するかどうか
    showSection: (tabId) => {
      if (tabId === 'sponsor') return false;
      if (isStationUI) return tabId === 'internal'; // 放送局UIなら自社のみセクション表示
      return tabId === 'broadcaster'; // 代理店UIなら放送局のみセクション表示
    }
  }), [isStationUI]);

  const STATION_SCOPES = [
    { id: 'req', label: '見積依頼' },
    { id: 'res', label: '見積回答' },
    { id: 'slo', label: '枠管理' },
    { id: 'pro', label: '進行管理' },
    { id: 'tra', label: '移動書' },
    { id: 'exm', label: '素材考査' }
  ];

  const AGENCY_SCOPES = [
    { id: 'est', label: '見積作成' },
    { id: 'sta', label: '局担' },
    { id: 'ord', label: '発注' },
    { id: 'pro', label: '進行' },
    { id: 'tra', label: '移動' },
    { id: 'exm', label: '考査' }
  ];

  const SECTION_LABELS = {
    'H': '本社',
    'O': '大阪',
    'T': '東京',
    'S': 'その他'
  };

  const SCOPE_OPTIONS = [...STATION_SCOPES, ...AGENCY_SCOPES];

  const getScopeOptions = (tabId) => {
    const targetRole = config.roleMap[tabId];
    return (targetRole === 'station' || targetRole === 'broadcaster') ? STATION_SCOPES : AGENCY_SCOPES;
  };

  useEffect(() => {
    const loadUser = async () => {
      const sess = await api.getCurrentSession();
      if (sess?.user?.email) {
        const profile = await api.getProfileByEmail(sess.user.email);
        setCurrentUser(profile);
      }
    };
    loadUser();
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const targetRole = config.roleMap[activeTab];
      let data = await api.getProfilesByRole(targetRole);
      
      // 自社タブの場合は組織でフィルタリング
      if (activeTab === 'internal' && currentUser) {
        if (isStationUI) {
          data = data.filter(p => p.broadcaster_name === currentUser.broadcaster_name);
        } else {
          data = data.filter(p => p.company_name === currentUser.company_name);
        }
      }

      const mapped = data.map(p => ({
        id: p.id,
        type: activeTab,
        company: activeTab === 'sponsor' ? p.name : (isStationUI ? p.broadcaster_name : p.company_name),
        kana: p.kana,
        department: p.department,
        name: p.name,
        email: p.email,
        role: p.staff_role || '通常ユーザー',
        scopes: p.scopes || [],
        is_external: p.is_external || false,
        status: p.status || 'active',
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('ja-JP') : '-'
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, config.roleMap, currentUser, isStationUI]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, currentUser]);

  const handleAddItem = async (newItem) => {
    setIsLoading(true);
    try {
      const profileData = {
        name: activeTab === 'sponsor' ? newItem.company : newItem.name,
        email: newItem.email || `${Date.now()}@placeholder.com`,
        role: config.roleMap[activeTab],
        company_name: activeTab === 'sponsor' ? newItem.company : newItem.company,
        department: newItem.department,
        kana: newItem.kana,
        staff_role: newItem.role,
        scopes: newItem.scopes,
        is_external: newItem.is_external || false,
        status: 'active'
      };

      // 自社登録の場合は組織情報を自動付与
      let finalData = { ...profileData };
      if (activeTab === 'internal' && currentUser) {
        if (isStationUI) {
          finalData.broadcaster_name = currentUser.broadcaster_name;
          finalData.company_name = currentUser.broadcaster_name;
        } else {
          finalData.company_name = currentUser.company_name;
        }
      }

      if (editingItem) {
        await api.updateProfile(editingItem.id, finalData);
      } else {
        await api.createProfile(finalData);
      }
      setIsFormOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('この項目を削除してもよろしいですか？')) {
      setIsLoading(true);
      try {
        await api.deleteProfile(id);
        fetchItems();
      } catch (err) {
        console.error('Failed to delete profile:', err);
        alert('削除に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredItems = items;

  const getOrganizationDisplay = (item) => {
    if (activeTab === 'internal' || activeTab === 'broadcaster') {
      const showSec = config.showSection(activeTab);
      if (showSec) {
        const sectionName = SECTION_LABELS[item.company] || item.company;
        return `${sectionName} ${item.department ? `/ ${item.department}` : ''}`;
      }
    }
    return item.company;
  };

  const currentScopeOptions = getScopeOptions(activeTab);

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>
          {activeTab === 'sponsor' ? 'スポンサー・クライアント管理' : 'ユーザー・アカウント管理'}
        </h2>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '15px', fontWeight: '500' }}>システムにアクセス可能な{activeTab === 'sponsor' ? '企業マスタ' : '各組織のユーザー権限'}を管理します。</p>
      </header>

      {/* タブと登録ボタンの行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '18px' }}>
          {config.tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsFormOpen(false); }} style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '950', fontSize: '14px', backgroundColor: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#1e293b' : '#64748b', boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <button 
           onClick={() => { setEditingItem(null); setIsFormOpen(!isFormOpen); }}
           style={{ 
             padding: '12px 24px', borderRadius: '16px', fontWeight: '950', 
             backgroundColor: isFormOpen ? '#f1f5f9' : primaryColor, 
             color: isFormOpen ? '#64748b' : 'white', 
             border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
             boxShadow: isFormOpen ? 'none' : primaryShadow,
             transition: 'all 0.3s'
           }}
        >
          {isFormOpen ? <Icons.ArrowLeft size={18} /> : <Icons.Plus size={20} />}
          {isFormOpen ? '一覧に戻る' : (activeTab === 'sponsor' ? 'スポンサー登録' : '新規ユーザー登録')}
        </button>
      </div>

      {/* インライン展開フォーム */}
      <div style={{ 
        height: isFormOpen ? 'auto' : '0', 
        opacity: isFormOpen ? '1' : '0',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: isFormOpen ? '32px' : '0'
      }}>
        <RegistrationInlineForm 
           type={activeTab} 
           showSection={config.showSection(activeTab)}
           scopeOptions={currentScopeOptions}
           sectionLabels={SECTION_LABELS}
           editData={editingItem}
           currentApp={currentApp}
           onClose={() => { setIsFormOpen(false); setEditingItem(null); }} 
           onSubmit={handleAddItem} 
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
            {activeTab === 'sponsor' ? (
              <tr>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>企業名</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>かな</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>登録日</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>操作</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>削除</th>
              </tr>
            ) : (
              <tr>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>所属組織 / 氏名</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>メールアドレス</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>権限・業務範囲</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b' }}>登録日</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>操作</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '900', color: '#64748b', textAlign: 'center' }}>削除</th>
              </tr>
            )}
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id} className="hover-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                {activeTab === 'sponsor' ? (
                  <>
                    <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>{item.company}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{item.kana}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>{item.date}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <button onClick={() => { setEditingItem(item); setIsFormOpen(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ border: 'none', background: '#f8fafc', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#64748b' }}><Icons.Edit size={16} /></button>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: '#fff5f5', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#fa5252', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                         <Icons.Trash size={16} />
                       </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '2px' }}>
                          {getOrganizationDisplay(item)}
                       </div>
                       <div style={{ fontSize: '16px', fontWeight: '900' }}>{item.name}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontWeight: '700' }}>{item.email}</td>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                           <span style={{ display: 'inline-block', width: 'fit-content', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '950', backgroundColor: item.role === '管理者' ? '#fff4e6' : '#f1f3f5', color: item.role === '管理者' ? '#d9480f' : '#495057' }}>{item.role}</span>
                           {item.is_external && <span style={{ display: 'inline-block', width: 'fit-content', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '950', backgroundColor: '#fff0f6', color: '#c2255c', marginTop: '4px' }}>URL送付のみ</span>}
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                             {item.scopes?.map(s => {
                               const label = SCOPE_OPTIONS.find(so => so.id === s)?.label;
                               return <span key={s} style={{ fontSize: '9px', fontWeight: '800', color: '#4263eb', backgroundColor: '#edf2ff', padding: '2px 6px', borderRadius: '4px' }}>{label}</span>
                             })}
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: '700' }}>{item.date}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <button onClick={() => { setEditingItem(item); setIsFormOpen(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ border: 'none', background: '#f8fafc', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#64748b' }}><Icons.Edit size={16} /></button>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                       <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: '#fff5f5', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#fa5252', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                         <Icons.Trash size={16} />
                       </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`.hover-row:hover { background-color: #fcfdfe; }`}</style>
    </div>
  );
};

/* --- インライン登録・編集フォーム --- */
const RegistrationInlineForm = ({ type, editData, showSection, scopeOptions, sectionLabels, currentApp, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ company: '', department: '', kana: '', name: '', email: '', role: '通常ユーザー', scopes: [], is_external: false });
  const primaryColor = currentApp === 'pudding' ? '#3E2723' : 'var(--tacos-red)';
  const primaryShadow = currentApp === 'pudding' ? '0 4px 10px rgba(62,39,35,0.2)' : '0 4px 10px rgba(230,0,18,0.2)';

  useEffect(() => {
    if (editData) setFormData({ ...editData, scopes: editData.scopes || [], is_external: editData.is_external || false });
    else setFormData({ company: type === 'sponsor' ? '' : 'H', department: '', kana: '', name: '', email: '', role: '通常ユーザー', scopes: [], is_external: false });
  }, [editData, type]);

  const toggleScope = (id) => {
    const newScopes = formData.scopes.includes(id)
      ? formData.scopes.filter(s => s !== id)
      : [...formData.scopes, id];
    setFormData({ ...formData, scopes: newScopes });
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', borderRadius: '24px', padding: '32px', border: '2px dashed #e2e8f0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', margin: 0 }}>
          {editData ? '情報の編集' : (type === 'sponsor' ? 'スポンサー登録' : '新規ユーザー登録')}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {(type === 'sponsor' || showSection) && (
            <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {type === 'sponsor' ? '企業名' : 'セクション'}
               </label>
               {type === 'sponsor' ? (
                 <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '700', backgroundColor: 'white' }} placeholder="例：サントリー" />
               ) : (
                 <div style={{ display: 'flex', gap: '4px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
                   {Object.entries(sectionLabels).map(([id, label]) => (
                     <button key={id} onClick={() => setFormData({...formData, company: id})} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', backgroundColor: formData.company === id ? 'white' : 'transparent', color: formData.company === id ? '#1e293b' : '#64748b', transition: 'all 0.2s' }}>
                       {id} <span style={{ fontSize: '10px', opacity: 0.6, fontWeight: '700' }}>{label}</span>
                     </button>
                   ))}
                 </div>
               )}
            </div>
          )}

        {type === 'sponsor' ? (
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>かな</label>
            <input value={formData.kana} onChange={e => setFormData({...formData, kana: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '700', backgroundColor: 'white' }} placeholder="さんとりー" />
          </div>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>部署</label>
              <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '700', backgroundColor: 'white' }} placeholder="例：営業推進部" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>氏名</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '700', backgroundColor: 'white' }} placeholder="山田 太郎" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>メールアドレス</label>
              <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '700', backgroundColor: 'white' }} placeholder="example@broadcaster.jp" />
            </div>
            {type === 'broadcaster' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>システム連携</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', backgroundColor: formData.is_external ? '#fff0f6' : '#f8fafc', border: `1.5px solid ${formData.is_external ? '#ffdeeb' : '#e2e8f0'}`, borderRadius: '12px', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={formData.is_external} onChange={e => setFormData({...formData, is_external: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#d6336c' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: formData.is_external ? '#a61e4d' : '#475569' }}>
                    システム未導入（URL送付のみ）
                  </span>
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>

      {type !== 'sponsor' ? (
        <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>業務範囲 (複数選択可)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {scopeOptions.map(opt => (
              <label key={opt.id} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', fontSize: '12px', fontWeight: '800',
                backgroundColor: formData.scopes.includes(opt.id) ? '#edf2ff' : 'white',
                color: formData.scopes.includes(opt.id) ? '#4263eb' : '#64748b',
                borderColor: formData.scopes.includes(opt.id) ? '#4263eb' : '#e2e8f0'
              }}>
                <input type="checkbox" checked={formData.scopes.includes(opt.id)} onChange={() => toggleScope(opt.id)} style={{ display: 'none' }} />
                {formData.scopes.includes(opt.id) ? <Icons.Check size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '3px', border: '1.5px solid #cbd5e1' }} />}
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}>キャンセル</button>
        <button onClick={() => onSubmit(formData)} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', backgroundColor: primaryColor, color: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '14px', boxShadow: primaryShadow }}>
          {editData ? '更新を保存' : '登録'}
        </button>
      </div>
    </div>
  );
};

export default UserManagementView;
