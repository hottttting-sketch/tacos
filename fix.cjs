const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  for (const p of profiles) {
    if (!p.full_name) continue;
    let name = p.full_name;
    let changed = false;
    
    if (name.includes('[RESPONSES_JSON]')) {
      const match = name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const responses = JSON.parse(match[1]);
          for (let res of responses) {
            if (res.projectId === 'BACKUP-1778409372253-lduws0rn6') {
              console.log('Fixing response:', res.stationName);
              res.responseData.has_material = false;
              res.responseData.material_sent = false;
              res.responseData.material_paths = [];
              res.responseData.status = 'registered';
              delete res.responseData.material_path;
              changed = true;
            }
          }
          if (changed) {
            const newJsonStr = JSON.stringify(responses);
            name = name.replace(/\[RESPONSES_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[RESPONSES_JSON]${newJsonStr}`);
          }
        } catch(e) {}
      }
    }

    if (name.includes('[PROJECTS_JSON]')) {
      const match = name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const projects = JSON.parse(match[1]);
          for (let proj of projects) {
            if (proj.id === 'BACKUP-1778409372253-lduws0rn6') {
              console.log('Fixing project metadata:', proj.name);
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
              changed = true;
            }
          }
          if (changed) {
            const newJsonStr = JSON.stringify(projects);
            name = name.replace(/\[PROJECTS_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PROJECTS_JSON]${newJsonStr}`);
          }
        } catch(e) {}
      }
    }

    if (changed) {
      console.log('Saving profile', p.id);
      await supabase.from('profiles').update({ full_name: name }).eq('id', p.id);
      console.log('Saved successfully.');
    }
  }
}
fix();
