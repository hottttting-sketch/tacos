import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Update the broadcaster filtering logic to use partial matching
const oldFilter = `const possibleStationNames = [
                 fullProfile?.broadcaster_name,
                 fullProfile?.company_name,
                 fullProfile?.org,
                 fullProfile?.name
               ].filter(Boolean);
               if (!possibleStationNames.includes(s)) return;`;

const newFilter = `const possibleStationNames = [
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

if (content.indexOf(oldFilter) !== -1) {
    content = content.replace(oldFilter, newFilter);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Improved broadcaster filtering with partial matching!');
} else {
    console.log('Filter pattern not found!');
}
