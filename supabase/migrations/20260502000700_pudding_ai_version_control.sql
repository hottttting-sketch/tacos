-- =============================================
-- 20260502000700_pudding_ai_version_control.sql
-- Description: Tracking active AI rewrite and restoring previous versions.
-- =============================================

-- 1. Add current active rewrite text column to projects
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS active_rewritten_text TEXT DEFAULT NULL;

-- 2. Stored procedure to restore a previous rewrite version
CREATE OR REPLACE FUNCTION pudding.fn_restore_ai_rewrite_version(
    p_rewrite_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_rewrite RECORD;
BEGIN
    -- Get rewrite details
    SELECT * INTO v_rewrite 
    FROM pudding.ai_rewrite_history 
    WHERE id = p_rewrite_id;

    IF v_rewrite IS NULL THEN
        RAISE EXCEPTION 'AI rewrite version not found';
    END IF;

    -- Update the active rewritten text on projects
    UPDATE pudding.projects
    SET active_rewritten_text = v_rewrite.rewritten_text,
        updated_at = now()
    WHERE id = v_rewrite.project_id;

    -- Create an audit trail record in history indicating it was restored
    INSERT INTO pudding.ai_rewrite_history (
        project_id,
        created_by,
        original_text,
        rewritten_text,
        prompt_used,
        metadata
    )
    VALUES (
        v_rewrite.project_id,
        p_user_id,
        v_rewrite.rewritten_text, -- original is the restored version
        v_rewrite.rewritten_text,
        'Restored from version: ' || p_rewrite_id,
        jsonb_build_object('restored_from', p_rewrite_id)
    );
END;
$$ LANGUAGE plpgsql;
