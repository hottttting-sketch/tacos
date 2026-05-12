-- =============================================
-- 20260502000200_pudding_storage_v2.sql
-- Description: Additional storage buckets and policies for Pudding recordings and AI narrations.
-- =============================================

-- 1. Create dedicated buckets for Recordings and Narrations
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('pudding-recordings', 'pudding-recordings', true),
    ('pudding-narrations', 'pudding-narrations', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Security RLS Policies

-- Pudding Recordings Policies
CREATE POLICY "Public Access for Pudding Recordings" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pudding-recordings');

CREATE POLICY "Authenticated users can upload recordings" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pudding-recordings' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own recordings" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'pudding-recordings' AND auth.uid() = owner);


-- Pudding Narrations Policies
CREATE POLICY "Public Access for Pudding Narrations" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pudding-narrations');

CREATE POLICY "Authenticated users can upload narrations" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pudding-narrations' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own narrations" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'pudding-narrations' AND auth.uid() = owner);
