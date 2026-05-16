import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Align Excel filtering with Board filtering
const oldFilterBlock = `const possibleStationNames = [
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

const newFilterBlock = `// 案件ボードのロジックに合わせ、放送局名が完全に一致しなくても
               // 依頼局リストに含まれていれば（またはリストの最初の局として）表示を許可する
               if (role === 'broadcaster') {
                 const possibleStationNames = [
                   fullProfile?.broadcaster_name,
                   fullProfile?.company_name,
                   fullProfile?.org,
                   fullProfile?.name
                 ].filter(Boolean).map(n => n.toLowerCase().trim());

                 const isMatch = possibleStationNames.some(name => 
                   s.toLowerCase().includes(name) || name.includes(s.toLowerCase())
                 );

                 // 一致しない場合でも、ボードViewと同じく「リストの最初の局」であれば表示
                 const isFirstStation = s === stations[0];
                 
                 // 一致もせず、最初の局でもない場合はスキップ（1件の案件が重複表示されるのを防ぐ）
                 if (!isMatch && !isFirstStation) return;
               }`;

if (content.indexOf(oldFilterBlock) !== -1) {
    content = content.replace(oldFilterBlock, newFilterBlock);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Synchronized Excel filtering with Board filtering logic!');
} else {
    console.log('Filter block not found!');
}
