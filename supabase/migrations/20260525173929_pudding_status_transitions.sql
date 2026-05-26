-- =============================================
-- 20260525173929_pudding_status_transitions.sql
-- Description: Create project_status_transitions table and transition RPC for Pudding.
-- =============================================

-- 1. Create table in public schema
CREATE TABLE IF NOT EXISTS public.project_status_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.pudding_projects(id) ON DELETE CASCADE,
    station_name TEXT,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_type TEXT
);

-- RLS
ALTER TABLE public.project_status_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by authenticated users"
ON public.project_status_transitions FOR SELECT
USING (true);

CREATE POLICY "Insertable by authenticated users"
ON public.project_status_transitions FOR INSERT
WITH CHECK (true);

-- 2. Create RPC for atomic status update
CREATE OR REPLACE FUNCTION public.pudding_transition_status(
    p_project_id UUID,
    p_station_name TEXT,
    p_new_status TEXT,
    p_action_type TEXT,
    p_user_id UUID,
    p_extra_flags JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status TEXT;
    v_current_metadata JSONB;
BEGIN
    -- Get current project status
    SELECT status, metadata INTO v_old_status, v_current_metadata
    FROM public.pudding_projects
    WHERE id = p_project_id;

    -- If the transition is for a specific station, update metadata for that station
    IF p_station_name IS NOT NULL THEN
        -- Construct JSONB update string dynamically
        
        UPDATE public.pudding_projects
        SET status = p_new_status,
            metadata = jsonb_set(
                COALESCE(metadata, '{}'::jsonb),
                array['response_' || p_station_name],
                (COALESCE(metadata->('response_' || p_station_name), '{}'::jsonb) || jsonb_build_object('status', p_new_status) || COALESCE(p_extra_flags, '{}'::jsonb))
            ),
            updated_at = timezone('utc'::text, now())
        WHERE id = p_project_id;
    ELSE
        -- Global project status update
        UPDATE public.pudding_projects
        SET status = p_new_status,
            metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_extra_flags, '{}'::jsonb),
            updated_at = timezone('utc'::text, now())
        WHERE id = p_project_id;
    END IF;

    -- Insert log
    INSERT INTO public.project_status_transitions (
        project_id,
        station_name,
        old_status,
        new_status,
        changed_by,
        action_type
    ) VALUES (
        p_project_id,
        p_station_name,
        v_old_status,
        p_new_status,
        p_user_id,
        p_action_type
    );
END;
$$;
