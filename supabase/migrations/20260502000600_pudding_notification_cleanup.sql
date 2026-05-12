-- =============================================
-- 20260502000600_pudding_notification_cleanup.sql
-- Description: Advanced read management and archival for Pudding notifications.
-- =============================================

-- 1. Function to mark all unread notifications for a specific user as read
CREATE OR REPLACE FUNCTION pudding.fn_mark_all_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE pudding.notifications
    SET is_read = true
    WHERE user_id = p_user_id AND is_read = false;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to mark a single notification as read
CREATE OR REPLACE FUNCTION pudding.fn_mark_notification_as_read(p_notification_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pudding.notifications
    SET is_read = true
    WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to cleanup notifications older than a given number of days (e.g., default 30 days)
CREATE OR REPLACE FUNCTION pudding.fn_cleanup_old_notifications(p_older_than_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM pudding.notifications
    WHERE created_at < now() - (p_older_than_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;
