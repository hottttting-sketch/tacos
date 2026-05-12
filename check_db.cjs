const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xijzmpmqipmzgrzrnfcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const { data, error } = await supabase.from('station_responses').select('*');
  if (error) {
    console.log('station_responses error:', error.message);
  } else {
    console.log('Found', data.length, 'station_responses');
    for (const d of data) {
      if (d.project_id === 'BACKUP-1778409372253-lduws0rn6') {
        console.log('DB station_responses MATCH:', JSON.stringify(d));
      }
    }
  }

  // Also check if there's any other profile that has it?
  const { data: profs } = await supabase.from('profiles').select('*');
  for (const p of profs) {
    if (p.full_name && p.full_name.includes('BACKUP-1778409372253-lduws0rn6')) {
      if (p.full_name.includes('"status":"material_ok"')) {
         console.log('FOUND material_ok in profile:', p.id, p.email);
      }
      if (p.full_name.includes('"status":"rewrite_ok"')) {
         console.log('FOUND rewrite_ok in profile:', p.id, p.email);
      }
    }
  }
}
checkTables();
