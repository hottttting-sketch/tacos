-- =============================================
-- 20260502002100_pudding_slot_time_validation.sql (Backup)
-- Description: Enforce that slot start time is always before end time.
-- =============================================

-- 1. Trigger function to validate time consistency
CREATE OR REPLACE FUNCTION pudding.fn_check_slot_time_consistency()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.time_start IS NOT NULL AND NEW.time_end IS NOT NULL THEN
        IF NEW.time_start >= NEW.time_end THEN
            RAISE EXCEPTION 'Time Validation Error: Slot start time (%) must be strictly before end time (%).', 
                NEW.time_start, NEW.time_end;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger on the pudding.slots table
DROP TRIGGER IF EXISTS trg_check_slot_time_consistency ON pudding.slots;
CREATE TRIGGER trg_check_slot_time_consistency
BEFORE INSERT OR UPDATE OF time_start, time_end ON pudding.slots
FOR EACH ROW EXECUTE FUNCTION pudding.fn_check_slot_time_consistency();
