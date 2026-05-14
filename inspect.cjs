const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODgxODMsImV4cCI6MjA5MTE2NDE4M30.xwPTps2Q8WRMMJs17IcnY07Cduu6lJJjX8WM3ez4FI8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  for (const p of profiles) {
    if (!p.full_name) continue;
    let name = p.full_name;
    
    // Check projects
    if (name.includes('[PROJECTS_JSON]')) {
      const match = name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const projects = JSON.parse(match[1]);
          for (let proj of projects) {
            if (proj.name.includes('aa')) {
              console.log('--- PROJECT ---');
              console.log(JSON.stringify(proj, null, 2));
            }
          }
        } catch(e) {}
      }
    }
    
    // Check responses
    if (name.includes('[RESPONSES_JSON]')) {
      const match = name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const responses = JSON.parse(match[1]);
          for (let res of responses) {
            // we don't know project name here, but let's dump all responses to see
            // Actually, let's just dump responses that have material_ok
            if (res.responseData && (res.responseData.status === 'material_ok' || res.responseData.status === 'rewrite_ok')) {
               console.log('--- SUSPECT RESPONSE ---');
               console.log(JSON.stringify(res, null, 2));
            }
          }
        } catch(e) {}
      }
    }
  }
}
inspect();
