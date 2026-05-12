-- =============================================
-- 20260502002000_pudding_prevent_duplicate_project_name.sql
-- Description: Prevent duplicate active project names within same sponsor.
-- =============================================

-- 1. Trigger function to validate uniqueness of active project names
CREATE OR REPLACE FUNCTION pudding.fn_check_duplicate_project_name()
RETURNS TRIGGER AS $$
DECLARE
    v_duplicate_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pudding.projects
        WHERE name = NEW.name
          AND sponsor_name = NEW.sponsor_name
          AND is_archived = false
          AND id IS DISTINCT FROM NEW.id
    ) INTO v_duplicate_exists;

    IF v_duplicate_exists THEN
        RAISE EXCEPTION 'Duplicate Project Name Error: An active project named "%" already exists for sponsor "%".', 
            NEW.name, NEW.sponsor_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger on the pudding.projects table
DROP TRIGGER IF EXISTS trg_check_duplicate_project_name ON pudding.projects;
CREATE TRIGGER trg_check_duplicate_project_name
BEFORE INSERT OR UPDATE OF name, sponsor_name ON pudding.projects
FOR EACH ROW EXECUTE FUNCTION pudding.fn_check_duplicate_project_name();
