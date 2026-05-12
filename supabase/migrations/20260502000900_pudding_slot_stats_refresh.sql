-- =============================================
-- 20260502000900_pudding_slot_stats_refresh.sql
-- Description: Automatically refresh analytics materialized view when slots are changed.
-- =============================================

-- 1. Create Trigger Function to refresh stats on slots table mutations
CREATE OR REPLACE FUNCTION pudding.fn_refresh_stats_on_slot_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pudding.refresh_project_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger on the pudding.slots table
DROP TRIGGER IF EXISTS trg_refresh_stats_on_slot_change ON pudding.slots;
CREATE TRIGGER trg_refresh_stats_on_slot_change
AFTER INSERT OR UPDATE OR DELETE ON pudding.slots
FOR EACH ROW EXECUTE FUNCTION pudding.fn_refresh_stats_on_slot_change();
