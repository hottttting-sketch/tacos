import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Add useEffect to refetch projects when entering excel tab
const tabEffect = `
  useEffect(() => {
    if (activeTab === 'excel') {
      fetchProjects();
    }
  }, [activeTab]);
`;

if (content.indexOf("useEffect(() => {") !== -1 && !content.includes("activeTab === 'excel'")) {
    content = content.replace(
        "fetchProjects();\n  }, []);",
        "fetchProjects();\n  }, []);\n" + tabEffect
    );
}

// 2. Further improve the filter to check response data too
const oldFilter = `const possibleStationNames = [
                 fullProfile?.broadcaster_name,
                 fullProfile?.company_name,
                 fullProfile?.org,
                 fullProfile?.name
               ].filter(Boolean).map(n => n.toLowerCase().trim());
               
               // 部分一致または完全一致で判定
               const isMatch = possibleStationNames.some(name => 
                 s.toLowerCase().includes(name) || name.includes(s.toLowerCase())
               );
               if (!isMatch) return;`;

const newFilter = `const possibleStationNames = [
                 fullProfile?.broadcaster_name,
                 fullProfile?.company_name,
                 fullProfile?.org,
                 fullProfile?.name
               ].filter(Boolean).map(n => n.toLowerCase().trim());
               
               const projectResponses = broadcasterResponses[p.id] || [];
               const stationResp = projectResponses.find(r => r.station_name === s);
               
               // 局名の一致チェック
               const isNameMatch = possibleStationNames.some(name => 
                 s.toLowerCase().includes(name) || name.includes(s.toLowerCase())
               );
               
               // レスポンスが存在する場合の一致チェック（より確実）
               const isResponseMatch = stationResp && possibleStationNames.some(name => 
                 stationResp.station_name.toLowerCase().includes(name) || name.includes(stationResp.station_name.toLowerCase())
               );

               if (role === 'broadcaster' && !isNameMatch && !isResponseMatch) return;`;

if (content.indexOf(oldFilter) !== -1) {
    content = content.replace(oldFilter, newFilter);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Applied tab refetch and dual-match filtering!');
} else {
    console.log('Filter pattern not found!');
}
