-- =============================================
-- 20260502002900_pudding_bulk_import_slots.sql (Backup)
-- Description: Server-side validation and bulk import for Pudding slots.
-- =============================================

CREATE OR REPLACE FUNCTION pudding.fn_import_slots_bulk(
    p_slots_data JSONB
)
RETURNS UUID[] AS $$
DECLARE
    v_item JSONB;
    v_project_id UUID;
    v_station TEXT;
    v_date DATE;
    v_start TEXT;
    v_end TEXT;
    v_is_overnight BOOLEAN;
    v_new_slot_id UUID;
    v_slot_ids UUID[] := '{}';
BEGIN
    -- 1. Validate that input is a JSON array
    IF jsonb_typeof(p_slots_data) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Input data must be a JSON array.';
    END IF;

    -- 2. Loop over each slot in the array
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_slots_data)
    LOOP
        -- Extract fields
        v_project_id := (v_item->>'project_id')::UUID;
        v_station := trim(v_item->>'station_network');
        v_date := (v_item->>'broadcast_date')::DATE;
        v_start := trim(v_item->>'time_start');
        v_end := trim(v_item->>'time_end');
        v_is_overnight := coalesce((v_item->>'is_overnight')::BOOLEAN, false);

        -- Basic Validations
        IF v_project_id IS NULL THEN
            RAISE EXCEPTION 'Bulk Slot Import Error: Project ID is required.';
        END IF;

        IF v_station IS NULL OR v_station = '' THEN
            RAISE EXCEPTION 'Bulk Slot Import Error: Station network is required.';
        END IF;

        IF v_date IS NULL THEN
            RAISE EXCEPTION 'Bulk Slot Import Error: Broadcast date is required.';
        END IF;

        IF v_start IS NULL OR v_end IS NULL THEN
            RAISE EXCEPTION 'Bulk Slot Import Error: Both start and end times are required.';
        END IF;

        -- Create random ID
        v_new_slot_id := gen_random_uuid();

        -- Insert the slot (Triggers will validate Double Booking & Time consistency)
        INSERT INTO pudding.slots (
            id,
            project_id,
            station_network,
            broadcast_date,
            time_start,
            time_end,
            is_overnight
        )
        VALUES (
            v_new_slot_id,
            v_project_id,
            v_station,
            v_date,
            v_start,
            v_end,
            v_is_overnight
        );

        -- Append the created ID to the array
        v_slot_ids := array_append(v_slot_ids, v_new_slot_id);
    END LOOP;

    -- Refresh dashboard stats once after the bulk insert
    PERFORM pudding.refresh_project_stats();

    RETURN v_slot_ids;
END;
$$ LANGUAGE plpgsql;
