-- =============================================
-- 20260502003500_pudding_station_acceptance_summary.sql (Backup)
-- Description: Aggregate broadcaster acceptance/rejection metrics.
-- =============================================

-- 1. Function to get station response summary metrics
CREATE OR REPLACE FUNCTION pudding.fn_get_station_response_summary()
RETURNS TABLE (
    station_network TEXT,
    accepted_count BIGINT,
    rejected_count BIGINT,
    total_count BIGINT,
    acceptance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.station_network,
        COUNT(*) FILTER (WHERE ps.status = 'confirmed') AS accepted_count,
        COUNT(*) FILTER (WHERE ps.status = 'rejected') AS rejected_count,
        COUNT(*) AS total_count,
        ROUND(
            100.0 * COUNT(*) FILTER (WHERE ps.status = 'confirmed')::NUMERIC / GREATEST(1, COUNT(*)), 
            1
        ) AS acceptance_rate
    FROM pudding.project_stations ps
    JOIN pudding.projects p ON ps.project_id = p.id
    WHERE p.is_archived = false
    GROUP BY ps.station_network;
END;
$$ LANGUAGE plpgsql;
