import React, { useState } from 'react';
import { Icons } from './IconLibrary';
import UrlRevisionsDemo from './UrlRevisionsDemo';
import UrlOrdersDemo from './UrlOrdersDemo';
import UrlStationResponseDemo from './UrlStationResponseDemo';

const TacosUrlManagementView = ({ onTabChange, setRole }) => {
  const [activePreview, setActivePreview] = useState(null);

  const links = [
    {
      id: 'requests',
      label: '見積回答画面ベース',
      desc: '放送局UI見積回答作成をベースに作成',
      icon: <Icons.Inbox />,
      color: '#edf2ff',
      iconColor: '#1971c2',
      targetRole: 'station'
    },
    {
      id: 'orders',
      label: '発注書画面ベース',
      desc: '代理店UI発注書画面をベースに作成',
      icon: <Icons.FileText />,
      color: '#f8f9fa',
      iconColor: '#495057',
      targetRole: 'agency'
    },
    {
      id: 'revisions',
      label: '初案・改案画面ベース',
      desc: '代理店UI初案・改案・進行画面をベースに作成',
      icon: <Icons.Edit />,
      color: '#fff0f6',
      iconColor: '#d6336c',
      targetRole: 'agency'
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

        {/* Dynamic component rendering based on the active link */}
        <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '2px solid #eef1f6', padding: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.02)' }}>
          {activePreview === 'revisions' && <UrlRevisionsDemo />}
          {activePreview === 'orders' && <UrlOrdersDemo />}
          {activePreview === 'requests' && <UrlStationResponseDemo />}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {links.map((link) => (
          <div
            key={link.id}
            onClick={() => handleOpenPreview(link.id, link.targetRole)}
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '24px',
              border: '2px solid #eef1f6',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = link.iconColor;
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#eef1f6';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.02)';
            }}
          >
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: link.color,
                color: link.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {link.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                {link.label}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                {link.desc}
              </p>
            </div>
            <div style={{ alignSelf: 'flex-end', marginTop: '16px', color: link.iconColor, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '800' }}>
              プレビューを表示する →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TacosUrlManagementView;
