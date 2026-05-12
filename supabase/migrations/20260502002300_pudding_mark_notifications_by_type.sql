-- =============================================
-- 20260502002300_pudding_mark_notifications_by_type.sql
-- Description: Mark notifications as read filtering by specific type.
-- =============================================

-- 1. Function to mark notifications as read by type
CREATE OR REPLACE FUNCTION pudding.fn_mark_notifications_by_type_as_read(
    p_user_id UUID,
    p_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE pudding.notifications
    SET is_read = true
    WHERE user_id = p_user_id
      AND type = p_type
      AND is_read = false;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;
