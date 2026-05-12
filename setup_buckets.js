
import { supabase } from './src/utils/supabaseClient.js';

async function setupBuckets() {
  const buckets = ['materials', 'attachments', 'rewrites', 'recordings'];
  for (const name of buckets) {
    console.log(`Attempting to create/verify bucket: ${name}`);
    try {
      const { data, error } = await supabase.storage.createBucket(name, { public: true });
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`Bucket ${name} already exists.`);
        } else {
          console.error(`Failed to create bucket ${name}:`, error.message);
        }
      } else {
        console.log(`Bucket ${name} created successfully.`);
      }
    } catch (e) {
      console.error(`Exception creating bucket ${name}:`, e.message);
    }
  }
}

setupBuckets();
