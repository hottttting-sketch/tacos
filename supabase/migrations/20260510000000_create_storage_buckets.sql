-- =============================================
-- 20260510000000_create_storage_buckets.sql
-- Description: Create all required storage buckets for file uploads
-- Run this in Supabase SQL Editor if buckets don't exist
-- =============================================

-- 1. Create buckets (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('rewrites', 'rewrites', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies (idempotent with DROP IF EXISTS)

-- materials
DROP POLICY IF EXISTS "materials_public_select" ON storage.objects;
CREATE POLICY "materials_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "materials_auth_insert" ON storage.objects;
CREATE POLICY "materials_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "materials_auth_update" ON storage.objects;
CREATE POLICY "materials_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "materials_auth_delete" ON storage.objects;
CREATE POLICY "materials_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

-- attachments
DROP POLICY IF EXISTS "attachments_public_select" ON storage.objects;
CREATE POLICY "attachments_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "attachments_auth_insert" ON storage.objects;
CREATE POLICY "attachments_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "attachments_auth_update" ON storage.objects;
CREATE POLICY "attachments_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');

-- recordings
DROP POLICY IF EXISTS "recordings_public_select" ON storage.objects;
CREATE POLICY "recordings_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');

DROP POLICY IF EXISTS "recordings_auth_insert" ON storage.objects;
CREATE POLICY "recordings_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.role() = 'authenticated');

-- rewrites
DROP POLICY IF EXISTS "rewrites_public_select" ON storage.objects;
CREATE POLICY "rewrites_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'rewrites');

DROP POLICY IF EXISTS "rewrites_auth_insert" ON storage.objects;
CREATE POLICY "rewrites_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'rewrites' AND auth.role() = 'authenticated');
