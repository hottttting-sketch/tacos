const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xijzmpmqipmzgrzrnfcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
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
            console.log(`Found project: ${proj.name} (sponsor: ${proj.sponsor_name || proj.metadata?.sponsor})`);
            if (proj.name.includes('aaa') || proj.name.includes('aa') || (proj.sponsor_name && proj.sponsor_name.includes('北海道'))) {
              console.log(`  -> Match! Status: ${proj.status}`);
            }
          }
        } catch(e) {}
      }
    }
  }
}
check();
