const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles.`);
  
  profiles.forEach(p => {
    const rawData = p.full_name || p.name || p.ful_name || '';
    if (rawData.includes('[PROJECTS_JSON]')) {
      console.log(`--- Profile Hack found for user: ${p.email || p.id} ---`);
      try {
        const match = rawData.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
        if (match) {
          const projects = JSON.parse(match[1]);
          console.log(`Number of projects: ${projects.length}`);
          projects.forEach(proj => {
            console.log(`  - Project ID: ${proj.id}, Name: ${proj.name}, Status: ${proj.status}`);
          });
        }
      } catch (e) {
        console.error('  Failed to parse projects JSON');
      }
    }
  });
}

check();
