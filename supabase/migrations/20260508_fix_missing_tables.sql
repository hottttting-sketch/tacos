-- =============================================
-- 20260508_fix_missing_tables.sql
-- Description: Create missing tables in the 'public' schema for Tabasco/Pudding.
-- Use this if you get "Could not find the table in the schema cache" errors.
-- =============================================

-- 1. Create pudding_projects table
CREATE TABLE IF NOT EXISTS public.pudding_projects (
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

-- 2. Create projects table (as an alias or secondary table if needed)
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

-- 3. Create materials table
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_path TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create station_responses table
CREATE TABLE IF NOT EXISTS public.station_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID, -- Removed REFERENCES to be more flexible with backup IDs
    station_name TEXT,
    status TEXT,
    response_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add unique constraint for upsert
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'station_responses_project_station_unique') THEN
        ALTER TABLE public.station_responses ADD CONSTRAINT station_responses_project_station_unique UNIQUE (project_id, station_name);
    END IF;
END $$;

-- 5. Enable RLS and add basic policies
ALTER TABLE public.pudding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Allow all authenticated users full access to pudding_projects" ON public.pudding_projects;
DROP POLICY IF EXISTS "Allow all authenticated users full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all authenticated users full access to materials" ON public.materials;
DROP POLICY IF EXISTS "Allow all authenticated users full access to station_responses" ON public.station_responses;

CREATE POLICY "Allow all authenticated users full access to pudding_projects" ON public.pudding_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to materials" ON public.materials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to station_responses" ON public.station_responses FOR ALL USING (auth.role() = 'authenticated');

-- 6. Grant permissions
GRANT ALL ON public.pudding_projects TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.materials TO authenticated;
GRANT ALL ON public.station_responses TO authenticated;
GRANT ALL ON public.pudding_projects TO anon;
GRANT ALL ON public.projects TO anon;
GRANT ALL ON public.materials TO anon;
GRANT ALL ON public.station_responses TO anon;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
