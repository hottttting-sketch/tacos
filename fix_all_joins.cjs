const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            if (/join\('、.*?E\)/g.test(content)) {
                content = content.replace(/join\('、.*?E\)/g, "join('、')");
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed join in ${fullPath}`);
            }
        }
    });
}

processDir('c:\\Users\\hotta_yoshihiko2\\.gemini\\antigravity\\scratch\\tabasco\\src');
console.log('Global join string fix complete');
