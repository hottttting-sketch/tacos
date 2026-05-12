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
            
            // Fix alerts: alert('somethingE); -> alert('something');
            const alertRegex = /alert\('([^']*)E\);/g;
            if (alertRegex.test(content)) {
                content = content.replace(alertRegex, "alert('$1');");
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed alerts in ${fullPath}`);
            }
        }
    });
}

processDir('c:\\Users\\hotta_yoshihiko2\\.gemini\\antigravity\\scratch\\tabasco\\src');
console.log('Global alert fix complete');
