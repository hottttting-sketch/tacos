const fs = require('fs');
let content = fs.readFileSync('src/utils/api.js', 'utf8');

// Fix all cases where // comment... code are on the same line
// Added if, for, while, switch
content = content.replace(/(\/\/.*?)(\s+if \(|\s+for \(|\s+while \(|\s+switch \(|\s+try \{|\s+const |\s+let |\s+await |\s+return )/g, '$1\n      $2');

fs.writeFileSync('src/utils/api.js', content);
console.log('Fixed api.js v3');
