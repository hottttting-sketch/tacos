-- =============================================
-- 20260502001400_pudding_slot_status_on_recording.sql
-- Description: Auto-update individual slot recording status when recording is uploaded.
-- =============================================

-- 1. Add recording status to slots table
ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS recording_status TEXT DEFAULT 'pending' NOT NULL;

-- 2. Trigger Function to update individual slot's status
CREATE OR REPLACE FUNCTION pudding.fn_update_slot_status_on_recording()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pudding.slots
    SET recording_status = 'recorded'
    WHERE id = NEW.slot_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the Trigger on the pudding.recordings table
DROP TRIGGER IF EXISTS trg_update_slot_status_on_recording ON pudding.recordings;
CREATE TRIGGER trg_update_slot_status_on_recording
AFTER INSERT ON pudding.recordings
FOR EACH ROW EXECUTE FUNCTION pudding.fn_update_slot_status_on_recording();
