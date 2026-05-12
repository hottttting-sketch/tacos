import React from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';

const ManualView = () => {
  const sections = [
    { title: '基本的な使い方', icon: <Icons.Dashboard />, items: ['ログインと初期設定', 'ダッシュボードの見方', '通知・設定の変更'] },
    { title: 'パブリシティ依頼', icon: <Icons.Plus />, items: ['新規依頼の作成手順', '期間・パブ種別の選択', '共有者の個別設定'] },
    { title: '案件進行・素材管理', icon: <Icons.Board />, items: ['案件ボードの活用方法', '素材搬入予定日の管理', '同録データの確認・DL'] },
    { title: '高度な機能・AI', icon: <Icons.Zap />, items: ['AIリライト・学習設定', 'AIナレーションの一括生成', 'スプレッドシート自動連携'] },
  ];

  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#3E2723' }}>🍮 Pudding 操作マニュアル</h2>
        <p style={{ color: '#8B4513', marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>Puddingプラットフォームを最大限に活用するためのガイドです。</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        {sections.map((section, i) => (
          <div key={i} style={{ 
            padding: '2.5rem', borderRadius: '32px', border: '1.5px solid #F1E4C9', 
            backgroundColor: 'white', boxShadow: '0 10px 30px rgba(139,69,19,0.03)',
            transition: 'transform 0.2s', cursor: 'default'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
              <IconWrapper size={56} color="#FFFBE6" iconColor="#8B4513">{section.icon}</IconWrapper>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '950', color: '#3E2723' }}>{section.title}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {section.items.map((item, j) => (
                <li key={j} style={{ 
                  padding: '14px 0', borderBottom: j === section.items.length - 1 ? 'none' : '1px solid #f1f5f9',
                  color: '#57534e', fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <Icons.Check size={16} style={{ color: '#FFD93D' }} /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualView;
