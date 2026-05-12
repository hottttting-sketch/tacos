-- =============================================
-- 20260502003200_pudding_check_recording_delays.sql (Backup)
-- Description: Check past-due broadcast slots for missing recordings and issue alerts.
-- =============================================

CREATE OR REPLACE FUNCTION pudding.fn_check_recording_delays()
RETURNS INTEGER AS $$
DECLARE
    v_rec RECORD;
    v_alert_count INTEGER := 0;
BEGIN
    FOR v_rec IN
        SELECT s.id AS slot_id, s.broadcast_date, p.id AS project_id, p.name AS project_name, p.created_by
        FROM pudding.slots s
        JOIN pudding.projects p ON s.project_id = p.id
        WHERE s.broadcast_date < now()::DATE
          AND NOT EXISTS (
              SELECT 1 
              FROM pudding.recordings r 
              WHERE r.slot_id = s.id
          )
          AND p.is_archived = false
    LOOP
        -- If the project was created by a specific user, notify them
        IF v_rec.created_by IS NOT NULL THEN
            INSERT INTO pudding.notifications (
                user_id,
                title,
                content,
                type,
                metadata
            )
            VALUES (
                v_rec.created_by,
                '【遅延】同録ファイル未提出アラート',
                '案件「' || v_rec.project_name || '」の放送日 (' || v_rec.broadcast_date || ') に対する同録ファイルが未提出です。',
                'alert',
                jsonb_build_object('project_id', v_rec.project_id, 'slot_id', v_rec.slot_id)
            );
            v_alert_count := v_alert_count + 1;
        END IF;
    END LOOP;

    RETURN v_alert_count;
END;
$$ LANGUAGE plpgsql;
