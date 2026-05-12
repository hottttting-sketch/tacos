-- =============================================
-- 20260430000400_pudding_status_triggers.sql
-- Description: Automated status updates for Pudding projects.
-- =============================================

-- 1. Function: Update Project Status to 'requesting'
CREATE OR REPLACE FUNCTION pudding.fn_on_request_created()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pudding.projects 
    SET status = 'requesting' 
    WHERE id = NEW.project_id AND status = 'draft';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function: Update Project Status to 'slots_registration'
CREATE OR REPLACE FUNCTION pudding.fn_on_slot_registered()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pudding.projects 
    SET status = 'slots_registration' 
    WHERE id = NEW.project_id AND status IN ('draft', 'requesting');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Triggers
DROP TRIGGER IF EXISTS trg_request_created ON pudding.publicity_requests;
CREATE TRIGGER trg_request_created
AFTER INSERT ON pudding.publicity_requests
FOR EACH ROW EXECUTE FUNCTION pudding.fn_on_request_created();

DROP TRIGGER IF EXISTS trg_slot_registered ON pudding.slots;
CREATE TRIGGER trg_slot_registered
AFTER INSERT ON pudding.slots
FOR EACH ROW EXECUTE FUNCTION pudding.fn_on_slot_registered();

-- 4. Function: Update updated_at on project when chat happens (Optional but useful)
-- First add updated_at to projects if not exists
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE OR REPLACE FUNCTION pudding.fn_on_chat_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pudding.projects 
    SET updated_at = now() 
    WHERE id = (SELECT project_id FROM pudding.chat_channels WHERE id = NEW.channel_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chat_message_posted ON pudding.chat_messages;
CREATE TRIGGER trg_chat_message_posted
AFTER INSERT ON pudding.chat_messages
FOR EACH ROW EXECUTE FUNCTION pudding.fn_on_chat_message();
