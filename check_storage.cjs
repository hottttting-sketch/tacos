const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple .env parser since dotenv is not installed
function loadEnv(path) {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

loadEnv('c:/Users/hotta_yoshihiko2/.gemini/antigravity/scratch/tabasco/.env');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  console.log('Checking buckets...');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('Error listing buckets:', bError);
  } else {
    console.log('Buckets:', buckets.map(b => b.name));
  }

  const bucketsToCheck = ['materials', 'rewrites', 'attachments', 'recordings'];
  for (const b of bucketsToCheck) {
    const { data: files, error: fError } = await supabase.storage.from(b).list('', { limit: 10 });
    if (fError) {
      console.error(`Error listing files in ${b}:`, fError.message);
    } else {
      console.log(`Files in ${b}:`, files.map(f => f.name));
    }
  }
}

check();
