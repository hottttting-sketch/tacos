import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Target the Bulk Unhide logic
content = content.replace(
  /const hiddenItems = responses\.filter\(r => r\.status === 'completed'\);\s*if \(hiddenItems\.length === 0\) \{\s*alert\('非表示の案件はありません。'\);\s*return;\s*\}\s*for \(const r of hiddenItems\) \{\s*await api\.saveStationResponse\(selectedBoardProject\.id, r\.station_name, \{\s*\.\.\.\(r\.response_data \|\| \{\}\),\s*status: 'recordings'\s*\}\);\s*\}/,
  `const hiddenItems = responses.filter(r => r.response_data && r.response_data.agency_hidden === true);
                                          if (hiddenItems.length === 0) {
                                            alert('非表示の案件はありません。');
                                            return;
                                          }
                                          for (const r of hiddenItems) {
                                            await api.saveStationResponse(selectedBoardProject.id, r.station_name, {
                                              ...(r.response_data || {}),
                                              agency_hidden: false
                                            });
                                          }`
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed Bulk Unhide logic!');
