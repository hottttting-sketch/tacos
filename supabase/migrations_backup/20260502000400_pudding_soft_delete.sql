-- =============================================
-- 20260502000400_pudding_soft_delete.sql (Backup)
-- Description: Archival and soft delete capability for Pudding projects.
-- =============================================

-- 1. Add archival columns to projects
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Function to archive/cancel a single project
CREATE OR REPLACE FUNCTION pudding.fn_archive_project(p_project_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pudding.projects 
    SET is_archived = true, deleted_at = now()
    WHERE id = p_project_id;

    -- Trigger analytics refresh
    PERFORM pudding.refresh_project_stats();
END;
$$ LANGUAGE plpgsql;

-- 3. Function to archive multiple projects in bulk
CREATE OR REPLACE FUNCTION pudding.fn_bulk_archive_projects(p_project_ids UUID[])
RETURNS void AS $$
BEGIN
    UPDATE pudding.projects 
    SET is_archived = true, deleted_at = now()
    WHERE id = ANY(p_project_ids);

    -- Trigger analytics refresh
    PERFORM pudding.refresh_project_stats();
END;
$$ LANGUAGE plpgsql;

-- 4. Update the Materialized View to ignore archived projects
DROP MATERIALIZED VIEW IF EXISTS pudding.mv_project_stats CASCADE;

CREATE MATERIALIZED VIEW pudding.mv_project_stats AS
SELECT 
    status,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at > now() - INTERVAL '7 days' THEN 1 END) as new_last_7_days,
    MAX(updated_at) as last_updated_at
FROM pudding.projects
WHERE is_archived = false
GROUP BY status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_project_stats_status ON pudding.mv_project_stats(status);

-- 5. Recreate Refresh Function (since we dropped view cascade)
CREATE OR REPLACE FUNCTION pudding.refresh_project_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY pudding.mv_project_stats;
EXCEPTION WHEN OTHERS THEN
    REFRESH MATERIALIZED VIEW pudding.mv_project_stats;
END;
$$ LANGUAGE plpgsql;
