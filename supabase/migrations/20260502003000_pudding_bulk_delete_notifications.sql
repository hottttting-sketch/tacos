-- =============================================
-- 20260502003000_pudding_bulk_delete_notifications.sql
-- Description: Enable bulk deletion of notifications.
-- =============================================

-- 1. Function to delete notifications in bulk
CREATE OR REPLACE FUNCTION pudding.fn_bulk_delete_notifications(
    p_notification_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM pudding.notifications
    WHERE id = ANY(p_notification_ids);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;
