-- =============================================
-- 20260502000100_pudding_v3_test.sql
-- Description: Testing data insertion for V3 triggers with fully self-contained views.
-- =============================================

-- Drop broken trigger from older sessions if exists
DROP TRIGGER IF EXISTS trg_notify_project_update ON pudding.projects CASCADE;
DROP FUNCTION IF EXISTS pudding.fn_notify_project_update CASCADE;

-- Ensure the materialized view exists
DROP MATERIALIZED VIEW IF EXISTS pudding.mv_project_stats CASCADE;

CREATE MATERIALIZED VIEW pudding.mv_project_stats AS
SELECT 
    status,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at > now() - INTERVAL '7 days' THEN 1 END) as new_last_7_days,
    MAX(updated_at) as last_updated_at
FROM pudding.projects
GROUP BY status;

-- Unique index needed for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_project_stats_status ON pudding.mv_project_stats(status);

-- Function to refresh view
CREATE OR REPLACE FUNCTION pudding.refresh_project_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY pudding.mv_project_stats;
EXCEPTION WHEN OTHERS THEN
    REFRESH MATERIALIZED VIEW pudding.mv_project_stats;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    agency_id_val UUID;
    project_id_val UUID;
    slot_id_val UUID;
    v_stats_count INTEGER;
    v_notif_count INTEGER;
BEGIN
    -- 1. 代理店ユーザーIDの取得 (なければ新規作成用のダミープロファイルを参照)
    SELECT id INTO agency_id_val FROM public.profiles WHERE role = 'agency' LIMIT 1;
    IF agency_id_val IS NULL THEN
        -- ダミーの代理店IDを作成
        agency_id_val := gen_random_uuid();
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (agency_id_val, 'test_agency@example.com', 'テスト代理店', 'agency')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 2. テスト案件の登録 (status = 'slots_registration' で登録)
    project_id_val := gen_random_uuid();
    INSERT INTO pudding.projects (id, name, sponsor_name, agency_id, status)
    VALUES (project_id_val, 'V3検証用テスト案件', 'サントリー株式会社', agency_id_val, 'slots_registration');

    -- 3. テスト用放送枠の登録
    slot_id_val := gen_random_uuid();
    INSERT INTO pudding.slots (id, project_id, station_network, broadcast_date, time_start, time_end, pub_type, remarks)
    VALUES (slot_id_val, project_id_val, 'CX', '2026-05-15', '12:00', '13:00', 'ストレート', 'V3テスト用の枠登録');

    -- 4. 同録データの登録 (ここでトリガーが発動する)
    INSERT INTO pudding.recordings (slot_id, file_path, status)
    VALUES (slot_id_val, 'pudding-materials/recordings/test_aircheck.mp3', 'approved');

    -- 【検証1】 案件ステータスが 'completed' になっているか
    ASSERT (SELECT status FROM pudding.projects WHERE id = project_id_val) = 'completed', 'Error: Project status is not updated to completed';

    -- 【検証2】 通知が作成されているか
    SELECT COUNT(*) INTO v_notif_count FROM pudding.notifications WHERE user_id = agency_id_val AND type = 'recording_uploaded';
    ASSERT v_notif_count > 0, 'Error: Notification for recording was not created';

    -- 【検証3】 統計のマテリアライズド・ビューが自動リフレッシュされ、'completed' が集計されているか
    SELECT total_count INTO v_stats_count FROM pudding.mv_project_stats WHERE status = 'completed';
    ASSERT v_stats_count >= 1, 'Error: Materialized view was not updated';

    RAISE NOTICE 'V3トリガー連動テスト: すべて成功しました！';
END;
$$ LANGUAGE plpgsql;
