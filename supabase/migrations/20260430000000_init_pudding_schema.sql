-- =============================================
-- 20260430000000_init_pudding_schema.sql
-- Description: Initialize Pudding platform schema and core tables.
-- =============================================

-- 1. Schema
CREATE SCHEMA IF NOT EXISTS pudding;

-- 2. Projects (Core entity)
CREATE TABLE IF NOT EXISTS pudding.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    sponsor_name TEXT,
    agency_id UUID REFERENCES public.profiles(id),
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft', -- 'draft', 'requesting', 'slots_registration', 'material_check', 'completed'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Publicity Requests (Detailed request info)
CREATE TABLE IF NOT EXISTS pudding.publicity_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    requester_id UUID REFERENCES public.profiles(id),
    pub_types TEXT[] DEFAULT '{}',
    zone_start TEXT, -- e.g., "08:00"
    zone_end TEXT,   -- e.g., "18:00"
    remarks TEXT,
    is_draft BOOLEAN DEFAULT false
);

-- 4. Project Stations (Broadcasters involved in a project)
CREATE TABLE IF NOT EXISTS pudding.project_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    station_network TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
    assigned_reviewer_rewrite UUID REFERENCES public.profiles(id),
    assigned_reviewer_recording UUID REFERENCES public.profiles(id),
    UNIQUE(project_id, station_network)
);

-- 5. Chat System
CREATE TABLE IF NOT EXISTS pudding.chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pudding.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES pudding.chat_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Slots (Broadcaster registration)
CREATE TABLE IF NOT EXISTS pudding.slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES pudding.projects(id) ON DELETE CASCADE,
    station_network TEXT NOT NULL,
    broadcast_date DATE NOT NULL,
    time_start TEXT,
    time_end TEXT,
    pub_type TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RLS (Row Level Security)
ALTER TABLE pudding.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.publicity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.project_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pudding.slots ENABLE ROW LEVEL SECURITY;

-- Policies for pudding.projects
CREATE POLICY "Admins have full access to projects" ON pudding.projects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Agencies see their own projects" ON pudding.projects FOR SELECT USING (
    agency_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Stations see assigned projects" ON pudding.projects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pudding.project_stations ps 
        JOIN public.profiles p ON p.networks @> ARRAY[ps.station_network]
        WHERE ps.project_id = pudding.projects.id AND p.id = auth.uid()
    )
);

-- (Simplified policies for other tables follow similar logic)
CREATE POLICY "Users see related chat channels" ON pudding.chat_channels FOR SELECT USING (
    EXISTS (SELECT 1 FROM pudding.projects WHERE id = pudding.chat_channels.project_id)
);

CREATE POLICY "Users see related chat messages" ON pudding.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM pudding.chat_channels WHERE id = pudding.chat_messages.channel_id)
);

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_pudding_projects_agency ON pudding.projects(agency_id);
CREATE INDEX IF NOT EXISTS idx_pudding_requests_project ON pudding.publicity_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_pudding_stations_project ON pudding.project_stations(project_id);
CREATE INDEX IF NOT EXISTS idx_pudding_chat_project ON pudding.chat_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_pudding_messages_channel ON pudding.chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_pudding_slots_project ON pudding.slots(project_id);
