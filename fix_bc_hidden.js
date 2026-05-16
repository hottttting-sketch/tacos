import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Target the broadcaster status logic
content = content.replace(
  /const respStatus = stationResp\?.status \|\| response\.status;\s*return \{\s*\.\.\.p,\s*sponsor: p\.sponsor_name \|\| p\.metadata\?\.sponsor \|\| '未設定',\s*station: stationName,\s*status: \(respStatus === 'registered' \|\| respStatus === 'pending'\) \? 'materials' :\s*\(respStatus === 'material_ok' \|\| respStatus === 'rewrites'\) \? 'rewrites' :\s*respStatus === 'rewrite_ok' \? 'recordings' :\s*p\.status === 'requesting' \? 'slots' : p\.status,/,
  `const respStatus = stationResp?.status || response.status;
              const isHidden = response?.broadcaster_hidden === true;
              return { 
                 ...p, 
                 sponsor: p.sponsor_name || p.metadata?.sponsor || '未設定', 
                 station: stationName, 
                 status: isHidden ? 'completed' :
                         (respStatus === 'registered' || respStatus === 'pending') ? 'materials' :
                         (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'rewrites' :
                         (respStatus === 'rewrite_ok' || respStatus === 'recordings') ? 'recordings' :
                         p.status === 'requesting' ? 'slots' : p.status,`
);

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
console.log('Fixed broadcaster_hidden mapping!');
