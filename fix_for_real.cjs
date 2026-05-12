const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xijzmpmqipmzgrzrnfcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixForReal() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  for (const p of profiles) {
    if (p.id !== '2829800f-94a9-4099-b2ba-0d1561b0a174') continue;
    
    let name = p.full_name;
    // Replace "material_ok" with "registered" everywhere for this project just to be brute-force sure
    // But since it has other projects, let's just parse, modify, and stringify
    let projChanged = false;
    let resChanged = false;

    if (name.includes('[PROJECTS_JSON]')) {
      const match = name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        const projects = JSON.parse(match[1]);
        for (let proj of projects) {
          if (proj.name.includes('aa') || proj.id === 'BACKUP-1778409372253-lduws0rn6') {
            proj.status = 'materials';
            if (proj.metadata) {
              for (const key of Object.keys(proj.metadata)) {
                if (key.startsWith('response_')) {
                   proj.metadata[key].status = 'registered';
                   proj.metadata[key].has_material = false;
                   proj.metadata[key].material_sent = false;
                }
              }
            }
            projChanged = true;
          }
        }
        if (projChanged) {
          const newStr = JSON.stringify(projects);
          name = name.replace(/\[PROJECTS_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PROJECTS_JSON]${newStr}`);
        }
      }
    }

    if (name.includes('[RESPONSES_JSON]')) {
      const match = name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        const responses = JSON.parse(match[1]);
        for (let res of responses) {
          if (res.projectId === 'BACKUP-1778409372253-lduws0rn6' || (res.responseData && res.responseData.status === 'material_ok')) {
             res.responseData.status = 'registered';
             res.responseData.has_material = false;
             res.responseData.material_sent = false;
             resChanged = true;
          }
        }
        if (resChanged) {
          const newStr = JSON.stringify(responses);
          name = name.replace(/\[RESPONSES_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[RESPONSES_JSON]${newStr}`);
        }
      }
    }

    if (projChanged || resChanged) {
      console.log('UPDATING PROFILE...');
      const { data, error } = await supabase.from('profiles').update({ full_name: name }).eq('id', p.id).select();
      if (error) {
         console.error('FAILED TO UPDATE:', error);
      } else {
         console.log('UPDATE SUCCESS:', data);
      }
    }
  }
}
fixForReal();
