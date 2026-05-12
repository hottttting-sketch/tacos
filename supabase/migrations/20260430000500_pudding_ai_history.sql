-- =============================================
-- 20260430000500_pudding_ai_history.sql
-- Description: AI Rewrite and Narration history tables for Pudding.
-- =============================================

-- 1. AI Rewrite History
CREATE TABLE IF NOT EXISTS pudding.ai_rewrite_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    original_text TEXT NOT NULL,
    rewritten_text TEXT NOT NULL,
    prompt_used TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Narration History
CREATE TABLE IF NOT EXISTS pudding.narration_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    text_content TEXT NOT NULL,
    voice_id TEXT NOT NULL,
    speed DECIMAL(3,2) DEFAULT 1.0,
    file_path TEXT, -- Path in Supabase Storage
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. RLS
ALTER TABLE pudding.ai_rewrite_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.narration_history ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified: Project participants can view)
CREATE POLICY "Project participants can view rewrite history" 
ON pudding.ai_rewrite_history FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM pudding.projects p
        WHERE p.id = pudding.ai_rewrite_history.project_id
        -- Detailed check can be added here if needed
    )
);

CREATE POLICY "Users can insert rewrite history" 
ON pudding.ai_rewrite_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Project participants can view narration history" 
ON pudding.narration_history FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM pudding.projects p
        WHERE p.id = pudding.narration_history.project_id
    )
);

CREATE POLICY "Users can insert narration history" 
ON pudding.narration_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_pudding_ai_rewrite_project ON pudding.ai_rewrite_history(project_id);
CREATE INDEX IF NOT EXISTS idx_pudding_narration_project ON pudding.narration_history(project_id);
