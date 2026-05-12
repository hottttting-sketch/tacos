import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xijzmpmqipmzgrzrnfcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error(error);
    return;
  }
  profiles.forEach(p => {
    console.log(`User: ${p.id}`);
    console.log(`Full Name: ${p.full_name}`);
  });
}

check();
