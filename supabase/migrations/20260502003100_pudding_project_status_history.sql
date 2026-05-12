-- =============================================
-- 20260502003100_pudding_project_status_history.sql
-- Description: Track history of project status transitions.
-- =============================================

-- 1. Create status history table
CREATE TABLE IF NOT EXISTS pudding.project_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE pudding.project_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by authenticated users"
ON pudding.project_status_history FOR SELECT
USING (true);

-- 2. Trigger function to log status change
CREATE OR REPLACE FUNCTION pudding.fn_log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO pudding.project_status_history (
            project_id,
            old_status,
            new_status
        )
        VALUES (
            NEW.id,
            OLD.status,
            NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger on pudding.projects
DROP TRIGGER IF EXISTS trg_log_project_status_change ON pudding.projects;
CREATE TRIGGER trg_log_project_status_change
AFTER UPDATE OF status ON pudding.projects
FOR EACH ROW EXECUTE FUNCTION pudding.fn_log_project_status_change();
