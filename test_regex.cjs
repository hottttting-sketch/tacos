const rawData = "Admin User[PROJECTS_JSON][{\"id\":\"123\"}][OTHER_JSON]";
const match = rawData.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
console.log('Match:', match ? match[1] : 'null');

const rawData2 = "Admin User[PROJECTS_JSON][{\"id\":\"456\"}]";
const match2 = rawData2.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
console.log('Match 2:', match2 ? match2[1] : 'null');
