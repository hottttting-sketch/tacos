import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

const excelCase = `      case 'excel': {
        const stationName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A';
        const displayData = projects.filter(p => p.status !== 'cancelled').map(p => {
          const projectResponses = broadcasterResponses[p.id] || [];
          const stationResp = projectResponses.find(r => r.station_name === stationName);
          const response = stationResp?.response_data || p.metadata?.[\`response_\${stationName}\`] || {};
          const respStatus = stationResp?.status || response.status;
          
          return {
            id: p.id,
            station: stationName,
            date: p.start_date || '未定',
            sponsor: p.sponsor_name || '未設定',
            name: p.name,
            status: respStatus === 'registered' ? '進行中' : 
                    respStatus === 'material_ok' ? '素材受領済' : 
                    respStatus === 'recordings' ? '同録待ち' : '未着手',
            material: response.has_material ? '済' : '未',
            note: p.metadata?.memo || '-'
          };
        });

        const handleExport = () => {
          const headers = ['放送局', '放送予定日', 'スポンサー', '案件名', 'ステータス', '素材搬入'];
          const csvContent = [
            '\\uFEFF' + headers.join(','),
            ...displayData.map(r => [r.station, r.date, r.sponsor, r.name, r.status, r.material].join(','))
          ].join('\\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', \`pudding_projects_\${new Date().toISOString().split('T')[0]}.csv\`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <PageView 
            title="エクセルビュー" 
            desc="案件データを一覧形式で閲覧・管理します。" 
            icon={Table} 
            color="#7C3AED" 
            action={
              <button 
                onClick={handleExport}
                style={{ backgroundColor: '#10B981', color: 'white', padding: '10px 24px', borderRadius: '12px', border: 'none', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
              >
                <Download size={18} /> Excel出力 (.csv)
              </button>
            }
          >
             <div style={{ backgroundColor: 'white', border: '1.5px solid #F1E4C9', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ overflowX: 'auto' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#fcfcfd', borderBottom: '1.5px solid #F1E4C9' }}>
                         <tr>
                            {['放送局', '放送予定日', 'スポンサー', '案件名', 'ステータス', '素材搬入'].map(h => (
                               <th key={h} style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody>
                         {displayData.length === 0 ? (
                            <tr>
                               <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>表示するデータがありません</td>
                            </tr>
                         ) : displayData.map((row, i) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #F1E4C9', transition: 'background-color 0.2s' }}>
                               <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '700', color: '#3E2723' }}>{row.station}</td>
                               <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>{row.date}</td>
                               <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '700', color: '#3E2723' }}>{row.sponsor}</td>
                               <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '900', color: '#8B4513' }}>{row.name}</td>
                               <td style={{ padding: '18px 24px' }}>
                                  <span style={{ 
                                     padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '950',
                                     backgroundColor: row.status === '素材受領済' ? '#dcfce7' : row.status === '進行中' ? '#dbeafe' : '#f1f5f9',
                                     color: row.status === '素材受領済' ? '#166534' : row.status === '進行中' ? '#1e40af' : '#64748b',
                                     border: '1px solid currentColor'
                                  }}>
                                     {row.status}
                                  </span>
                               </td>
                               <td style={{ padding: '18px 24px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: row.material === '済' ? '#10b981' : '#94a3b8', fontWeight: '950', fontSize: '13px' }}>
                                     {row.material === '済' ? <Check size={16} /> : <Clock size={16} />}
                                     {row.material}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </PageView>
        );
      }`;

content = content.replace(
    /case 'excel': \{[\s\S]*?case 'bulk-change-cancel'/,
    excelCase + '\n\n      case \'bulk-change-cancel\''
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Implemented Real Excel View in PuddingView.jsx!');
