-- =============================================
-- 20260508000000_pudding_rls_insert_fix.sql
-- Description: Allow Agencies to insert projects and requests.
-- =============================================

-- 1. Projects: Allow Insert for Agencies
DROP POLICY IF EXISTS "Agencies can insert projects" ON pudding.projects;
CREATE POLICY "Agencies can insert projects" 
ON pudding.projects FOR INSERT 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agency') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Publicity Requests: Allow Insert for Agencies
DROP POLICY IF EXISTS "Agencies can insert requests" ON pudding.publicity_requests;
CREATE POLICY "Agencies can insert requests" 
ON pudding.publicity_requests FOR INSERT 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agency') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Project Stations: Allow Insert for Agencies
DROP POLICY IF EXISTS "Agencies can insert project stations" ON pudding.project_stations;
CREATE POLICY "Agencies can insert project stations" 
ON pudding.project_stations FOR INSERT 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agency') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
