-- =============================================
-- 20260502001900_pudding_reviewer_history.sql (Backup)
-- Description: Tracking changes to assigned reviewers (Rewrite/Recording).
-- =============================================

-- 1. Create reviewer history table
CREATE TABLE IF NOT EXISTS pudding.project_reviewer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    station_network TEXT NOT NULL,
    reviewer_type TEXT NOT NULL, -- 'rewrite' or 'recording'
    old_reviewer_id UUID REFERENCES public.profiles(id),
    new_reviewer_id UUID REFERENCES public.profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for history
ALTER TABLE pudding.project_reviewer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by authenticated users" 
ON pudding.project_reviewer_history FOR SELECT 
USING (true);

-- 2. Trigger function to record audit trail
CREATE OR REPLACE FUNCTION pudding.fn_log_reviewer_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Check rewrite reviewer change
    IF OLD.assigned_reviewer_rewrite IS DISTINCT FROM NEW.assigned_reviewer_rewrite THEN
        INSERT INTO pudding.project_reviewer_history (
            project_id,
            station_network,
            reviewer_type,
            old_reviewer_id,
            new_reviewer_id
        )
        VALUES (
            NEW.project_id,
            NEW.station_network,
            'rewrite',
            OLD.assigned_reviewer_rewrite,
            NEW.assigned_reviewer_rewrite
        );
    END IF;

    -- Check recording reviewer change
    IF OLD.assigned_reviewer_recording IS DISTINCT FROM NEW.assigned_reviewer_recording THEN
        INSERT INTO pudding.project_reviewer_history (
            project_id,
            station_network,
            reviewer_type,
            old_reviewer_id,
            new_reviewer_id
        )
        VALUES (
            NEW.project_id,
            NEW.station_network,
            'recording',
            OLD.assigned_reviewer_recording,
            NEW.assigned_reviewer_recording
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger on project_stations
DROP TRIGGER IF EXISTS trg_log_reviewer_change ON pudding.project_stations;
CREATE TRIGGER trg_log_reviewer_change
AFTER UPDATE ON pudding.project_stations
FOR EACH ROW EXECUTE FUNCTION pudding.fn_log_reviewer_change();
