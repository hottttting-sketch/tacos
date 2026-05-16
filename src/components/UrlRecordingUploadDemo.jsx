import React, { useState } from 'react';
import { Upload, Video, Check, AlertCircle, FileVideo, ShieldCheck, Clock, Calendar } from 'lucide-react';

const Icons = { Upload, Video, Check, AlertCircle, FileVideo, ShieldCheck, Clock, Calendar };

const UrlRecordingUploadDemo = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFile(file.name);
          setIsUploading(false);
        }
      }, 200);
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#fdfbf7', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <header style={{ marginBottom: '32px', backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(62,39,35,0.05)', border: '1.5px solid #F1E4C9' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                 <div style={{ fontSize: '12px', fontWeight: '950', color: '#8B4513', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Broadcast Recording</div>
                 <h1 style={{ fontSize: '2rem', fontWeight: '950', color: '#3E2723', margin: 0 }}>同録ファイルのアップロード</h1>
              </div>
              <div style={{ backgroundColor: '#fff5f5', padding: '12px 24px', borderRadius: '14px', border: '1.5px solid #feb2b2' }}>
                 <div style={{ fontSize: '11px', color: '#c53030', fontWeight: '950' }}>提出ステータス</div>
                 <div style={{ fontSize: '15px', color: '#c53030', fontWeight: '950' }}>未提出</div>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', padding: '24px', backgroundColor: '#fcfcfd', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ backgroundColor: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
                    <Icons.Calendar size={18} color="#4338ca" />
                 </div>
                 <div>
                    <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '950', display: 'block' }}>放送日</label>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>2026年6月15日(月)</div>
                 </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ backgroundColor: '#fff7ed', padding: '10px', borderRadius: '12px' }}>
                    <Icons.Clock size={18} color="#f97316" />
                 </div>
                 <div>
                    <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '950', display: 'block' }}>放送時間</label>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>19:15 〜 19:17 (2分)</div>
                 </div>
              </div>
           </div>
        </header>

        {/* Upload Section */}
        <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(62,39,35,0.05)', border: '1.5px solid #F1E4C9', textAlign: 'center' }}>
           <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ marginBottom: '32px' }}>
                 <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#3E2723', marginBottom: '12px' }}>同録ファイルを選択</h2>
                 <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                    放送された内容の同録データ（MP4, MOV等）をアップロードしてください。<br />
                    アップロード後、スポンサーおよび代理店が閲覧可能になります。
                 </p>
              </div>

              {!uploadedFile && !isUploading && (
                 <div 
                    onClick={() => document.getElementById('recording-upload').click()}
                    style={{ border: '2px dashed #F1E4C9', borderRadius: '24px', backgroundColor: '#fffcf7', padding: '60px 40px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff9eb'; e.currentTarget.style.borderColor = '#FFD93D'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fffcf7'; e.currentTarget.style.borderColor = '#F1E4C9'; }}
                 >
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'inline-flex', marginBottom: '20px' }}>
                       <Icons.Video size={40} color="#8B4513" />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '950', color: '#3E2723', marginBottom: '8px' }}>ファイルを選択</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>またはここにドラッグ＆ドロップ</div>
                    <input type="file" id="recording-upload" accept="video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                 </div>
              )}

              {isUploading && (
                 <div style={{ padding: '60px 40px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '24px' }}>
                       <div style={{ fontSize: '14px', fontWeight: '950', color: '#3E2723', marginBottom: '8px' }}>アップロード中... {uploadProgress}%</div>
                       <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#3E2723', transition: 'width 0.2s ease' }}></div>
                       </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>大容量ファイルの場合は時間がかかることがあります。</p>
                 </div>
              )}

              {uploadedFile && (
                 <div style={{ padding: '60px 40px', backgroundColor: '#f0fdf4', borderRadius: '24px', border: '2px solid #dcfce7', animation: 'scaleIn 0.3s ease' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.1)', display: 'inline-flex', marginBottom: '20px' }}>
                       <Icons.Check size={40} color="#16a34a" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#16a34a', marginBottom: '8px' }}>アップロード完了</h3>
                    <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '800', marginBottom: '24px' }}>{uploadedFile}</div>
                    <button 
                       onClick={() => setUploadedFile(null)}
                       style={{ background: 'none', border: '1px solid #dcfce7', color: '#059669', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '950', cursor: 'pointer' }}
                    >
                       ファイルを変更する
                    </button>
                 </div>
              )}

              <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                 <Icons.ShieldCheck size={18} color="#64748b" />
                 <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', margin: 0, textAlign: 'left' }}>
                    送信されたデータは暗号化され、セキュアに保存されます。
                 </p>
              </div>
           </div>
        </section>

        <footer style={{ marginTop: '40px', textAlign: 'center', paddingBottom: '40px' }}>
           <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
              Powered by ぷりん (TV Pub Linker)
           </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default UrlRecordingUploadDemo;
