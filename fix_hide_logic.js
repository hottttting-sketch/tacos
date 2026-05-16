import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Agency Hide Button
const agencyHideTarget = `                                           if (confirm('この案件を非表示にしますか？')) {
                                             const success = await api.updateProject(item.projectId || item.id, { status: 'completed' }); 
                                             if (success) {
                                               alert('案件を非表示（完了）にしました。');
                                               fetchProjects();
                                             }
                                           }`;

const agencyHideReplace = `                                           if (!item.recording_downloaded) {
                                             alert('同録DLボタンをクリックしてファイルをダウンロードしてから非表示にできます。');
                                             return;
                                           }
                                           if (confirm('この案件を非表示にしますか？')) {
                                             try {
                                               const responses = await api.getStationResponses(item.projectId || item.id);
                                               const current = responses.find(r => r.station_name === item.station) || {};
                                               const success = await api.saveStationResponse(item.projectId || item.id, item.station, {
                                                 ...(current.response_data || {}),
                                                 agency_hidden: true
                                               });
                                               if (success) {
                                                 alert('案件を非表示にしました。');
                                                 fetchProjects();
                                                 if (selectedBoardProject) {
                                                   const updatedRes = await api.getStationResponses(selectedBoardProject.id);
                                                   setSelectedProjectResponses(updatedRes || []);
                                                 }
                                               }
                                             } catch(e) { console.error(e); }
                                           }`;
content = content.replace(agencyHideTarget, agencyHideReplace);

// 2. Broadcaster Send Button
const bcSendTarget = `                                               try {
                                                 const success = await api.updateProject(item.projectId || item.id, { status: 'completed' }); 
                                                 if (success) {
                                                   alert('同録の送信が完了しました。案件を完了として保存しました。');
                                                   fetchProjects();
                                                 }
                                               } catch (err) {
                                                 console.error('Failed to complete project:', err);
                                                 alert('送信に失敗しました。');
                                               }`;

const bcSendReplace = `                                               try {
                                                 const responses = await api.getStationResponses(item.projectId || item.id);
                                                 const current = responses.find(r => r.station_name === item.station) || {};
                                                 const success = await api.saveStationResponse(item.projectId || item.id, item.station, {
                                                   ...(current.response_data || {}),
                                                   broadcaster_hidden: true
                                                 });
                                                 if (success) {
                                                   alert('同録の送信が完了しました。案件を完了として保存しました。');
                                                   fetchProjects();
                                                 }
                                               } catch (err) {
                                                 console.error('Failed to complete project:', err);
                                                 alert('送信に失敗しました。');
                                               }`;
content = content.replace(bcSendTarget, bcSendReplace);

// 3. Agency Bulk Unhide
const bulkUnhideTarget = `                                          const hiddenItems = responses.filter(r => r.status === 'completed');
                                          if (hiddenItems.length === 0) {
                                            alert('非表示の案件はありません。');
                                            return;
                                          }
                                          for (const r of hiddenItems) {
                                            await api.saveStationResponse(selectedBoardProject.id, r.station_name, {
                                              ...(r.response_data || {}),
                                              status: 'recordings'
                                            });
                                          }`;

const bulkUnhideReplace = `                                          const hiddenItems = responses.filter(r => r.response_data && r.response_data.agency_hidden === true);
                                          if (hiddenItems.length === 0) {
                                            alert('非表示の案件はありません。');
                                            return;
                                          }
                                          for (const r of hiddenItems) {
                                            await api.saveStationResponse(selectedBoardProject.id, r.station_name, {
                                              ...(r.response_data || {}),
                                              agency_hidden: false
                                            });
                                          }`;
content = content.replace(bulkUnhideTarget, bulkUnhideReplace);

// 4. Agency currentStatus logic
const agencyStatusTarget = `             let currentStatus = 'slots'; 
             if (resp) {
                if (resp.status === 'registered' || resp.status === 'pending') currentStatus = 'materials';
                else if (resp.status === 'material_ok' || resp.status === 'rewrites') currentStatus = 'rewrites';
                else if (resp.status === 'rewrite_ok' || resp.status === 'recordings') currentStatus = 'recordings';
             }`;

const agencyStatusReplace = `             let currentStatus = 'slots'; 
             if (resp) {
                if (resp.status === 'registered' || resp.status === 'pending') currentStatus = 'materials';
                else if (resp.status === 'material_ok' || resp.status === 'rewrites') currentStatus = 'rewrites';
                else if (resp.status === 'rewrite_ok' || resp.status === 'recordings') currentStatus = 'recordings';
                
                if (resp.response_data?.agency_hidden === true) currentStatus = 'completed';
             }`;
content = content.replace(agencyStatusTarget, agencyStatusReplace);

// 5. Broadcaster status logic
const bcStatusTarget = `              const respStatus = stationResp?.status || response.status;
              return { 
                 ...p, 
                 sponsor: p.sponsor_name || p.metadata?.sponsor || '未設定', 
                 station: stationName, 
                 status: (respStatus === 'registered' || respStatus === 'pending') ? 'materials' :
                         (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'rewrites' :
                         respStatus === 'rewrite_ok' ? 'recordings' :
                         p.status === 'requesting' ? 'slots' : p.status,`;

const bcStatusReplace = `              const respStatus = stationResp?.status || response.status;
              const isHidden = response?.broadcaster_hidden === true;
              return { 
                 ...p, 
                 sponsor: p.sponsor_name || p.metadata?.sponsor || '未設定', 
                 station: stationName, 
                 status: isHidden ? 'completed' :
                         (respStatus === 'registered' || respStatus === 'pending') ? 'materials' :
                         (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'rewrites' :
                         (respStatus === 'rewrite_ok' || respStatus === 'recordings') ? 'recordings' :
                         p.status === 'requesting' ? 'slots' : p.status,`;
content = content.replace(bcStatusTarget, bcStatusReplace);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Applied independent hide flags!');
