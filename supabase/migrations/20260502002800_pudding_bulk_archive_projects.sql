-- =============================================
-- 20260502002800_pudding_bulk_archive_projects.sql
-- Description: Enable bulk archiving/logical deletion of multiple projects.
-- =============================================

-- 1. Drop existing function to prevent return type conflict
DROP FUNCTION IF EXISTS pudding.fn_bulk_archive_projects(UUID[]);

-- 2. Function to bulk archive projects
CREATE OR REPLACE FUNCTION pudding.fn_bulk_archive_projects(
    p_project_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    UPDATE pudding.projects
    SET is_archived = true,
        deleted_at = now()
    WHERE id = ANY(p_project_ids);

    GET DIAGNOSTICS v_archived_count = ROW_COUNT;

    -- Refresh stats once after the bulk update
    IF v_archived_count > 0 THEN
        PERFORM pudding.refresh_project_stats();
    END IF;

    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;
