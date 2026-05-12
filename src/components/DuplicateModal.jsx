import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import { api } from '../utils/api';

const DuplicateModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const [pastRequests, setPastRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const projs = await api.getProjects();
        const timeProjs = (projs || [])
          .filter(p => p.metadata?.type === 'time')
          .map(p => ({
            id: p.id,
            sponsor: p.sponsor_name,
            product: p.name,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('ja-JP') : '-',
            // TimeEstimateView が期待するデータ形式にマッピング
            formData: {
              sponsor: p.sponsor_name,
              ba: p.metadata?.ba || '',
              budget: p.metadata?.budget || '',
              area: p.metadata?.area || [],
              periods: [{ start: p.start_date || '', end: p.end_date || '' }],
              tg: p.metadata?.tg || '',
              scale: p.metadata?.scale || '',
              planningDetails: p.metadata?.planningDetails || '',
              hearingItems: p.metadata?.hearingItems || [],
              selectedStations: p.metadata?.selectedStations || []
            }
          }));
        setPastRequests(timeProjs);
      } catch (e) {
        console.error('Failed to fetch past requests:', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) fetchHistory();
  }, [isOpen]);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pop" style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '500px', boxShadow: '0 30px 70px rgba(0, 0, 0, 0.4)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#fff9db', borderRadius: '12px', color: '#f08c00' }}>
              <Icons.Folder size={24} />
            </div>
            過去の依頼から複製
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>×</button>
        </div>
        
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', fontWeight: '600' }}>
          複製したい過去の見積依頼を選択してください。現在の入力内容は選択したデータで上書きされます。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>履歴を読み込み中...</div>
          ) : pastRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>過去の依頼履歴が見つかりません。</div>
          ) : pastRequests.map(req => (
            <div 
              key={req.id} 
              onClick={() => onSelect(req.formData)}
              style={{ 
                padding: '16px', borderRadius: '20px', border: '1.5px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: '#f8fafc', position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--tacos-red)';
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#f1f5f9';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', marginBottom: '4px' }}>{req.id} · {req.date}</div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#1e293b' }}>{req.sponsor} / {req.product}</div>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                <Icons.ArrowLeft style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: '16px', fontWeight: '800' }}>
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default DuplicateModal;
