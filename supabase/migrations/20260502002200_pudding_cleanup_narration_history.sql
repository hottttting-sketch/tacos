-- =============================================
-- 20260502002200_pudding_cleanup_narration_history.sql
-- Description: Automatically prune unused or old AI narration history records.
-- =============================================

-- 1. Function to clean up old narration history records
CREATE OR REPLACE FUNCTION pudding.fn_cleanup_narration_history(
    p_older_than_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM pudding.narration_history
    WHERE created_at < now() - (p_older_than_days || ' days')::INTERVAL;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;
