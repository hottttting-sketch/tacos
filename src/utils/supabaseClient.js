import { createClient } from '@supabase/supabase-js'

// Hardcoded for stability - pointed to the correct Tabasco project
const supabaseUrl = 'https://adsnhxctomiqohzbzgvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc25oeGN0b21pcW9oemJ6Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODgxODMsImV4cCI6MjA5MTE2NDE4M30.xwPTps2Q8WRMMJs17IcnY07Cduu6lJJjX8WM3ez4FI8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
