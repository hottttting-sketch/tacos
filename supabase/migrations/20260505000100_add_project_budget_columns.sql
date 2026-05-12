-- =============================================
-- 20260505000100_add_project_budget_columns.sql
-- Description: Add budget-related columns to pudding.projects for RevenueView.
-- =============================================

-- 1. カラムの追加
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS budget_confirmed BIGINT DEFAULT 0;
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS total_budget BIGINT DEFAULT 0;
ALTER TABLE pudding.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. コメントの追加
COMMENT ON COLUMN pudding.projects.budget_confirmed IS '自社確定額（自社発注額）';
COMMENT ON COLUMN pudding.projects.total_budget IS 'エリア全体の合計投下額';

-- 3. 自動更新トリガーの作成
CREATE OR REPLACE FUNCTION pudding.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at') THEN
        CREATE TRIGGER trg_projects_updated_at
        BEFORE UPDATE ON pudding.projects
        FOR EACH ROW
        EXECUTE FUNCTION pudding.fn_update_timestamp();
    END IF;
END $$;
