-- =============================================
-- 20260430000100_fix_pudding_schema_columns.sql
-- Description: Align existing pudding.projects columns with new schema.
-- =============================================

-- 1. Rename existing columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'pudding' AND table_name = 'projects' AND column_name = 'title') THEN
        ALTER TABLE pudding.projects RENAME COLUMN title TO name;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'pudding' AND table_name = 'projects' AND column_name = 'client') THEN
        ALTER TABLE pudding.projects RENAME COLUMN client TO sponsor_name;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'pudding' AND table_name = 'projects' AND column_name = 'agency_assignee_id') THEN
        ALTER TABLE pudding.projects RENAME COLUMN agency_assignee_id TO agency_id;
    END IF;
END $$;

-- 2. Add missing columns
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure status is TEXT
-- We drop the dependent view and policies first to avoid type mismatch errors
DROP VIEW IF EXISTS pudding.view_system_stats;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'pudding' AND tablename = 'projects') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON pudding.projects', pol.policyname);
    END LOOP;
END $$;

-- Drop check constraints that might compare status with integer
DO $$
DECLARE
    cons RECORD;
BEGIN
    FOR cons IN (SELECT conname FROM pg_constraint WHERE conrelid = 'pudding.projects'::regclass AND contype = 'c') LOOP
        EXECUTE format('ALTER TABLE pudding.projects DROP CONSTRAINT IF EXISTS %I', cons.conname);
    END LOOP;
END $$;

ALTER TABLE pudding.projects ALTER COLUMN status TYPE TEXT USING status::text;
ALTER TABLE pudding.projects ALTER COLUMN status SET DEFAULT 'draft';

-- Recreate view (optional, but good for keeping system stats working if it was simple)
CREATE OR REPLACE VIEW pudding.view_system_stats AS
SELECT 
    status,
    COUNT(*) as project_count
FROM pudding.projects
GROUP BY status;

-- 4. Ensure NOT NULL constraints where appropriate (optional but recommended)
ALTER TABLE pudding.projects ALTER COLUMN name SET NOT NULL;
-- 5. Re-apply RLS policies
-- (Copying policies from init script to ensure they exist after dropping)
ALTER TABLE pudding.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to projects" ON pudding.projects;
CREATE POLICY "Admins have full access to projects" ON pudding.projects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Agencies see their own projects" ON pudding.projects;
CREATE POLICY "Agencies see their own projects" ON pudding.projects FOR SELECT USING (
    agency_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Stations see assigned projects" ON pudding.projects;
CREATE POLICY "Stations see assigned projects" ON pudding.projects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pudding.project_stations ps 
        JOIN public.profiles p ON p.networks @> ARRAY[ps.station_network]
        WHERE ps.project_id = pudding.projects.id AND p.id = auth.uid()
    )
);
