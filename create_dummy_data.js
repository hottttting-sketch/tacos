import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyProjects = [
  {
    name: '【テスト】枠出し待ち案件',
    sponsor_name: 'ダミー飲料株式会社',
    status: 'requesting',
    start_date: '2026-05-10',
    end_date: '2026-05-20',
    metadata: { type: 'pudding', selectedStations: ['東京-N系'] }
  },
  {
    name: '【テスト】素材待ち案件',
    sponsor_name: 'ダミー自動車',
    status: 'materials',
    start_date: '2026-05-12',
    end_date: '2026-05-22',
    metadata: { type: 'pudding', selectedStations: ['大阪-CX系'] }
  },
  {
    name: '【テスト】リライト待ち案件',
    sponsor_name: 'ダミー通信',
    status: 'rewrites',
    start_date: '2026-05-15',
    end_date: '2026-05-25',
    metadata: { type: 'pudding', selectedStations: ['名古屋-EX系'] }
  },
  {
    name: '【テスト】同録待ち案件',
    sponsor_name: 'ダミー不動産',
    status: 'recordings',
    start_date: '2026-05-18',
    end_date: '2026-05-28',
    metadata: { type: 'pudding', selectedStations: ['福岡-TX系'] }
  }
];

async function main() {
  console.log('Inserting dummy projects into public.projects...');
  const { data, error } = await supabase
    .from('projects')
    .insert(dummyProjects);

  if (error) {
    console.error('Error inserting into public.projects:', error.message);
  } else {
    console.log('Successfully inserted 4 dummy projects into public.projects.');
  }

  console.log('Inserting dummy projects into public.pudding_projects...');
  const { data: data2, error: error2 } = await supabase
    .from('pudding_projects')
    .insert(dummyProjects);

  if (error2) {
    console.error('Error inserting into public.pudding_projects:', error2.message);
  } else {
    console.log('Successfully inserted 4 dummy projects into public.pudding_projects.');
  }
}

main();
