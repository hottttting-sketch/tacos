-- migration_20260419_fix_project_columns.sql
-- Description: Add missing columns to public.projects table to match the current API implementation.

-- 1. Add missing columns to public.projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS ba TEXT,
ADD COLUMN IF NOT EXISTS area TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS indices JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hearing_items TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS ng_selections TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS ng_specific_program TEXT,
ADD COLUMN IF NOT EXISTS service_shares JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS estimate_deadline TEXT,
ADD COLUMN IF NOT EXISTS product TEXT;

-- 2. Update existing data (optional, mapping from form_data if necessary)
-- Note: api.js already stores full data in form_data, so we could theoretically backfill.
-- However, for the reported error, simply having the columns available is sufficient for new inserts.

-- 3. Notify PostgREST to reload schema (automatic in Supabase, but good to keep in mind)
COMMENT ON TABLE public.projects IS 'Updated on 2026-04-19: Added missing flat columns for better query support.';
