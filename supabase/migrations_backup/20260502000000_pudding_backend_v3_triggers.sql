-- =============================================
-- 20260502000000_pudding_backend_v3_triggers.sql (Backup)
-- Description: Advanced triggers for recordings, notifications, and analytics refresh.
-- =============================================

-- 1. Automation for Step 3: When a recording is uploaded, auto-update the project status to 'completed'
CREATE OR REPLACE FUNCTION pudding.fn_on_recording_uploaded()
RETURNS TRIGGER AS $$
DECLARE
    v_project_id UUID;
BEGIN
    -- Get the project ID associated with the slot of the recording
    SELECT s.project_id INTO v_project_id
    FROM pudding.slots s
    WHERE s.id = NEW.slot_id;

    IF v_project_id IS NOT NULL THEN
        UPDATE pudding.projects 
        SET status = 'completed', updated_at = now()
        WHERE id = v_project_id AND status IN ('draft', 'requesting', 'slots_registration', 'material_check');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recording_uploaded ON pudding.recordings;
CREATE TRIGGER trg_recording_uploaded
AFTER INSERT ON pudding.recordings
FOR EACH ROW EXECUTE FUNCTION pudding.fn_on_recording_uploaded();

-- 2. Automation for Step 4: Notify the Agency when a recording is uploaded
CREATE OR REPLACE FUNCTION pudding.fn_notify_recording_uploaded()
RETURNS TRIGGER AS $$
DECLARE
    v_project_id UUID;
    v_project_name TEXT;
    v_agency_id UUID;
BEGIN
    SELECT s.project_id, p.name, p.agency_id INTO v_project_id, v_project_name, v_agency_id
    FROM pudding.slots s
    JOIN pudding.projects p ON p.id = s.project_id
    WHERE s.id = NEW.slot_id;

    IF v_agency_id IS NOT NULL THEN
        INSERT INTO pudding.notifications (user_id, type, title, content, link)
        VALUES (
            v_agency_id, 
            'recording_uploaded', 
            '同録（放送後データ）のアップロード', 
            '案件「' || v_project_name || '」の同録がアップロードされました。', 
            '/pudding/board'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_recording_uploaded ON pudding.recordings;
CREATE TRIGGER trg_notify_recording_uploaded
AFTER INSERT ON pudding.recordings
FOR EACH ROW EXECUTE FUNCTION pudding.fn_notify_recording_uploaded();

-- 3. Automation for Step 5: Auto-refresh materialized view on project change
CREATE OR REPLACE FUNCTION pudding.fn_refresh_stats_on_project_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh view asynchronously via background or directly if concurrent
    -- Since it's a small dataset, direct concurrent refresh works quickly
    PERFORM pudding.refresh_project_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_stats_on_project_change ON pudding.projects;
CREATE TRIGGER trg_refresh_stats_on_project_change
AFTER INSERT OR UPDATE ON pudding.projects
FOR EACH ROW EXECUTE FUNCTION pudding.fn_refresh_stats_on_project_change();
