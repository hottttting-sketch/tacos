import fs from 'fs';
const code = fs.readFileSync('board_case.jsx', 'utf8');

let openTags = [];
const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*(\/?)>/g;

let match;
const lines = code.split('\n');
const getLineNumber = (index) => code.substring(0, index).split('\n').length;

while ((match = tagRegex.exec(code)) !== null) {
  const isClosingTag = match[0].startsWith('</');
  const tagName = match[1];
  const isSelfClosing = match[2] === '/';
  
  // Ignore lowercase standard tags that are empty
  if (tagName === 'br' || tagName === 'hr' || tagName === 'input' || tagName === 'img') continue;
  if (isSelfClosing) continue;
  
  if (!isClosingTag) {
    openTags.push({ tag: tagName, line: getLineNumber(match.index) });
  } else {
    if (openTags.length === 0) {
      console.log(`Unmatched closing tag </${tagName}> at line ${getLineNumber(match.index)}`);
      continue;
    }
    const lastOpen = openTags[openTags.length - 1];
    if (lastOpen.tag !== tagName) {
      console.log(`Mismatched closing tag </${tagName}> at line ${getLineNumber(match.index)}. Expected </${lastOpen.tag}> (opened at ${lastOpen.line})`);
    } else {
      openTags.pop();
    }
  }
}

if (openTags.length > 0) {
  console.log('Unclosed tags at end of file:');
  openTags.forEach(t => console.log(`- <${t.tag}> opened at line ${t.line}`));
} else {
  console.log('All tags balanced!');
}
