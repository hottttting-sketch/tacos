-- =============================================
-- 20260502002600_pudding_rewrite_revisions_count.sql
-- Description: Count revisions of AI rewrite for a project.
-- =============================================

-- 1. Function to get rewrite revisions count for a specific project
CREATE OR REPLACE FUNCTION pudding.fn_get_rewrite_revisions_count(
    p_project_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pudding.ai_rewrite_history
    WHERE project_id = p_project_id;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
