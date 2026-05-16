import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Update the button click handler
content = content.replace(
  /alert\('同録データの一括アップロードを開始します。'\);/,
  "setActiveModal('bulk-recording-upload');"
);

// 2. Add the modal UI
const modalUI = `
      {activeModal === 'bulk-recording-upload' && (
         <Modal title="同録ファイル一括アップロード" onClose={() => setActiveModal(null)} width="700px">
            <div style={{ display: 'grid', gap: '32px' }}>
               {/* 上段: 素材名ルール */}
               <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                     <div style={{ width: '4px', height: '16px', backgroundColor: '#FFD93D', borderRadius: '2px' }} />
                     <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723', margin: 0 }}>素材名ルール</h4>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#3E2723', lineHeight: '1.8' }}>
                     <div style={{ fontWeight: '800', marginBottom: '8px', color: '#8B4513' }}>以下の形式でファイル名を指定してください：</div>
                     <code style={{ display: 'block', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                        【案件名】_放送局名_収録日.mp4
                     </code>
                     <div style={{ fontSize: '12px', color: '#64748b' }}>
                        例：【春のパブキャンペーン】_系列局A_20260515.mp4<br/>
                        ※収録日は「YYYYMMDD」形式で入力してください。
                     </div>
                  </div>
               </div>

               {/* 下段: アップローダー */}
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                     <div style={{ width: '4px', height: '16px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                     <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723', margin: 0 }}>アップロード</h4>
                  </div>
                  <div style={{ 
                     border: '2px dashed #cbd5e1', 
                     borderRadius: '20px', 
                     padding: '40px', 
                     textAlign: 'center',
                     backgroundColor: '#f8fafc',
                     cursor: 'pointer',
                     transition: 'all 0.2s'
                  }}
                  onClick={() => document.getElementById('bulk-recording-input')?.click()}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  >
                     <Upload size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                     <div style={{ fontSize: '15px', fontWeight: '800', color: '#3E2723', marginBottom: '4px' }}>ファイルを選択またはドラッグ＆ドロップ</div>
                     <div style={{ fontSize: '12px', color: '#94a3b8' }}>対応形式: MP4, MOV, MP3, WAV</div>
                     <input 
                        id="bulk-recording-input"
                        type="file" 
                        multiple 
                        accept="video/*,audio/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                           const files = Array.from(e.target.files);
                           if (files.length > 0) alert(\`\${files.length}件のファイルを選択しました。\`);
                        }}
                     />
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'white', border: '2px solid #F1E4C9', fontWeight: '950', cursor: 'pointer' }}>キャンセル</button>
                  <button onClick={() => alert('割付送信機能は現在開発中です。')} style={{ flex: 1.5, padding: '16px', borderRadius: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                     <Send size={18} /> 割付送信
                  </button>
               </div>
            </div>
         </Modal>
      )}`;

// Capture the whole block including the final brace
const regex = /(\{activeModal === 'bulk-cancel' && \([\s\S]*?<\/Modal>\s*\)\})/;
if (regex.test(content)) {
  content = content.replace(regex, `$1\n\n${modalUI}`);
} else {
  console.log('Regex did not match bulk-cancel modal');
}

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Added Bulk Recording Upload Modal!');
