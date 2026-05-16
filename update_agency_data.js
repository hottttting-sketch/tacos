import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Update project creation metadata
const creationMetadataPattern = /selectedStations: selectedStations,\s*created_by: userId\s*\}/;
const creationMetadataReplacement = `selectedStations: selectedStations,
          created_by: userId,
          agency_name: fullProfile?.org || fullProfile?.company_name || '電通'
        }`;

if (creationMetadataPattern.test(content)) {
    content = content.replace(creationMetadataPattern, creationMetadataReplacement);
    console.log('Updated project creation metadata!');
}

// 2. Update Excel View logic to use the real agency name
// Replace the hardcoded '電通' in excelRows.push
const excelRowAgencyPattern = /agency: p\.metadata\?\.agency_name \|\| '電通', \/\/ 代理店名/;
const excelRowAgencyReplacement = "agency: p.metadata?.agency_name || '不明', // 代理店名";

if (excelRowAgencyPattern.test(content)) {
    content = content.replace(excelRowAgencyPattern, excelRowAgencyReplacement);
    console.log('Updated Excel View agency mapping!');
}

fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
