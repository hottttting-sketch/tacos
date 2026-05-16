import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Update columns and row mapping
const excelViewUpdate = `      case 'excel': {
        // 実データの生成
        let excelRows = [];
        projects.forEach(p => {
          const stations = p.metadata?.selectedStations || [];
          stations.forEach(s => {
            // 放送局UIの場合、自局のデータのみ表示
            if (role === 'broadcaster') {
               const myStation = fullProfile?.broadcaster_name || fullProfile?.name;
               if (s !== myStation) return;
            }

            const projectResponses = broadcasterResponses[p.id] || [];
            const stationResp = projectResponses.find(r => r.station_name === s);
            const response = stationResp?.response_data || p.metadata?.[ \`response_\${s}\`] || {};
            const respStatus = stationResp?.status || response.status;
            
            // ステータスの日本語化
            const statusLabel = 
              (response?.broadcaster_hidden === true || response?.agency_hidden === true) ? '完了' :
              (respStatus === 'registered' || respStatus === 'pending') ? '素材待ち' :
              (respStatus === 'material_ok' || respStatus === 'rewrites') ? '修正稿待ち' :
              (respStatus === 'rewrite_ok' || respStatus === 'recordings') ? '同録待ち' :
              p.status === 'requesting' ? '枠出し待ち' : p.status;

            excelRows.push({
              id: \`\${p.id}-\${s}\`,
              projectId: p.id,
              station: s,
              date: p.start_date || '未設定',
              sponsor: p.sponsor_name || p.metadata?.sponsor || '未設定',
              name: p.name || p.title || '無題の案件',
              status: statusLabel,
              material: response.has_material ? '済' : '未搬入',
              note: p.metadata?.memo || '-'
            });
          });
        });

        // 検索フィルタ
        const filteredExcelData = excelRows.filter(row => {
          if (!excelSearchQuery) return true;
          const query = excelSearchQuery.toLowerCase();
          return (
            row.station.toLowerCase().includes(query) ||
            row.sponsor.toLowerCase().includes(query) ||
            row.name.toLowerCase().includes(query) ||
            row.status.toLowerCase().includes(query)
          );
        });

        return (
          <PageView title="エクセルビュー" desc="案件データを一覧形式で閲覧・編集します。" icon={Table} color="#7C3AED" action={<button style={{ backgroundColor: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>Excel出力</button>}>
             <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                   <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                   <input 
                      type="text" 
                      placeholder="局名、スポンサー、案件名で検索..." 
                      value={excelSearchQuery}
                      onChange={(e) => setExcelSearchQuery(e.target.value)}
                      style={{ 
                         width: '100%', padding: '12px 16px 12px 44px', borderRadius: '16px', 
                         border: '2px solid #F1E4C9', fontSize: '14px', fontWeight: '800', outline: 'none',
                         transition: 'border-color 0.2s'
                      }} 
                   />
                </div>
             </div>

             <div style={{ backgroundColor: 'white', border: '1.5px solid #F1E4C9', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ backgroundColor: '#fcfcfd', borderBottom: '1.5px solid #F1E4C9' }}>
                      <tr>
                        {['スポンサー', '案件名', '放送局', '放送予定日', 'ステータス', 'チャット'].map(h => (
                          <th key={h} style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '950', color: '#3E2723' }}>{h}</th>
                        ))}
                      </tr>
                   </thead>
                   <tbody>
                      {filteredExcelData.length > 0 ? filteredExcelData.map((row) => (
                         <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="hover-row">
                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '800' }}>{row.sponsor}</td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '950', color: '#3E2723' }}>{row.name}</td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '800' }}>{row.station}</td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '800', color: '#64748b' }}>{row.date}</td>
                            <td style={{ padding: '16px 24px' }}>
                               <span style={{ 
                                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900',
                                  backgroundColor: row.status === '完了' ? '#ecfdf5' : row.status === '素材待ち' ? '#fff7ed' : '#f1f5f9',
                                  color: row.status === '完了' ? '#10b981' : row.status === '素材待ち' ? '#f97316' : '#64748b'
                               }}>
                                  {row.status}
                               </span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                               <button 
                                 onClick={() => {
                                   if (typeof onNavigateToChat === 'function') {
                                     onNavigateToChat(row.name);
                                   } else {
                                     setActiveTab('chat');
                                   }
                                 }}
                                 style={{ 
                                   border: 'none', background: '#f1f5f9', color: '#64748b', 
                                   padding: '8px', borderRadius: '10px', cursor: 'pointer',
                                   display: 'flex', alignItems: 'center', justifyContent: 'center'
                                 }}
                                 title="チャットを開く"
                               >
                                 <Chat size={18} />
                               </button>
                            </td>
                         </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>該当する案件が見つかりませんでした。</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </PageView>
        );
      }`;

const excelTabPattern = /case 'excel': \{[\s\S]*?return \([\s\S]*?<\/PageView>[\s\S]*?\);[\s\S]*?\}/;

if (excelTabPattern.test(content)) {
    content = content.replace(excelTabPattern, excelViewUpdate);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Successfully updated Excel View columns and added chat button!');
} else {
    console.log('Excel tab pattern not found!');
}
