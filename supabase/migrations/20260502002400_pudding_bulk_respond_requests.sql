-- =============================================
-- 20260502002400_pudding_bulk_respond_requests.sql
-- Description: Allow broadcasters to accept/reject publicity requests in bulk.
-- =============================================

-- 1. Function to respond to multiple publicity requests in bulk
CREATE OR REPLACE FUNCTION pudding.fn_respond_to_publicity_requests_bulk(
    p_project_ids UUID[],
    p_response TEXT, -- 'accepted' or 'rejected'
    p_reason TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_project_id UUID;
    v_processed_count INTEGER := 0;
BEGIN
    -- Validate response
    IF p_response NOT IN ('accepted', 'rejected') THEN
        RAISE EXCEPTION 'Response must be accepted or rejected';
    END IF;

    -- Loop and call existing function for each project
    FOREACH v_project_id IN ARRAY p_project_ids
    LOOP
        PERFORM pudding.fn_respond_to_publicity_request(v_project_id, p_response, p_reason);
        v_processed_count := v_processed_count + 1;
    END LOOP;

    RETURN v_processed_count;
END;
$$ LANGUAGE plpgsql;
