-- Supabase Storage Buckets Setup for Tabasco/Pudding
-- Run this in the SQL Editor of your Supabase Dashboard

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('materials', 'materials', true),
  ('attachments', 'attachments', true),
  ('rewrites', 'rewrites', true),
  ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on Storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Allow Public Access for simplicity, adjust if needed)

-- Allow anyone to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update/delete files
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE 
USING (auth.role() = 'authenticated');
