import React, { useState } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const UpdateRequestView = () => {
  const [requestType, setRequestType] = useState('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createProject({
        name: title,
        sponsor_name: 'アップデート申請',
        status: 'requesting',
        metadata: {
          type: 'update_request',
          requestType,
          description
        }
      });
      setSubmitted(true);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('送信に失敗しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <IconWrapper size={80} color="#ebfbee" iconColor="#087f5b" borderRadius={40}>
          <Icons.Check />
        </IconWrapper>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', marginTop: '1.5rem' }}>申請を承りました</h2>
        <p style={{ color: '#64748b', marginTop: '0.75rem', fontWeight: '700' }}>ご要望ありがとうございます。内容を確認し、順次検討させていただきます。</p>
        <button onClick={() => setSubmitted(false)} className="btn-secondary" style={{ marginTop: '2rem', padding: '10px 24px', borderRadius: '12px', fontWeight: '800' }}>新しく申請する</button>
      </div>
    );
  }

  const labelStyle = { fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' };
  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', fontWeight: '600', outline: 'none' };

  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>アップデート申請</h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>新機能の追加や、現状の不備・改善に関するご要望をお送りください。</p>
      </header>

      <form className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'white', border: '1.5px solid #f1f5f9' }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={labelStyle}>申請の種類</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['feature', 'bug', 'improvement'].map((type) => (
              <button 
                key={type}
                type="button"
                onClick={() => setRequestType(type)}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: requestType === type ? '#f0f9ff' : 'white',
                  borderColor: requestType === type ? '#0ea5e9' : '#e2e8f0',
                  color: requestType === type ? '#0ea5e9' : '#64748b'
                }}
              >
                {type === 'feature' ? '新機能要望' : type === 'bug' ? '不具合報告' : '改善提案'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={labelStyle}>タイトル</label>
          <input 
            type="text" 
            placeholder="例: ○○画面での一括選択機能の追加" 
            style={inputStyle} 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={labelStyle}>詳細内容</label>
          <textarea 
            placeholder="具体的なご要望や現状の問題点を詳しくご記入ください..." 
            style={{ ...inputStyle, minHeight: '180px', resize: 'none', lineHeight: '1.6' }} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required 
          />
        </div>

        <button 
          className="btn-primary" 
          disabled={isSubmitting}
          style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: '900', boxShadow: '0 8px 20px rgba(10, 165, 233, 0.2)', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? '送信中...' : '申請を送信する'}
        </button>
      </form>
    </div>
  );
};

export default UpdateRequestView;
