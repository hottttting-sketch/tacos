const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function revertPuddingProjects() {
  console.log('Fetching pudding_projects...');
  const { data: projects, error } = await supabase.from('pudding_projects').select('*');
  
  if (error) {
    console.error('Failed to fetch pudding_projects', error);
    return;
  }
  
  const targets = projects.filter(p => p.name === 'aa' || p.name === 'aaa');
  console.log(`Found ${targets.length} target projects in pudding_projects.`);
  
  for (const p of targets) {
    console.log(`Reverting project: ${p.name} (ID: ${p.id})`);
    
    const { error: pErr } = await supabase.from('pudding_projects')
      .update({ status: 'materials' })
      .eq('id', p.id);
      
    if (pErr) console.error('Error updating project', pErr);
    
    // 3. Revert metadata inside project
    let metadata = { ...p.metadata };
    let metadataChanged = false;
    for (const key of Object.keys(metadata)) {
      if (key.startsWith('response_')) {
        metadata[key].has_material = false;
        metadata[key].material_sent = false;
        metadata[key].material_paths = [];
        delete metadata[key].material_path;
        metadata[key].status = 'registered';
        metadataChanged = true;
      }
    }
    
    if (metadataChanged) {
      await supabase.from('pudding_projects')
        .update({ metadata: metadata })
        .eq('id', p.id);
      console.log('  Updated project metadata');
    }
  }
}

revertPuddingProjects();
