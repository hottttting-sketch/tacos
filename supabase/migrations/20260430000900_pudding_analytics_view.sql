-- =============================================
-- 20260430000900_pudding_analytics_view.sql
-- Description: Analytics views for Pudding dashboard.
-- =============================================

-- 1. Materialized View for Project Statistics
-- This view aggregates data for faster dashboard rendering.
DROP MATERIALIZED VIEW IF EXISTS pudding.mv_project_stats;

CREATE MATERIALIZED VIEW pudding.mv_project_stats AS
SELECT 
    status,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at > now() - INTERVAL '7 days' THEN 1 END) as new_last_7_days,
    MAX(updated_at) as last_updated_at
FROM pudding.projects
GROUP BY status;

-- 2. View for Agency Performance
CREATE OR REPLACE VIEW pudding.view_agency_stats AS
SELECT 
    p.name as agency_name,
    COUNT(pr.id) as total_projects,
    COUNT(CASE WHEN pr.status = 'completed' THEN 1 END) as completed_projects
FROM public.profiles p
JOIN pudding.projects pr ON pr.agency_id = p.id
WHERE p.role = 'agency'
GROUP BY p.name;

-- 3. Function to Refresh Materialized View
CREATE OR REPLACE FUNCTION pudding.refresh_project_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY pudding.mv_project_stats;
END;
$$ LANGUAGE plpgsql;

-- 4. Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_project_stats_status ON pudding.mv_project_stats(status);

-- 5. Trigger to refresh stats on project update (Optional, use with caution for performance)
-- For now, we provide the function to be called periodically or after major updates.
