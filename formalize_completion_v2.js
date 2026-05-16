import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const oldBlock = `                                            if (confirm('この案件を非表示にしますか？')) {
                                              try {
                                                const responses = await api.getStationResponses(item.projectId || item.id);
                                                const current = responses.find(r => r.station_name === item.station) || {};
                                                const success = await api.saveStationResponse(item.projectId || item.id, item.station, {
                                                  ...(current.response_data || {}),
                                                  agency_hidden: true
                                                });
                                                if (success) {
                                                  alert('案件を非表示にしました。');
                                                  fetchProjects();`;

const newBlock = `                                            if (confirm('この案件を完了し、非表示にしますか？')) {
                                              try {
                                                // 正式にステータスを完了（completed）に更新
                                                await api.updateProjectStatus(item.projectId || item.id, 'completed');

                                                const responses = await api.getStationResponses(item.projectId || item.id);
                                                const current = responses.find(r => r.station_name === item.station) || {};
                                                const success = await api.saveStationResponse(item.projectId || item.id, item.station, {
                                                  ...(current.response_data || {}),
                                                  agency_hidden: true
                                                });
                                                if (success) {
                                                  alert('案件を完了し、非表示にしました。');
                                                  fetchProjects();`;

if (content.indexOf(oldBlock) !== -1) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Successfully formalized project completion!');
} else {
    console.log('Old block not found!');
}
