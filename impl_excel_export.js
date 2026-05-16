import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Add import
if (!content.includes("import * as XLSX")) {
    content = content.replace(
        "import { api } from '../utils/api';",
        "import { api } from '../utils/api';\nimport * as XLSX from 'xlsx';"
    );
}

// 2. Add handleExportExcel inside PuddingView
const exportFunc = `
  const handleExportExcel = () => {
    // 表示用と同じロジックでデータを生成
    let exportData = [];
    projects.forEach(p => {
      const stations = p.metadata?.selectedStations || [];
      stations.forEach(s => {
        if (role === 'broadcaster') {
          const myStation = fullProfile?.broadcaster_name || fullProfile?.name;
          if (s !== myStation) return;
        }

        const projectResponses = broadcasterResponses[p.id] || [];
        const stationResp = projectResponses.find(r => r.station_name === s);
        const response = stationResp?.response_data || p.metadata?.[ \`response_\${s}\`] || {};
        const respStatus = stationResp?.status || response.status;
        
        const statusLabel = 
          (response?.broadcaster_hidden === true || response?.agency_hidden === true) ? '完了' :
          (respStatus === 'registered' || respStatus === 'pending') ? '素材待ち' :
          (respStatus === 'material_ok' || respStatus === 'rewrites') ? '修正稿待ち' :
          (respStatus === 'rewrite_ok' || respStatus === 'recordings') ? '同録待ち' :
          p.status === 'requesting' ? '枠出し待ち' : p.status;

        exportData.push({
          'スポンサー': p.sponsor_name || p.metadata?.sponsor || '未設定',
          '案件名': p.name || p.title || '無題の案件',
          [role === 'agency' ? '放送局' : '代理店']: role === 'agency' ? s : (p.metadata?.agency_name || '電通'),
          '放送予定日': p.start_date || '未設定',
          'ステータス': statusLabel,
          '備考': p.metadata?.memo || '-'
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "案件一覧");
    XLSX.writeFile(workbook, \`ぷりん_案件一覧_\${new Date().toISOString().split('T')[0]}.xlsx\`);
  };
`;

// Insert after state variables
if (!content.includes("const handleExportExcel =")) {
    content = content.replace(
        "const [excelSearchQuery, setExcelSearchQuery] = useState('');",
        "const [excelSearchQuery, setExcelSearchQuery] = useState('');" + exportFunc
    );
}

// 3. Update the button onClick
content = content.replace(
    /action=\{<button style=\{\{ backgroundColor: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer' \}\}>Excel出力<\/button>\}/,
    `action={<button onClick={handleExportExcel} style={{ backgroundColor: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>Excel出力</button>}`
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Successfully implemented Excel Export functionality!');
