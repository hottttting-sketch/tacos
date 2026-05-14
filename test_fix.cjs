const { createClient } = require('@supabase/supabase-js');
// Mocking the api object or just importing from api.js is hard in CJS without transform.
// I'll just manually call the same logic as in api.js

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFix() {
  const ids = ['303574be-5c4d-44f4-87ef-d275527dc463'];
  const updateData = { status: 'cancelled' };
  
  console.log('Testing bulkUpdateProjects logic for pudding_projects...');
  
  // Logic from api.js bulkUpdateProjects
  const puddingUpdateData = { ...updateData };
  // (name/metadata conversions omitted as they are not used here)
  
  const { error } = await supabase.from('pudding_projects').update(puddingUpdateData).in('id', ids);
  if (error) console.error('Error:', error);
  else console.log('Success!');

  const { data: verify } = await supabase.from('pudding_projects').select('status').in('id', ids).single();
  console.log('Verified status:', verify?.status);
  
  // Clean up: set it back to slots for next tests
  await supabase.from('pudding_projects').update({ status: 'slots' }).in('id', ids);
}

testFix();
