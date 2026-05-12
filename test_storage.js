
import { supabase } from './src/utils/supabaseClient.js';

async function testStorage() {
  const testFile = new Blob(['test'], { type: 'text/plain' });
  const fileName = `test_${Date.now()}.txt`;

  console.log('Testing rewrites bucket...');
  const { data: d1, error: e1 } = await supabase.storage.from('rewrites').upload(fileName, testFile);
  if (e1) console.error('Rewrites upload failed:', e1.message);
  else console.log('Rewrites upload success:', d1.path);

  console.log('Testing attachments bucket...');
  const { data: d2, error: e2 } = await supabase.storage.from('attachments').upload(fileName, testFile);
  if (e2) console.error('Attachments upload failed:', e2.message);
  else console.log('Attachments upload success:', d2.path);
  
  console.log('Testing recordings bucket...');
  const { data: d3, error: e3 } = await supabase.storage.from('recordings').upload(fileName, testFile);
  if (e3) console.error('Recordings upload failed:', e3.message);
  else console.log('Recordings upload success:', d3.path);
}

testStorage();
