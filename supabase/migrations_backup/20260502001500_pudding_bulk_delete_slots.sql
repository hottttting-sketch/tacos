-- =============================================
-- 20260502001500_pudding_bulk_delete_slots.sql (Backup)
-- Description: Enable bulk deletion of broadcast slots and refresh analytics once.
-- =============================================

-- 1. Function to delete multiple slots at once
CREATE OR REPLACE FUNCTION pudding.fn_bulk_delete_slots(
    p_slot_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM pudding.slots
    WHERE id = ANY(p_slot_ids);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Refresh dashboard stats once after the bulk delete
    PERFORM pudding.refresh_project_stats();

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;
