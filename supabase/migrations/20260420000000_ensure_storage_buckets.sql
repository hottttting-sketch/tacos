-- SQL Migration: Ensure storage buckets and policies exist
-- Date: 2026-04-20

-- 1. Create tabasco-assets bucket
INSERT INTO storage.buckets (id, name, public)
SELECT 'tabasco-assets', 'tabasco-assets', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'tabasco-assets'
);

-- 2. Create transfers bucket
INSERT INTO storage.buckets (id, name, public)
SELECT 'transfers', 'transfers', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'transfers'
);

-- 3. tabasco-assets Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tabasco-assets');

DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Auth Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tabasco-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Update Delete Access" ON storage.objects;
CREATE POLICY "Update Delete Access" ON storage.objects FOR UPDATE USING (bucket_id = 'tabasco-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Delete Access" ON storage.objects;
CREATE POLICY "Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'tabasco-assets' AND auth.role() = 'authenticated');

-- 4. transfers Policies
DROP POLICY IF EXISTS "Transfers Public Access" ON storage.objects;
CREATE POLICY "Transfers Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'transfers');

DROP POLICY IF EXISTS "Transfers Auth Upload Access" ON storage.objects;
CREATE POLICY "Transfers Auth Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'transfers' AND auth.role() = 'authenticated');
