-- =============================================
-- 20260502001600_pudding_respond_to_request.sql
-- Description: Allow broadcasters to accept or reject a publicity request.
-- =============================================

-- 1. Function to accept or reject a publicity request
CREATE OR REPLACE FUNCTION pudding.fn_respond_to_publicity_request(
    p_project_id UUID,
    p_response TEXT, -- 'accepted' or 'rejected'
    p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_project RECORD;
BEGIN
    -- 1. Fetch project details
    SELECT * INTO v_project 
    FROM pudding.projects 
    WHERE id = p_project_id;

    IF v_project IS NULL THEN
        RAISE EXCEPTION 'Project not found';
    END IF;

    -- 2. Process based on broadcaster response
    IF p_response = 'accepted' THEN
        -- Move status forward to slots registration
        UPDATE pudding.projects
        SET status = 'slots_registration',
            updated_at = now()
        WHERE id = p_project_id;

        -- Notify agency of acceptance
        INSERT INTO pudding.notifications (user_id, type, title, content, link)
        VALUES (
            v_project.agency_id,
            'request_accepted',
            'パブリシティ依頼受領',
            '案件「' || v_project.name || '」の依頼が放送局に受託されました。放送枠の登録をお待ちください。',
            '/pudding/board'
        );
    ELSIF p_response = 'rejected' THEN
        -- Revert status back to draft and save rejection reason
        UPDATE pudding.projects
        SET status = 'draft',
            metadata = jsonb_set(
                coalesce(metadata, '{}'::jsonb),
                '{rejection_reason}',
                to_jsonb(p_reason)
            ),
            updated_at = now()
        WHERE id = p_project_id;

        -- Notify agency of rejection
        INSERT INTO pudding.notifications (user_id, type, title, content, link)
        VALUES (
            v_project.agency_id,
            'request_rejected',
            'パブリシティ依頼辞退',
            '案件「' || v_project.name || '」の依頼が放送局に辞退されました。理由: ' || coalesce(p_reason, '特になし'),
            '/pudding/board'
        );
    ELSE
        RAISE EXCEPTION 'Response must be accepted or rejected';
    END IF;
END;
$$ LANGUAGE plpgsql;
