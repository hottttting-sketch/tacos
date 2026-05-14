const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking "projects" table ---');
  const { data: projects, error: pError } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (pError) console.error('Error fetching projects:', pError.message);
  else {
    console.log(`Found ${projects.length} projects in "projects" table.`);
    projects.slice(0, 5).forEach(p => {
      console.log(`  ID: ${p.id}, Title: ${p.title || p.name}, Status: ${p.status}, CreatedAt: ${p.created_at}`);
    });
  }

  console.log('\n--- Checking "pudding_projects" table ---');
  const { data: oldProjects, error: oError } = await supabase.from('pudding_projects').select('*').order('created_at', { ascending: false });
  if (oError) console.error('Error fetching pudding_projects:', oError.message);
  else {
    console.log(`Found ${oldProjects.length} projects in "pudding_projects" table.`);
    oldProjects.slice(0, 5).forEach(p => {
      console.log(`  ID: ${p.id}, Title: ${p.title || p.name}, Status: ${p.status}, CreatedAt: ${p.created_at}`);
    });
  }

  console.log('\n--- Checking Profile Hack (profiles table) ---');
  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  if (profError) console.error('Error fetching profiles:', profError.message);
  else {
    profiles.forEach(p => {
      const rawData = p.full_name || p.name || p.ful_name || '';
      if (rawData.includes('[PROJECTS_JSON]')) {
        try {
          const match = rawData.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
          if (match) {
            const extraProjects = JSON.parse(match[1]);
            console.log(`Profile Hack found for user ${p.email || p.id}: ${extraProjects.length} projects.`);
            extraProjects.slice(-3).forEach(proj => {
              console.log(`  ID: ${proj.id}, Name: ${proj.name}, Status: ${proj.status}, CreatedAt: ${proj.created_at}`);
            });
          }
        } catch (e) {
          console.error(`  Failed to parse PROJECTS_JSON for user ${p.id}`);
        }
      }
    });
  }
}

check();
