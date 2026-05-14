const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectAll() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  for (const p of profiles) {
    if (!p.full_name) continue;
    let name = p.full_name;
    
    if (name.includes('[PROJECTS_JSON]')) {
      const match = name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const projects = JSON.parse(match[1]);
          for (let proj of projects) {
            if (proj.name.includes('aa') || (proj.sponsor_name && proj.sponsor_name.includes('aa'))) {
              console.log('--- FOUND ---');
              console.log('ID:', proj.id);
              console.log('Name:', proj.name);
              console.log('Sponsor:', proj.sponsor_name);
              console.log('Status:', proj.status);
            }
          }
        } catch(e) {}
      }
    }
  }
}
inspectAll();
