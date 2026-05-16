import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const brokenPart = `(respStatus === 'rewrite_ok' || respStatus === 'recordings') ? 'recordings' :
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                         {col.title}
                         <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{col.items.length}</span>
                         {col.id === 'recordings' && (
                           <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                             {role === 'agency' && (
                                <button 
                                   onClick={async (e) => { 
                                     e.stopPropagation(); 
                                     if (confirm('非表示にしたすべての案件を再表示しますか？')) {
                                        try {
                                          const responses = await api.getStationResponses(selectedBoardProject.id);
                                          const hiddenItems = responses.filter(r => r.response_data && r.response_data.agency_hidden === true);
                                          if (hiddenItems.length === 0) {
                                            alert('非表示の案件はありません。');
                                            return;
                                          }
                                          for (const r of hiddenItems) {
                                            await api.saveStationResponse(selectedBoardProject.id, r.station_name, {
                                              ...(r.response_data || {}),
                                              agency_hidden: false
                                            });
                                          }
                                          alert('案件を再表示しました。');
                                          fetchProjects();
                                          const updatedRes = await api.getStationResponses(selectedBoardProject.id);
                                          setSelectedProjectResponses(updatedRes || []);
                                        } catch (err) {
                                          console.error('Failed to restore items:', err);
                                        }
                                     }
                                   }} 
                                   style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: 'white', color: '#64748b', border: '1.5px solid #e2e8f0', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                   <Sliders size={12} /> 一括再表示
                                </button>
                             )}
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
                          </div>
                        )}`;

const fixedPart = `(respStatus === 'rewrite_ok' || respStatus === 'recordings') ? 'recordings' :
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
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                        {col.title}
                        <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{col.items.length}</span>
                        {col.id === 'recordings' && (
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            {role === 'agency' && (
                              <button 
                                onClick={async (e) => { 
                                  e.stopPropagation(); 
                                  if (confirm('非表示にしたすべての案件を再表示しますか？')) {
                                    try {
                                      const responses = await api.getStationResponses(selectedBoardProject.id);
                                      const hiddenItems = responses.filter(r => r.response_data && r.response_data.agency_hidden === true);
                                      if (hiddenItems.length === 0) {
                                        alert('非表示の案件はありません。');
                                        return;
                                      }
                                      for (const r of hiddenItems) {
                                        await api.saveStationResponse(selectedBoardProject.id, r.station_name, {
                                          ...(r.response_data || {}),
                                          agency_hidden: false
                                        });
                                      }
                                      alert('案件を再表示しました。');
                                      fetchProjects();
                                      const updatedRes = await api.getStationResponses(selectedBoardProject.id);
                                      setSelectedProjectResponses(updatedRes || []);
                                    } catch (err) {
                                      console.error('Failed to restore items:', err);
                                    }
                                  }
                                }} 
                                style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: 'white', color: '#64748b', border: '1.5px solid #e2e8f0', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Sliders size={12} /> 一括再表示
                              </button>
                            )}
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
                              style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              {role === 'agency' ? <Download size={12} /> : <Upload size={12} />}
                              {role === 'agency' ? '一括DL' : '一括UP'}
                            </button>
                          </div>
                        )}`;

content = content.replace(brokenPart, fixedPart);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed file corruption!');
