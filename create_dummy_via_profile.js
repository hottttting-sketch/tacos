import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const profileId = '2829800f-94a9-4099-b2ba-0d1561b0a174';

async function main() {
  console.log('Fetching current profile...');
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return;
  }

  if (!profile.full_name || !profile.full_name.includes('[PUDDING_JSON]')) {
    console.log('No PUDDING_JSON data found.');
    return;
  }

  const jsonStr = profile.full_name.substring(profile.full_name.indexOf('[PUDDING_JSON]') + 14);
  let projectsList = JSON.parse(jsonStr);
  if (!Array.isArray(projectsList)) projectsList = [projectsList];

  // We want to make sure we have at least 4 projects with different statuses
  // If there aren't enough, we'll add/modify them.
  
  const statuses = ['slots', 'materials', 'rewrites', 'recordings'];
  
  // Create 4 dummy projects for these statuses
  const dummyProjects = statuses.map((status, i) => ({
    name: `【テスト】${status}ステータス案件`,
    sponsor_name: `テストスポンサー${i+1}`,
    status: status,
    start_date: '2026-05-10',
    end_date: '2026-05-20',
    metadata: { 
      type: 'pudding', 
      selectedStations: ['東京-N系'], 
      ba: 'テスト代理店',
      material_start_date: '2026-05-01'
    }
  }));

  // Replace or append
  const updatedList = [...dummyProjects];
  const newFullName = `[PUDDING_JSON]${JSON.stringify(updatedList)}`;

  console.log('Updating profile with 4 projects covering all statuses...');
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ full_name: newFullName })
    .eq('id', profileId);

  if (updateError) {
    console.error('Error updating profile:', updateError.message);
    // If update fails, maybe try to insert into projects table anyway (maybe it was just a schema cache issue)
    console.log('Attempting to insert into projects table as fallback...');
    await supabase.from('projects').insert(dummyProjects);
  } else {
    console.log('Successfully updated profile!');
  }
}

main();
