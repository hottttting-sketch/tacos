import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  console.log('--- Checking Table Content (Public Schema) ---');
  
  const schemas = ['public', 'pudding'];
  const tables = ['materials', 'projects', 'station_responses', 'profiles', 'pudding_projects'];

  for (const s of schemas) {
    console.log(`\n--- Schema: ${s} ---`);
    for (const t of tables) {
      let query = supabase.from(t);
      if (s === 'pudding') {
        query = supabase.schema('pudding').from(t);
      }
      
      const { data, error, count } = await query.select('*', { count: 'exact' });
      if (error) {
        console.log(`[X] ${t}: Error - ${error.message}`);
      } else {
        console.log(`[!] ${t}: ${count} rows found.`);
        if (data && data.length > 0) {
          console.log(`    Sample: ${JSON.stringify(data[0]).substring(0, 1000)}...`);
        }
      }
    }
  }
}

checkContent();
