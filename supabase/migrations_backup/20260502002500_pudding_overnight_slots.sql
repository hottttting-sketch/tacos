-- =============================================
-- 20260502002500_pudding_overnight_slots.sql (Backup)
-- Description: Extend time validation trigger to support overnight slots.
-- =============================================

-- 1. Add is_overnight column to slots table
ALTER TABLE pudding.slots ADD COLUMN IF NOT EXISTS is_overnight BOOLEAN DEFAULT false NOT NULL;

-- 2. Update the time validation function to accommodate overnight slots
CREATE OR REPLACE FUNCTION pudding.fn_check_slot_time_consistency()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.time_start IS NOT NULL AND NEW.time_end IS NOT NULL THEN
        -- Standard check: Start time must be before end time unless it's an overnight slot
        IF NEW.is_overnight = false THEN
            IF NEW.time_start >= NEW.time_end THEN
                RAISE EXCEPTION 'Time Validation Error: Slot start time (%) must be strictly before end time (%) unless marked as overnight.', 
                    NEW.time_start, NEW.time_end;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
