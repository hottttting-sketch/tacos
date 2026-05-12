import React, { useState } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';

const ExternalIntegrationView = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'EDPS', name: '営放システム (EDPS) 連携', status: 'connected', lastSync: '10分前', type: 'API' },
    { id: 'DAM', name: '素材管理サーバー (DAM)', status: 'connected', lastSync: '1時間前', type: 'S3-Compatible' },
    { id: 'AGENCY_PORTAL', name: '共通代理店ポータルシステム', status: 'error', lastSync: '3日前', type: 'Webhook' },
  ]);

  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>外部システム連携</h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>貴局内で稼働中の各基幹システムとTabascoのデータ同期設定を管理します。</p>
      </header>

      <div style={{ display: 'grid', gap: '20px' }}>
        {integrations.map(item => (
          <div key={item.id} className="glass-card" style={{ 
            backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #f1f3f5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <IconWrapper size={52} color={item.status === 'connected' ? '#f0f9ff' : '#fff5f5'} iconColor={item.status === 'connected' ? '#0ea5e9' : '#fa5252'}>
                  <Icons.Link />
               </IconWrapper>
               <div>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1e293b' }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
                     <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{item.type}</span>
                     <span>最終同期: {item.lastSync}</span>
                  </div>
               </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
               <div style={{ 
                  padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '900',
                  backgroundColor: item.status === 'connected' ? '#ebfbee' : '#fff5f5',
                  color: item.status === 'connected' ? '#087f5b' : '#c92a2a',
                  display: 'flex', alignItems: 'center', gap: '6px'
               }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: item.status === 'connected' ? '#087f5b' : '#c92a2a' }}></div>
                  {item.status === 'connected' ? '正常稼働中' : '接続エラー'}
               </div>
               <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '800' }}>
                 設定
               </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#fff9db', borderRadius: '20px', border: '1px dashed #f08c00', display: 'flex', gap: '16px', alignItems: 'center' }}>
         <Icons.Plus style={{ color: '#f08c00' }} />
         <div>
            <div style={{ fontWeight: '900', color: '#92400e' }}>新しいシステムの接続を追加</div>
            <div style={{ fontSize: '13px', color: '#b45309' }}>独自のAPIエンドポイントやFTPサーバーとの連携をセットアップします。</div>
         </div>
      </div>
    </div>
  );
};

export default ExternalIntegrationView;
