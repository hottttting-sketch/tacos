-- =============================================
-- 20260502000500_pudding_split_request.sql (Backup)
-- Description: Split single publicity request into individual broadcaster projects.
-- =============================================

-- 1. Function to create individual child projects per selected station
CREATE OR REPLACE FUNCTION pudding.fn_split_request_by_stations(
    p_request_id UUID,
    p_station_networks TEXT[]
)
RETURNS UUID[] AS $$
DECLARE
    v_req RECORD;
    v_new_project_id UUID;
    v_project_ids UUID[] := '{}';
    v_station TEXT;
BEGIN
    -- 1. Fetch original publicity request details
    SELECT * INTO v_req
    FROM pudding.publicity_requests
    WHERE id = p_request_id;

    IF v_req IS NULL THEN
        RAISE EXCEPTION 'Publicity request not found';
    END IF;

    -- 2. Iterate over each selected station network
    FOREACH v_station IN ARRAY p_station_networks
    LOOP
        v_new_project_id := gen_random_uuid();
        
        -- 3. Create project for each station
        INSERT INTO pudding.projects (
            id, 
            name, 
            sponsor_name, 
            agency_id, 
            status,
            metadata
        )
        VALUES (
            v_new_project_id,
            '[' || v_station || '] ' || v_req.project_name,
            v_req.sponsor_name,
            -- If user_id is in metadata or available, use it (otherwise null)
            NULL, 
            'requesting',
            jsonb_build_object(
                'source_request_id', p_request_id,
                'station_network', v_station,
                'remarks', v_req.remarks
            )
        );

        -- Accumulate created project IDs
        v_project_ids := array_append(v_project_ids, v_new_project_id);
    END LOOP;

    -- Refresh view
    PERFORM pudding.refresh_project_stats();

    RETURN v_project_ids;
END;
$$ LANGUAGE plpgsql;
