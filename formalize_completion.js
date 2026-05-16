import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Update the Hide (非表示) button logic to also update project status to 'completed'
const oldHideLogic = `                                               const updatedData = { 
                                                 ...(currentResp.response_data || {}), 
                                                 agency_hidden: true 
                                               };
                                               await api.saveStationResponse(p.id, s, updatedData, currentResp.status);
                                               fetchProjects();
                                               alert('案件を非表示にしました。');`;

const newHideLogic = `                                               const updatedData = { 
                                                 ...(currentResp.response_data || {}), 
                                                 agency_hidden: true 
                                               };
                                               // ステータスを正式に 'completed' に更新
                                               await api.updateProjectStatus(p.id, 'completed');
                                               await api.saveStationResponse(p.id, s, updatedData, currentResp.status);
                                               fetchProjects();
                                               alert('案件を完了し、非表示にしました。');`;

if (content.indexOf(oldHideLogic) !== -1) {
    content = content.replace(oldHideLogic, newHideLogic);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Formalized project completion logic in PuddingView.jsx!');
} else {
    console.log('Hide logic pattern not found!');
}
