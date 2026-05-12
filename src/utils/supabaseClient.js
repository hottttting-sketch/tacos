import { createClient } from '@supabase/supabase-js'

// Hardcoded for stability - pointed to the correct Tabasco project
const supabaseUrl = 'https://xijzmpmqipmzgrzrnfcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpanptcG1xaXBtemdyenJuZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTYyNDMsImV4cCI6MjA5MjYzMjI0M30.n_PSOneRVWeeC7GDmd8puES87QAr-nhoo7Rq0obu-Ig';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
