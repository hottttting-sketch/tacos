import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import RoleIcon from './RoleIcon';
import { UserPlus, UserCheck, Shield, ChevronRight, Save, X } from 'lucide-react';

const UserManagement = ({ role, currentUser, fullProfile, setFullProfile }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserProfiles();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditData({ ...user });
  };

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(editingId, {
        name: editData.name,
        role: editData.role,
        scopes: editData.scopes,
        status: editData.status
      });
      setUsers(users.map(u => u.id === editingId ? updated : u));
      if (editingId === fullProfile.id) {
        setFullProfile(updated);
      }
      setEditingId(null);
      alert('更新しました');
    } catch (e) {
      alert('更新に失敗しました: ' + e.message);
    }
  };

  const toggleScope = (scope) => {
    const currentScopes = editData.scopes || [];
    if (currentScopes.includes(scope)) {
      setEditData({ ...editData, scopes: currentScopes.filter(s => s !== scope) });
    } else {
      setEditData({ ...editData, scopes: [...currentScopes, scope] });
    }
  };

  const availableScopes = [
    '見積作成者', '局担', '発注', '改案', '進行', '移動書', '考査',
    '営業外勤', 'スポットデスク', 'タイムデスク'
  ];

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>ユーザー管理・承認</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>アカウントの権限設定と業務範囲の管理を行います</p>
        </div>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>ユーザー情報</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>所属・ロール</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>業務範囲 (Scopes)</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>状態</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isEditing = editingId === u.id;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {isEditing ? (
                        <input 
                          value={editData.name} 
                          onChange={e => setEditData({...editData, name: e.target.value})}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                      ) : (
                        u.name || '名称未設定'
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{u.company_name || u.broadcaster_name || '-'}</div>
                    {isEditing ? (
                      <select 
                        value={editData.role} 
                        onChange={e => setEditData({...editData, role: e.target.value})}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      >
                        <option value="agency">代理店</option>
                        <option value="broadcaster">放送局</option>
                        <option value="admin">管理者</option>
                      </select>
                    ) : (
                      <RoleIcon fullProfile={u} role={u.role} showLabel={true} />
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                        {availableScopes.map(s => (
                          <button 
                            key={s} 
                            onClick={() => toggleScope(s)}
                            style={{ 
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #cbd5e1',
                              backgroundColor: editData.scopes?.includes(s) ? '#0ea5e9' : 'white',
                              color: editData.scopes?.includes(s) ? 'white' : '#64748b',
                              cursor: 'pointer'
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {u.scopes && Array.isArray(u.scopes) ? u.scopes.map(s => (
                          <span key={s} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontSize: '0.75rem' }}>{s}</span>
                        )) : <span style={{ color: '#cbd5e1' }}>未設定</span>}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <select 
                        value={editData.status} 
                        onChange={e => setEditData({...editData, status: e.target.value})}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      >
                        <option value="active">アクティブ</option>
                        <option value="pending">承認待ち</option>
                        <option value="blocked">無効</option>
                      </select>
                    ) : (
                      <span style={{ 
                        color: u.status === 'active' ? '#15803d' : '#d97706', 
                        background: u.status === 'active' ? '#dcfce3' : '#fef3c7', 
                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                      }}>
                        {u.status === 'active' ? 'アクティブ' : u.status === 'pending' ? '承認待ち' : '無効'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#0ea5e9', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
                          <Save size={16} /> 保存
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
                          <X size={16} /> 取消
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(u)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                        編集
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
