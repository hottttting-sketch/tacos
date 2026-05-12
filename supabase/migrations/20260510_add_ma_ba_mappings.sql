-- MA/BA マッピング管理用テーブル
CREATE TABLE IF NOT EXISTS public.ma_ba_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_org_name TEXT NOT NULL,
    ba_org_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(ma_org_name, ba_org_name)
);

-- RLSの有効化
ALTER TABLE public.ma_ba_mappings ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーなら誰でも読み書き可能（デモ・開発用設定）
CREATE POLICY "Allow all for authenticated users on ma_ba_mappings" 
ON public.ma_ba_mappings FOR ALL 
USING (auth.role() = 'authenticated');
