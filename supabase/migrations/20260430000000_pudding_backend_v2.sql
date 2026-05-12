-- =============================================
-- 20260430000000_pudding_backend_v2.sql
-- Description: Robust initialization/fix for Pudding platform backend.
-- =============================================

-- 1. Schema
CREATE SCHEMA IF NOT EXISTS pudding;

-- 2. Clean up ALL potentially blocking dependencies
DROP VIEW IF EXISTS pudding.view_system_stats;

-- Drop all policies in the pudding schema
DO $$
DECLARE
    row RECORD;
BEGIN
    FOR row IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'pudding') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON pudding.%I', row.policyname, row.tablename);
    END LOOP;
END $$;

-- Drop all check constraints in the pudding schema
DO $$
DECLARE
    row RECORD;
BEGIN
    FOR row IN (
        SELECT conname, relname 
        FROM pg_constraint c
        JOIN pg_class r ON c.conrelid = r.oid
        JOIN pg_namespace n ON r.relnamespace = n.oid
        WHERE n.nspname = 'pudding' AND c.contype = 'c'
    ) LOOP
        EXECUTE format('ALTER TABLE pudding.%I DROP CONSTRAINT IF EXISTS %I', row.relname, row.conname);
    END LOOP;
END $$;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS pudding.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'draft'
);

DO $$
BEGIN
    -- Rename legacy columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'pudding' AND table_name = 'projects' AND column_name = 'title') THEN
        ALTER TABLE pudding.projects RENAME COLUMN title TO name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'pudding' AND table_name = 'projects' AND column_name = 'client') THEN
        ALTER TABLE pudding.projects RENAME COLUMN client TO sponsor_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'pudding' AND table_name = 'projects' AND column_name = 'agency_assignee_id') THEN
        ALTER TABLE pudding.projects RENAME COLUMN agency_assignee_id TO agency_id;
    END IF;

    -- Add missing columns
    ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS name TEXT;
    ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS sponsor_name TEXT;
    ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.profiles(id);
    ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS end_date DATE;
    ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE pudding.projects ALTER COLUMN status TYPE TEXT USING status::text;
    
    UPDATE pudding.projects SET name = '無題の案件' WHERE name IS NULL;
    ALTER TABLE pudding.projects ALTER COLUMN name SET NOT NULL;
END $$;

-- 4. Other Tables & Column Sync
CREATE TABLE IF NOT EXISTS pudding.publicity_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS pudding.project_stations (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS pudding.chat_channels (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS pudding.chat_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS pudding.slots (id UUID PRIMARY KEY DEFAULT gen_random_uuid());

DO $$
BEGIN
    -- publicity_requests
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE;
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.profiles(id);
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS pub_types TEXT[] DEFAULT '{}';
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS zone_start TEXT;
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS zone_end TEXT;
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS remarks TEXT;
    ALTER TABLE pudding.publicity_requests ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

    -- project_stations
    ALTER TABLE pudding.project_stations ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE;
    ALTER TABLE pudding.project_stations ADD COLUMN IF NOT EXISTS station_network TEXT;
    ALTER TABLE pudding.project_stations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE pudding.project_stations ADD COLUMN IF NOT EXISTS assigned_reviewer_rewrite UUID REFERENCES public.profiles(id);
    ALTER TABLE pudding.project_stations ADD COLUMN IF NOT EXISTS assigned_reviewer_recording UUID REFERENCES public.profiles(id);

    -- chat_channels
    ALTER TABLE pudding.chat_channels ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE;
    ALTER TABLE pudding.chat_channels ADD COLUMN IF NOT EXISTS name TEXT;

    -- chat_messages
    ALTER TABLE pudding.chat_messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES pudding.chat_channels(id) ON DELETE CASCADE;
    ALTER TABLE pudding.chat_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);
    ALTER TABLE pudding.chat_messages ADD COLUMN IF NOT EXISTS content TEXT;

    -- slots
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE;
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS station_network TEXT;
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS broadcast_date DATE;
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS time_start TEXT;
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS time_end TEXT;
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS pub_type TEXT;
    ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS remarks TEXT;
END $$;

-- 5. RLS
ALTER TABLE pudding.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.publicity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.project_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.slots ENABLE ROW LEVEL SECURITY;

-- Apply policies
CREATE POLICY "Admins full access" ON pudding.projects FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Agencies see own" ON pudding.projects FOR SELECT USING (agency_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Stations see assigned" ON pudding.projects FOR SELECT USING (EXISTS (SELECT 1 FROM pudding.project_stations ps JOIN public.profiles p ON p.networks @> ARRAY[ps.station_network] WHERE ps.project_id = pudding.projects.id AND p.id = auth.uid()));
CREATE POLICY "Publicity requests see related" ON pudding.publicity_requests FOR SELECT USING (true);
CREATE POLICY "Chat viewable" ON pudding.chat_channels FOR SELECT USING (true);
CREATE POLICY "Messages viewable" ON pudding.chat_messages FOR SELECT USING (true);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_pudding_projects_agency ON pudding.projects(agency_id);
CREATE INDEX IF NOT EXISTS idx_pudding_requests_project ON pudding.publicity_requests(project_id);

-- 7. View
CREATE OR REPLACE VIEW pudding.view_system_stats AS
SELECT status, COUNT(*) as project_count FROM pudding.projects GROUP BY status;
