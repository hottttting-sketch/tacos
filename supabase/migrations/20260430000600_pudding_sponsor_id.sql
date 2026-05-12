-- =============================================
-- 20260430000600_pudding_sponsor_id.sql
-- Description: Link projects to sponsor IDs and enforce isolation.
-- =============================================

-- 1. Add sponsor_id to projects
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES public.profiles(id);

-- 2. Update RLS Policies to include Sponsor access
-- Drop old policies first
DROP POLICY IF EXISTS "Admins full access" ON pudding.projects;
DROP POLICY IF EXISTS "Agencies see own" ON pudding.projects;
DROP POLICY IF EXISTS "Stations see assigned" ON pudding.projects;
DROP POLICY IF EXISTS "Sponsors see own projects" ON pudding.projects;

-- Admin: Full access
CREATE POLICY "Admins full access" 
ON pudding.projects FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Agency: Access to projects they are managing
CREATE POLICY "Agencies see managed projects" 
ON pudding.projects FOR SELECT 
USING (agency_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Broadcaster: Access via project_stations
CREATE POLICY "Stations see assigned projects" 
ON pudding.projects FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM pudding.project_stations ps 
        JOIN public.profiles p ON p.networks @> ARRAY[ps.station_network]
        WHERE ps.project_id = pudding.projects.id AND p.id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sponsor: Access ONLY to their own projects
CREATE POLICY "Sponsors see own projects" 
ON pudding.projects FOR SELECT 
USING (sponsor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Index for sponsor lookup
CREATE INDEX IF NOT EXISTS idx_pudding_projects_sponsor ON pudding.projects(sponsor_id);
