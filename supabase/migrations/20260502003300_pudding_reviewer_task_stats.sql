-- =============================================
-- 20260502003300_pudding_reviewer_task_stats.sql
-- Description: Get task completion performance statistics for a reviewer.
-- =============================================

-- 1. Function to calculate pending vs completed reviewer tasks
CREATE OR REPLACE FUNCTION pudding.fn_get_reviewer_task_stats(
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_pending_rewrite INTEGER;
    v_completed_rewrite INTEGER;
    v_pending_recording INTEGER;
    v_completed_recording INTEGER;
BEGIN
    -- Rewrite pending vs completed
    SELECT 
        COUNT(*) FILTER (WHERE p.status != 'completed') AS pending,
        COUNT(*) FILTER (WHERE p.status = 'completed') AS completed
    INTO v_pending_rewrite, v_completed_rewrite
    FROM pudding.project_stations ps
    JOIN pudding.projects p ON ps.project_id = p.id
    WHERE ps.assigned_reviewer_rewrite = p_user_id
      AND p.is_archived = false;

    -- Recording pending vs completed
    SELECT 
        COUNT(*) FILTER (WHERE p.status != 'completed') AS pending,
        COUNT(*) FILTER (WHERE p.status = 'completed') AS completed
    INTO v_pending_recording, v_completed_recording
    FROM pudding.project_stations ps
    JOIN pudding.projects p ON ps.project_id = p.id
    WHERE ps.assigned_reviewer_recording = p_user_id
      AND p.is_archived = false;

    RETURN jsonb_build_object(
        'pending_rewrite_tasks', coalesce(v_pending_rewrite, 0),
        'completed_rewrite_tasks', coalesce(v_completed_rewrite, 0),
        'pending_recording_tasks', coalesce(v_pending_recording, 0),
        'completed_recording_tasks', coalesce(v_completed_recording, 0)
    );
END;
$$ LANGUAGE plpgsql;
