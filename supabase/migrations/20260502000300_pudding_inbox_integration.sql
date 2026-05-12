-- =============================================
-- 20260502000300_pudding_inbox_integration.sql
-- Description: Inbox email management and conversion function to publicity requests.
-- =============================================

-- 1. Create Inbox Emails Table
CREATE TABLE IF NOT EXISTS pudding.inbox_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'converted', 'archived'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS for inbox emails
ALTER TABLE pudding.inbox_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view incoming emails" 
ON pudding.inbox_emails FOR SELECT 
USING (true);

CREATE POLICY "System can insert emails" 
ON pudding.inbox_emails FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update emails" 
ON pudding.inbox_emails FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 2. Function to convert email to a publicity request
CREATE OR REPLACE FUNCTION pudding.fn_convert_email_to_request(
    p_email_id UUID,
    p_sponsor_name TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_email_record RECORD;
    v_request_id UUID;
BEGIN
    -- Get the email record
    SELECT * INTO v_email_record 
    FROM pudding.inbox_emails 
    WHERE id = p_email_id;

    IF v_email_record IS NULL THEN
        RAISE EXCEPTION 'Email not found';
    END IF;

    -- Create publicity request
    v_request_id := gen_random_uuid();
    INSERT INTO pudding.publicity_requests (id, sponsor_name, project_name, remarks)
    VALUES (
        v_request_id,
        p_sponsor_name,
        v_email_record.subject,
        'From email sender: ' || v_email_record.sender || E'\nBody:\n' || v_email_record.body
    );

    -- Update the email status to converted
    UPDATE pudding.inbox_emails 
    SET status = 'converted'
    WHERE id = p_email_id;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;
