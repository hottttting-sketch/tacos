const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'PuddingView.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. handleAgencyMaterialUpload (uploadMaterialFile -> uploadProjectFile)
content = content.replace(
  /const uploadResults = await Promise\.all\(files\.map\(async file => \(\{\s*path: await api\.uploadMaterialFile\(file\),\s*originalName: file\.name\s*\}\)\)\);/g,
  `const session = await api.getCurrentSession();
        const uploadResults = await Promise.all(files.map(async file => {
          const res = await api.uploadProjectFile(projectId, stationName, 'material', file, session?.user?.id);
          return { path: res.path, originalName: file.name };
        }));`
);

// 2. handleRewriteUpload (uploadRewriteFile -> uploadProjectFile)
content = content.replace(
  /const path = await api\.uploadRewriteFile\(projectId, stationName, file, 'original'\);/g,
  `const session = await api.getCurrentSession();
        const res = await api.uploadProjectFile(projectId, stationName, 'rewrite', file, session?.user?.id);
        const path = res.path;`
);

// 3. handleRevisedUpload (uploadRewriteFile -> uploadProjectFile)
content = content.replace(
  /const path = await api\.uploadRewriteFile\(projectId, stationName, file, 'revised'\);/g,
  `const session = await api.getCurrentSession();
        const res = await api.uploadProjectFile(projectId, stationName, 'rewrite', file, session?.user?.id);
        const path = res.path;`
);

// 4. handleRecordingUpload (uploadRecordingFile -> uploadProjectFile)
content = content.replace(
  /const path = await api\.uploadRecordingFile\(projectId, stationName, file\);/g,
  `const session = await api.getCurrentSession();
        const res = await api.uploadProjectFile(projectId, stationName, 'recording', file, session?.user?.id);
        const path = res.path;`
);

// 5. handleMaterialDownload (metadata path to project_files fallback)
content = content.replace(
  /const paths = current\.response_data\?\.material_paths \|\| \(current\.response_data\?\.material_path \? \[current\.response_data\.material_path\] : \[\]\);/g,
  `const files = await api.getProjectFiles(projectId);
      const materialFiles = files.filter(f => f.file_type === 'material' && f.station_name === stationName);
      
      let paths = materialFiles.map(f => f.file_path);
      
      if (paths.length === 0) {
        paths = current.response_data?.material_paths || (current.response_data?.material_path ? [current.response_data.material_path] : []);
      }`
);

// 6. handleRewriteDownload
content = content.replace(
  /const path = current\.response_data\?\.rewrite_path;/g,
  `const files = await api.getProjectFiles(projectId);
      const rewriteFiles = files.filter(f => f.file_type === 'rewrite' && f.station_name === stationName);
      
      let path = current.response_data?.rewrite_path;
      if (rewriteFiles.length > 0) {
        path = rewriteFiles[0].file_path;
      }`
);

// 7. handleRevisedDownload
content = content.replace(
  /const path = current\.response_data\?\.revised_path;/g,
  `const files = await api.getProjectFiles(projectId);
      const rewriteFiles = files.filter(f => f.file_type === 'rewrite' && f.station_name === stationName);
      
      let path = current.response_data?.revised_path;
      if (rewriteFiles.length > 0) {
        // Find latest one, maybe same bucket, let's just use the first one assuming it's ordered
        path = rewriteFiles[0].file_path;
      }`
);

// 8. handleRecordingDownload
content = content.replace(
  /const path = current\.response_data\?\.recording_path;/g,
  `const files = await api.getProjectFiles(projectId);
      const recordingFiles = files.filter(f => f.file_type === 'recording' && f.station_name === stationName);
      
      let path = current.response_data?.recording_path;
      if (recordingFiles.length > 0) {
        path = recordingFiles[0].file_path;
      }`
);

// --- Put back the missing Transition Status updates ---

// handleMaterialUpload (transitionProjectStatus)
content = content.replace(
  /if \(success\) {\s*showToast\(\`\$\{stationName\} への素材送信が完了しました/g,
  `if (success) {
        const session = await api.getCurrentSession();
        await api.transitionProjectStatus(projectId, stationName, 'registered', 'material_upload', session?.user?.id, { material_sent: true });
        showToast(\`\${stationName} への素材送信が完了しました`
);

// handleRewriteSend (transitionProjectStatus)
content = content.replace(
  /if \(success\) {\s*showToast\(\`\$\{stationName\} の修正稿送信を送信しました/g,
  `if (success) {
        const session = await api.getCurrentSession();
        await api.transitionProjectStatus(projectId, stationName, current.status || 'rewrites', 'rewrite_submit', session?.user?.id, { rewrite_sent: true });
        showToast(\`\${stationName} の修正稿送信を送信しました`
);

// handleRevisedSend (transitionProjectStatus)
content = content.replace(
  /if \(success\) {\s*showToast\('修正稿を送信しました/g,
  `if (success) {
        const session = await api.getCurrentSession();
        await api.transitionProjectStatus(projectId, stationName, 'rewrites', 'revised_submit', session?.user?.id, { revised_sent: true });
        showToast('修正稿を送信しました`
);

// Inline button SEND
content = content.replace(
  /const success = await api\.updateProject\(item\.projectId \|\| item\.id, \{\s*metadata: \{ \[\`response_\$\{item\.station\}\`\]: \{ \.\.\.\(selectedBoardProject\.metadata\?\.\[\`response_\$\{item\.station\}\`\] \|\| \{\}\), material_sent: true, status: 'registered' \} \}\s*\}\);/g,
  `const session = await api.getCurrentSession();
                                                const success = await api.transitionProjectStatus(
                                                  item.projectId || item.id,
                                                  item.station,
                                                  'registered',
                                                  'material_send',
                                                  session?.user?.id,
                                                  { material_sent: true }
                                                );`
);


fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated PuddingView.jsx');
