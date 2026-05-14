const fs = require('fs');
let content = fs.readFileSync('src/utils/api.js', 'utf8');

// Replace corrupted FALLBACK_PROJECTS (if any left)
// Replace corrupted Blobs
content = content.replace(/new Blob\(\[.*?\]/g, 'new Blob(["Local Simulation Data"]');

// Also fix the merged line if it happened again
content = content.replace(/\/\/ 1\. .*?const { data, error } = await supabase/g, '// 1. Standard table fetch\n      const { data, error } = await supabase');

// Fix corrupted Japanese in getBroadcasters
content = content.replace(/\{ id: 1, name: '.*?', area: '.*?', network: 'NNN' \}/g, "{ id: 1, name: 'Sapporo TV', area: 'Hokkaido', network: 'NNN' }");
content = content.replace(/\{ id: 2, name: '.*?', area: '.*?', network: 'NNN' \}/g, "{ id: 2, name: 'Aomori Broadcasting', area: 'Tohoku', network: 'NNN' }");
// ... and so on, but let's just use a broad regex for the broadcasters fallback
content = content.replace(/return \[\s+\{ id: 1, name: .*? \s+\];/gs, (match) => {
    return `return [
        { id: 1, name: 'Sapporo TV', area: 'Hokkaido', network: 'NNN' },
        { id: 2, name: 'Aomori Broadcasting', area: 'Tohoku', network: 'NNN' },
        { id: 3, name: 'Miyagi TV', area: 'Tohoku', network: 'NNN' },
        { id: 4, name: 'Nippon TV', area: 'Kanto', network: 'NNN' },
        { id: 5, name: 'TV Asahi', area: 'Kanto', network: 'ANN' },
        { id: 6, name: 'TBS', area: 'Kanto', network: 'JNN' },
        { id: 7, name: 'TV Tokyo', area: 'Kanto', network: 'TXN' },
        { id: 8, name: 'Fuji TV', area: 'Kanto', network: 'FNN' }
      ];`;
});

fs.writeFileSync('src/utils/api.js', content);
console.log('Fixed api.js');
