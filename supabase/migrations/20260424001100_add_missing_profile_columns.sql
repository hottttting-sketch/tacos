-- =============================================
-- 20260424001100_add_missing_profile_columns.sql
-- Description: Add missing columns to profiles table and set scopes.
-- =============================================

-- 1. 不足しているカラムを追加
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS networks TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. 堀田② (代理店) の業務範囲設定
UPDATE public.profiles 
SET scopes = ARRAY['見積作成者', '局担', '発注', '改案', '進行', '移動書', '考査'],
    status = 'active'
WHERE email = 'hottttting@gmail.com';

-- 3. 堀田③ (放送局) の業務範囲設定
UPDATE public.profiles 
SET scopes = ARRAY['営業外勤', 'スポットデスク', 'タイムデスク', '進行', '移動書', '考査'],
    status = 'active'
WHERE email = 'nsizm.2002@icloud.com';

-- 結果を確認
SELECT email, name, role, scopes, status FROM public.profiles WHERE name LIKE '%堀田%';
