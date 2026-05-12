-- =============================================
-- 20260502003400_pudding_compare_ai_rewrites.sql (Backup)
-- Description: Function to compare two AI rewrite history versions.
-- =============================================

-- 1. Function to compare two versions of rewritten text
CREATE OR REPLACE FUNCTION pudding.fn_compare_ai_rewrites(
    p_old_version_id UUID,
    p_new_version_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_old_text TEXT;
    v_new_text TEXT;
    v_old_created TIMESTAMP WITH TIME ZONE;
    v_new_created TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT rewritten_text, created_at INTO v_old_text, v_old_created
    FROM pudding.ai_rewrite_history
    WHERE id = p_old_version_id;

    SELECT rewritten_text, created_at INTO v_new_text, v_new_created
    FROM pudding.ai_rewrite_history
    WHERE id = p_new_version_id;

    RETURN jsonb_build_object(
        'old_text', coalesce(v_old_text, ''),
        'new_text', coalesce(v_new_text, ''),
        'old_created_at', v_old_created,
        'new_created_at', v_new_created,
        'has_changes', v_old_text IS DISTINCT FROM v_new_text
    );
END;
$$ LANGUAGE plpgsql;
