-- =============================================
-- 20260505000000_extend_profiles.sql
-- Description: Add metadata columns to profiles table for UserManagementView.
-- =============================================

-- 1. カラムの追加
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kana TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_role TEXT;

-- 2. コメントの追加
COMMENT ON COLUMN public.profiles.department IS '部署名';
COMMENT ON COLUMN public.profiles.kana IS 'ふりがな（主にスポンサー用）';
COMMENT ON COLUMN public.profiles.company_name IS '組織名（自社セクションや代理店名、またはスポンサー会社名）';

-- 3. RLSポリシーの確認（既に存在することを前提としているが、念のためadminアクセスを保証）
-- public.profiles のポリシーは通常 auth.users と連動しているため、
-- ここではアプリケーション側からの読み書きを想定した最低限の定義を確認。
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins full access to profiles'
    ) THEN
        CREATE POLICY "Admins full access to profiles" ON public.profiles
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;
