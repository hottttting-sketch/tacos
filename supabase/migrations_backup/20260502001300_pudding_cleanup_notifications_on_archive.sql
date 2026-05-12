-- =============================================
-- 20260502001300_pudding_cleanup_notifications_on_archive.sql (Backup)
-- Description: Auto-delete related notifications when a project is archived.
-- =============================================

-- 1. Trigger Function to clean up notifications on project archival
CREATE OR REPLACE FUNCTION pudding.fn_delete_notifications_on_project_archive()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if the project just got archived
    IF NEW.is_archived = true AND (OLD.is_archived = false OR OLD.is_archived IS NULL) THEN
        DELETE FROM pudding.notifications
        WHERE content LIKE '%' || NEW.name || '%';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger on the pudding.projects table
DROP TRIGGER IF EXISTS trg_delete_notifications_on_project_archive ON pudding.projects;
CREATE TRIGGER trg_delete_notifications_on_project_archive
AFTER UPDATE ON pudding.projects
FOR EACH ROW EXECUTE FUNCTION pudding.fn_delete_notifications_on_project_archive();
