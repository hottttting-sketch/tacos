-- =============================================
-- 20260508000100_pudding_public_tables.sql
-- Description: Create pudding tables in public schema for better API accessibility.
-- =============================================

-- 1. Projects
CREATE TABLE IF NOT EXISTS public.pudding_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    sponsor_name TEXT,
    agency_id UUID REFERENCES public.profiles(id),
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Publicity Requests
CREATE TABLE IF NOT EXISTS public.pudding_publicity_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.pudding_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    requester_id UUID REFERENCES public.profiles(id),
    pub_types TEXT[] DEFAULT '{}',
    zone_start TEXT,
    zone_end TEXT,
    remarks TEXT,
    is_draft BOOLEAN DEFAULT false
);

-- 3. Project Stations
CREATE TABLE IF NOT EXISTS public.pudding_project_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.pudding_projects(id) ON DELETE CASCADE,
    station_network TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    assigned_reviewer_rewrite UUID REFERENCES public.profiles(id),
    assigned_reviewer_recording UUID REFERENCES public.profiles(id),
    UNIQUE(project_id, station_network)
);

-- 4. RLS
ALTER TABLE public.pudding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pudding_publicity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pudding_project_stations ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for dev
CREATE POLICY "Permissive all for pudding_projects" ON public.pudding_projects FOR ALL USING (true);
CREATE POLICY "Permissive all for pudding_requests" ON public.pudding_publicity_requests FOR ALL USING (true);
CREATE POLICY "Permissive all for pudding_stations" ON public.pudding_project_stations FOR ALL USING (true);
