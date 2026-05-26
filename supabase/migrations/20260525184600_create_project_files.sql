-- =============================================
-- 20260525184600_create_project_files.sql
-- Description: Create project_files table for managing file attachments.
-- =============================================

CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.pudding_projects(id) ON DELETE CASCADE,
    station_name TEXT,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);

-- RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by authenticated users"
ON public.project_files FOR SELECT
USING (true);

CREATE POLICY "Insertable by authenticated users"
ON public.project_files FOR INSERT
WITH CHECK (true);

CREATE POLICY "Deletable by authenticated users"
ON public.project_files FOR DELETE
USING (true);
