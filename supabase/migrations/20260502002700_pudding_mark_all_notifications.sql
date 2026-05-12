-- =============================================
-- 20260502002700_pudding_mark_all_notifications.sql
-- Description: Mark all notifications as read for a user.
-- =============================================

-- 1. Function to mark all unread notifications for a user as read
CREATE OR REPLACE FUNCTION pudding.fn_mark_all_notifications_as_read(
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE pudding.notifications
    SET is_read = true
    WHERE user_id = p_user_id
      AND is_read = false;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;
