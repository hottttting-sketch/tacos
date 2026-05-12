-- =============================================
-- 20260510_final_schema_fix.sql
-- Description: Comprehensive database schema for Tabasco/Pudding.
-- Fixes mismatches in materials and adds missing operational tables.
-- =============================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects Table (Primary)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sponsor_name TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'requesting',
    type TEXT DEFAULT 'spot',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Materials Table (Fixed Schema)
-- Drop existing if structure is wrong, or alter. Since we are in development, dropping and recreating is cleaner.
DROP TABLE IF EXISTS public.materials;
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_name TEXT,
    title TEXT NOT NULL,
    material_code TEXT,
    duration INTEGER,
    file_path TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Station Responses Table
CREATE TABLE IF NOT EXISTS public.station_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    station_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    response_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT station_responses_project_station_unique UNIQUE (project_id, station_name)
);

-- 4. Project Chats Table (Missing)
CREATE TABLE IF NOT EXISTS public.project_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID,
    user_name TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Slot Details Table (Missing)
CREATE TABLE IF NOT EXISTS public.slot_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    station_name TEXT,
    program_name TEXT,
    oa_date DATE,
    time_range TEXT,
    duration TEXT,
    status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Project Revisions Table (Missing)
CREATE TABLE IF NOT EXISTS public.project_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    station_name TEXT,
    annotations JSONB DEFAULT '[]'::jsonb,
    memo TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RLS Configuration
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for consistency
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('projects', 'materials', 'station_responses', 'project_chats', 'slot_details', 'project_revisions')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all authenticated users" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow all authenticated users" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
        EXECUTE format('GRANT ALL ON public.%I TO anon', t);
    END LOOP;
END $$;

-- 8. Trigger to reload schema cache
NOTIFY pgrst, 'reload schema';
