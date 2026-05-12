-- =============================================
-- 20260502001200_pudding_auto_chat_channels.sql
-- Description: Automatically create a chat channel linked to every new project.
-- =============================================

-- 1. Trigger function to automatically create chat channel on project creation
CREATE OR REPLACE FUNCTION pudding.fn_create_chat_channel_on_project_create()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create if a channel doesn't already exist for this project
    IF NOT EXISTS (
        SELECT 1 
        FROM pudding.chat_channels 
        WHERE project_id = NEW.id
    ) THEN
        INSERT INTO pudding.chat_channels (project_id, name)
        VALUES (
            NEW.id, 
            '[General] ' || NEW.name
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS trg_create_chat_channel_on_project_create ON pudding.projects;
CREATE TRIGGER trg_create_chat_channel_on_project_create
AFTER INSERT ON pudding.projects
FOR EACH ROW EXECUTE FUNCTION pudding.fn_create_chat_channel_on_project_create();
