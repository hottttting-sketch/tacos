-- =============================================
-- 20260502001700_pudding_recording_history.sql (Backup)
-- Description: Create audit log for recording file changes / replacements.
-- =============================================

-- 1. Create Recording History Table
CREATE TABLE IF NOT EXISTS pudding.recording_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES pudding.slots(id) ON DELETE CASCADE,
    old_file_path TEXT,
    new_file_path TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS for recording history
ALTER TABLE pudding.recording_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by all authenticated users" 
ON pudding.recording_history FOR SELECT 
USING (true);

-- 2. Trigger function to record audit trail
CREATE OR REPLACE FUNCTION pudding.fn_log_recording_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.file_path IS DISTINCT FROM NEW.file_path THEN
        INSERT INTO pudding.recording_history (slot_id, old_file_path, new_file_path, metadata)
        VALUES (
            NEW.slot_id,
            OLD.file_path,
            NEW.file_path,
            jsonb_build_object(
                'status', NEW.status,
                'old_status', OLD.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the Trigger on the pudding.recordings table
DROP TRIGGER IF EXISTS trg_log_recording_change ON pudding.recordings;
CREATE TRIGGER trg_log_recording_change
AFTER UPDATE ON pudding.recordings
FOR EACH ROW EXECUTE FUNCTION pudding.fn_log_recording_change();
