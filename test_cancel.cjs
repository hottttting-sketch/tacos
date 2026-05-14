const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBulkCancel() {
  const ids = ['303574be-5c4d-44f4-87ef-d275527dc463']; // A project in pudding_projects
  console.log('Testing bulk cancel for:', ids);
  
  const { data, error } = await supabase.from('pudding_projects').update({ status: 'cancelled', updated_at: new Date().toISOString() }).in('id', ids);
  if (error) console.error('Error:', error);
  else console.log('Success:', data);

  const { data: verify } = await supabase.from('pudding_projects').select('status').in('id', ids).single();
  console.log('Verified status:', verify?.status);
}

testBulkCancel();
