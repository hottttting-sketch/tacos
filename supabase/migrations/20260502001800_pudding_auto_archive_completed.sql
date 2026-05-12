-- =============================================
-- 20260502001800_pudding_auto_archive_completed.sql
-- Description: Automatically archive old completed projects.
-- =============================================

-- 1. Function to auto-archive completed projects older than a certain number of days
CREATE OR REPLACE FUNCTION pudding.fn_auto_archive_completed_projects(
    p_older_than_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    UPDATE pudding.projects
    SET is_archived = true, 
        deleted_at = now()
    WHERE status = 'completed'
      AND is_archived = false
      AND updated_at < now() - (p_older_than_days || ' days')::INTERVAL;

    GET DIAGNOSTICS v_archived_count = ROW_COUNT;

    -- Trigger analytics refresh if any projects were archived
    IF v_archived_count > 0 THEN
        PERFORM pudding.refresh_project_stats();
    END IF;

    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;
