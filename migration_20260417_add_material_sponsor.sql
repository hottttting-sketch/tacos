-- 放送素材 (Materials) テーブルにスポンサー名カラムを追加
-- 2026-04-17

ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS sponsor_name TEXT;

-- コメントの追加
COMMENT ON COLUMN public.materials.sponsor_name IS 'プロジェクトに紐付けない素材の場合に使用するスポンサー名';
