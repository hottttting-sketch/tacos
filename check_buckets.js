
import { supabase } from './src/utils/supabaseClient.js';

async function checkBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return;
    }
    console.log('Available buckets:', buckets.map(b => b.name));
  } catch (e) {
    console.error('Exception listing buckets:', e);
  }
}

checkBuckets();
