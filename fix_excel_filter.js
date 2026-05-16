import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Update the broadcaster filtering logic in the excel tab
const oldFilter = "const myStation = fullProfile?.broadcaster_name || fullProfile?.name;\n               if (s !== myStation) return;";
const newFilter = `const possibleStationNames = [
                 fullProfile?.broadcaster_name,
                 fullProfile?.company_name,
                 fullProfile?.org,
                 fullProfile?.name
               ].filter(Boolean);
               if (!possibleStationNames.includes(s)) return;`;

if (content.indexOf(oldFilter) !== -1) {
    content = content.replace(oldFilter, newFilter);
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Fixed broadcaster filtering logic in Excel View!');
} else {
    console.log('Broadcaster filter pattern not found!');
}
