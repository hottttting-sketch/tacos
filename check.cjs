const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODgxODMsImV4cCI6MjA5MTE2NDE4M30.xwPTps2Q8WRMMJs17IcnY07Cduu6lJJjX8WM3ez4FI8';

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
            if (proj.name.includes('aaa') || proj.name.includes('aa') || (proj.sponsor_name && proj.sponsor_name.includes('北海遁E))) {
              console.log(`  -> Match! Status: ${proj.status}`);
            }
          }
        } catch(e) {}
      }
    }
  }
}
check();
