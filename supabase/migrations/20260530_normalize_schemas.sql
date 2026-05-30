-- =============================================
-- 20260530_normalize_schemas.sql
-- Description: DB Schema Normalization for Chats, Annotations, Transfers, and Assignees.
-- =============================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Project Chats Enhancement
-- Add channel_name to differentiate chat targets (e.g., specific station vs internal)
ALTER TABLE public.project_chats 
ADD COLUMN IF NOT EXISTS channel_name TEXT;

CREATE INDEX IF NOT EXISTS idx_project_chats_channel_name ON public.project_chats(channel_name);

-- 2. Annotations and Revisions Normalization
-- Ensure project_revisions exists and acts as a parent for annotations
CREATE TABLE IF NOT EXISTS public.project_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    station_name TEXT,
    memo TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We are migrating away from storing JSON annotations in project_revisions, 
-- so we create a separate table for individual annotations.
CREATE TABLE IF NOT EXISTS public.project_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    revision_id UUID NOT NULL REFERENCES public.project_revisions(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    station_name TEXT,
    text TEXT NOT NULL,
    x NUMERIC,
    y NUMERIC,
    width NUMERIC,
    height NUMERIC,
    page INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_annotations_revision_id ON public.project_annotations(revision_id);
CREATE INDEX IF NOT EXISTS idx_project_annotations_project_id ON public.project_annotations(project_id);


-- 3. Transfer History (移動書)
CREATE TABLE IF NOT EXISTS public.transfer_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    station_name TEXT,
    transfer_file_url TEXT,
    transfer_file_name TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    memo TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transfer_histories_project_id ON public.transfer_histories(project_id);


-- 4. Station Assignees (局担当者アサイン)
CREATE TABLE IF NOT EXISTS public.project_station_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    station_name TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'main', -- e.g., 'main', 'sub'
    assigned_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, station_name, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_station_assignees_project_id ON public.project_station_assignees(project_id);
CREATE INDEX IF NOT EXISTS idx_project_station_assignees_user_id ON public.project_station_assignees(user_id);


-- 5. RLS Policies
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_station_assignees ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('project_revisions', 'project_annotations', 'transfer_histories', 'project_station_assignees')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all authenticated users" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow all authenticated users" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
        EXECUTE format('GRANT ALL ON public.%I TO anon', t);
    END LOOP;
END $$;

-- 6. Trigger schema cache reload
NOTIFY pgrst, 'reload schema';
