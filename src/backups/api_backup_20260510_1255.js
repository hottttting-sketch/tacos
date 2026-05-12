import { supabase } from './supabaseClient';

const FALLBACK_PROJECTS = [
  { id: '8d0727d8-33d4-4147-ac05-65b12f3e930c', name: '【テスト】枠出し待ち案件', sponsor_name: 'ダミー飲料', start_date: '2026-05-10', end_date: '2026-05-20', status: 'slots', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局A'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: '9bca16fd-26f3-48a7-b8af-f75006b7049a', name: '【テスト】素材待ち案件', sponsor_name: 'ダミー自動車', start_date: '2026-05-12', end_date: '2026-05-22', status: 'materials', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局B'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: 'c824c3bf-2f87-4148-b362-5f2f41b8deae', name: '【テスト】リライト待ち案件', sponsor_name: 'ダミー通信', start_date: '2026-05-15', end_date: '2026-05-25', status: 'rewrites', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局C'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: 'eedf17b0-f0a1-47c3-a385-86425090f932', name: '【テスト】同録待ち案件', sponsor_name: 'ダミー不動産', start_date: '2026-05-18', end_date: '2026-05-28', status: 'recordings', type: 'spot', metadata: { type: 'pudding', selectedStations: ['系列局D'], ba: 'テスト代理店', material_start_date: '2026-05-01' } },
  { id: 'REQ-SPOT-101', name: 'プレミアムモルツ 2026夏企画', sponsor_name: 'サントリー', start_date: '2026-05-10', end_date: '2026-05-20', status: 'requesting', type: 'spot', metadata: { ba: '電通', budget: '5000万', area: ['関東'], deadline: '2026-05-20' } },
  { id: 'REQ-TIME-201', name: '企業ブランド 2026', sponsor_name: 'トヨタ自動車', start_date: '2026-04-01', end_date: '2026-06-30', status: 'planning', type: 'time', metadata: { ba: '博報堂', budget: '1.2億', area: ['全国'], deadline: '2026-05-15' } },
  { id: 'REV-SPOT-301', name: '新製品発表キャンペーン 2026', sponsor_name: 'ソニー', start_date: '2026-06-01', end_date: '2026-06-15', status: 'revision', type: 'spot', metadata: { ba: 'ADK', budget: '3000万', area: ['全国'], deadline: '2026-05-10', selectedStations: ['札幌テレビ', 'ミヤギテレビ'] } },
  { id: 'SALE-101', name: '【特選】ゴールデン枠 3月限定パッケージ', sponsor_name: '日本テレビ', start_date: '2026-03-01', end_date: '2026-03-31', status: 'planning', type: 'time', metadata: { type: 'sales_slot', station: '日本テレビ', slot: '金曜 19:00 - 20:00', period: '2026年3月', price: '¥2,500,000', label: '残り僅か', color: '#fff5f5', iconColor: '#fa5252', saleType: 'time' } }
];

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
      let allProjects = [];
      
      // 1. 標準テーブルからの取得試行
      const tables = ['projects', 'pudding_projects'];
      for (const t of tables) {
        try {
          const { data, error } = await supabase.from(t).select('*').order('created_at', { ascending: false });
          if (!error && data) {
            allProjects = [...allProjects, ...data];
          }
        } catch (e) {
          console.warn(`[API] Failed to fetch from table ${t}:`, e);
        }
      }

      // 3. データの統合（マージ）: 同一案件名・スポンサー名のものは最新を優先
      const mergedMap = new Map();
      
      // 標準テーブルのデータを先に登録
      allProjects.forEach(p => {
        const key = `${p.name}-${p.sponsor_name}`;
        mergedMap.set(key, p);
      });

      // バックアップ（プロファイル内）のデータで上書き（より新しい可能性があるため）
      const { data: profiles } = await supabase.from('profiles').select('*');
      profiles?.forEach(p => {
        const val = p.full_name || p.name;
        if (typeof val === 'string' && val.includes('[PUDDING_JSON]')) {
          try {
            const match = val.match(/\[PUDDING_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
            if (match) {
              const items = JSON.parse(match[1]);
              (Array.isArray(items) ? items : [items]).forEach((item, idx) => {
                const key = `${item.name}-${item.sponsor || item.sponsor_name}`;
                const existing = mergedMap.get(key);
                
                // ステータスがより進んでいる、または新しいデータを優先
                if (!existing || item.status === 'materials' || item.status === 'completed' || (item.timestamp > (existing.created_at || ''))) {
                  mergedMap.set(key, {
                    id: existing?.id || `BACKUP-${p.id}-${idx}`,
                    name: item.name || '名称未設定',
                    sponsor_name: item.sponsor || item.sponsor_name || 'パブリシティ依頼',
                    status: item.status || 'requesting',
                    start_date: item.start || item.start_date,
                    end_date: item.end || item.end_date,
                    metadata: { ...(item.metadata || {}), is_backup: true },
                    created_at: item.timestamp || p.created_at
                  });
                }
              });
            }
          } catch (e) {}
        }
      });

      return [...mergedMap.values(), ...FALLBACK_PROJECTS];
    } catch (e) {
      console.error('[API] getProjects failed:', e);
      return FALLBACK_PROJECTS;
    }
  },
  getProjectById: async (id) => {
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error || !data) {
        return FALLBACK_PROJECTS.find(x => x.id === id) || null;
      }
      return data;
    } catch (e) {
      return FALLBACK_PROJECTS.find(x => x.id === id) || null;
    }
  },
  updateProject: async (id, updateData) => {
    try {
      if (!id.includes('BACKUP')) {
        // 1. 標準テーブルへの更新試行 (複数のテーブル名を試す)
        const tables = ['projects', 'pudding_projects'];
        for (const tableName of tables) {
          const { data: current, error: fetchError } = await supabase.from(tableName).select('metadata').eq('id', id).single();
          
          if (!fetchError && current) {
            let finalMetadata = { ...(current.metadata || {}), ...(updateData.metadata || {}) };
            const { error: updateError } = await supabase.from(tableName).update({
              ...updateData,
              metadata: finalMetadata
            }).eq('id', id);

            if (!updateError) return { success: true };
          }
        }
      }
    } catch (e) {
      console.warn('[API] updateProject DB failed, trying fallback...', e);
    }

    // 2. 最終手段：Profile Hack
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        
        if (profile?.full_name?.includes('[PUDDING_JSON]')) {
          const match = profile.full_name.match(/\[PUDDING_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
          if (match) {
            let projectsList = JSON.parse(match[1]);
            if (!Array.isArray(projectsList)) projectsList = [projectsList];

            // IDから該当する案件を探して更新
            // BACKUP-IDの場合はインデックスなどから特定する必要がある
            let updated = false;
            projectsList = projectsList.map((p, idx) => {
              const backupId = `BACKUP-${user.id}-${idx}`;
              if (p.id === id || backupId === id) {
                updated = true;
                return { ...p, ...updateData, metadata: { ...(p.metadata || {}), ...(updateData.metadata || {}) } };
              }
              return p;
            });

            if (updated) {
              const newFullName = profile.full_name.replace(/\[PUDDING_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[PUDDING_JSON]${JSON.stringify(projectsList)}`);
              const { error: profError } = await supabase.from('profiles').update({ full_name: newFullName }).eq('id', user.id);
              if (!profError) return { success: true };
            }
          }
        }
      }
    } catch (e) {
      console.error('[API] updateProject fallback failed:', e);
    }

    return { success: false };
  },
  createProject: async (projectData) => {
    try {
      // 1. 標準テーブルへの保存試行
      const { data, error } = await supabase.from('projects').insert([projectData]);
      if (!error) return true;

      // 2. 代替テーブルへの保存試行
      const { error: error2 } = await supabase.from('pudding_projects').insert([projectData]);
      if (!error2) return true;

      // 3. 最終手段：Profile Hack (profilesテーブルにJSONとして保存)
      console.warn('[API] Tables missing, falling back to profile hack...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 既存のデータを取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        let projectsList = [];
        if (profile?.full_name?.includes('[PUDDING_JSON]')) {
          try {
            const existingStr = profile.full_name.substring(profile.full_name.indexOf('[PUDDING_JSON]') + 14);
            const existingData = JSON.parse(existingStr);
            projectsList = Array.isArray(existingData) ? existingData : [existingData];
          } catch (e) {}
        }

        const newProject = { 
          ...projectData, 
          timestamp: new Date().toISOString() 
        };
        projectsList.push(newProject);

        const { error: profError } = await supabase
          .from('profiles')
          .update({ 
            full_name: `[PUDDING_JSON]${JSON.stringify(projectsList)}` 
          })
          .eq('id', user.id);
        
        if (!profError) return true;
      }

      throw error || new Error('全ての保存手段が失敗しました。');
    } catch (e) {
      console.error('[API] createProject failed:', e);
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
            id: m.id, sponsor: m.sponsor_name, name: m.title, code: m.material_code, duration: String(m.duration), 
            videoUrl: signedUrl, filePath: m.file_path, examStatus: m.metadata?.examStatus || '未考査',
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
    const { data, error } = await supabase.storage.from('materials').upload(fileName, file);
    if (error) throw error;
    return data.path;
  },
  getMaterialUrl: async (path) => {
    if (!path) return null;
    const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(path);
    return publicUrl;
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
    try {
      if (projectId && !projectId.includes('BACKUP')) {
        const { error } = await supabase.from('station_responses').upsert({
          project_id: projectId,
          station_name: stationName,
          status: responseData.status || 'pending',
          response_data: responseData,
        }, { onConflict: 'project_id,station_name' });
  
        if (!error) {
          // 案件本体のメタデータも更新して同期を確実にする
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

    // 2. 最終手段：Profile Hack (profilesテーブルにJSONとして保存)
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

        // 既存の同一プロジェクト・同一放送局のデータを更新、なければ追加
        const newResponse = { projectId, stationName, responseData, timestamp: new Date().toISOString() };
        const idx = responses.findIndex(r => r.projectId === projectId && r.stationName === stationName);
        if (idx >= 0) responses[idx] = newResponse;
        else responses.push(newResponse);

        // 他のデータ（PROJECTS_JSONなど）を保持しつつ、RESPONSES_JSONを追加/更新
        let currentFullName = profile?.full_name || '';
        if (currentFullName.includes('[RESPONSES_JSON]')) {
          currentFullName = currentFullName.replace(/\[RESPONSES_JSON\].*?(?=\[[A-Z_]+_JSON\]|$)/, `[RESPONSES_JSON]${JSON.stringify(responses)}`);
        } else {
          currentFullName += `[RESPONSES_JSON]${JSON.stringify(responses)}`;
        }

        // 案件本体のメタデータも更新（バックアップ案件の場合）
        await api.updateProject(projectId, { 
          metadata: { 
            [`response_${stationName}`]: responseData,
            last_status_change: new Date().toISOString()
          } 
        });

        const { error: profError } = await supabase.from('profiles').update({ full_name: currentFullName }).eq('id', user.id);
        if (!profError) return true;
      }
    } catch (e) {
      console.error('[API] Fallback saveStationResponse failed:', e);
      throw e; // 全ての手段が失敗した場合はエラーを投げる
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
      let allResponses = [];
      profiles?.forEach(p => {
        if (p.full_name?.includes('[RESPONSES_JSON]')) {
          try {
            const match = p.full_name.match(/\[RESPONSES_JSON\](.*?)(?=\[[A-Z_]+_JSON\]|$)/);
            if (match) {
              const jsonStr = match[1];
                const items = JSON.parse(jsonStr);
                items.forEach(item => {
                  if (item.projectId === projectId) {
                    allResponses.push({
                      project_id: item.projectId,
                      station_name: item.stationName,
                      status: item.responseData?.status || 'pending',
                      response_data: item.responseData
                    });
                  }
                });
              }
            } catch (e) {}
        }
      });
      if (allResponses.length > 0) return allResponses;

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
    const { data, error } = await supabase.storage.from('attachments').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(data.path);
    return { url: publicUrl, name: file.name };
  },
  uploadRecordingFile: async (projectId, stationName, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `rec_${projectId}_${stationName}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('recordings').upload(fileName, file);
    
    if (error) {
      // Fallback to attachments if recordings bucket doesn't exist
      const { data: attData, error: attError } = await supabase.storage.from('attachments').upload(fileName, file);
      if (attError) throw attError;
      return attData.path;
    }
    return data.path;
  },
  getRecordingUrl: async (path) => {
    if (!path) return null;
    // Check which bucket it might be in
    const bucket = path.startsWith('rec_') ? 'recordings' : 'attachments';
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },
  uploadRewriteFile: async (projectId, stationName, file, type = 'original') => {
    const fileExt = file.name.split('.').pop();
    const prefix = type === 'original' ? 'rew' : 'rev';
    const fileName = `${prefix}_${projectId}_${stationName}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('rewrites').upload(fileName, file);
    
    if (error) {
      const { data: attData, error: attError } = await supabase.storage.from('attachments').upload(fileName, file);
      if (attError) throw attError;
      return attData.path;
    }
    return data.path;
  },
  getRewriteUrl: async (path) => {
    if (!path) return null;
    const bucket = (path.startsWith('rew_') || path.startsWith('rev_')) ? 'rewrites' : 'attachments';
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },
  getBadgeCounts: async (role = 'station', orgName = '') => {
    try {
      // 1. 素材考査 (Material Exams)
      const { data: materials } = await supabase.from('materials').select('requestedStations, reviewedStations, metadata');
      const examCount = materials?.filter(m => {
        const reqs = m.requestedStations || [];
        const revs = m.reviewedStations || {};
        // 放送局の場合: 自分に依頼が来ているが、まだ回答していないもの
        if (role === 'station') {
          return reqs.includes(orgName) && !revs[orgName];
        }
        // 代理店・局担の場合: 自分が依頼したが、まだ全局から回答が揃っていないもの
        return reqs.length > 0 && Object.keys(revs).length < reqs.length;
      }).length || 0;

      // 2. 見積回答依頼 (Estimate Requests)
      const { data: responses } = await supabase.from('station_responses').select('station_network, status');
      const { data: projects } = await supabase.from('projects').select('status, metadata');
      
      let requestCount = 0;
      if (role === 'station') {
        // 放送局の場合: 自分へのペンディング中の回答
        requestCount = responses?.filter(r => r.station_network === orgName && (r.status === 'pending' || !r.status)).length || 0;
      } else {
        // 代理店・局担の場合: 自分が投げている見積依頼案件の数
        requestCount = projects?.filter(p => p.status === 'requesting').length || 0;
      }

      // 3. 発注・進行 (Orders)
      let orderCount = 0;
      if (role === 'station') {
        // 放送局の場合: 自分宛てに発注(ordered)が来た案件
        orderCount = projects?.filter(p => (p.status === 'ordered' || p.metadata?.status === 'ordered') && (p.metadata?.selectedStations || []).includes(orgName)).length || 0;
      } else {
        // 代理店・局担の場合: 進行中の案件
        orderCount = projects?.filter(p => p.status === 'ordered').length || 0;
      }

      // 4. 移動書 (Transfer Docs)
      // 素材に紐づく移動書フラグなどがあればカウント (現状はダミー)
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
  getRevenueTimeSeriesStats: async () => [{ date: '2026-05', revenue: 8000000 }]
};
