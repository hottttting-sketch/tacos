-- migration_20260416_security_audit.sql
-- セキュリティ（RLSポリシー）の厳格化

-- 1. 放送局別データ (project_stations) のポリシー強化
DROP POLICY IF EXISTS "Allow all authenticated users full access to project_stations" ON public.project_stations;

-- 代理店はその案件に属する全ての局データにアクセス可能
CREATE POLICY "Agency can manage their own project stations" ON public.project_stations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects pj
    WHERE pj.id = public.project_stations.project_id
    AND (pj.agency_id = auth.uid() OR auth.role() = 'service_role')
  )
);

-- 放送局・局担は自分の所属ネットワークのデータのみアクセス可能
CREATE POLICY "Stations can manage their own data" ON public.project_stations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (p.network = public.project_stations.station_network OR p.role = 'admin')
  )
);


-- 2. チャットメッセージ (chat_messages) のポリシー強化
DROP POLICY IF EXISTS "Allow all authenticated users full access to chat_messages" ON public.chat_messages;

CREATE POLICY "Chat access for related members" ON public.chat_messages
FOR ALL USING (
  -- 代理店・管理者・局担は案件が自分の担当ならOK
  EXISTS (
    SELECT 1 FROM public.projects pj
    WHERE (pj.id = project_id_tacos OR pj.id = project_id_pudding)
    AND (pj.agency_id = auth.uid() OR pj.liaison_id = auth.uid())
  )
  OR
  -- 放送局は自分が指名されている案件ならOK
  EXISTS (
    SELECT 1 FROM public.project_stations ps
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ps.project_id = project_id_tacos
    AND ps.station_network = p.network
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);


-- 3. 考査素材 (materials) のポリシー強化
DROP POLICY IF EXISTS "Allow all authenticated users full access to materials" ON public.materials;

CREATE POLICY "Material access for related stations" ON public.materials
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_stations ps
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ps.project_id = project_id_tacos
    AND (ps.station_network = p.network OR p.role IN ('admin', 'agency', 'agency-liaison'))
  )
);

COMMENT ON TABLE public.chat_messages IS 'RLSポリシーにより、関係者(代理店, 関係放送局, 管理者)のみが閲覧・送信可能';
