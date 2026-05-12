-- =============================================
-- 20260424000300_restore_core_materials.sql
-- Description: Restore missing materials tables and create tokens table for magic links.
-- =============================================

-- 1. Materials Management
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    material_code TEXT UNIQUE,
    duration INTEGER, -- in seconds
    file_path TEXT,
    file_type TEXT,
    file_size BIGINT,
    project_id_tacos UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_id_pudding UUID REFERENCES pudding.projects(id) ON DELETE SET NULL,
    sponsor_name TEXT,
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Material Status per Station Network
CREATE TABLE IF NOT EXISTS public.material_station_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    station_network TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'received', 'j_alert_match', 'error'
    remarks TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(material_id, station_network)
);

-- 2. External Access Tokens (for verify-magic-link)
-- This table stores unique tokens sent to broadcasters to allow access without normal login.
CREATE TABLE IF NOT EXISTS public.external_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    project_id UUID NOT NULL, -- References either Tacos or Pudding project
    station_network TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT DEFAULT 'broadcaster_response', -- 'broadcaster_response', 'media_preview'
    is_used BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. RLS (Row Level Security)
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_station_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_access_tokens ENABLE ROW LEVEL SECURITY;

-- Materials RLS
CREATE POLICY "Materials viewable by authenticated" ON public.materials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Materials manageable by authenticated" ON public.materials FOR ALL USING (auth.role() = 'authenticated');

-- Status RLS
CREATE POLICY "Material status viewable by authenticated" ON public.material_station_status FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Material status manageable by authenticated" ON public.material_station_status FOR ALL USING (auth.role() = 'authenticated');

-- Tokens RLS: Restricted to SERVICE ROLE (for Edge Functions)
-- But we allow SELECT by ANON for token validation function if needed (though service role is safer)
CREATE POLICY "Tokens only visible to service role" ON public.external_access_tokens FOR ALL USING (false);

-- 4. Storage Buckets (Ensuring they exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('materials', 'materials', true),
    ('tabasco-assets', 'tabasco-assets', true),
    ('transfers', 'transfers', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for buckets
CREATE POLICY "Public Read for Materials" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Public Read for Assets" ON storage.objects FOR SELECT USING (bucket_id = 'tabasco-assets');

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_materials_project_tacos ON public.materials(project_id_tacos);
CREATE INDEX IF NOT EXISTS idx_materials_project_pudding ON public.materials(project_id_pudding);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.external_access_tokens(token);
