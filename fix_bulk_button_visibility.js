import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const target = `{col.items.length > 0 && (
                                <button 
                                   onClick={(e) => { 
                                     e.stopPropagation(); 
                                     if (role === 'agency') {
                                       alert('選択されたすべての同録データをダウンロードします。');
                                       col.items.forEach(item => {
                                         if (item.has_recording) handleRecordingDownload(item.projectId || item.id, item.station);
                                       });
                                     } else {
                                       alert('同録データの一括アップロードを開始します。');
                                     }
                                   }} 
                                   style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: 'white', color: '#10b981', border: '1.5px solid #10b981', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                   {role === 'agency' ? <Download size={12} /> : <Upload size={12} />}
                                   {role === 'agency' ? '一括DL' : '一括UP'}
                                </button>
                             )}`;

const replacement = `<button 
                                   onClick={(e) => { 
                                     e.stopPropagation(); 
                                     if (role === 'agency') {
                                       alert('選択されたすべての同録データをダウンロードします。');
                                       col.items.forEach(item => {
                                         if (item.has_recording) handleRecordingDownload(item.projectId || item.id, item.station);
                                       });
                                     } else {
                                       alert('同録データの一括アップロードを開始します。');
                                     }
                                   }} 
                                   style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: 'white', color: '#10b981', border: '1.5px solid #10b981', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                   {role === 'agency' ? <Download size={12} /> : <Upload size={12} />}
                                   {role === 'agency' ? '一括DL' : '一括UP'}
                                </button>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Removed length condition for bulk buttons!');
