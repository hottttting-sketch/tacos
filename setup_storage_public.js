import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4ODE4MywiZXhwIjoyMDkxMTY0MTgzfQ.BCfCE4KTspsnO2KSQBImxJDraOVKgnPnc4IM4B2eAbw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPolicies() {
  const buckets = ['materials', 'attachments', 'rewrites', 'recordings'];
  for (const bucket of buckets) {
    console.log(`Setting up policies for bucket: ${bucket}`);
    
    // We can't run raw SQL easily through the client's storage API, 
    // but we can try to ensure the bucket is public.
    const { error: updateError } = await supabase.storage.updateBucket(bucket, {
      public: true,
      allowedMimeTypes: null,
      fileSizeLimit: null
    });
    
    if (updateError) {
      console.log(`Failed to update bucket ${bucket}: ${updateError.message}`);
    } else {
      console.log(`Bucket ${bucket} is now public.`);
    }
  }
}

setupPolicies();
