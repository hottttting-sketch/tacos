-- =============================================
-- 20260502000800_pudding_slot_conflict_check.sql (Backup)
-- Description: Prevent duplicate broadcaster slots for the SAME project at same station and time.
-- =============================================

-- 1. Function to validate no duplicate slots for the same project
CREATE OR REPLACE FUNCTION pudding.fn_check_slot_conflict()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pudding.slots
        WHERE station_network = NEW.station_network
          AND broadcast_date = NEW.broadcast_date
          AND time_start = NEW.time_start
          AND project_id = NEW.project_id -- same project constraint
          AND id IS DISTINCT FROM NEW.id -- ignore itself if updating
    ) INTO v_conflict_exists;

    IF v_conflict_exists THEN
        RAISE EXCEPTION 'Double Booking Error: A slot on Station % at % on % for this project already exists.', 
            NEW.station_network, NEW.time_start, NEW.broadcast_date;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS trg_check_slot_conflict ON pudding.slots;
CREATE TRIGGER trg_check_slot_conflict
BEFORE INSERT OR UPDATE ON pudding.slots
FOR EACH ROW EXECUTE FUNCTION pudding.fn_check_slot_conflict();
