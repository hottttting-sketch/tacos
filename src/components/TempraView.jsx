import React from 'react';
import { Calendar, Monitor, Users, ExternalLink } from 'lucide-react';

const TempraView = () => {
  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--tempra-accent, #FF9800)' }}>🍤 Tempra 管理画面</h2>
        <p style={{ color: 'var(--text-secondary, #64748b)' }}>番組連動のタイム管理と連携状況を確認します。</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #FFE082' }}>
           <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Calendar size={20} /> 今週の提供枠スケジュール
           </h3>
           <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                { time: '19:00', program: 'ゴールデンタイム特選', spot: '満枠' },
                { time: '21:00', program: '夜のニュースサマリー', spot: '残り1枠' },
                { time: '23:30', program: 'ミッドナイトトーク', spot: '残り3枠' }
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', padding: '1rem', backgroundColor: i % 2 === 0 ? '#FFF8E1' : 'transparent', borderRadius: '12px' }}>
                   <div style={{ width: '80px', fontWeight: '900', color: 'var(--tempra-accent, #FF9800)' }}>{row.time}</div>
                   <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>{row.program}</div>
                   <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: row.spot === '満枠' ? '#ef4444' : '#10b981' }}>{row.spot}</div>
                </div>
              ))}
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #FFE082' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={18} /> 通販連携状況
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { label: '連携済み番組', value: '12', color: '#22c55e' },
                { label: '申請中', value: '3', color: '#f59e0b' },
                { label: '要対応', value: '1', color: '#ef4444' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '10px', backgroundColor: '#FFFBEB' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontWeight: '900', color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #FFE082' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> 担当者
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {['田中 太郎', '鈴木 花子', '山田 次郎'].map((name, i) => (
                <div key={i} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempraView;
