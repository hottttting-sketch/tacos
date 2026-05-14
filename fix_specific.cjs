const fs = require('fs');
let content = fs.readFileSync('src/utils/api.js', 'utf8');

// Fix specific corrupted characters
content = content.replace(/['"]蜆・['"]/g, "'億'");
content = content.replace(/['"]荳・['"]/g, "'万'");

fs.writeFileSync('src/utils/api.js', content);
console.log('Fixed specific corruption');
