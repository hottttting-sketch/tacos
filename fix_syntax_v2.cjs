const fs = require('fs');
let content = fs.readFileSync('src/utils/api.js', 'utf8');

// Fix all cases where // comment... code are on the same line
content = content.replace(/(\/\/.*?)(\s+try \{|\s+const |\s+let |\s+await |\s+return )/g, '$1\n      $2');

// Ensure proper newlines after Japanese comments that might have been corrupted
content = content.replace(/\/\/.*?\r?\n/g, (match) => {
    // If the comment line contains code at the end, split it
    if (match.includes('try {') || match.includes('const ') || match.includes('let ')) {
        return match.replace(/(\/\/.*?)(\s+try \{|\s+const |\s+let )/, '$1\n      $2');
    }
    return match;
});

fs.writeFileSync('src/utils/api.js', content);
console.log('Fixed api.js again');
