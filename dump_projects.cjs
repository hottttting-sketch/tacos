const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpAll() {
  console.log('--- DB: projects ---');
  const { data: dbProjects } = await supabase.from('projects').select('*');
  dbProjects?.forEach(p => {
    console.log(`[DB] ID: ${p.id}, Status: ${p.status}, UpdatedAt: ${p.updated_at || p.created_at}, Name: ${p.name || p.title}`);
  });

  console.log('\n--- DB: pudding_projects ---');
  const { data: puddingProjects } = await supabase.from('pudding_projects').select('*');
  puddingProjects?.forEach(p => {
    console.log(`[PUDDING] ID: ${p.id}, Status: ${p.status}, UpdatedAt: ${p.updated_at || p.created_at}, Name: ${p.name || p.title}`);
  });

  console.log('\n--- Profile Hack ---');
  const { data: profiles } = await supabase.from('profiles').select('*');
  profiles?.forEach(prof => {
    const rawData = prof.full_name || prof.name || prof.ful_name || '';
    if (rawData.includes('[PROJECTS_JSON]')) {
      const match = rawData.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
      if (match) {
        try {
          const extraProjects = JSON.parse(match[1]);
          extraProjects.forEach(p => {
            console.log(`[PROF:${prof.email}] ID: ${p.id}, Status: ${p.status}, UpdatedAt: ${p.updated_at || p.created_at}, Name: ${p.name || p.title}`);
          });
        } catch (e) {}
      }
    }
  });
}

dumpAll();
