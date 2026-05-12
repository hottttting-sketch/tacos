-- =============================================
-- 20260430000700_pudding_recordings.sql
-- Description: Air-check (recording) management for Pudding.
-- =============================================

-- 1. Recordings Table
CREATE TABLE IF NOT EXISTS pudding.recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    slot_id UUID REFERENCES pudding.slots(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL, -- Path in Supabase Storage (e.g., 'pudding-materials/recordings/...')
    duration_seconds INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. RLS
ALTER TABLE pudding.recordings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Project participants can view recordings" 
ON pudding.recordings FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM pudding.slots s
        WHERE s.id = pudding.recordings.slot_id
    )
);

CREATE POLICY "Broadcasters can upload recordings" 
ON pudding.recordings FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('broadcaster', 'admin')
    )
);

-- 3. Index
CREATE INDEX IF NOT EXISTS idx_pudding_recordings_slot ON pudding.recordings(slot_id);
