import { supabase } from './supabaseClient';

const FALLBACK_PROJECTS = [
  { id: '8d0727d8-33d4-4147-ac05-65b12f3e930c', name: '【テスト】枠出し待ち案件', sponsor_name: 'ダミー飲料', start_date: '2026-05-10', end_date: '2026-05-20', status: 'slots', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局A'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: '9bca16fd-26f3-48a7-b8af-f75006b7049a', name: '【テスト】素材待ち案件', sponsor_name: 'ダミー自動車', start_date: '2026-05-12', end_date: '2026-05-22', status: 'materials', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局B'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: 'c824c3bf-2f87-4148-b362-5f2f41b8deae', name: '【テスト】リライト待ち案件', sponsor_name: 'ダミー通信', start_date: '2026-05-15', end_date: '2026-05-25', status: 'rewrites', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局C'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: 'eedf17b0-f0a1-47c3-a385-86425090f932', name: '【テスト】同録待ち案件', sponsor_name: 'ダミー不動産', start_date: '2026-05-18', end_date: '2026-05-28', status: 'recordings', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局D'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: 'TEST-STATION-A', name: '【系列局A用】テスト案件', sponsor_name: 'テスト飲料', start_date: '2026-05-10', end_date: '2026-05-20', status: 'materials', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局A'], ba: '電通', oa_date: '2026-05-15', time_range: '19:00〜19:30', duration: 30, material_deadline: '2026-05-12' } },
  { id: 'REQ-SPOT-101', name: 'プレミアムモルツ 2026夏企画', sponsor_name: 'サントリー', start_date: '2026-05-10', end_date: '2026-05-20', status: 'requesting', type: 'spot', metadata: { ba: '電通', budget: '5000万', area: ['関東'], deadline: '2026-05-20' } },
  { id: 'REQ-TIME-201', name: '企業ブランド 2026', sponsor_name: 'トヨタ自動車', start_date: '2026-04-01', end_date: '2026-06-30', status: 'planning', type: 'time', metadata: { ba: '博報堂', budget: '1.2億', area: ['全国'], deadline: '2026-05-15' } },
  { id: 'REV-SPOT-301', name: '新製品発表キャンペーン 2026', sponsor_name: 'ソニー', start_date: '2026-06-01', end_date: '2026-06-15', status: 'revision', type: 'spot', metadata: { ba: 'ADK', budget: '3000万', area: ['全国'], deadline: '2026-05-10', selectedStations: ['札幌テレビ', 'ミヤギテレビ'] } },
  { id: 'SALE-101', name: '【特選】ゴールデン枠 3月限定パッケージ', sponsor_name: '日本テレビ', start_date: '2026-03-01', end_date: '2026-03-31', status: 'planning', type: 'time', metadata: { type: 'sales_slot', station: '日本テレビ', slot: '金曜 19:00 - 20:00', period: '2026年3月', price: '¥2,500,000', label: '残り僅か', color: '#fff5f5', iconColor: '#fa5252', saleType: 'time' } }
];

const VALID_TRANSITIONS = {
  'draft': ['requesting', 'cancelled'],
  'requesting': ['slots', 'cancelled'],
  'slots': ['materials', 'cancelled'],
  'materials': ['rewrites', 'cancelled'],
  'rewrites': ['recordings', 'cancelled'],
  'recordings': ['completed', 'cancelled'],
  'completed': ['cancelled'],
  'cancelled': ['requesting'] // 再開
};

export const api = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  logout: async () => { await supabase.auth.signOut(); },
  getCurrentSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (e) { return null; }
  },
  getProfileByEmail: async (email) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', email);
      if (!error && data && data.length > 0) return data[0];
    } catch (e) {}
    return { email, role: 'admin', name: email.split('@')[0], company_name: 'デモ組織' };
  },
  getProfilesByRole: async (role) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', role);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[API] getProfilesByRole failed:', e);
      return [];
    }
  },
  getProjects: async () => {
    try {
      let allProjects = [...FALLBACK_PROJECTS];

      // 1. 標準テーブルからの取得
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        allProjects = [...data, ...allProjects];
      } else {
        console.warn('[API] Failed to fetch from projects table, trying pudding_projects...', error);
        const { data: oldData } = await supabase.from('pudding_projects').select('*');
        if (oldData) allProjects = [...oldData, ...allProjects];
      }

      // 2. Profile Hack からの取得 (全ユーザーのプロファイルを走査して最新のプロジェクト情報を収集)
      try {
        const { data: profiles } = await supabase.from('profiles').select('full_name');
        if (profiles && profiles.length > 0) {
          const projectMap = new Map();
          
          // 既存の標準テーブルからのデータをマップに入れる
          allProjects.forEach(p => projectMap.set(p.id, p));
          
          profiles.forEach(prof => {
            if (prof.full_name?.includes('[PROJECTS_JSON]')) {
              try {
                const match = prof.full_name.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
                if (match) {
                  const extraProjects = JSON.parse(match[1]);
                  extraProjects.forEach(p => {
                    const existing = projectMap.get(p.id);
                    // タイムスタンプを比較して新しい方を採用
                    const pTime = p.updated_at || p.created_at || '0';
                    const eTime = existing?.updated_at || existing?.created_at || '0';
                    
                    if (!existing || new Date(pTime) > new Date(eTime)) {
                      projectMap.set(p.id, p);
                    }
                  });
                }
              } catch (e) {}
            }
          });
          
          allProjects = Array.from(projectMap.values());
        }
      } catch (e) {
        console.warn('[API] Profile Hack get projects failed:', e);
      }

      return allProjects;
    } catch (e) {
      console.error('[API] getProjects failed completely:', e);
      return FALLBACK_PROJECTS;
    }
  },
  getProjectById: async (id) => {
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) return data;
      
      const all = await api.getProjects();
      return all.find(x => x.id === id) || null;
    } catch (e) {
      return FALLBACK_PROJECTS.find(x => x.id === id) || null;
    }
  },
  updateProject: async (id, updateData) => {
    try {
      // 1. 既存のプロジェクトを取得してmetadataをマージする準備
      const projects = await api.getProjects();
      const existingProject = projects.find(p => p.id === id);
      
      let finalUpdateData = { ...updateData };
      if (updateData.metadata && existingProject?.metadata) {
        finalUpdateData.metadata = {
          ...existingProject.metadata,
          ...updateData.metadata
        };
      }

      // 2. 標準テーブルの更新試行
      const { error } = await supabase.from('projects').update(finalUpdateData).eq('id', id);
      if (!error) return { success: true };

      // 3. Profile Hack への保存（フォールバック）
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        let projectsList = [];
        let currentFullName = profile?.full_name || '';
        
        if (currentFullName.includes('[PROJECTS_JSON]')) {
          const match = currentFullName.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
          if (match) projectsList = JSON.parse(match[1]);
        }

        const idx = projectsList.findIndex(p => p.id === id);
        if (idx >= 0) {
          projectsList[idx] = { ...projectsList[idx], ...finalUpdateData, updated_at: new Date().toISOString() };
        } else {
          // 他のユーザーのプロファイルにある案件を更新しようとしている場合、
          // 自分のプロファイルに「最新版」としてコピーを作成する
          projectsList.push({ 
            ...existingProject, 
            ...finalUpdateData, 
            updated_at: new Date().toISOString() 
          });
        }
        
        if (currentFullName.includes('[PROJECTS_JSON]')) {
          currentFullName = currentFullName.replace(/\[PROJECTS_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PROJECTS_JSON]${JSON.stringify(projectsList)}`);
        } else {
          currentFullName += `[PROJECTS_JSON]${JSON.stringify(projectsList)}`;
        }
        
        await supabase.from('profiles').update({ full_name: currentFullName }).eq('id', user.id);
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error('[API] updateProject failed:', e);
      return { success: false };
    }
  },
  bulkUpdateProjects: async (ids, updateData) => {
    try {
      const results = await Promise.all(ids.map(id => api.updateProject(id, updateData)));
      return { success: results.every(r => r.success) };
    } catch (e) {
      console.error('[API] bulkUpdateProjects failed:', e);
      return { success: false };
    }
  },
  createProject: async (projectData) => {
    // IDを付与
    const newId = projectData.id || `BACKUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullData = { 
      ...projectData, 
      id: newId,
      created_at: new Date().toISOString() 
    };

    try {
      // 1. 標準テーブルへの挿入試行
      const { error } = await supabase.from('projects').insert([fullData]);
      if (!error) return true;
      
      console.warn('[API] createProject failed on primary table, trying pudding_projects...', error);
      const { error: error2 } = await supabase.from('pudding_projects').insert([fullData]);
      if (!error2) return true;
    } catch (e) {
      console.warn('[API] DB createProject failed, attempting Profile Hack...', e);
    }

    // 2. Profile Hack (最終手段)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for fallback storage');

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      let projects = [];
      let currentFullName = profile?.full_name || '';
      
      if (currentFullName.includes('[PROJECTS_JSON]')) {
        const match = currentFullName.match(/\[PROJECTS_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
        if (match) projects = JSON.parse(match[1]);
      }

      projects.push(fullData);

      if (currentFullName.includes('[PROJECTS_JSON]')) {
        currentFullName = currentFullName.replace(/\[PROJECTS_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PROJECTS_JSON]${JSON.stringify(projects)}`);
      } else {
        currentFullName += `[PROJECTS_JSON]${JSON.stringify(projects)}`;
      }

      const { error: profError } = await supabase.from('profiles').update({ full_name: currentFullName }).eq('id', user.id);
      if (profError) throw profError;
      
      console.log('[API] Project saved via Profile Hack');
      return true;
    } catch (e) {
      console.error('[API] All createProject methods failed:', e);
      throw e;
    }
  },
  getProjectStations: async (projectId) => {
    try {
      // まずプロジェクトのメタデータから選択された局名を取得
      const { data: project, error } = await supabase.from('projects').select('metadata').eq('id', projectId).single();
      if (error || !project) return [];
      
      const stationNames = project.metadata?.selectedStations || [];
      const { data: broadcasters } = await supabase.from('profiles').select('*').eq('role', 'station');
      
      if (!broadcasters) return [];
      return broadcasters.filter(b => stationNames.includes(b.name));
    } catch (e) {
      console.error('[API] getProjectStations failed:', e);
      return [];
    }
  },
  getBroadcasters: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'station');
      if (error) throw error;
      if (data && data.length > 0) return data;
      // Fallback
      return [
        { id: 1, name: '札幌テレビ', area: '北海道', network: 'NNN' },
        { id: 2, name: '青森放送', area: '東北', network: 'NNN' },
        { id: 3, name: 'ミヤギテレビ', area: '東北', network: 'NNN' },
        { id: 4, name: '日本テレビ', area: '関東', network: 'NNN' },
        { id: 5, name: 'テレビ朝日', area: '関東', network: 'ANN' },
        { id: 6, name: 'TBS', area: '関東', network: 'JNN' },
        { id: 7, name: 'テレビ東京', area: '関東', network: 'TXN' },
        { id: 8, name: 'フジテレビ', area: '関東', network: 'FNN' }
      ];
    } catch (e) {
      console.error('[API] getBroadcasters failed:', e);
      return [];
    }
  },
  createProfile: async (profileData) => {
    try {
      const { data, error } = await supabase.from('profiles').insert([profileData]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[API] createProfile failed:', e);
      throw e;
    }
  },
  updateProfile: async (id, profileData) => {
    try {
      const { data, error } = await supabase.from('profiles').update(profileData).eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[API] updateProfile failed:', e);
      throw e;
    }
  },
  deleteProfile: async (id) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[API] deleteProfile failed:', e);
      throw e;
    }
  },
  getUserProfiles: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[API] getUserProfiles failed:', e);
      return [];
    }
  },
  getMaterials: async () => {
    try {
      const { data, error } = await supabase.from('materials').select('*');
      let dbMaterials = [];
      if (!error && data) {
        dbMaterials = await Promise.all(data.map(async (m) => {
          let signedUrl = m.file_path;
          try { if (m.file_path && !m.file_path.startsWith('http')) {
            const { data: sd } = await supabase.storage.from('materials').createSignedUrl(m.file_path, 3600);
            if (sd?.signedUrl) signedUrl = sd.signedUrl;
          }} catch (sErr) {}
          return {
            id: m.id, 
            sponsor: m.sponsor_name, 
            name: m.title, 
            code: m.material_code, 
            duration: String(m.duration), 
            videoUrl: signedUrl, 
            filePath: m.file_path, 
            examStatus: m.metadata?.examStatus || '未考査',
            requestedStations: m.metadata?.requestedStations || [], 
            reviewedStations: m.metadata?.reviewedStations || {}, 
            metadata: m.metadata || {}
          };
        }));
      }
      const localStr = localStorage.getItem('tabasco_local_materials') || '[]';
      const localMaterials = JSON.parse(localStr);
      return [...dbMaterials, ...localMaterials];
    } catch (e) {
      console.error('[API] getMaterials failed:', e);
      return [];
    }
  },
  createMaterial: async (data, file = null) => {
    try {
      let finalPath = data.videoUrl;
      if (file) finalPath = await api.uploadMaterialFile(file);
      const { error } = await supabase.from('materials').insert([{
        sponsor_name: data.sponsor,
        title: data.name,
        material_code: data.code,
        duration: parseInt(data.duration),
        file_path: finalPath,
        metadata: { examStatus: '未考査' }
      }]);
      if (error) {
        const localStr = localStorage.getItem('tabasco_local_materials') || '[]';
        const localMaterials = JSON.parse(localStr);
        const newLocal = {
          id: `LOCAL-${Date.now()}`,
          ...data,
          videoUrl: finalPath,
          examStatus: '未考査',
          requestedStations: [],
          reviewedStations: {},
          metadata: { isLocal: true, uploadDate: new Date().toISOString() }
        };
        localStorage.setItem('tabasco_local_materials', JSON.stringify([...localMaterials, newLocal]));
      }
      return true;
    } catch (e) { return false; }
  },
  updateMaterial: async (id, data) => {
    const { error } = await supabase.from('materials').update({
      sponsor_name: data.sponsor,
      title: data.name,
      material_code: data.code,
      duration: parseInt(data.duration),
      file_path: data.videoUrl
    }).eq('id', id);
    if (error) throw error;
    return true;
  },
  deleteMaterial: async (id) => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  uploadMaterialFile: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `mat_${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    // Ensure bucket exists
    try {
      await supabase.storage.createBucket('materials', { public: true });
    } catch (e) {}

    // Try materials bucket first
    const { data, error } = await supabase.storage.from('materials').upload(fileName, file);
    if (!error) return data.path;
    
    console.warn('[API] uploadMaterialFile: materials bucket failed:', error.message);
    
    // Fallback 1: attachments bucket
    try {
      await supabase.storage.createBucket('attachments', { public: true });
      const { data: attData, error: attError } = await supabase.storage.from('attachments').upload(fileName, file);
      if (!attError) return attData.path;
      console.warn('[API] uploadMaterialFile: attachments bucket failed:', attError.message);
    } catch (e) {}
    
    // Fallback 2: Remove local simulation and throw error
    console.error('[API] All storage methods failed for material:', file.name);
    throw new Error(`ストレージへのアップロードに失敗しました (${file.name})。バケット設定を確認してください。`);
  },
  getMaterialUrl: async (path) => {
    if (!path) return null;
    
    // Local simulation handling
    if (path.startsWith('local_')) {
      const blob = new Blob(['【ローカルシミュレーション】素材ファイルのダミーデータです。プロジェクトのストレージ設定を確認してください。'], { type: 'text/plain;charset=utf-8' });
      return URL.createObjectURL(blob);
    }

    try {
      // Try download first for better reliability with private buckets
      const { data, error } = await supabase.storage.from('materials').download(path);
      if (!error && data && data.size > 500) return URL.createObjectURL(data);
      
      // Fallback to attachments
      const { data: dataAtt, error: errorAtt } = await supabase.storage.from('attachments').download(path);
      if (!errorAtt && dataAtt && dataAtt.size > 500) return URL.createObjectURL(dataAtt);
      
      // If we are here, files are either missing or inaccessible.
      // Avoid returning publicUrl which leads to "corrupted" error page downloads
      console.error('[API] getMaterialUrl failed: File not found or inaccessible', path);
      return null;
    } catch (e) {
      return null;
    }
  },
  requestMaterialExam: async (id, stations, deadline) => {
    try {
      const { data: current, error: fetchErr } = await supabase.from('materials').select('metadata').eq('id', id).single();
      if (!fetchErr && current) {
        const nextMeta = { 
          ...(current.metadata || {}), 
          requestedStations: stations.map(s => s.split('_')[1]),
          deadline: deadline,
          examStatus: '考査中'
        };
        await supabase.from('materials').update({ metadata: nextMeta }).eq('id', id);
        return true;
      }
      return false;
    } catch (e) { return false; }
  },
  updateExaminationResponse: async (materialId, stationId, data) => {
    const { data: material } = await supabase.from('materials').select('metadata').eq('id', materialId).single();
    const metadata = material.metadata || {};
    const reviewedStations = metadata.reviewedStations || {};
    const current = reviewedStations[stationId] || {};
    reviewedStations[stationId] = {
      ...current,
      results: data.results || current.results,
      selectedStatuses: data.selectedStatuses || current.selectedStatuses,
      messages: [...(current.messages || []), ...(data.messages || [])],
      lastUpdated: new Date().toISOString()
    };
    await supabase.from('materials').update({ metadata: { ...metadata, reviewedStations } }).eq('id', materialId);
    return { success: true };
  },
  saveStationResponse: async (projectId, stationName, responseData) => {
    // 1. 標準テーブルへの保存試行
    try {
      if (projectId && !projectId.includes('BACKUP')) {
        const { error } = await supabase.from('station_responses').upsert({
          project_id: projectId,
          station_name: stationName,
          status: responseData.status || 'pending',
          response_data: responseData,
        }, { onConflict: 'project_id,station_name' });
  
        if (!error) {
          // 案件本体のメタデータもマージして同期を確実にする
          await api.updateProject(projectId, { 
            metadata: { 
              [`response_${stationName}`]: responseData,
              last_status_change: new Date().toISOString()
            } 
          });
          return true;
        }
        console.warn('[API] saveStationResponse failed, trying fallback...', error);
      }
    } catch (e) {
      console.warn('[API] saveStationResponse exception, trying fallback...', e);
    }

    // 2. Profile Hack (profilesテーブルにJSONとして保存)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        
        let responses = [];
        if (profile?.full_name?.includes('[RESPONSES_JSON]')) {
          try {
            const match = profile.full_name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
            if (match) {
              responses = JSON.parse(match[1]);
            }
          } catch (e) {}
        }

        const newResponse = { projectId, stationName, responseData, timestamp: new Date().toISOString() };
        
        const existingIdx = responses.findIndex(r => r.projectId === projectId && r.stationName === stationName);
        if (existingIdx >= 0) {
          responses[existingIdx] = newResponse;
        } else {
          responses.push(newResponse);
        }

        let currentFullName = profile?.full_name || '';
        if (currentFullName.includes('[RESPONSES_JSON]')) {
          currentFullName = currentFullName.replace(/\[RESPONSES_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[RESPONSES_JSON]${JSON.stringify(responses)}`);
        } else {
          currentFullName += `[RESPONSES_JSON]${JSON.stringify(responses)}`;
        }

        // 案件本体のメタデータも更新
        await api.updateProject(projectId, { 
          metadata: { 
            [`response_${stationName}`]: responseData,
            last_status_change: new Date().toISOString()
          } 
        });

        const { error: profError } = await supabase.from('profiles').update({ full_name: currentFullName }).eq('id', user.id);
        if (!profError) return true;
        console.warn('[API] Profile Hack update failed:', profError);
      }
    } catch (e) {
      console.error('[API] Fallback saveStationResponse failed:', e);
    }

    // 3. 最終手段: メタデータ更新のみ
    try {
      console.warn('[API] Using metadata-only fallback for saveStationResponse');
      const result = await api.updateProject(projectId, {
        metadata: {
          [`response_${stationName}`]: responseData,
          last_status_change: new Date().toISOString()
        }
      });
      return result?.success || true;
    } catch (e) {
      console.error('[API] All saveStationResponse methods failed:', e);
      return false;
    }
  },
  getStationResponses: async (projectId) => {
    try {
      // 1. 標準テーブルからの取得
      const { data, error } = await supabase.from('station_responses').select('*').eq('project_id', projectId);
      if (!error && data && data.length > 0) return data;
    } catch (e) {}

    // 2. Fallbackからの取得
    try {
      const { data: profiles } = await supabase.from('profiles').select('full_name');
      let allResponsesMap = new Map(); // Key: `${projectId}-${stationName}`, Value: response object

      profiles?.forEach(p => {
        if (p.full_name?.includes('[RESPONSES_JSON]')) {
          try {
            const match = p.full_name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
            if (match) {
              const items = JSON.parse(match[1]);
              items.forEach(item => {
                if (item.projectId === projectId) {
                  const key = `${item.projectId}-${item.stationName}`;
                  const existing = allResponsesMap.get(key);
                  // 最新のタイムスタンプを持つものを優先
                  if (!existing || (item.timestamp && (!existing.timestamp || new Date(item.timestamp) > new Date(existing.timestamp)))) {
                    allResponsesMap.set(key, {
                      project_id: item.projectId,
                      station_name: item.stationName,
                      status: item.responseData?.status || 'pending',
                      response_data: item.responseData,
                      timestamp: item.timestamp
                    });
                  }
                }
              });
            }
          } catch (e) {}
        }
      });
      
      const allResponses = Array.from(allResponsesMap.values());
      if (allResponses.length > 0) return allResponses;
    } catch (e) {}

      // 3. 案件自体のメタデータから抽出 (ピギーバック・フォールバック)
      try {
        const projects = await api.getProjects();
        const targetProj = projects.find(p => p.id === projectId);
        if (targetProj?.metadata) {
          const metaResponses = [];
          Object.keys(targetProj.metadata).forEach(key => {
            if (key.startsWith('response_')) {
              const sName = key.replace('response_', '');
              const resData = targetProj.metadata[key];
              metaResponses.push({
                project_id: projectId,
                station_name: sName,
                status: resData.status || 'pending',
                response_data: resData
              });
            }
          });
          if (metaResponses.length > 0) return metaResponses;
        }
      } catch (e) {}
 
    return [];
  },
  getChatMessages: async (projectId) => {
    const { data } = await supabase.from('project_chats').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    return data || [];
  },
  sendChatMessage: async (projectId, userId, name, text) => {
    await supabase.from('project_chats').insert([{ project_id: projectId, user_id: userId, user_name: name, message: text }]);
    return true;
  },
  subscribeToChat: (projectId, callback) => {
    return supabase.channel(`chat-${projectId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_chats', filter: `project_id=eq.${projectId}` }, payload => callback(payload.new)).subscribe();
  },
  getSlotDetails: async (projectId) => {
    const { data } = await supabase.from('slot_details').select('*').eq('project_id', projectId);
    return data || [];
  },
  getLatestRevision: async (projectId, station) => {
    const { data } = await supabase.from('project_revisions').select('*').eq('project_id', projectId).eq('station_name', station).order('created_at', { ascending: false }).limit(1);
    return data?.[0] || null;
  },
  createProjectRevision: async (projectId, station, annotations, memo, userId) => {
    await supabase.from('project_revisions').insert([{ project_id: projectId, station_network: station, annotations, memo, created_by: userId }]);
    return true;
  },
  uploadAttachment: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `att_${Date.now()}.${fileExt}`;
    
    try {
      await supabase.storage.createBucket('attachments', { public: true });
    } catch (e) {}

    const { data, error } = await supabase.storage.from('attachments').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(data.path);
    return { url: publicUrl, name: file.name };
  },
  uploadRecordingFile: async (projectId, stationName, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `rec_${projectId}_${stationName}_${Date.now()}.${fileExt}`;
    
    try {
      await supabase.storage.createBucket('recordings', { public: true });
    } catch (e) {}

    const { data, error } = await supabase.storage.from('recordings').upload(fileName, file);
    if (!error) return data.path;
    
    console.warn('[API] uploadRecordingFile: recordings bucket failed, trying attachments...', error.message);
    try {
      await supabase.storage.createBucket('attachments', { public: true });
    } catch (e) {}
    
    const { data: attData, error: attError } = await supabase.storage.from('attachments').upload(fileName, file);
    if (!attError) return attData.path;
    
    // Fallback: throw error
    console.error('[API] All storage methods failed for recording.');
    throw new Error('同録ファイルのアップロードに失敗しました。ストレージ設定を確認してください。');
  },
  getRecordingUrl: async (path) => {
    if (!path) return null;
    
    // Local simulation handling
    if (path.startsWith('local_')) {
      const fileName = path.replace('local_', '');
      const blob = new Blob([`【ローカルシミュレーション】同録ファイルのダミーデータです (${fileName})。ストレージ設定を確認してください。`], { type: 'text/plain;charset=utf-8' });
      return URL.createObjectURL(blob);
    }
    
    try {
      const { data, error } = await supabase.storage.from('recordings').download(path);
      if (!error && data && data.size > 500) return URL.createObjectURL(data);
      
      const { data: dataAtt, error: errorAtt } = await supabase.storage.from('attachments').download(path);
      if (!errorAtt && dataAtt && dataAtt.size > 500) return URL.createObjectURL(dataAtt);
      
      return null;
    } catch (e) {
      return null;
    }
  },
  uploadRewriteFile: async (projectId, stationName, file, type = 'original') => {
    const fileExt = file.name.split('.').pop();
    const prefix = type === 'original' ? 'rew' : 'rev';
    const fileName = `${prefix}_${projectId}_${stationName}_${Date.now()}.${fileExt}`;
    
    try {
      await supabase.storage.createBucket('rewrites', { public: true });
    } catch (e) {}

    const { data, error } = await supabase.storage.from('rewrites').upload(fileName, file);
    if (!error) return data.path;
    
    console.warn('[API] uploadRewriteFile: rewrites bucket failed, trying attachments...', error.message);
    try {
      await supabase.storage.createBucket('attachments', { public: true });
    } catch (e) {}

    const { data: attData, error: attError } = await supabase.storage.from('attachments').upload(fileName, file);
    if (!attError) return attData.path;
    
    // Fallback: throw error
    console.error('[API] All storage methods failed for rewrite.');
    throw new Error('リライト原稿のアップロードに失敗しました。ストレージ設定を確認してください。');
  },
  getRewriteUrl: async (path) => {
    if (!path) return null;

    // Local simulation handling
    if (path.startsWith('local_')) {
      const fileName = path.replace('local_', '');
      const blob = new Blob([`【ローカルシミュレーション】リライト原稿のダミーデータです (${fileName})。ストレージのバケット設定が未完了のため、実際のファイルは保存されていません。`], { type: 'text/plain;charset=utf-8' });
      return URL.createObjectURL(blob);
    }

    try {
      const { data, error } = await supabase.storage.from('rewrites').download(path);
      // data.size check to avoid returning small JSON error responses as blobs
      if (!error && data && data.size > 500) return URL.createObjectURL(data);
      
      const { data: dataAtt, error: errorAtt } = await supabase.storage.from('attachments').download(path);
      if (!errorAtt && dataAtt && dataAtt.size > 500) return URL.createObjectURL(dataAtt);
      
      console.error('[API] getRewriteUrl failed: File not found or inaccessible', path);
      return null;
    } catch (e) {
      return null;
    }
  },
  getBadgeCounts: async (role = 'station', orgName = '') => {
    try {
      // 1. 素材考査 (Material Exams)
      const { data: materials } = await supabase.from('materials').select('metadata');
      const examCount = materials?.filter(m => {
        const meta = m.metadata || {};
        const reqs = meta.requestedStations || [];
        const revs = meta.reviewedStations || {};
        // 放送局の場合: 自分に依頼が来ているが、まだ回答していないもの
        if (role === 'station') {
          return reqs.includes(orgName) && !revs[orgName];
        }
        // 代理店・局担の場合: 自分が依頼したが、まだ全局から回答が揃っていないもの
        return reqs.length > 0 && Object.keys(revs).length < reqs.length;
      }).length || 0;

      // 2. 見積回答依頼 (Estimate Requests)
      const responses = await api.getStationResponses(''); // 全局分を取得（本来はフィルタが必要だが現状のロジックに合わせる）
      const projects = await api.getProjects();
      
      let requestCount = 0;
      if (role === 'station') {
        // 放送局の場合: 自分へのペンディング中の回答
        requestCount = projects.filter(p => p.status === 'requesting' && (p.metadata?.selectedStations || []).includes(orgName)).length;
      } else {
        // 代理店・局担の場合: 自分が投げている見積依頼案件の数
        requestCount = projects.filter(p => p.status === 'requesting').length;
      }

      // 3. 発注・進行 (Orders)
      let orderCount = 0;
      if (role === 'station') {
        // 放送局の場合: 自分宛てに発注(ordered)が来た案件
        orderCount = projects.filter(p => (p.status === 'ordered' || p.metadata?.status === 'ordered') && (p.metadata?.selectedStations || []).includes(orgName)).length;
      } else {
        // 代理店・局担の場合: 進行中の案件
        orderCount = projects.filter(p => p.status === 'ordered').length;
      }

      // 4. 移動書 (Transfer Docs)
      const transferCount = materials?.filter(m => m.metadata?.needsTransferDoc && !m.metadata?.transferDocSent).length || 0;

      return { 
        requestCount, 
        orderCount, 
        transferCount, 
        examCount, 
        broadcastMaterialCount: materials?.length || 0 
      };
    } catch (e) { 
      console.error('[API] getBadgeCounts failed:', e);
      return { requestCount: 0, orderCount: 0, transferCount: 0, examCount: 0, broadcastMaterialCount: 0 }; 
    }
  },
  getRevenueTimeSeriesStats: async () => {
    try {
      const projects = await api.getProjects();
      const stats = {};

      projects.forEach(p => {
        if (!p.start_date) return;
        const month = p.start_date.substring(0, 7); // YYYY-MM
        let budget = 0;
        const rawBudget = p.metadata?.budget;
        if (typeof rawBudget === 'string') {
          if (rawBudget.includes('億')) {
            budget = parseFloat(rawBudget.replace('億', '')) * 100000000;
          } else if (rawBudget.includes('万')) {
            budget = parseFloat(rawBudget.replace('万', '')) * 10000;
          } else {
            budget = parseFloat(rawBudget.replace(/[^0-9.]/g, '')) || 0;
          }
        } else if (typeof rawBudget === 'number') {
          budget = rawBudget;
        }
        
        stats[month] = (stats[month] || 0) + budget;
      });

      return Object.keys(stats).sort().map(month => ({
        date: month,
        revenue: stats[month]
      }));
    } catch (e) {
      return [{ date: new Date().toISOString().substring(0, 7), revenue: 0 }];
    }
  },
  getDashboardStats: async () => {
    try {
      const projects = await api.getProjects();
      const { data: materials } = await supabase.from('materials').select('id');
      
      const totalCount = projects.length;
      const activeCount = projects.filter(p => p.status !== 'cancelled' && p.status !== 'completed').length;
      
      const occupancy = totalCount > 0 ? Math.round((activeCount / 10) * 100) : 0; 
      
      const today = new Date().toISOString().split('T')[0];
      const todayCount = projects.filter(p => p.created_at?.startsWith(today)).length;

      return {
        occupancy: `${Math.min(occupancy, 100)}%`,
        todayPlans: `${todayCount}件`,
        notifications: '3件'
      };
    } catch (e) {
      return { occupancy: '0%', todayPlans: '0件', notifications: '0件' };
    }
  },
  getMaBaMappings: async () => {
    try {
      const { data, error } = await supabase.from('ma_ba_mappings').select('*');
      if (error) throw error;
      
      const mappings = {};
      data.forEach(m => {
        if (!mappings[m.ma_org_name]) mappings[m.ma_org_name] = [];
        mappings[m.ma_org_name].push(m.ba_org_name);
      });
      return mappings;
    } catch (e) {
      console.error('[API] getMaBaMappings failed:', e);
      return {};
    }
  },
  updateMaBaMappings: async (maOrgName, baOrgNames) => {
    try {
      // 既存のマッピングを削除してから挿入
      await supabase.from('ma_ba_mappings').delete().eq('ma_org_name', maOrgName);
      
      if (baOrgNames.length > 0) {
        const inserts = baOrgNames.map(ba => ({
          ma_org_name: maOrgName,
          ba_org_name: ba
        }));
        const { error } = await supabase.from('ma_ba_mappings').insert(inserts);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      console.error('[API] updateMaBaMappings failed:', e);
      return false;
    }
  }
};
