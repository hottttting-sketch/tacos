-- Seed Pudding Projects for Excel Tool Testing
-- Date: 2026-04-22

-- 1. 既存のテストデータをクリア（クリーンな状態から開始）
TRUNCATE pudding.projects CASCADE;

-- 2. 現在のユーザー(hotta)のIDを取得して変数に格納
-- (IDが不明な場合でも動作するように subquery を使用します)
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.profiles WHERE email LIKE 'hotta%' LIMIT 1;

    -- 3. テストデータの投入
    INSERT INTO pudding.projects (
        title, 
        client, 
        status, 
        broadcast_date, 
        recording_date, 
        material_deadline,
        agency_assignee_id,
        description
    ) VALUES 
    (
        '春のサンクスキャンペーン', 
        'サントリー', 
        2, -- 内示済
        '2024-04-10', 
        '2024-04-01', 
        '2024-03-25',
        v_user_id,
        'エクセルツール動作確認用データ1'
    ),
    (
        '夏の新商品発表会', 
        'トヨタ自動車', 
        3, -- 進行中
        '2024-05-15', 
        '2024-05-01', 
        '2024-04-20',
        v_user_id,
        'エクセルツール動作確認用データ2'
    ),
    (
        '秋のファッションウィーク', 
        'ファーストリテイリング', 
        1, -- 未着手
        '2024-09-20', 
        '2024-09-10', 
        '2024-09-01',
        v_user_id,
        'エクセルツール動作確認用データ3'
    ),
    (
        '冬のギフトセレクション', 
        '三越伊勢丹', 
        2, -- 内示済
        '2024-12-05', 
        '2024-11-20', 
        '2024-11-10',
        v_user_id,
        'エクセルツール動作確認用データ4'
    );
END $$;
