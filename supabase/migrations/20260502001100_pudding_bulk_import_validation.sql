-- =============================================
-- 20260502001100_pudding_bulk_import_validation.sql
-- Description: Server-side validation and bulk import for Pudding projects.
-- =============================================

CREATE OR REPLACE FUNCTION pudding.fn_import_projects_bulk(
    p_projects_data JSONB
)
RETURNS UUID[] AS $$
DECLARE
    v_item JSONB;
    v_name TEXT;
    v_sponsor TEXT;
    v_agency_id UUID;
    v_status TEXT;
    v_new_project_id UUID;
    v_project_ids UUID[] := '{}';
BEGIN
    -- 1. Validate that input is a JSON array
    IF jsonb_typeof(p_projects_data) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Input data must be a JSON array.';
    END IF;

    -- 2. Loop over each project in the array
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_projects_data)
    LOOP
        -- Extract and clean fields
        v_name := trim(v_item->>'name');
        v_sponsor := trim(v_item->>'sponsor_name');
        v_agency_id := (v_item->>'agency_id')::UUID;
        v_status := coalesce(trim(v_item->>'status'), 'draft');

        -- Validations
        IF v_name IS NULL OR v_name = '' THEN
            RAISE EXCEPTION 'Bulk Import Error: Project name is required for all rows.';
        END IF;

        IF v_sponsor IS NULL OR v_sponsor = '' THEN
            RAISE EXCEPTION 'Bulk Import Error: Sponsor name is required for all rows.';
        END IF;

        -- Check valid status
        IF v_status NOT IN ('draft', 'requesting', 'slots_registration', 'material_check', 'completed') THEN
            v_status := 'draft';
        END IF;

        -- Insert the project
        v_new_project_id := gen_random_uuid();
        INSERT INTO pudding.projects (
            id,
            name,
            sponsor_name,
            agency_id,
            status
        )
        VALUES (
            v_new_project_id,
            v_name,
            v_sponsor,
            v_agency_id,
            v_status
        );

        -- Append the created ID to the array
        v_project_ids := array_append(v_project_ids, v_new_project_id);
    END LOOP;

    -- Refresh dashboard stats once after the bulk insert
    PERFORM pudding.refresh_project_stats();

    RETURN v_project_ids;
END;
$$ LANGUAGE plpgsql;
