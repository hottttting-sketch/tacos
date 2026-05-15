        if (role === 'agency' && !selectedBoardProject) {
           return (
              <PageView title="案件ボード" desc="進行を確認したい案件を選択してください。" icon={Layout} color="#f59e0b">
                 <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 2rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '12px', fontWeight: '950', gap: '2rem' }}>
                       <div style={{ flex: '1.2', minWidth: '150px' }}>スポンサー</div>
                       <div style={{ flex: '1.8', minWidth: '200px' }}>案件名</div>
                       <div style={{ flex: '1.5', minWidth: '180px' }}>依頼期間</div>
                       <div style={{ flex: '1', minWidth: '120px' }}>素材搬入開始日</div>
                       <div style={{ textAlign: 'right', minWidth: '80px' }}>依頼局数</div>
                       <div style={{ width: '24px' }}></div>
                    </div>
                    {projects.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>案件がありません。</div>
                    ) : projects.filter(p => p.status !== 'cancelled').map((p, i) => (
                       <div key={p.id} onClick={() => setSelectedBoardProject(p)} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem 2rem', backgroundColor: 'white', borderRadius: '20px', border: '1.5px solid #F1E4C9', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', gap: '2rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#FFD93D'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#F1E4C9'; }}>
                          <div style={{ flex: '1.2', minWidth: '150px' }}><div style={{ fontSize: '13px', color: '#8B4513', fontWeight: '800' }}>{p.sponsor_name}</div></div>
                          <div style={{ flex: '1.8', minWidth: '200px' }}><div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#3E2723' }}>{p.name}</div></div>
                          <div style={{ flex: '1.5', minWidth: '180px' }}><div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.start_date || '---'} 〜 {p.end_date || '---'}</div></div>
                          <div style={{ flex: '1', minWidth: '120px' }}><div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.material_start_date || p.metadata?.material_deadline || '---'}</div></div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}><div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#FFD93D' }}>{p.metadata?.selectedStations?.length || 0}局</div></div>
                          <ChevronRight style={{ color: '#F1E4C9' }} />
                       </div>
                    ))}
                 </div>
              </PageView>
           );
        }
        let boardItems = [];
        if (role === 'agency' && selectedBoardProject) {
           const stations = selectedBoardProject.metadata?.selectedStations || [];
           boardItems = stations.map(s => {
             const resp = selectedProjectResponses.find(r => r.station_name === s);
             let currentStatus = 'slots'; 
             if (resp) {
                if (resp.status === 'registered' || resp.status === 'pending') currentStatus = 'materials';
                else if (resp.status === 'material_ok' || resp.status === 'rewrites') currentStatus = 'rewrites';
                else if (resp.status === 'rewrite_ok' || resp.status === 'recordings') currentStatus = 'recordings';
             }
               return { 
                 id: `${selectedBoardProject.id}-${s}`, 
                 projectId: selectedBoardProject.id,
                 name: selectedBoardProject.name, 
                 sponsor: selectedBoardProject.sponsor_name, 
                 station: s, 
                 status: currentStatus,
                 has_material: resp?.response_data?.has_material || false,
                 material_sent: resp?.response_data?.material_sent || false,
                 material_paths: resp?.response_data?.material_paths || [],
                 material_names: resp?.response_data?.material_names || [],
                 has_revised_material: resp?.response_data?.has_revised_material || false,
                 revised_sent: resp?.response_data?.revised_sent || false,
                 revised_filename: resp?.response_data?.revised_filename || null,
                 has_recording: resp?.response_data?.has_recording || false,
                 recording_filename: resp?.response_data?.recording_filename || null,
                 recording_downloaded: resp?.response_data?.recording_downloaded || false,
                 has_rewrite: resp?.response_data?.has_rewrite || false,
                 rewrite_sent: resp?.response_data?.rewrite_sent || false,
                 rewrite_filename: resp?.response_data?.rewrite_filename || null,
                 rewrite_deadline: resp?.response_data?.rewrite_deadline || null
               };
           });
        } else {
           boardItems = projects.filter(p => p.status !== 'cancelled').map(p => {
              const requestedStations = p.metadata?.selectedStations || [];
              let stationName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A';
              
              if (requestedStations.length > 0 && !requestedStations.includes(stationName)) {
                 stationName = requestedStations[0];
              }

              const projectResponses = broadcasterResponses[p.id] || [];
              const stationResp = projectResponses.find(r => r.station_name === stationName);
              const response = stationResp?.response_data || p.metadata?.[`response_${stationName}`] || {};
              const respStatus = stationResp?.status || response.status;
              return { 
                 ...p, 
                 sponsor: p.sponsor_name || p.metadata?.sponsor || '未設定', 
                 station: stationName, 
                 status: (respStatus === 'registered' || respStatus === 'pending') ? 'materials' :
                         (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'rewrites' :
                         respStatus === 'rewrite_ok' ? 'recordings' :
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
          <PageView title={selectedBoardProject ? `推進管理: ${selectedBoardProject.name}` : "案件ボード"} desc={selectedBoardProject ? "放送局ごとの推進管理を調整します。" : "案件の調整推進を整理します。"} icon={Layout} color="#f59e0b" action={selectedBoardProject && (<button onClick={() => setSelectedBoardProject(null)} style={{ padding: '8px 20px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: 'white', fontWeight: '900', cursor: 'pointer' }}>案件一覧に戻る</button>)}>
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
                                          const hiddenItems = responses.filter(r => r.status === 'completed');
                                          if (hiddenItems.length === 0) {
                                            alert('非表示の案件はありません。');
                                            return;
                                          }
                                          for (const r of hiddenItems) {
                                            await api.saveStationResponse(selectedBoardProject.id, r.station_name, {
                                              ...(r.response_data || {}),
                                              status: 'recordings'
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
                             {col.items.length > 0 && (
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
                             )}
                          </div>
                        )}
                      </h3>
                      {col.items.map(item => (
                         <div key={item.id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1E4C9', marginBottom: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                               <div style={{ fontSize: '10px', color: '#FFD93D', fontWeight: '950', backgroundColor: '#3E2723', padding: '2px 8px', borderRadius: '4px' }}>{item.station}</div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                     onClick={(e) => { e.stopPropagation(); setActiveChatChannel(item.name); setActiveTab('chat'); }} 
                                     style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                     <MessageSquare size={12} /> チャット
                                  </button>
                               </div>
                            </div>
                            <div style={{ fontWeight: '950', fontSize: '14px', color: '#3E2723', marginBottom: '4px' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#8B4513', fontWeight: '700', marginBottom: '12px' }}>{item.sponsor}</div>
                            <div style={{ paddingTop: '12px', borderTop: '1px dashed #F1E4C9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                               {col.id === 'slots' && role !== 'agency' && (
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedRequest(item); setActiveTab('slot-registration'); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                     <Clock size={14} /> 枠詳細登録
                                  </button>
                                )}
                               {col.id === 'materials' && (
                                  role === 'agency' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {item.has_material && (
                                           <div style={{ fontSize: '11px', color: '#059669', fontWeight: '950', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}>
                                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  <Check size={14} /> 素材アップロード済 ({(item.material_paths || []).length}件)
                                               </div>
                                               <div style={{ fontSize: '9px', color: '#065f46', borderTop: '1px solid #d1fae5', paddingTop: '4px', marginTop: '2px', opacity: 0.8 }}>
                                                  {(item.material_paths || []).map((path, idx) => {
                                                     const fileName = path.split('/').pop();
                                                     const displayName = item.material_names?.[idx] || (fileName.includes('_') ? fileName.split('_').slice(2).join('_').replace(/-\d+(\.[^.]+)+$/, '$1') : fileName);
                                                     return (
                                                         <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>・{displayName}</div>
                                                            {!item.material_sent && (
                                                               <button 
                                                                   onClick={(e) => { 
                                                                     e.stopPropagation(); 
                                                                     handleDeleteMaterialFile(item.projectId || item.id, item.station, idx); 
                                                                   }}
                                                                   style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.7 }}
                                                                   onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                                                   onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                                                                >
                                                                   <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                         </div>
                                                      );
                                                  })}
                                               </div>
                                           </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); handleMaterialUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                               <Upload size={12} /> 素材UP
                                            </button>
                                            <button 
                                              disabled={!item.has_material || item.material_sent}
                                              onClick={async (e) => { 
                                                e.stopPropagation(); 
                                                const success = await api.updateProject(item.projectId || item.id, { 
                                                  metadata: { [`response_${item.station}`]: { ...(selectedBoardProject.metadata?.[`response_${item.station}`] || {}), material_sent: true, status: 'registered' } }
                                                }); 
                                                if (success) {
                                                  alert('素材の送信が完了しました。');
                                                  fetchProjects();
                                                }
                                              }} 
                                              style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: (item.has_material && !item.material_sent) ? '#3E2723' : '#94a3b8', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: (item.has_material && !item.material_sent) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                               <Check size={12} /> 送信
                                            </button>
                                         </div>
                                     </div>
                                   ) : (
                                     <button 
                                        disabled={!item.has_material}
                                        onClick={(e) => { e.stopPropagation(); handleMaterialDownload(item.projectId || item.id, item.station); }} 
                                        style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: item.has_material ? '#3b82f6' : '#f8fafc', color: item.has_material ? 'white' : '#cbd5e1', border: item.has_material ? 'none' : '1.5px solid #e2e8f0', fontSize: '11px', fontWeight: '950', cursor: item.has_material ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                     >
                                        <Download size={14} /> 素材DL
                                     </button>
                                   )
                                 )}
                               {col.id === 'rewrites' && (
                                  role === 'agency' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                       <button 
                                          disabled={!item.has_rewrite}
                                          onClick={(e) => { e.stopPropagation(); handleRewriteDownload(item.projectId || item.id, item.station); }} 
                                          style={{ 
                                            width: '100%', padding: '10px', borderRadius: '12px', 
                                            backgroundColor: item.has_rewrite ? '#3b82f6' : '#f8fafc', 
                                            color: item.has_rewrite ? 'white' : '#cbd5e1', 
                                            border: item.has_rewrite ? 'none' : '1.5px solid #e2e8f0',
                                            fontSize: '11px', fontWeight: '950', 
                                            cursor: item.has_rewrite ? 'pointer' : 'not-allowed', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                          }}
                                        >
                                           <Download size={14} /> リライト・修正稿DL
                                        </button>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                           <button onClick={(e) => { e.stopPropagation(); handleRevisedUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                              <Upload size={12} /> 修正稿UP
                                           </button>
                                           <button 
                                              disabled={!item.has_revised_material || item.revised_sent}
                                              onClick={(e) => { e.stopPropagation(); handleRevisedSend(item.projectId || item.id, item.station); }} 
                                              style={{ 
                                                flex: '1', padding: '10px', borderRadius: '12px', 
                                                backgroundColor: (item.has_revised_material && !item.revised_sent) ? '#3E2723' : '#94a3b8', 
                                                color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                                cursor: (item.has_revised_material && !item.revised_sent) ? 'pointer' : 'not-allowed', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' 
                                              }}
                                            >
                                               <Check size={12} /> {item.revised_sent ? '送信済' : '送信'}
                                           </button>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleNoRevision(item.projectId || item.id, item.station); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: 'white', color: '#64748b', border: '1.5px solid #e2e8f0', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                           <Check size={14} /> 修正なし
                                        </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                       <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                 <Clock size={12} /> 修正〆切: {item.rewrite_deadline || '未設定'}
                                              </div>
                                              {item.rewrite_deadline && (
                                                 <button 
                                                   onClick={(e) => { e.stopPropagation(); handleClearRewriteDeadline(item.projectId || item.id, item.station); }}
                                                   style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                   title="〆切設定を解除"
                                                 >
                                                   <Trash2 size={12} />
                                                 </button>
                                              )}
                                           </div>
                                       </div>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          <button onClick={(e) => { e.stopPropagation(); handleRewriteUpload(item.projectId || item.id, item.station); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                             <Edit size={14} /> リライト・修正稿UP
                                          </button>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleRevisedDownload(item.projectId || item.id, item.station); }} 
                                              style={{ 
                                                width: '100%', padding: '10px', borderRadius: '12px', 
                                                backgroundColor: '#3b82f6', 
                                                color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                                cursor: 'pointer', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                              }}
                                           >
                                              <Download size={14} /> 修正稿DL
                                           </button>
                                          {item.has_rewrite && item.rewrite_filename && (
                                             <div style={{ fontSize: '9px', color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 8px', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid #d1fae5' }}>
                                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                       ・{item.rewrite_filename}
                                                    </div>
                                                    <button 
                                                       onClick={(e) => { e.stopPropagation(); handleDeleteRewriteFile(item.projectId || item.id, item.station); }}
                                                       style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', marginLeft: '4px', display: 'flex', alignItems: 'center' }}
                                                       title="ファイルを削除"
                                                    >
                                                       <Trash2 size={10} />
                                                    </button>
                                                 </div>
                                             </div>
                                          )}
                                          <button 
                                            disabled={!item.has_rewrite}
                                            onClick={async (e) => { 
                                              e.stopPropagation(); 
                                              const success = await api.saveStationResponse(item.projectId || item.id, item.station, {
                                                ...(broadcasterResponses[item.projectId || item.id]?.find(r => r.station_name === item.station)?.response_data || {}),
                                                status: 'rewrite_ok'
                                              });
                                              if (success) {
                                                alert('リライト・修正稿の送信が完了しました。');
                                                fetchProjects();
                                              }
                                            }} 
                                            style={{ 
                                              width: '100%', padding: '10px', borderRadius: '12px', 
                                              backgroundColor: item.has_rewrite ? '#3E2723' : '#94a3b8', 
                                              color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                              cursor: item.has_rewrite ? 'pointer' : 'not-allowed', 
                                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                            }}
                                          >
                                             <Check size={14} /> 送信
                                          </button>
                                       </div>
                                    </div>
                                  )
                               )}

                               {col.id === 'recordings' && (
                                  role === 'agency' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                       <button 
                                          disabled={!item.has_recording}
                                          onClick={(e) => { e.stopPropagation(); handleRecordingDownload(item.projectId || item.id, item.station); }} 
                                          style={{ 
                                             width: '100%', padding: '10px', borderRadius: '12px', 
                                             backgroundColor: item.has_recording ? '#10b981' : '#f8fafc', 
                                             color: item.has_recording ? 'white' : '#cbd5e1', 
                                             border: item.has_recording ? 'none' : '1.5px solid #e2e8f0',
                                             fontSize: '11px', fontWeight: '950', 
                                             cursor: item.has_recording ? 'pointer' : 'not-allowed', 
                                             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                          }}
                                       >
                                          <Download size={14} /> 同録DL
                                       </button>
                                       <button 
                                         disabled={!item.recording_downloaded}
                                         onClick={async (e) => { 
                                           e.stopPropagation(); 
                                           if (confirm('この案件を非表示にしますか？')) {
                                             const success = await api.updateProject(item.projectId || item.id, { status: 'completed' }); 
                                             if (success) {
                                               alert('案件を非表示（完了）にしました。');
                                               fetchProjects();
                                             }
                                           }
                                         }} 
                                         style={{ 
                                            width: '100%', padding: '10px', borderRadius: '12px', 
                                            backgroundColor: item.recording_downloaded ? '#4b5563' : '#f1f5f9', 
                                            color: item.recording_downloaded ? 'white' : '#94a3b8', 
                                            border: 'none', fontSize: '11px', fontWeight: '950', 
                                            cursor: item.recording_downloaded ? 'pointer' : 'not-allowed', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                         }}
                                       >
                                          <EyeOff size={14} /> 非表示
                                       </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {item.has_recording && item.recording_filename && (
                                           <div style={{ fontSize: '9px', color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 8px', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid #d1fae5' }}>
                                              ・{item.recording_filename}
                                           </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                           <button onClick={(e) => { e.stopPropagation(); handleRecordingUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                              <Mic size={12} /> 同録UP
                                           </button>
                                           <button 
                                             disabled={!item.has_recording}
                                             onClick={async (e) => { 
                                               e.stopPropagation(); 
                                               try {
                                                 const success = await api.updateProject(item.projectId || item.id, { status: 'completed' }); 
                                                 if (success) {
                                                   alert('同録の送信が完了しました。案件を完了として保存しました。');
                                                   fetchProjects();
                                                 }
                                               } catch (err) {
                                                 console.error('Failed to complete project:', err);
                                                 alert('送信に失敗しました。');
                                               }
                                             }} 
                                             style={{ 
                                               flex: '1', padding: '10px', borderRadius: '12px', 
                                               backgroundColor: item.has_recording ? '#3E2723' : '#94a3b8', 
                                               color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                               cursor: item.has_recording ? 'pointer' : 'not-allowed', 
                                               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' 
                                             }}
                                           >
                                              <Check size={12} /> 送信
                                           </button>
                                        </div>
                                    </div>
                                  )
                               )}
                      ))}
                   </div>
                ))}
             </div>
          </PageView>
        );
        case 'excel':