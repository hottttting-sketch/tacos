const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function revert() {
  console.log('Fetching profiles...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Failed to fetch profiles', error);
    return;
  }
  
  for (const p of profiles) {
    if (!p.full_name) continue;
    let name = p.full_name;
    let changed = false;

    // 1. Revert projects in [PROJECTS_JSON]
    if (name.includes('[PROJECTS_JSON]')) {
      const match = name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const projects = JSON.parse(match[1]);
          for (let proj of projects) {
            if (proj.name === 'aa' || proj.name === 'aaa') {
              console.log(`Reverting project ${proj.name} in profile ${p.email}`);
              proj.status = 'materials';
              
              if (proj.metadata) {
                for (let key of Object.keys(proj.metadata)) {
                  if (key.startsWith('response_')) {
                    proj.metadata[key].has_material = false;
                    proj.metadata[key].material_sent = false;
                    proj.metadata[key].material_paths = [];
                    proj.metadata[key].status = 'registered';
                  }
                }
              }
              changed = true;
            }
          }
          if (changed) {
            name = name.replace(/\[PROJECTS_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PROJECTS_JSON]${JSON.stringify(projects)}`);
          }
        } catch(e) { console.error('json parse error', e) }
      }
    }

    // 2. Revert responses in [RESPONSES_JSON]
    if (name.includes('[RESPONSES_JSON]')) {
      const match = name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const responses = JSON.parse(match[1]);
          let rChanged = false;
          for (let res of responses) {
            // Need to match project somehow, but responses don't have project name, only ID
            // Since we don't easily know the ID of 'aa', let's just reset ALL responses that have rewrite_ok or material_ok or material_sent to test?
            // Actually, we can just reset responseData for any response that matches... wait, we can look up the ID from the projects loop
          }
        } catch(e) {}
      }
    }
    
    // Actually, just find ALL profiles and reset ANY project named 'aa' or 'aaa', AND ANY response associated with their IDs.
  }
}

async function revertBetter() {
  console.log('Fetching profiles...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) return;
  
  let targetIds = [];
  
  // First pass: find target project IDs and update them
  for (const p of profiles) {
    if (!p.full_name) continue;
    let name = p.full_name;
    let changed = false;

    if (name.includes('[PROJECTS_JSON]')) {
      const match = name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const projects = JSON.parse(match[1]);
          for (let proj of projects) {
            if (proj.name === 'aa' || proj.name === 'aaa') {
              console.log(`Reverting project ${proj.name} (ID: ${proj.id}) in profile ${p.email}`);
              targetIds.push(proj.id);
              proj.status = 'materials';
              
              if (proj.metadata) {
                for (let key of Object.keys(proj.metadata)) {
                  if (key.startsWith('response_')) {
                    proj.metadata[key].has_material = false;
                    proj.metadata[key].material_sent = false;
                    proj.metadata[key].material_paths = [];
                    proj.metadata[key].status = 'registered';
                  }
                }
              }
              changed = true;
            }
          }
          if (changed) {
            name = name.replace(/\[PROJECTS_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PROJECTS_JSON]${JSON.stringify(projects)}`);
          }
        } catch(e) {}
      }
    }
    
    // Second pass: update responses in this profile
    if (name.includes('[RESPONSES_JSON]') && targetIds.length > 0) {
      const match = name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const responses = JSON.parse(match[1]);
          let rChanged = false;
          for (let res of responses) {
            if (targetIds.includes(res.projectId)) {
              console.log(`Reverting response for ${res.stationName}`);
              res.responseData.has_material = false;
              res.responseData.material_sent = false;
              res.responseData.material_paths = [];
              res.responseData.status = 'registered';
              rChanged = true;
            }
          }
          if (rChanged) {
            name = name.replace(/\[RESPONSES_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[RESPONSES_JSON]${JSON.stringify(responses)}`);
            changed = true;
          }
        } catch(e) {}
      }
    }
    
    if (changed) {
      await supabase.from('profiles').update({ full_name: name }).eq('id', p.id);
      console.log(`Updated profile ${p.email}`);
    }
  }
  console.log('Done!');
}

revertBetter();
