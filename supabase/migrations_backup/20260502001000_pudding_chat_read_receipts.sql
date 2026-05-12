-- =============================================
-- 20260502001000_pudding_chat_read_receipts.sql (Backup)
-- Description: Tracking unread status and counting unread messages in chat channels.
-- =============================================

-- 1. Add is_read flag to chat_messages
ALTER TABLE pudding.chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false NOT NULL;

-- 2. Stored procedure to mark messages as read for a given channel and user
CREATE OR REPLACE FUNCTION pudding.fn_mark_chat_messages_as_read(
    p_channel_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE pudding.chat_messages
    SET is_read = true
    WHERE channel_id = p_channel_id 
      AND user_id IS DISTINCT FROM p_user_id -- only mark messages from other users
      AND is_read = false;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Stored procedure to get unread message count for a given channel and user
CREATE OR REPLACE FUNCTION pudding.fn_get_unread_chat_count(
    p_channel_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_unread_count
    FROM pudding.chat_messages
    WHERE channel_id = p_channel_id
      AND user_id IS DISTINCT FROM p_user_id -- count messages sent by others
      AND is_read = false;

    RETURN v_unread_count;
END;
$$ LANGUAGE plpgsql;
