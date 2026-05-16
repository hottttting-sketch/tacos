import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// Find the first return block and the second one, and delete the first one.
const marker = "if (resp.response_data?.agency_hidden === true) currentStatus = 'completed';";
const markerIndex = content.indexOf(marker);

if (markerIndex !== -1) {
    const fromMarker = content.substring(markerIndex);
    // Find the sequence of two return statements
    const firstReturn = fromMarker.indexOf("return {");
    const secondReturn = fromMarker.indexOf("return {", firstReturn + 1);
    
    if (firstReturn !== -1 && secondReturn !== -1 && secondReturn < firstReturn + 500) {
        const toDelete = fromMarker.substring(firstReturn, secondReturn);
        const newContent = content.replace(toDelete, "");
        fs.writeFileSync('src/components/PuddingView.jsx', newContent, 'utf8');
        console.log('Fixed corruption by deleting the redundant block!');
    } else {
        console.log('Could not find double return sequence', firstReturn, secondReturn);
    }
} else {
    console.log('Marker not found!');
}
