const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking "projects" table ---');
  const { data: projects, error: err1 } = await supabase.from('projects').select('*');
  if (err1) console.log('Error projects:', err1.message);
  else console.log(`Found ${projects.length} projects in table.`);

  console.log('\n--- Checking "pudding_projects" table ---');
  const { data: puddingProjects, error: err2 } = await supabase.from('pudding_projects').select('*');
  if (err2) console.log('Error pudding_projects:', err2.message);
  else console.log(`Found ${puddingProjects.length} pudding_projects in table.`);
  
  if (projects) {
      projects.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
  }
}

check();
