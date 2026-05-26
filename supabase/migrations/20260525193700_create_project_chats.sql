-- =============================================
-- 20260525193700_create_project_chats.sql
-- Description: Create project_chats table for chat messages.
-- =============================================

CREATE TABLE IF NOT EXISTS public.project_chats (
    id TEXT PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_type TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster retrieval by project
CREATE INDEX IF NOT EXISTS idx_project_chats_project_id ON public.project_chats(project_id);
CREATE INDEX IF NOT EXISTS idx_project_chats_created_at ON public.project_chats(created_at);

-- RLS
ALTER TABLE public.project_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by authenticated users"
ON public.project_chats FOR SELECT
USING (true);

CREATE POLICY "Insertable by authenticated users"
ON public.project_chats FOR INSERT
WITH CHECK (true);
