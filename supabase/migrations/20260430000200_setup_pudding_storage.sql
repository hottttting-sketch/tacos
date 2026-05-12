-- =============================================
-- 20260430000200_setup_pudding_storage.sql
-- Description: Setup storage buckets and policies for Pudding.
-- =============================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('pudding-materials', 'pudding-materials', true),
    ('pudding-ai-assets', 'pudding-ai-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies

-- Pudding Materials Policies
CREATE POLICY "Public Access for Pudding Materials" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pudding-materials');

CREATE POLICY "Authenticated users can upload materials" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pudding-materials' AND auth.role() = 'authenticated');

-- Pudding AI Assets Policies
CREATE POLICY "Public Access for Pudding AI Assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pudding-ai-assets');

CREATE POLICY "Authenticated users can upload AI assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pudding-ai-assets' AND auth.role() = 'authenticated');

-- (Optional) Allow users to delete their own uploads if needed
CREATE POLICY "Users can delete own materials" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'pudding-materials' AND auth.uid() = owner);

CREATE POLICY "Users can delete own AI assets" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'pudding-ai-assets' AND auth.uid() = owner);
