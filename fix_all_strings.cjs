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
            
            // Fix unclosed strings followed by comma or closing brace
            const regex1 = /(:\s*'[^'\n]+)E(\s*[,}])/g;
            if (regex1.test(content)) {
                content = content.replace(regex1, "$1'$2");
                changed = true;
            }

            // Fix unclosed strings in logical OR fallbacks
            const regex2 = /(\|\|\s*'[^'\n]+)E(\s*[,}])/g;
            if (regex2.test(content)) {
                content = content.replace(regex2, "$1'$2");
                changed = true;
            }

            // Fix unclosed strings in ternary conditions
            const regex3 = /(\?\s*'[^'\n]+)E(\s*:)/g;
            if (regex3.test(content)) {
                content = content.replace(regex3, "$1'$2");
                changed = true;
            }

            // Fix unclosed strings in ternary results
            const regex4 = /(:\s*'[^'\n]+)E(\s*\))/g;
            if (regex4.test(content)) {
                content = content.replace(regex4, "$1'$2");
                changed = true;
            }

            // Fix missing quotes inside arrays
            const regex5 = /(\[\s*'[^'\n]+)E(\s*\])/g;
            if (regex5.test(content)) {
                content = content.replace(regex5, "$1'$2");
                changed = true;
            }
            
            const regex6 = /(,\s*'[^'\n]+)E(\s*[,\]])/g;
            if (regex6.test(content)) {
                content = content.replace(regex6, "$1'$2");
                // Run again to catch consecutive items
                content = content.replace(regex6, "$1'$2");
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed strings in ${fullPath}`);
            }
        }
    });
}

processDir('c:\\Users\\hotta_yoshihiko2\\.gemini\\antigravity\\scratch\\tabasco\\src');
console.log('Global string fix complete');
