import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
  const buckets = ['materials', 'attachments', 'rewrites', 'recordings'];
  for (const name of buckets) {
    console.log(`Attempting to create bucket: ${name}`);
    const { data, error } = await supabase.storage.createBucket(name, { public: true });
    if (error) {
      console.log(`Bucket ${name}: ${error.message}`);
    } else {
      console.log(`Bucket ${name} created successfully.`);
    }
  }
}

setupBuckets();
