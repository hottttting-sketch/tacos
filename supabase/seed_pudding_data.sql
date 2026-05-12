-- =============================================
-- seed_pudding_data.sql
-- Description: Seed data for Pudding platform demo.
-- =============================================

-- 1. Get Agency and Broadcaster IDs (Assuming profiles already exist)
DO $$
DECLARE
    agency_id_val UUID;
    broadcaster_id_val UUID;
    project_id_val UUID;
    request_id_val UUID;
    channel_id_val UUID;
BEGIN
    -- Get IDs
    SELECT id INTO agency_id_val FROM public.profiles WHERE email = 'hottttting@gmail.com' LIMIT 1;
    SELECT id INTO broadcaster_id_val FROM public.profiles WHERE email = 'nsizm.2002@icloud.com' LIMIT 1;

    -- If profiles don't exist, this will skip or fail depending on constraints.
    -- For demo purposes, we proceed if agency exists.
    IF agency_id_val IS NOT NULL THEN
        
        -- 2. Create Project
        INSERT INTO pudding.projects (name, sponsor_name, agency_id, start_date, end_date, status)
        VALUES ('サントリー天然水 春のキャンペーン', 'サントリー', agency_id_val, '2026-05-10', '2026-05-20', 'requesting')
        RETURNING id INTO project_id_val;

        -- 3. Create Publicity Request
        INSERT INTO pudding.publicity_requests (project_id, requester_id, pub_types, zone_start, zone_end, remarks)
        VALUES (project_id_val, agency_id_val, ARRAY['ストレートパブ', '取材パブ'], '08:00', '22:00', 'GW前の需要喚起として、朝〜昼の主婦層向け番組を希望します。');

        -- 4. Assign Stations to Project
        INSERT INTO pudding.project_stations (project_id, station_network, status, assigned_reviewer_rewrite)
        VALUES 
            (project_id_val, 'CX系', 'confirmed', broadcaster_id_val),
            (project_id_val, 'NTV系', 'pending', NULL);

        -- 5. Create Chat Channel
        INSERT INTO pudding.chat_channels (project_id, name)
        VALUES (project_id_val, 'サントリー天然水 春のキャンペーン 相談窓口')
        RETURNING id INTO channel_id_val;

        -- 6. Add Chat Messages
        INSERT INTO pudding.chat_messages (channel_id, user_id, content)
        VALUES 
            (channel_id_val, agency_id_val, '今回の案件ですが、特に週末の枠を優先的に確保したいと考えております。'),
            (channel_id_val, broadcaster_id_val, '承知いたしました。CX系の方で調整可能か確認いたします。');

        -- 7. Register a Slot (Broadcaster side)
        INSERT INTO pudding.slots (project_id, station_network, broadcast_date, time_start, time_end, pub_type, remarks)
        VALUES (project_id_val, 'CX系', '2026-05-12', '10:30', '10:45', 'ストレートパブ', '情報番組内でのコーナー紹介を予定しています。');

        RAISE NOTICE 'Seed data for Pudding platform created successfully.';
    ELSE
        RAISE WARNING 'Agency profile not found. Seed skipped.';
    END IF;
END $$;
