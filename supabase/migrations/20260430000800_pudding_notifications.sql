-- =============================================
-- 20260430000800_pudding_notifications.sql
-- Description: Notification system for Pudding.
-- =============================================

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS pudding.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'status_change', 'chat', 'recording_uploaded', 'new_request'
    title TEXT NOT NULL,
    content TEXT,
    link TEXT, -- Deep link to the project or chat
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. RLS
ALTER TABLE pudding.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
ON pudding.notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
ON pudding.notifications FOR INSERT 
WITH CHECK (true); -- Usually triggered by system functions

-- 3. Notification Triggers

-- A. Trigger for Status Change
CREATE OR REPLACE FUNCTION pudding.fn_notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Notify Agency
        INSERT INTO pudding.notifications (user_id, type, title, content, link)
        VALUES (NEW.agency_id, 'status_change', '案件ステータス更新', '案件「' || NEW.name || '」が「' || NEW.status || '」になりました。', '/pudding/board');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_status_change ON pudding.projects;
CREATE TRIGGER trg_notify_status_change
AFTER UPDATE ON pudding.projects
FOR EACH ROW EXECUTE FUNCTION pudding.fn_notify_status_change();

-- B. Trigger for New Chat Message
CREATE OR REPLACE FUNCTION pudding.fn_notify_new_chat()
RETURNS TRIGGER AS $$
DECLARE
    v_project_name TEXT;
    v_target_user UUID;
BEGIN
    SELECT p.name, p.agency_id INTO v_project_name, v_target_user 
    FROM pudding.projects p 
    JOIN pudding.chat_channels c ON c.project_id = p.id
    WHERE c.id = NEW.channel_id;

    -- Simplified: Notify the agency if the sender is not the agency
    IF (NEW.user_id IS DISTINCT FROM v_target_user) THEN
        INSERT INTO pudding.notifications (user_id, type, title, content, link)
        VALUES (v_target_user, 'chat', '新着メッセージ', v_project_name || ' で新しいメッセージがあります。', '/pudding/chat');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_chat ON pudding.chat_messages;
CREATE TRIGGER trg_notify_new_chat
AFTER INSERT ON pudding.chat_messages
FOR EACH ROW EXECUTE FUNCTION pudding.fn_notify_new_chat();

-- 4. Index
CREATE INDEX IF NOT EXISTS idx_pudding_notifications_user ON pudding.notifications(user_id, is_read);
