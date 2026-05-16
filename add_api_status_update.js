import fs from 'fs';

let content = fs.readFileSync('src/utils/api.js', 'utf8');

const updateProjectStatusFunc = `
  updateProjectStatus: async (projectId, status) => {
    try {
      // 1. 標準テーブル (projects) の更新
      const { error } = await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', projectId);
      
      // 2. 旧テーブル (pudding_projects) の更新
      await supabase.from('pudding_projects').update({ status, updated_at: new Date().toISOString() }).eq('id', projectId);
      
      return true;
    } catch (e) {
      console.error('[API] updateProjectStatus failed:', e);
      return false;
    }
  },`;

if (!content.includes('updateProjectStatus: async')) {
    content = content.replace('getProjects: async () => {', updateProjectStatusFunc + '\n  getProjects: async () => {');
    fs.writeFileSync('src/utils/api.js', content, 'utf8');
    console.log('Added updateProjectStatus to api.js!');
} else {
    console.log('updateProjectStatus already exists!');
}
