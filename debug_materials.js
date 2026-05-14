import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://adsnhxctomiqohzbzgvi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig'
);

async function checkMaterials() {
  const { data, error } = await supabase.from('materials').select('*');
  if (error) {
    console.error('Error fetching materials:', error);
    return;
  }
  console.log('--- Materials in DB ---');
  data.forEach(m => {
    console.log(`ID: ${m.id}`);
    console.log(`Title: ${m.title}`);
    console.log(`Metadata: ${JSON.stringify(m.metadata)}`);
    console.log('---');
  });
}

checkMaterials();
