import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const regex = /\(respStatus === 'rewrite_ok' \|\| respStatus === 'recordings'\) \? 'recordings' :\s*<div style=\{\{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col\.color \}\} \/>/;

const replacement = `(respStatus === 'rewrite_ok' || respStatus === 'recordings') ? 'recordings' :
                         p.status === 'requesting' ? 'slots' : p.status,
                  has_material: response.has_material || false,
                  material_sent: response.material_sent || false,
                  material_paths: response.material_paths || [],
                  material_names: response.material_names || [],
                  has_revised_material: response.has_revised_material || false,
                  revised_sent: response.revised_sent || false,
                  revised_filename: response.revised_filename || null,
                  has_recording: response.has_recording || false,
                  recording_filename: response.recording_filename || null,
                  recording_downloaded: response.recording_downloaded || false,
                  has_rewrite: response.has_rewrite || false,
                  rewrite_sent: response.rewrite_sent || false,
                  rewrite_filename: response.rewrite_filename || null,
                  rewrite_deadline: response.rewrite_deadline || null
              };
           });
        }
        const boardColumns = [
           { id: 'slots', title: '枠出し待ち', color: '#64748b' },
           { id: 'materials', title: '素材待ち', color: '#3b82f6' },
           { id: 'rewrites', title: 'リライト待ち', color: '#f59e0b' },
           { id: 'recordings', title: '同録待ち', color: '#10b981' },
        ].map(col => ({ ...col, items: boardItems.filter(item => item.status === col.id) }));
        return (
          <PageView title={selectedBoardProject ? \`推進管理: \${selectedBoardProject.name}\` : "案件ボード"} desc={selectedBoardProject ? "放送局ごとの推進管理を調整します。" : "案件の調整推進を整理します。"} icon={Layout} color="#f59e0b" action={selectedBoardProject && (<button onClick={() => setSelectedBoardProject(null)} style={{ padding: '8px 20px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: 'white', fontWeight: '900', cursor: 'pointer' }}>案件一覧に戻る</button>)}>
             <div style={{ display: 'flex', gap: '20px', minHeight: '600px', overflowX: 'auto', paddingBottom: '20px' }}>
                {boardColumns.map(col => (
                   <div key={col.id} style={{ flex: '1', minWidth: '280px', backgroundColor: '#fcfcfd', borderRadius: '24px', padding: '16px', border: '1.5px solid #F1E4C9' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '950', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3E2723' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Fixed file corruption with regex!');
} else {
    console.log('Regex did not match!');
}
