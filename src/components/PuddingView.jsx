import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  Cloud, Sun, Zap, Search, Plus, Clock, History, Inbox, 
  Layout, Table, Calendar, Link, Settings, Monitor, 
  Building, DollarSign, FileText, List, Sliders, MessageSquare, Save, Download, Upload,
  Mic, Play, Volume2, Users, Shield, Trash2, Mail, Edit, Check, ChevronRight, Copy
} from 'lucide-react';
import ChatView from './ChatView';
import ManualView from './ManualView';
import { api } from '../utils/api';

const PageView = ({ title, desc, icon: Icon, color, action, children }) => (
  <div className="animate-fade">
    <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#8B4513', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: `${color}15`, color: color }}>
             <Icon size={24} />
          </div>
          {title}
        </h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>{desc}</p>
      </div>
      {action && <div>{action}</div>}
    </header>
    {children}
  </div>
);

const Modal = ({ title, onClose, children, width = '600px' }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(62,39,35,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
     <div style={{ backgroundColor: 'white', width, borderRadius: '32px', border: '1.5px solid #F1E4C9', overflow: 'hidden', boxShadow: '0 32px 80px rgba(62,39,35,0.2)' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1.5px solid #F1E4C9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc' }}>
           <h3 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#8B4513' }}>{title}</h3>
           <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8', fontWeight: '100' }}>×</button>
        </div>
        <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>{children}</div>
        <div style={{ padding: '24px 32px', borderTop: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'flex-end' }}>
           <button onClick={onClose} style={{ padding: '12px 48px', borderRadius: '16px', backgroundColor: '#3E2723', color: 'white', fontWeight: '950', border: 'none', cursor: 'pointer' }}>設定を完了する</button>
        </div>
     </div>
  </div>
);

const PuddingView = ({ activeTab = 'dashboard', role: rawRole, setActiveTab, fullProfile }) => {
  // App.jsxでは 'station' を使うが、PuddingView内では 'broadcaster' を使用するため正規化
  const role = rawRole === 'station' ? 'broadcaster' : rawRole;
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSpreadsheetLinked, setIsSpreadsheetLinked] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [narrationVoice, setNarrationVoice] = useState('female1');
  const [narrationSpeed, setNarrationSpeed] = useState(1.0);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [generatedNarrationFiles, setGeneratedNarrationFiles] = useState([]);
  const [puddingUsers, setPuddingUsers] = useState([
    { id: 1, name: '堀田 剛心', email: 'hotta@example.jp', org: '本社', role: 'admin', scopes: ['全権限', 'システム管理'], status: 'active' },
    { id: 2, name: '鈴木 恵介', email: 'suzuki@station.co.jp', org: '系列局', role: 'broadcaster', scopes: ['枠管理', '進行', '考査'], status: 'active' },
    { id: 3, name: '佐藤 健太', email: 'sato@agency.com', org: '電通', role: 'agency', scopes: ['見積作成', 'プランニング', '発注'], status: 'active' },
    { id: 4, name: '田中 幸子', email: 'tanaka@station.co.jp', org: '系列局', role: 'broadcaster', scopes: ['番組管理', '素材管理'], status: 'active' },
    { id: 5, name: '伊藤 裕樹', email: 'ito@broadcaster.jp', org: '大阪支社', role: 'broadcaster', scopes: ['営業推進', 'スポット'], status: 'pending' },
    { id: 6, name: '山本 太郎', email: 'yamamoto@hakuhodo.jp', org: '博報堂', role: 'agency', scopes: ['見積作成'], status: 'active' },
    { id: 7, name: '中村 華子', email: 'nakamura@adk.jp', org: 'ADK', role: 'agency', scopes: ['見積作成'], status: 'active' },
    { id: 8, name: '小林 誠', email: 'kobayashi@daiko.jp', org: '大広', role: 'agency', scopes: ['見積作成'], status: 'active' },
    { id: 9, name: '加藤 亮', email: 'kato@yomiko.jp', org: '読売広告社', role: 'agency', scopes: ['見積作成'], status: 'active' },
  ]);
  const [inboxEmails, setInboxEmails] = useState([
    { id: 1, from: 'dentsu_taro@dentsu.co.jp', subject: '【依頼】春のキャンペーンパブリシティ', date: '2026/04/28 10:15', body: 'サントリー様の春のキャンペーンについて、ストレートパブの枠取りをお願いしたくご連絡いたしました。\n\n期間：5/10〜5/20\n本数：5本\n希望枠：G帯優先', status: 'new' },
    { id: 2, from: 'hakuhodo_hanako@hakuhodo.co.jp', subject: '素材送付のご案内（トヨタ自動車様）', date: '2026/04/28 14:30', body: '5月放映予定のCM素材をギガファイル便にてお送りいたしました。ご確認をお願いいたします。', status: 'read' },
    { id: 3, from: 'adk_jiro@adk.jp', subject: '考査依頼：新健康飲料「元気MAX」', date: '2026/04/29 09:00', body: '新商品の考査をお願いいたします。添付の絵コンテをご確認ください。', status: 'new' },
  ]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [requestDateRange, setRequestDateRange] = useState({ start: '', end: '' });
  const [rewriteReviewer, setRewriteReviewer] = useState('');
  const [recordingReviewer, setRecordingReviewer] = useState('');
  const [selectedPubTypes, setSelectedPubTypes] = useState([]);
  const [startHour, setStartHour] = useState('05');
  const [endHour, setEndHour] = useState('24');
  const [selectedProject, setSelectedProject] = useState(null);
  const [userFilterRole, setUserFilterRole] = useState('sponsor');
  const [activeChatChannel, setActiveChatChannel] = useState(null);
  const [preRewriteFiles, setPreRewriteFiles] = useState([]);
  const [postRewriteFiles, setPostRewriteFiles] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [sponsorName, setSponsorName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [materialDeadline, setMaterialDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maBaMappings, setMaBaMappings] = useState({});
  const [rewriteDeadline, setRewriteDeadline] = useState('');
 // { maOrg: [baOrg1, baOrg2] }
  const [selectedMaId, setSelectedMaId] = useState(null);
  const [selectedBa, setSelectedBa] = useState('');
  const [selectedBoardProject, setSelectedBoardProject] = useState(null);
  const [selectedProjectResponses, setSelectedProjectResponses] = useState([]);
  const [selectedBulkProjectIds, setSelectedBulkProjectIds] = useState([]);
  const [broadcasterResponses, setBroadcasterResponses] = useState({}); // { projectId: [responses] }
  const [bulkChangeName, setBulkChangeName] = useState('');
  const [bulkChangeDateRange, setBulkChangeDateRange] = useState({ start: '', end: '' });
  const [bulkChangeMaterialDeadline, setBulkChangeMaterialDeadline] = useState('');
  const [copySearchQuery, setCopySearchQuery] = useState('');
  const [selectedCopySource, setSelectedCopySource] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({ occupancy: '0%', todayPlans: '0件', notifications: '0件' });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      const parsedData = (data || []).map(p => {
        let meta = p.metadata;
        if (typeof meta === 'string') {
          try { meta = JSON.parse(meta); } catch(e) { meta = {}; }
        }
        return { ...p, metadata: meta || {} };
      });
      setProjects(parsedData);
      
      // 放送局UIの場合、station responsesも同時に取得
      if (role === 'broadcaster') {
        await fetchBroadcasterResponses(parsedData);
      }
      
      // ダッシュボード統計も更新
      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // コンポーネントマウント時に状態を明示的にリセット
    setActiveModal(null);
    setSelectedRequest(null);
    setSelectedBoardProject(null);
    fetchProjects();
  }, []);

  const handleUpdateRewriteDeadline = async (item, date) => {
    if (!item) return;
    const projectId = item.projectId || item.id;
    const stationName = item.station;
    
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      
      await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        rewrite_deadline: date
      });
      
      fetchProjects();
    } catch (e) {
      console.error('Failed to update rewrite deadline', e);
    }
  };

  useEffect(() => {
    const fetchResponses = async () => {
      if (selectedBoardProject) {
        const res = await api.getStationResponses(selectedBoardProject.id);
        setSelectedProjectResponses(res || []);
      }
    };
    fetchResponses();
  }, [selectedBoardProject]);

  useEffect(() => {
    // 案件複製関連のタブ以外に切り替わった場合、選択状態をリセット
    if (activeTab !== 'copy-project' && activeTab !== 'select-stations') {
      setSelectedCopySource(null);
    }
  }, [activeTab]);

  const [viewMonth, setViewMonth] = useState(new Date(2026, 4, 1)); 
  const [formProgramName, setFormProgramName] = useState('');
  const [formOADate, setFormOADate] = useState('');
  const [formTimeRange, setFormTimeRange] = useState('');
  const [formOADuration, setFormOADuration] = useState('30');
  const [formMaterialDeadlineLimit, setFormMaterialDeadlineLimit] = useState('');
  const [formRecordingDate, setFormRecordingDate] = useState('');
  const [formMaterialDest, setFormMaterialDest] = useState('');
  const [formRevisionDest, setFormRevisionDest] = useState('');
  const [formPubType, setFormPubType] = useState('');

  const SectionTitle = ({ title }) => (
     <h4 style={{ fontSize: '12px', fontWeight: '950', color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <div style={{ width: '4px', height: '16px', backgroundColor: '#34D399', borderRadius: '2px' }} />
        {title}
     </h4>
  );

  const FormItem = ({ label, value }) => (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>{label}</label>
        <div style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723' }}>{value || '---'}</div>
     </div>
  );

  const handleBulkChange = async () => {
    if (selectedBulkProjectIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const updateData = {};
      if (bulkChangeName) updateData.name = bulkChangeName;
      if (bulkChangeDateRange.start) updateData.start_date = bulkChangeDateRange.start;
      if (bulkChangeDateRange.end) updateData.end_date = bulkChangeDateRange.end;
      if (bulkChangeMaterialDeadline) {
        updateData.metadata = { material_start_date: bulkChangeMaterialDeadline };
      }

      const res = await api.bulkUpdateProjects(selectedBulkProjectIds, updateData);
      if (res.success) {
        alert(`${selectedBulkProjectIds.length}件の案件を一括更新しました。`);
        setSelectedBulkProjectIds([]);
        setActiveModal(null);
        fetchProjects();
        console.log('Bulk update success');
      } else {
        alert('一部または全ての更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('更新に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedBulkProjectIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await api.bulkUpdateProjects(selectedBulkProjectIds, { status: 'cancelled' });
      if (res.success) {
        alert(`${selectedBulkProjectIds.length}件の案件を一括取り消ししました。`);
        setSelectedBulkProjectIds([]);
        setActiveModal(null);
        fetchProjects();
      } else {
        alert('一部または全ての取り消しに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('取り消しに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyProject = (sourceProject) => {
    setSelectedCopySource(sourceProject);
    // フォームに値をセット
    setSponsorName(sourceProject.sponsor_name || '');
    setProjectName(`【複製】${sourceProject.name}`);
    setRequestDateRange({ 
      start: sourceProject.start_date || '', 
      end: sourceProject.end_date || '' 
    });
    setSelectedBa(sourceProject.metadata?.ba || '');
    setSelectedPubTypes(sourceProject.metadata?.pub_types || []);
    setMaterialDeadline(sourceProject.metadata?.material_start_date || '');
    setRewriteReviewer(sourceProject.metadata?.rewrite_reviewer || '');
    setRecordingReviewer(sourceProject.metadata?.recording_reviewer || '');
    setSelectedStations(sourceProject.selectedStations || sourceProject.metadata?.selectedStations || []);
    setStartHour(sourceProject.metadata?.start_hour || '05');
    setEndHour(sourceProject.metadata?.end_hour || '24');
  };

  const handleEditSave = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const session = await api.getCurrentSession();
      const user = session?.user;
      const profiles = await api.getProfilesByRole('broadcaster');
      const fullProfile = Array.isArray(profiles) ? profiles.find(u => u.id === user?.id) : null;
      const stationName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A';
      
      const responseData = {
        programName: formProgramName,
        oaDate: formOADate,
        pubType: formPubType,
        timeRange: formTimeRange,
        duration: formOADuration,
        materialDeadline: formMaterialDeadlineLimit,
        recordingDate: formRecordingDate,
        materialDest: formMaterialDest,
        revisionDest: formRevisionDest,
        status: 'registered',
        last_updated: new Date().toISOString()
      };

      // プロジェクトのメタデータも更新（一覧表示・フィルタリング用）
      const updatedMetadata = {
        ...(selectedRequest.metadata || {}),
        oa_date: formOADate,
        time_range: formTimeRange,
        duration: formOADuration,
        material_deadline: formMaterialDeadlineLimit,
        recording_date: formRecordingDate, // 収録日を標準化
        program_name: formProgramName
      };

      await api.updateProject(selectedRequest.id, { metadata: updatedMetadata });
      const success = await api.saveStationResponse(selectedRequest.id, stationName, responseData);
      
      if (success) {
        alert('枠情報を更新しました。');
        setActiveModal(null);
        await fetchProjects();
      }
    } catch (err) {
      console.error('[Pudding] Failed to save edit:', err);
      alert('保存に失敗しました。詳細: ' + (err.message || '不明なエラー'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStationSave = async (isFinal = false) => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      const session = await api.getCurrentSession();
      const user = session?.user;
      const profiles = await api.getProfilesByRole('broadcaster');
      const fullProfile = Array.isArray(profiles) ? profiles.find(u => u.id === user?.id) : null;
      
      let stationName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A'; 
      
      const requestedStations = selectedRequest.metadata?.selectedStations || [];
      if (requestedStations.length > 0 && !requestedStations.includes(stationName)) {
        stationName = requestedStations[0];
      }

      const responseData = {
        programName: formProgramName,
        oaDate: formOADate,
        pubType: formPubType,
        timeRange: formTimeRange,
        duration: formOADuration,
        materialDeadline: formMaterialDeadlineLimit,
        recordingDate: formRecordingDate,
        materialDest: formMaterialDest,
        revisionDest: formRevisionDest,
        status: isFinal ? 'registered' : 'draft',
        last_updated: new Date().toISOString()
      };

      // プロジェクトのメタデータにもサマリーを保存（一覧表示用）
      if (isFinal) {
        await api.updateProject(selectedRequest.id, {
          metadata: {
            ...(selectedRequest.metadata || {}),
            oa_date: formOADate,
            time_range: formTimeRange,
            duration: formOADuration,
            material_deadline: formMaterialDeadlineLimit,
            recording_date: formRecordingDate,
            program_name: formProgramName
          }
        });
      }

      // 枠出し（isFinal）時に、同案件内で既にアップロード済みの素材があれば自動反映する
      if (isFinal) {
        const allRes = await api.getStationResponses(selectedRequest.id);
        const source = allRes.find(r => r.response_data?.has_material);
        if (source) {
          responseData.has_material = true;
          responseData.material_path = source.response_data.material_path;
          responseData.material_paths = source.response_data.material_paths;
          responseData.material_uploaded_at = source.response_data.material_uploaded_at;
          // 送信済みフラグ(material_sent)はコピーしない（代理店が確認して送信するため）
        }
      }

      const success = await api.saveStationResponse(selectedRequest.id, stationName, responseData);
      
      if (success) {
        if (isFinal) {
          await api.updateProject(selectedRequest.id, { status: 'materials' });
          alert('枠情報を送信しました。');
          setSelectedRequest(null);
          fetchProjects();
        } else {
          alert('一時保存しました。');
        }
      }
    } catch (err) {
      console.error('Failed to save response:', err);
      alert('保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgencyMaterialUpload = (projectId, stationName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) {
        document.body.removeChild(input);
        return;
      }
      
      alert(`ファイルを選択しました（${files.length}件）。アップロードを開始します...`);
      setIsSubmitting(true);
      try {
        const paths = await Promise.all(files.map(file => api.uploadMaterialFile(file)));
        const resp = await api.getStationResponses(projectId);
        const current = resp.find(r => r.station_name === stationName) || {};
        
        const existingPaths = current.response_data?.material_paths || [];
        if (current.response_data?.material_path && !existingPaths.includes(current.response_data.material_path)) {
          existingPaths.push(current.response_data.material_path);
        }
        
        const newPaths = Array.from(new Set([...existingPaths, ...paths]));

        console.log('Saving station response:', { projectId, stationName, has_material: true });
        const success = await api.saveStationResponse(projectId, stationName, {
          ...(current.response_data || {}),
          status: current.status || 'registered', 
          has_material: true,
          material_path: newPaths[0],
          material_paths: newPaths,
          material_uploaded_at: new Date().toISOString()
        });
        
        if (success) {
          // 他の局（素材待ち状態かつ未アップロード）にも自動反映
          const allRes = await api.getStationResponses(projectId);
          const others = allRes.filter(r => r.station_name !== stationName && r.status === 'registered' && !r.response_data?.has_material);
          
          if (others.length > 0) {
            console.log(`Syncing material to ${others.length} other stations...`);
            for (const other of others) {
              await api.saveStationResponse(projectId, other.station_name, {
                ...(other.response_data || {}),
                has_material: true,
                material_path: newPaths[0],
                material_paths: newPaths,
                material_uploaded_at: new Date().toISOString()
              });
            }
          }

          alert(`${stationName} ${others.length > 0 ? `および他${others.length}局` : ''} の素材（${files.length}件）をアップロードしました。送信ボタンで確定してください。`);
          fetchProjects();
          if (selectedBoardProject) {
            const res = await api.getStationResponses(selectedBoardProject.id);
            setSelectedProjectResponses(res || []);
          }
        }
      } catch (err) {
        console.error('Failed to upload material:', err);
        alert('素材のアップロードに失敗しました: ' + (err.message || err));
      } finally {
        setIsSubmitting(false);
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    });

    input.click();
  };

  const handleMaterialUpload = async (projectId, stationName) => {
    if (isSubmitting) {
      alert('現在別の処理を実行中です。しばらく待ってから再度お試しください。');
      return; 
    }
    setIsSubmitting(true);
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      
      const success = await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        status: 'registered',
        material_sent: true,
        last_updated: new Date().toISOString()
      });
      
      if (success) {
        alert(`${stationName} への素材送信が完了しました。放送局側の「素材DL」が活性化されます。`);
        fetchProjects();
        if (selectedBoardProject) {
          const res = await api.getStationResponses(selectedBoardProject.id);
          setSelectedProjectResponses(res || []);
        }
      } else {
        alert(`${stationName} への素材送信に失敗しました。もう一度お試しください。`);
      }
    } catch (e) {
      console.error('[送信] Failed:', e);
      alert('素材の送信に失敗しました: ' + (e.message || e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaterialDownload = async (projectId, stationName) => {
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      const paths = current.response_data?.material_paths || (current.response_data?.material_path ? [current.response_data.material_path] : []);
      
      if (paths.length === 0) {
        alert('素材ファイルが見つかりません。');
        return;
      }

      for (const path of paths) {
        const url = await api.getMaterialUrl(path);
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          const fileName = path.split('/').pop();
          a.download = fileName; 
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          await new Promise(r => setTimeout(r, 500));
        } else {
          alert('素材ファイルの取得に失敗しました。ファイルが存在しないか、ストレージの設定に問題がある可能性があります。');
          return;
        }
      }

      await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        status: 'material_ok',
        material_downloaded_at: new Date().toISOString()
      });
      await api.updateProject(projectId, { status: 'rewrites' });
      fetchProjects();
    } catch (err) {
      console.error('Failed to download material:', err);
      alert('素材のダウンロードに失敗しました。');
    }
  };

  const handleRewriteUpload = (projectId, stationName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc,.docx,.pdf,.txt';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }

      setIsSubmitting(true);
      try {
        const path = await api.uploadRewriteFile(projectId, stationName, file, 'original');
        const resp = await api.getStationResponses(projectId);
        const current = resp.find(r => r.station_name === stationName) || {};
        
        const success = await api.saveStationResponse(projectId, stationName, {
          ...(current.response_data || {}),
          status: current.status, 
          has_rewrite: true,
          rewrite_path: path,
          rewrite_filename: file.name,
          rewrite_uploaded_at: new Date().toISOString()
        });
        
        if (success) {
          alert(`${stationName} のリライト原稿をアップロードしました。`);
          fetchProjects();
          if (selectedBoardProject) {
            const res = await api.getStationResponses(selectedBoardProject.id);
            setSelectedProjectResponses(res || []);
          }
        }
      } catch (err) {
        console.error('Failed to upload rewrite:', err);
        alert('リライト原稿のアップロードに失敗しました。');
      } finally {
        setIsSubmitting(false);
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    });
    input.click();
  };

  const handleClearRewriteDeadline = async (projectId, stationName) => {
    if (!window.confirm('修正〆切設定を取り消しますか？')) return;
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      const success = await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        rewrite_deadline: null
      });
      if (success) {
        fetchProjects();
        if (selectedBoardProject) {
          const res = await api.getStationResponses(selectedBoardProject.id);
          setSelectedProjectResponses(res || []);
        }
      }
    } catch (e) {
      console.error(e);
      alert('削除に失敗しました。');
    }
  };

  const handleDeleteRewriteFile = async (projectId, stationName) => {
    if (!window.confirm('アップロード済みのリライト原稿を削除しますか？')) return;
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      const success = await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        has_rewrite: false,
        rewrite_path: null,
        rewrite_filename: null,
        rewrite_uploaded_at: null
      });
      if (success) {
        fetchProjects();
        if (selectedBoardProject) {
          const res = await api.getStationResponses(selectedBoardProject.id);
          setSelectedProjectResponses(res || []);
        }
      }
    } catch (e) {
      console.error(e);
      alert('削除に失敗しました。');
    }
  };

  const handleRewriteDownload = async (projectId, stationName) => {
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      const path = current.response_data?.rewrite_path;
      const originalName = current.response_data?.rewrite_filename;
      if (!path) { alert('リライト原稿が見つかりません。'); return; }
      const url = await api.getRewriteUrl(path);
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName || path.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // ブラウザがダウンロードを開始する時間を確保してからURLを開放
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        alert('リライト原稿のダウンロードに失敗しました。ファイルが削除されたか、ストレージにアクセスできない可能性があります。');
      }
    } catch (err) { alert('ダウンロードに失敗しました。'); }
  };

  const handleRevisedDownload = async (projectId, stationName) => {
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      const path = current.response_data?.revised_path;
      const originalName = current.response_data?.revised_filename;
      if (!path) { alert('修正稿が見つかりません。'); return; }
      const url = await api.getRewriteUrl(path, 'revised');
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName || path.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // ブラウザがダウンロードを開始する時間を確保してからURLを開放
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        alert('修正稿のダウンロードに失敗しました。ストレージ設定を確認してください。');
      }
    } catch (err) { alert('ダウンロードに失敗しました。'); }
  };

  const handleRevisedUpload = (projectId, stationName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc,.docx,.pdf,.txt';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }

      setIsSubmitting(true);
      try {
        const path = await api.uploadRewriteFile(projectId, stationName, file, 'revised');
        const resp = await api.getStationResponses(projectId);
        const current = resp.find(r => r.station_name === stationName) || {};
        
        const success = await api.saveStationResponse(projectId, stationName, {
          ...(current.response_data || {}),
          status: current.status, 
          has_revised_material: true,
          revised_path: path,
          revised_filename: file.name,
          revised_material_uploaded_at: new Date().toISOString()
        });
        
        if (success) {
          alert(`${stationName} への修正稿アップロードが完了しました。`);
          fetchProjects();
          if (selectedBoardProject) {
            const res = await api.getStationResponses(selectedBoardProject.id);
            setSelectedProjectResponses(res || []);
          }
        }
      } catch (err) {
        console.error('Failed to upload revised:', err);
        alert('修正稿のアップロードに失敗しました。');
      } finally {
        setIsSubmitting(false);
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    });
    input.click();
  };

  const handleRewriteSend = async (projectId, stationName) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      
      const success = await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        status: current.status,
        rewrite_sent: true,
        rewrite_sent_at: new Date().toISOString()
      });
      
      if (success) {
        alert(`${stationName} のリライト原稿を送信しました。代理店側でダウンロード可能になります。`);
        fetchProjects();
        if (selectedBoardProject) {
          const res = await api.getStationResponses(selectedBoardProject.id);
          setSelectedProjectResponses(res || []);
        }
      }
    } catch (err) {
      console.error('Failed to send rewrite:', err);
      alert('送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevisedSend = async (projectId, stationName) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      
      const success = await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        status: 'rewrites', // 同録待ちに移行せず、リライト待ちに留める
        revised_sent: true,
        revised_sent_at: new Date().toISOString()
      });
      
      if (success) {
        alert('修正稿を送信しました。放送局の確認をお待ちください。');
        fetchProjects();
        if (selectedBoardProject) {
          const res = await api.getStationResponses(selectedBoardProject.id);
          setSelectedProjectResponses(res || []);
        }
      }
    } catch (err) {
      console.error('Failed to send revised script:', err);
      alert('送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoRevision = async (projectId, stationName) => {
    setIsSubmitting(true);
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      
      const success = await api.saveStationResponse(projectId, stationName, {
        ...(current.response_data || {}),
        status: 'rewrite_ok',
        no_revision: true,
        last_updated: new Date().toISOString()
      });
      
      if (success) {
        alert('修正なしとして処理しました。同録待ちに移動します。');
        fetchProjects();
        if (selectedBoardProject) {
          const res = await api.getStationResponses(selectedBoardProject.id);
          setSelectedProjectResponses(res || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordingUpload = (projectId, stationName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,audio/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }

      setIsSubmitting(true);
      try {
        const path = await api.uploadRecordingFile(projectId, stationName, file);
        const resp = await api.getStationResponses(projectId);
        const current = resp.find(r => r.station_name === stationName) || {};
        
        const success = await api.saveStationResponse(projectId, stationName, {
          ...(current.response_data || {}),
          status: current.status, // ステータスを維持
          has_recording: true,
          recording_path: path,
          recording_uploaded_at: new Date().toISOString()
        });
        
        if (success) {
          alert(`${stationName} の同録をアップロードしました。`);
          fetchProjects();
          if (selectedBoardProject) {
            const res = await api.getStationResponses(selectedBoardProject.id);
            setSelectedProjectResponses(res || []);
          }
        }
      } catch (err) {
        console.error('Failed to upload recording:', err);
        alert('同録のアップロードに失敗しました。');
      } finally {
        setIsSubmitting(false);
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    });
    input.click();
  };

  const handleRecordingDownload = async (projectId, stationName) => {
    try {
      const resp = await api.getStationResponses(projectId);
      const current = resp.find(r => r.station_name === stationName) || {};
      const path = current.response_data?.recording_path;
      
      if (!path) {
        alert('同録ファイルが見つかりません。');
        return;
      }

      const url = await api.getRecordingUrl(path);
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        const fileName = path.split('/').pop();
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // ブラウザがダウンロードを開始する時間を確保してからURLを開放
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error('Failed to download recording:', err);
      alert('同録のダウンロードに失敗しました。');
    }
  };


  const handleCreateProject = async () => {
    if (!projectName || !sponsorName) {
      alert('案件名とスポンサー名は必須です。');
      return;
    }
    
    if (selectedStations.length === 0) {
      if (!confirm('依頼局が選択されていません。このまま作成しますか？（後から追加も可能です）')) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const session = await api.getCurrentSession();
      const userId = session?.user?.id;

      const projectData = {
        name: projectName,
        sponsor_name: sponsorName,
        start_date: requestDateRange.start || null,
        end_date: requestDateRange.end || null,
        status: 'requesting',
        type: 'spot',
        metadata: {
          type: 'pudding',
          ba: selectedBa,
          pub_types: selectedPubTypes,
          start_hour: startHour,
          end_hour: endHour,
          material_start_date: materialDeadline,
          hearingItems: {
            checkStraightPub: selectedPubTypes.some(t => t.includes('ストレート')),
            checkInterviewPub: selectedPubTypes.some(t => t.includes('取材')),
            checkTalkPub: selectedPubTypes.some(t => t.includes('対談')),
            checkPrePub: selectedPubTypes.some(t => t.includes('プレゼン')),
            checkProgramIntegration: false
          },
          rewrite_reviewer: rewriteReviewer,
          recording_reviewer: recordingReviewer,
          selectedStations: selectedStations,
          created_by: userId
        }
      };

      console.log('[Pudding] Creating project:', projectData);
      const success = await api.createProject(projectData);

      if (success) {
        alert('案件を作成しました。' + (selectedStations.length > 0 ? `\n依頼局: ${selectedStations.join(', ')}` : ''));
        
        // フォームのリセット
        setProjectName('');
        setSponsorName('');
        setSelectedBa('');
        setSelectedPubTypes([]);
        setMaterialDeadline('');
        setRequestDateRange({ start: '', end: '' });
        setSelectedStations([]);
        setRewriteReviewer('');
        setRecordingReviewer('');
        
        // 画面遷移
        setActiveTab('dashboard');
        
        // データ更新
        setTimeout(() => {
          fetchProjects();
        }, 300);
      } else {
        alert('案件の作成に失敗しました。');
      }
    } catch (err) {
      console.error('[Pudding] handleCreateProject error:', err);
      alert('案件の作成中にエラーが発生しました。\n詳細: ' + (err.message || '不明なエラー'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMaBaMappings = async () => {
    const mappings = await api.getMaBaMappings();
    setMaBaMappings(mappings);
  };

  // 放送局UIの場合、全案件のstation responsesを取得してキャッシュする
  const fetchBroadcasterResponses = async (projectList) => {
    if (role !== 'broadcaster' || !projectList || projectList.length === 0) return;
    const responseMap = {};
    for (const p of projectList) {
      try {
        const res = await api.getStationResponses(p.id);
        if (res && res.length > 0) {
          responseMap[p.id] = res;
        }
      } catch (e) {
        console.warn('[Pudding] Failed to fetch responses for', p.id, e);
      }
    }
    setBroadcasterResponses(responseMap);
  };

  useEffect(() => {
    fetchProjects();
    fetchMaBaMappings();

    const channel = supabase
      .channel('pudding_projects_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects' 
      }, () => {
        fetchProjects();
      })
      .subscribe();

    // station_responsesテーブルの変更も監視（放送局UIの素材DL活性化の即時反映のため）
    const responseChannel = supabase
      .channel('pudding_station_responses_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'station_responses'
      }, () => {
        // responsesが更新されたらprojectsと一緒に再取得
        fetchProjects();
      })
      .subscribe();

    // profilesテーブルの変更も監視（Profile Hackによる同期のため）
    const profilesChannel = supabase
      .channel('pudding_profiles_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(responseChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  useEffect(() => {
    const loadStationResponse = async () => {
      if (selectedRequest && role === 'broadcaster') {
        try {
          const responses = await api.getStationResponses(selectedRequest.id);
          const stationName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A';
          const myResponse = responses.find(r => r.station_name === stationName);
          if (myResponse && myResponse.response_data) {
            const m = myResponse.response_data;
            setFormProgramName(m.programName || '');
            setFormOADate(m.oaDate || '');
            setFormPubType(m.pubType || '');
            setFormTimeRange(m.timeRange || '');
            setFormOADuration(m.duration || '30');
            setFormMaterialDeadlineLimit(m.materialDeadline || '');
            setFormRecordingDate(m.recordingDate || m.recording_date || '');
            setFormMaterialDest(m.materialDest || '');
            setFormRevisionDest(m.revisionDest || '');
          } else {
            setFormProgramName('');
            setFormOADate('');
            setFormPubType('');
            setFormTimeRange('');
            setFormOADuration('30');
            setFormMaterialDeadlineLimit('');
            setFormRecordingDate('');
            setFormMaterialDest('');
            setFormRevisionDest('');
          }
        } catch (e) {
          console.error('Failed to load station response:', e);
        }
      }
    };
    loadStationResponse();
  }, [selectedRequest, role, fullProfile]);

  const saveMaBaMappings = async (newMappings) => {
    setMaBaMappings(newMappings);
    if (selectedMaId) {
      await api.updateMaBaMappings(selectedMaId, newMappings[selectedMaId] || []);
    }
  };
  
  const renderDashboard = () => {
    const cards = [
      { label: '現在のスポット稼働率', value: dashboardStats.occupancy, icon: Zap, color: '#ffd93d' },
      { label: '本日公開のプラン', value: dashboardStats.todayPlans, icon: Sun, color: '#fb923c' },
      { label: '空き枠通知', value: dashboardStats.notifications, icon: Cloud, color: '#38bdf8' }
    ];

    return (
      <div className="animate-fade">
        <header style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#8B4513' }}>📊 ダッシュボード</h2>
          <p style={{ color: '#64748b' }}>スポット広告の現状状況と提案プランを確認できます。</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <div style={{ color: card.color, marginBottom: '1rem' }}>
                  <Icon size={28} />
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>{card.label}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#8B4513' }}>{card.value}</div>
              </div>
            );
          })}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(139,69,19,0.05)', border: '1.5px solid #F1E4C9' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1.5rem', color: '#3E2723', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={22} color="#FFD93D" /> パブリシティ案件一覧
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>データを読み込み中...</div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>案件がありません。</div>
            ) : projects.map((item, i) => {
              const statusColors = {
                draft: { label: '下書き', color: '#94a3b8' },
                requesting: { label: '依頼中', color: '#f59e0b' },
                slots: { label: '枠登録中', color: '#3b82f6' },
                materials: { label: '素材待ち', color: '#8b5cf6' },
                rewrites: { label: 'リライト中', color: '#ec4899' },
                recordings: { label: '同録待ち', color: '#10b981' },
                completed: { label: '完了', color: '#22c55e' },
                cancelled: { label: '取消', color: '#ef4444' }
              };
              const statusInfo = statusColors[item.status] || { label: item.status, color: '#64748b' };
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem 2rem', backgroundColor: 'white', borderRadius: '20px', border: '1.5px solid #F1E4C9', transition: 'all 0.2s', gap: '2rem' }}>
                  <div style={{ flex: '1.2' }}>
                    <div style={{ fontSize: '13px', color: '#8B4513', fontWeight: '800' }}>{item.sponsor_name}</div>
                  </div>
                  <div style={{ flex: '1.8' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#3E2723' }}>{item.name}</div>
                  </div>
                  <div style={{ flex: '1.5' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{item.start_date || '---'} 〜 {item.end_date || '---'}</div>
                  </div>
                  <div style={{ flex: '1', }}>
                    <span style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: `${statusInfo.color}15`, color: statusInfo.color, fontSize: '12px', fontWeight: '950' }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (role === 'broadcaster') {
                        setSelectedRequest(item);
                        setActiveTab('slot-registration');
                      } else {
                        setSelectedBoardProject(item);
                        setActiveTab('board');
                      }
                    }}
                    style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1.5px solid #F1E4C9', fontWeight: '900', cursor: 'pointer', color: '#3E2723' }}
                  >
                    詳細
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();

      case 'new-request':
        return (
          <PageView title="新規パブリシティ依頼" desc="詳細を入力して、各放送局へ一括依頼を送信します。" icon={Plus} color="#FFD93D">
             <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '32px', border: '1.5px solid #F1E4C9' }}>
                <div style={{ display: 'grid', gap: '28px' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>スポンサー</label>
                         <input type="text" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="例：サントリー株式会社" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                      </div>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>BA (担当者)</label>
                         <select 
                           value={selectedBa}
                           onChange={(e) => setSelectedBa(e.target.value)}
                           style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white' }}
                         >
                            <option value="">BAを選択してください</option>
                            {(maBaMappings['本社'] || []).map(baOrg => <option key={baOrg} value={baOrg}>{baOrg}</option>)}
                         </select>
                      </div>
                   </div>
                   <div className="input-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>案件名</label>
                      <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="例：春の新商品キャンペーン" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '800' }} />
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                       <div className="input-group">
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>依頼期間</label>
                          <div onClick={() => setActiveModal('period')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <Calendar size={18} color="#8B4513" />
                             <span style={{ color: requestDateRange.start ? '#3E2723' : '#94a3b8' }}>
                                {requestDateRange.start && requestDateRange.end ? `${requestDateRange.start} 〜 ${requestDateRange.end}` : '期間を選択してください'}
                             </span>
                          </div>
                       </div>
                       <div className="input-group">
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>依頼ゾーン</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div onClick={() => setActiveModal('zone')} style={{ flex: 1, padding: '14px 10px', borderRadius: '16px', border: '2px solid #F1E4C9', textAlign: 'center', fontWeight: '950', cursor: 'pointer', backgroundColor: 'white' }}>{startHour}:00</div>
                             <span>〜</span>
                             <div onClick={() => setActiveModal('zone')} style={{ flex: 1, padding: '14px 10px', borderRadius: '16px', border: '2px solid #F1E4C9', textAlign: 'center', fontWeight: '950', cursor: 'pointer', backgroundColor: 'white' }}>{endHour}:00</div>
                          </div>
                       </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                       <div className="input-group">
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '12px' }}>パブ種別</label>
                          <div onClick={() => setActiveModal('pubType')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '56px' }}>
                             {selectedPubTypes.map(type => <span key={type} style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: '#FFFBE6', color: '#8B4513', fontSize: '12px', fontWeight: '900', border: '1px solid #FFD93D' }}>{type}</span>)}
                             {selectedPubTypes.length === 0 && <span style={{ color: '#94a3b8' }}>選択してください</span>}
                          </div>
                       </div>
                       <div className="input-group">
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '12px' }}>素材搬入開始日</label>
                          <input type="date" value={materialDeadline} onChange={(e) => setMaterialDeadline(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                       </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                       <div className="input-group">
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>リライト共有者</label>
                          <div onClick={() => setActiveModal('reviewer-rewrite')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <Users size={18} /> <span>{rewriteReviewer || '担当者を選択'}</span>
                          </div>
                       </div>
                       <div className="input-group">
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>同録共有者</label>
                          <div onClick={() => setActiveModal('reviewer-recording')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <Users size={18} /> <span>{recordingReviewer || '担当者を選択'}</span>
                          </div>
                       </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '24px 0 0 0', borderTop: '1px solid #F1E4C9' }}>
                       <button style={{ padding: '14px 32px', borderRadius: '16px', fontWeight: '950', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>下書き保存</button>
                       <button style={{ padding: '14px 32px', borderRadius: '16px', fontWeight: '950', backgroundColor: '#FFFBE6', color: '#8B4513', border: '2px solid #FFD93D' }} onClick={() => setActiveTab('select-stations')}><Monitor size={18} /> 依頼局選択</button>
                       <button style={{ padding: '14px 56px', borderRadius: '16px', fontWeight: '950', backgroundColor: isSubmitting ? '#94a3b8' : '#3E2723', color: 'white', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer' }} onClick={handleCreateProject} disabled={isSubmitting}>{isSubmitting ? '送信中...' : '送信する'}</button>
                    </div>
                 </div>
              </div>
          </PageView>
        );

      case 'users':
        return (
          <PageView title="ユーザー・アカウント管理" desc="システム利用権限と業務範囲を設定します。" icon={Users} color="#1e293b">
             <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', gap: '8px', padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '16px' }}>
                      {['sponsor', 'agency', 'broadcaster'].map(t => (
                         <button key={t} onClick={() => setUserFilterRole(t)} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: userFilterRole === t ? 'white' : 'transparent', fontWeight: '950', cursor: 'pointer' }}>{t === 'sponsor' ? 'スポンサー' : t === 'agency' ? '代理店' : '放送局'}</button>
                      ))}
                   </div>
                   <button style={{ padding: '12px 24px', borderRadius: '16px', backgroundColor: '#3E2723', color: 'white', fontWeight: '950', border: 'none' }}><Plus size={20} /> 新規ユーザー招待</button>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1.5px solid #F1E4C9', overflow: 'hidden' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#fcfcfc', borderBottom: '1.5px solid #F1E4C9' }}>
                         <tr>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950' }}>ユーザー情報</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950' }}>所属</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950' }}>状態</th>
                            <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950' }}>操作</th>
                         </tr>
                      </thead>
                      <tbody>
                         {puddingUsers.filter(u => u.role === userFilterRole).map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #F1E4C9' }}>
                               <td style={{ padding: '20px 32px' }}>
                                  <div style={{ fontWeight: '900' }}>{u.name}</div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                                </td>
                               <td style={{ padding: '20px 32px', fontWeight: '800' }}>{u.org}</td>
                               <td style={{ padding: '20px 32px' }}>{u.status}</td>
                               <td style={{ padding: '20px 32px', textAlign: 'center' }}><Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer' }} /></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </PageView>
        );

      case 'board':
        if (role === 'agency' && !selectedBoardProject) {
           return (
              <PageView title="案件ボード" desc="進行を確認したい案件を選択してください。" icon={Layout} color="#f59e0b">
                 <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 2rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '12px', fontWeight: '950', gap: '2rem' }}>
                       <div style={{ flex: '1.2', minWidth: '150px' }}>スポンサー</div>
                       <div style={{ flex: '1.8', minWidth: '200px' }}>案件名</div>
                       <div style={{ flex: '1.5', minWidth: '180px' }}>依頼期間</div>
                       <div style={{ flex: '1', minWidth: '120px' }}>素材搬入開始日</div>
                       <div style={{ textAlign: 'right', minWidth: '80px' }}>依頼局数</div>
                       <div style={{ width: '24px' }}></div>
                    </div>
                    {projects.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>案件がありません。</div>
                    ) : projects.filter(p => p.status !== 'cancelled').map((p, i) => (
                       <div key={p.id} onClick={() => setSelectedBoardProject(p)} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem 2rem', backgroundColor: 'white', borderRadius: '20px', border: '1.5px solid #F1E4C9', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', gap: '2rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#FFD93D'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#F1E4C9'; }}>
                          <div style={{ flex: '1.2', minWidth: '150px' }}><div style={{ fontSize: '13px', color: '#8B4513', fontWeight: '800' }}>{p.sponsor_name}</div></div>
                          <div style={{ flex: '1.8', minWidth: '200px' }}><div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#3E2723' }}>{p.name}</div></div>
                          <div style={{ flex: '1.5', minWidth: '180px' }}><div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.start_date || '---'} 〜 {p.end_date || '---'}</div></div>
                          <div style={{ flex: '1', minWidth: '120px' }}><div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.material_start_date || p.metadata?.material_deadline || '---'}</div></div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}><div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#FFD93D' }}>{p.metadata?.selectedStations?.length || 0}局</div></div>
                          <ChevronRight style={{ color: '#F1E4C9' }} />
                       </div>
                    ))}
                 </div>
              </PageView>
           );
        }
        let boardItems = [];
        if (role === 'agency' && selectedBoardProject) {
           const stations = selectedBoardProject.metadata?.selectedStations || [];
           boardItems = stations.map(s => {
             const resp = selectedProjectResponses.find(r => r.station_name === s);
              if (resp) console.log('Found response for', s, ':', resp.response_data);
             let currentStatus = 'slots'; 
             if (resp) {
                if (resp.status === 'registered' || resp.status === 'pending') currentStatus = 'materials';
                else if (resp.status === 'material_ok' || resp.status === 'rewrites') currentStatus = 'rewrites';
                else if (resp.status === 'rewrite_ok' || resp.status === 'recordings') currentStatus = 'recordings';
             }
               return { 
                 id: `${selectedBoardProject.id}-${s}`, 
                 projectId: selectedBoardProject.id,
                 name: selectedBoardProject.name, 
                 sponsor: selectedBoardProject.sponsor_name, 
                 station: s, 
                 status: currentStatus,
                 has_material: resp?.response_data?.has_material || false,
                 material_sent: resp?.response_data?.material_sent || false,
                 material_paths: resp?.response_data?.material_paths || [],
                 has_revised_material: resp?.response_data?.has_revised_material || false,
                 revised_sent: resp?.response_data?.revised_sent || false,
                revised_filename: resp?.response_data?.revised_filename || null,
                 has_recording: resp?.response_data?.has_recording || false,
                 has_rewrite: resp?.response_data?.has_rewrite || false,
                 rewrite_sent: resp?.response_data?.rewrite_sent || false,
                 rewrite_filename: resp?.response_data?.rewrite_filename || null,
                 rewrite_deadline: resp?.response_data?.rewrite_deadline || null
               };
           });
        } else {
           boardItems = projects.map(p => {
              const requestedStations = p.metadata?.selectedStations || [];
              let stationName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A';
              
              if (requestedStations.length > 0 && !requestedStations.includes(stationName)) {
                 stationName = requestedStations[0];
              }

              // station_responsesテーブルからデータを取得（metadata依存をやめて直接参照）
              const projectResponses = broadcasterResponses[p.id] || [];
              const stationResp = projectResponses.find(r => r.station_name === stationName);
              const response = stationResp?.response_data || p.metadata?.[`response_${stationName}`] || {};
              const respStatus = stationResp?.status || response.status;
              return { 
                 ...p, 
                 sponsor: p.sponsor_name || p.metadata?.sponsor || '未設定', 
                 station: stationName, 
                 status: (respStatus === 'registered' || respStatus === 'pending') ? 'materials' :
                         (respStatus === 'material_ok' || respStatus === 'rewrites') ? 'rewrites' :
                         respStatus === 'rewrite_ok' ? 'recordings' :
                         p.status === 'requesting' ? 'slots' : p.status,
                 has_material: response.has_material || false,
                 material_sent: response.material_sent || false,
                 material_paths: response.material_paths || [],
                 has_revised_material: response.has_revised_material || false,
                 revised_sent: response.revised_sent || false,
                  revised_filename: response.revised_filename || null,
                 has_recording: response.has_recording || false,
                 has_rewrite: response.has_rewrite || false,
                 rewrite_sent: response.rewrite_sent || false,
                  rewrite_filename: response.rewrite_filename || null,
                  rewrite_deadline: response.rewrite_deadline || null
              };
           });
        }
        const boardColumns = [
           { id: 'slots', title: '枠出し待ち', color: '#64748b' },
           { id: 'materials', title: '素材待ち', color: '#3b82f6' },
           { id: 'rewrites', title: 'リライト待ち', color: '#f59e0b' },
           { id: 'recordings', title: '同録待ち', color: '#10b981' },
        ].map(col => ({ ...col, items: boardItems.filter(item => item.status === col.id) }));
        return (
          <PageView title={selectedBoardProject ? `推進管理: ${selectedBoardProject.name}` : "案件ボード"} desc={selectedBoardProject ? "放送局ごとの推進管理を調整します。" : "案件の調整推進を整理します。"} icon={Layout} color="#f59e0b" action={selectedBoardProject && (<button onClick={() => setSelectedBoardProject(null)} style={{ padding: '8px 20px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: 'white', fontWeight: '900', cursor: 'pointer' }}>案件一覧に戻る</button>)}>
             <div style={{ display: 'flex', gap: '20px', minHeight: '600px', overflowX: 'auto', paddingBottom: '20px' }}>
                {boardColumns.map(col => (
                   <div key={col.id} style={{ flex: '1', minWidth: '280px', backgroundColor: '#fcfcfd', borderRadius: '24px', padding: '16px', border: '1.5px solid #F1E4C9' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '950', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3E2723' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                        {col.title}
                        <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{col.items.length}</span>
                        {col.id === 'recordings' && col.items.length > 0 && (
                          <button 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               if (role === 'agency') {
                                 alert('選択されたすべての同録データをダウンロードします。');
                                 col.items.forEach(item => {
                                   if (item.has_recording) handleRecordingDownload(item.projectId || item.id, item.station);
                                 });
                               } else {
                                 alert('同録データの一括アップロードを開始します。');
                               }
                             }} 
                             style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '8px', backgroundColor: 'white', color: '#10b981', border: '1.5px solid #10b981', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                             {role === 'agency' ? <Download size={12} /> : <Upload size={12} />}
                             {role === 'agency' ? '一括DL' : '一括UP'}
                          </button>
                        )}
                      </h3>
                      {col.items.map(item => (
                         <div key={item.id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1E4C9', marginBottom: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                               <div style={{ fontSize: '10px', color: '#FFD93D', fontWeight: '950', backgroundColor: '#3E2723', padding: '2px 8px', borderRadius: '4px' }}>{item.station}</div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                     onClick={(e) => { e.stopPropagation(); setActiveChatChannel(item.name); setActiveTab('chat'); }} 
                                     style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', fontSize: '10px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                     <MessageSquare size={12} /> チャット
                                  </button>
                               </div>
                            </div>
                            <div style={{ fontWeight: '950', fontSize: '14px', color: '#3E2723', marginBottom: '4px' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#8B4513', fontWeight: '700', marginBottom: '12px' }}>{item.sponsor}</div>
                            <div style={{ paddingTop: '12px', borderTop: '1px dashed #F1E4C9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                               {col.id === 'slots' && (
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedRequest(item); setActiveTab('slot-registration'); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                     <Clock size={14} /> 枠詳細登録
                                  </button>
                                )}
                               {col.id === 'materials' && (
                                  role === 'agency' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {item.has_material && (
                                           <div style={{ fontSize: '11px', color: '#059669', fontWeight: '950', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}>
                                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  <Check size={14} /> 素材アップロード済 ({(item.material_paths || []).length}件)
                                               </div>
                                               <div style={{ fontSize: '9px', color: '#065f46', borderTop: '1px solid #d1fae5', paddingTop: '4px', marginTop: '2px', opacity: 0.8 }}>
                                                  {(item.material_paths || []).map((path, idx) => {
                                                     const fileName = path.split('/').pop();
                                                     const displayName = fileName.includes('_') ? fileName.split('_').slice(2).join('_').replace(/-\d+(\.[^.]+)$/, '$1') : fileName;
                                                     return <div key={idx} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>・{displayName}</div>
                                                  })}
                                               </div>
                                           </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={(e) => { e.stopPropagation(); handleAgencyMaterialUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                          <Upload size={12} /> 素材UP
                                       </button>
                                       <button disabled={!item.has_material || item.material_sent} onClick={(e) => { e.stopPropagation(); handleMaterialUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: (item.has_material && !item.material_sent) ? '#3E2723' : '#94a3b8', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: (item.has_material && !item.material_sent) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                          <Check size={12} /> {item.material_sent ? '送信済' : '送信'}
                                       </button>
                                     </div>
                                     </div>
                                   ) : (
                                    <button 
                                       disabled={!item.material_sent}
                                       onClick={(e) => { e.stopPropagation(); handleMaterialDownload(item.projectId || item.id, item.station); }} 
                                       style={{ 
                                          width: '100%', padding: '10px', borderRadius: '12px', 
                                          backgroundColor: item.material_sent ? '#3b82f6' : '#94a3b8', 
                                          color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                          cursor: item.material_sent ? 'pointer' : 'not-allowed', 
                                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                          opacity: item.material_sent ? 1 : 0.6
                                       }}
                                    >
                                       <Download size={14} /> 素材一括ダウンロード
                                    </button>
                                  )
                                )}
                               {col.id === 'rewrites' && (
                                  role === 'agency' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                       <button 
                                          disabled={!item.has_rewrite}
                                          onClick={(e) => { e.stopPropagation(); handleRewriteDownload(item.projectId || item.id, item.station); }} 
                                          style={{ 
                                            width: '100%', padding: '10px', borderRadius: '12px', 
                                            backgroundColor: item.has_rewrite ? '#3b82f6' : '#f8fafc', 
                                            color: item.has_rewrite ? 'white' : '#cbd5e1', 
                                            border: item.has_rewrite ? 'none' : '1.5px solid #e2e8f0',
                                            fontSize: '11px', fontWeight: '950', 
                                            cursor: item.has_rewrite ? 'pointer' : 'not-allowed', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                          }}
                                        >
                                           <Download size={14} /> リライトDL
                                        </button>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                           <button onClick={(e) => { e.stopPropagation(); handleRevisedUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                              <Upload size={12} /> 修正稿UP
                                           </button>
                                           <button 
                                              disabled={!item.has_revised_material || item.revised_sent}
                                              onClick={(e) => { e.stopPropagation(); handleRevisedSend(item.projectId || item.id, item.station); }} 
                                              style={{ 
                                                flex: '1', padding: '10px', borderRadius: '12px', 
                                                backgroundColor: (item.has_revised_material && !item.revised_sent) ? '#3E2723' : '#94a3b8', 
                                                color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                                cursor: (item.has_revised_material && !item.revised_sent) ? 'pointer' : 'not-allowed', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' 
                                              }}
                                            >
                                               <Check size={12} /> {item.revised_sent ? '送信済' : '送信'}
                                           </button>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleNoRevision(item.projectId || item.id, item.station); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: 'white', color: '#64748b', border: '1.5px solid #e2e8f0', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                           <Check size={14} /> 修正なし
                                        </button>
                                    </div>
                                  ) : (
                                    <>
                                       <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                 <Clock size={12} /> 修正〆切: {item.rewrite_deadline || '未設定'}
                                              </div>
                                              {item.rewrite_deadline && (
                                                 <button 
                                                   onClick={(e) => { e.stopPropagation(); handleClearRewriteDeadline(item.projectId || item.id, item.station); }}
                                                   style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                   title="〆切設定を解除"
                                                 >
                                                   <Trash2 size={12} />
                                                 </button>
                                              )}
                                           </div>
                                       </div>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          <button onClick={(e) => { e.stopPropagation(); handleRewriteUpload(item.projectId || item.id, item.station); }} style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                             <Edit size={14} /> リライト原稿UP
                                          </button>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); handleRevisedDownload(item.projectId || item.id, item.station); }} 
                                              style={{ 
                                                width: '100%', padding: '10px', borderRadius: '12px', 
                                                backgroundColor: '#3b82f6', 
                                                color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                                cursor: 'pointer', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                              }}
                                           >
                                              <Download size={14} /> 修正稿DL
                                           </button>
                                           {item.revised_sent && (
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); if(confirm('修正稿を確認しました。同録待ちへ移動しますか？')) { api.saveStationResponse(item.projectId || item.id, item.station, { status: 'rewrite_ok' }); fetchProjects(); } }}
                                                style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                              >
                                                <Check size={14} /> 同録待ちへ移動
                                              </button>
                                           )}
                                          {item.has_rewrite && item.rewrite_filename && (
                                             <div style={{ fontSize: '9px', color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 8px', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid #d1fae5' }}>
                                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                       ・{item.rewrite_filename}
                                                    </div>
                                                    <button 
                                                       onClick={(e) => { e.stopPropagation(); handleDeleteRewriteFile(item.projectId || item.id, item.station); }}
                                                       style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', marginLeft: '4px', display: 'flex', alignItems: 'center' }}
                                                       title="ファイルを削除"
                                                    >
                                                       <Trash2 size={10} />
                                                    </button>
                                                 </div>
                                             </div>
                                          )}
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                             <button onClick={(e) => { e.stopPropagation(); setSelectedRequest(item); setActiveModal('rewrite-deadline'); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: 'white', color: '#ef4444', border: '1.5px solid #ef4444', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                <Clock size={12} /> 修正〆切
                                             </button>
                                             <button 
                                                disabled={!item.has_rewrite || !item.rewrite_deadline || item.rewrite_sent}
                                                onClick={(e) => { e.stopPropagation(); handleRewriteSend(item.projectId || item.id, item.station); }} 
                                                style={{ 
                                                  flex: '1', padding: '10px', borderRadius: '12px', 
                                                  backgroundColor: (item.has_rewrite && item.rewrite_deadline && !item.rewrite_sent) ? '#3E2723' : '#94a3b8', 
                                                  color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                                  cursor: (item.has_rewrite && item.rewrite_deadline && !item.rewrite_sent) ? 'pointer' : 'not-allowed', 
                                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' 
                                                }}
                                             >
                                                <Check size={12} /> {item.rewrite_sent ? '送信済' : '送信'}
                                             </button>
                                          </div>
                                       </div>
                                    </>
                                  )
                                )}
                               {col.id === 'recordings' && (
                                  role === 'agency' ? (
                                    <button 
                                      disabled={!item.has_recording}
                                      onClick={(e) => { e.stopPropagation(); handleRecordingDownload(item.projectId || item.id, item.station); }} 
                                      style={{ 
                                         width: '100%', padding: '10px', borderRadius: '12px', 
                                         backgroundColor: item.has_recording ? '#3b82f6' : '#f8fafc', 
                                         color: item.has_recording ? 'white' : '#cbd5e1', 
                                         border: item.has_recording ? 'none' : '1.5px solid #e2e8f0', 
                                         fontSize: '11px', fontWeight: '950', 
                                         cursor: item.has_recording ? 'pointer' : 'not-allowed', 
                                         display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                                      }}
                                    >
                                       <Download size={14} /> 同録DL
                                    </button>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                       <button onClick={(e) => { e.stopPropagation(); handleRecordingUpload(item.projectId || item.id, item.station); }} style={{ flex: '1', padding: '10px', borderRadius: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                          <Mic size={12} /> 同録UP
                                       </button>
                                       <button 
                                         disabled={!item.has_recording}
                                         onClick={(e) => { 
                                           e.stopPropagation(); 
                                           alert('同録を送信しました。ステータスを完了に移行します。'); 
                                           api.updateProject(item.projectId || item.id, { status: 'completed' }); 
                                           fetchProjects(); 
                                         }} 
                                         style={{ 
                                           flex: '1', padding: '10px', borderRadius: '12px', 
                                           backgroundColor: item.has_recording ? '#3E2723' : '#94a3b8', 
                                           color: 'white', border: 'none', fontSize: '11px', fontWeight: '950', 
                                           cursor: item.has_recording ? 'pointer' : 'not-allowed', 
                                           display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' 
                                         }}
                                       >
                                          <Check size={12} /> 送信
                                       </button>
                                    </div>
                                  )
                                )}
                            </div>
                         </div>
                      ))}
                   </div>
                ))}
             </div>
          </PageView>
        );

      case 'excel':
        const filteredData = [
           { station: 'CX', date: '2026/05/10', sponsor: 'サントリー', name: '春の感謝祭パブ', status: '素材待ち', material: '未搬入', note: 'G帯指定' },
           { station: 'NTV', date: '2026/05/12', sponsor: 'トヨタ', name: '新型SUV発表', status: '進行中', material: '済', note: '-' },
        ];
        return (
          <PageView title="エクセルビュー" desc="案件データを一覧形式で閲覧・編集します。" icon={Table} color="#7C3AED" action={<button style={{ backgroundColor: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '900' }}>Excel出力</button>}>
             <div style={{ backgroundColor: 'white', border: '1.5px solid #F1E4C9', borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ backgroundColor: '#fcfcfc', borderBottom: '1.5px solid #F1E4C9' }}>
                      <tr>{['放送局', '放送予定日', 'スポンサー', '案件名', 'ステータス', '素材搬入'].map(h => <th key={h} style={{ padding: '16px', textAlign: 'left', fontWeight: '950' }}>{h}</th>)}</tr>
                   </thead>
                   <tbody>
                      {filteredData.map((row, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px' }}>{row.station}</td>
                            <td style={{ padding: '16px' }}>{row.date}</td>
                            <td style={{ padding: '16px' }}>{row.sponsor}</td>
                            <td style={{ padding: '16px' }}>{row.name}</td>
                            <td style={{ padding: '16px' }}>{row.status}</td>
                            <td style={{ padding: '16px' }}>{row.material}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </PageView>
        );

      case 'bulk-change-cancel':
        return (
          <PageView title="一括変更・取消" desc="複数の案件を選択して一括でステータス変更や取り消しを行います。" icon={Sliders} color="#EF4444">
             <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                   <button 
                      disabled={selectedBulkProjectIds.length === 0}
                      onClick={() => {
                        setBulkChangeName('');
                        setBulkChangeDateRange({ start: '', end: '' });
                        setBulkChangeMaterialDeadline('');
                        setActiveModal('bulk-change');
                      }}
                      style={{ 
                        padding: '12px 24px', borderRadius: '16px', backgroundColor: selectedBulkProjectIds.length > 0 ? '#3E2723' : '#e2e8f0', 
                        color: selectedBulkProjectIds.length > 0 ? 'white' : '#94a3b8', border: 'none', fontWeight: '950', cursor: selectedBulkProjectIds.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                   >
                      <Edit size={18} /> 一括変更
                   </button>
                   <button 
                      disabled={selectedBulkProjectIds.length === 0}
                      onClick={() => {
                        setActiveModal('bulk-cancel');
                      }}
                      style={{ 
                        padding: '12px 24px', borderRadius: '16px', backgroundColor: 'white', 
                        color: selectedBulkProjectIds.length > 0 ? '#EF4444' : '#94a3b8', border: `2px solid ${selectedBulkProjectIds.length > 0 ? '#EF4444' : '#e2e8f0'}`, 
                        fontWeight: '950', cursor: selectedBulkProjectIds.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                   >
                      <Trash2 size={18} /> 一括取消
                   </button>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #F1E4C9', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#fcfcfd', borderBottom: '1.5px solid #F1E4C9' }}>
                         <tr>
                            <th style={{ padding: '20px 32px', textAlign: 'center', width: '60px' }}>
                               <input 
                                  type="checkbox" 
                                  checked={projects.length > 0 && selectedBulkProjectIds.length === projects.length}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedBulkProjectIds(projects.map(p => p.id));
                                    else setSelectedBulkProjectIds([]);
                                  }}
                                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                               />
                            </th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>スポンサー</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>案件名</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>依頼期間</th>
                            <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>素材搬入開始日</th>
                         </tr>
                      </thead>
                      <tbody>
                         {isLoading ? (
                            <tr>
                               <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>データを読み込み中...</td>
                            </tr>
                         ) : projects.length === 0 ? (
                            <tr>
                               <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>対象の案件が見つかりません</td>
                            </tr>
                         ) : projects.filter(p => p.status !== 'cancelled').map(p => {
                            const isSelected = selectedBulkProjectIds.includes(p.id);
                            return (
                               <tr key={p.id} style={{ borderBottom: '1px solid #F1E4C9', backgroundColor: isSelected ? '#FFFBE6' : 'transparent', transition: 'background-color 0.2s' }}>
                                  <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                     <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => {
                                          if (isSelected) setSelectedBulkProjectIds(selectedBulkProjectIds.filter(id => id !== p.id));
                                          else setSelectedBulkProjectIds([...selectedBulkProjectIds, p.id]);
                                        }}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                     />
                                  </td>
                                  <td style={{ padding: '20px 32px' }}>
                                     <div style={{ fontSize: '13px', color: '#8B4513', fontWeight: '800' }}>{p.sponsor_name}</div>
                                  </td>
                                  <td style={{ padding: '20px 32px' }}>
                                     <div style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723' }}>{p.name}</div>
                                  </td>
                                  <td style={{ padding: '20px 32px' }}>
                                     <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.start_date || '---'} 〜 {p.end_date || '---'}</div>
                                  </td>
                                  <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                     <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.material_start_date || p.metadata?.material_deadline || '---'}</div>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </PageView>
        );


      case 'copy-project':
        if (selectedCopySource) {
          return (
            <PageView 
              title="案件複製" 
              desc="過去の案件情報を元に、内容を調整して新しい案件を作成します。" 
              icon={Copy} 
              color="#8B4513"
              action={<button onClick={() => setSelectedCopySource(null)} style={{ padding: '8px 20px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: 'white', fontWeight: '900', cursor: 'pointer' }}>リストに戻る</button>}
            >
               <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '32px', border: '1.5px solid #F1E4C9' }}>
                  <div style={{ display: 'grid', gap: '28px' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="input-group">
                           <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>スポンサー</label>
                           <input type="text" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="例：サントリー株式会社" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                        </div>
                        <div className="input-group">
                           <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>BA (担当者)</label>
                           <select 
                             value={selectedBa}
                             onChange={(e) => setSelectedBa(e.target.value)}
                             style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white' }}
                           >
                              <option value="">BAを選択してください</option>
                              {(maBaMappings['本社'] || []).map(baOrg => <option key={baOrg} value={baOrg}>{baOrg}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>案件名</label>
                        <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="例：春の新商品キャンペーン" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '800' }} />
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                         <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>依頼期間</label>
                            <div onClick={() => setActiveModal('period')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                               <Calendar size={18} color="#8B4513" />
                               <span style={{ color: requestDateRange.start ? '#3E2723' : '#94a3b8' }}>
                                  {requestDateRange.start && requestDateRange.end ? `${requestDateRange.start} 〜 ${requestDateRange.end}` : '期間を選択してください'}
                               </span>
                            </div>
                         </div>
                         <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>依頼ゾーン</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <div onClick={() => setActiveModal('zone')} style={{ flex: 1, padding: '14px 10px', borderRadius: '16px', border: '2px solid #F1E4C9', textAlign: 'center', fontWeight: '950', cursor: 'pointer', backgroundColor: 'white' }}>{startHour}:00</div>
                               <span>〜</span>
                               <div onClick={() => setActiveModal('zone')} style={{ flex: 1, padding: '14px 10px', borderRadius: '16px', border: '2px solid #F1E4C9', textAlign: 'center', fontWeight: '950', cursor: 'pointer', backgroundColor: 'white' }}>{endHour}:00</div>
                            </div>
                         </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                         <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '12px' }}>パブ種別</label>
                            <div onClick={() => setActiveModal('pubType')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '56px' }}>
                               {selectedPubTypes.map(type => <span key={type} style={{ padding: '4px 12px', borderRadius: '8px', backgroundColor: '#FFFBE6', color: '#8B4513', fontSize: '12px', fontWeight: '900', border: '1px solid #FFD93D' }}>{type}</span>)}
                               {selectedPubTypes.length === 0 && <span style={{ color: '#94a3b8' }}>選択してください</span>}
                            </div>
                         </div>
                         <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '12px' }}>素材搬入開始日</label>
                            <input type="date" value={materialDeadline} onChange={(e) => setMaterialDeadline(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                         </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                         <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>リライト共有者</label>
                            <div onClick={() => setActiveModal('reviewer-rewrite')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                               <Users size={18} /> <span>{rewriteReviewer || '担当者を選択'}</span>
                            </div>
                         </div>
                         <div className="input-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>同録共有者</label>
                            <div onClick={() => setActiveModal('reviewer-recording')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                               <Users size={18} /> <span>{recordingReviewer || '担当者を選択'}</span>
                            </div>
                         </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '24px 0 0 0', borderTop: '1px solid #F1E4C9' }}>
                         <button onClick={() => setSelectedCopySource(null)} style={{ padding: '14px 32px', borderRadius: '16px', fontWeight: '950', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>キャンセル</button>
                         <button style={{ padding: '14px 32px', borderRadius: '16px', fontWeight: '950', backgroundColor: '#FFFBE6', color: '#8B4513', border: '2px solid #FFD93D' }} onClick={() => setActiveTab('select-stations')}><Monitor size={18} /> 依頼局選択</button>
                         <button style={{ padding: '14px 56px', borderRadius: '16px', fontWeight: '950', backgroundColor: isSubmitting ? '#94a3b8' : '#3E2723', color: 'white', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer' }} onClick={async () => { await handleCreateProject(); setSelectedCopySource(null); }} disabled={isSubmitting}>{isSubmitting ? '送信中...' : '複製して送信'}</button>
                      </div>
                   </div>
                </div>
            </PageView>
          );
        }

        const filteredCopyProjects = projects.filter(p => 
          p.name?.toLowerCase().includes(copySearchQuery.toLowerCase()) || 
          p.sponsor_name?.toLowerCase().includes(copySearchQuery.toLowerCase())
        );

        return (
          <PageView title="案件複製" desc="過去の案件を検索して複製し、新しい案件を作成します。" icon={History} color="#8B4513">
             <div style={{ display: 'grid', gap: '24px' }}>
                {/* 検索バー */}
                <div style={{ backgroundColor: 'white', padding: '24px 32px', borderRadius: '24px', border: '1.5px solid #F1E4C9', display: 'flex', gap: '16px', alignItems: 'center' }}>
                   <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                         type="text" 
                         placeholder="案件名、スポンサー名で検索..." 
                         value={copySearchQuery}
                         onChange={(e) => setCopySearchQuery(e.target.value)}
                         style={{ 
                           width: '100%', padding: '14px 14px 14px 50px', borderRadius: '16px', border: '2px solid #F1E4C9', 
                           fontSize: '15px', fontWeight: '800', outline: 'none'
                         }} 
                      />
                   </div>
                   <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '800' }}>
                      対象: {filteredCopyProjects.length}件
                   </div>
                </div>

                {/* 案件一覧テーブル */}
                <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #F1E4C9', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#fcfcfd', borderBottom: '1.5px solid #F1E4C9' }}>
                         <tr>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>スポンサー</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>案件名</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>依頼期間</th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>BA</th>
                            <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>素材搬入開始日</th>
                            <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>依頼局</th>
                            <th style={{ padding: '20px 32px', textAlign: 'center', width: '120px' }}>操作</th>
                         </tr>
                      </thead>
                      <tbody>
                         {isLoading ? (
                            <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>読み込み中...</td></tr>
                         ) : filteredCopyProjects.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>該当する案件が見つかりません</td></tr>
                         ) : filteredCopyProjects.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #F1E4C9', transition: 'background-color 0.2s' }}>
                               <td style={{ padding: '20px 32px' }}>
                                  <div style={{ fontSize: '14px', color: '#8B4513', fontWeight: '800' }}>{p.sponsor_name}</div>
                               </td>
                               <td style={{ padding: '20px 32px' }}>
                                  <div style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723' }}>{p.name}</div>
                               </td>
                               <td style={{ padding: '20px 32px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>
                                     {p.start_date || '---'} 〜 {p.end_date || '---'}
                                  </div>
                               </td>
                               <td style={{ padding: '20px 32px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.ba || '---'}</div>
                               </td>
                               <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.material_start_date || '---'}</div>
                               </td>
                               <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{(p.selectedStations || p.metadata?.selectedStations || []).length} 局</div>
                               </td>
                               <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                  <button 
                                     onClick={() => {
                                        handleCopyProject(p);
                                     }}
                                     disabled={isSubmitting}
                                     style={{ 
                                       padding: '10px 20px', borderRadius: '12px', backgroundColor: '#FFFBE6', 
                                       color: '#8B4513', border: '1.5px solid #F1E4C9', fontWeight: '950', 
                                       cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                     }}
                                  >
                                     <Copy size={16} /> 複製
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </PageView>
        );


      case 'slot-registration':
        if (!selectedRequest) {
           return (
              <PageView title="枠情報登録" desc="依頼内容を確認し、放送枠情報を登録してください。" icon={Clock} color="#34D399">
                 <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 2rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '12px', fontWeight: '950', gap: '2rem' }}>
                       <div style={{ flex: '1.5', minWidth: '150px' }}>スポンサー / 代理店</div>
                       <div style={{ flex: '1.8', minWidth: '200px' }}>案件名</div>
                       <div style={{ flex: '1.5', minWidth: '180px' }}>依頼期間</div>
                       <div style={{ flex: '1', minWidth: '120px' }}>素材搬入開始日</div>
                       <div style={{ width: '24px' }}></div>
                    </div>
                    {projects.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>未対応の依頼はありません。</div>
                    ) : projects.map(p => (
                       <div key={p.id} onClick={() => setSelectedRequest(p)} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem 2rem', backgroundColor: 'white', borderRadius: '20px', border: '1.5px solid #F1E4C9', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', gap: '2rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#34D399'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#F1E4C9'; }}>
                          <div style={{ flex: '1.5', minWidth: '150px' }}><div style={{ fontSize: '13px', color: '#059669', fontWeight: '800' }}>{p.sponsor_name} / {p.metadata?.ba || p.metadata?.agency || '---'}</div></div>
                          <div style={{ flex: '1.8', minWidth: '200px' }}><div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#3E2723' }}>{p.name}</div></div>
                          <div style={{ flex: '1.5', minWidth: '180px' }}><div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.start_date || '---'} 〜 {p.end_date || '---'}</div></div>
                          <div style={{ flex: '1', minWidth: '120px' }}><div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.material_start_date || p.metadata?.material_deadline || '---'}</div></div>
                          <ChevronRight style={{ color: '#F1E4C9' }} />
                       </div>
                    ))}
                 </div>
              </PageView>
           );
        }
        const availablePubTypes = [...new Set(
           (Array.isArray(selectedRequest.metadata?.pub_types) ? selectedRequest.metadata.pub_types : [selectedRequest.metadata?.pub_types || ''])
           .map(t => t.replace(/打診|確定|確約/g, ''))
           .filter(Boolean)
        )];

        return (
           <PageView title="枠詳細登録" desc="依頼内容を確認し、放送枠情報を登録してください。" icon={Clock} color="#34D399" action={<button onClick={() => setSelectedRequest(null)} style={{ padding: '8px 20px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: 'white', fontWeight: '900', cursor: 'pointer' }}>戻る</button>}>
              <div style={{ display: 'grid', gap: '24px' }}>
                 <div style={{ backgroundColor: '#fcfcfd', borderRadius: '28px', border: '1.5px solid #F1E4C9', padding: '24px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    <SectionTitle title="案件情報" />
                    <div style={{ display: 'grid', gap: '20px' }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.2fr 1.2fr', gap: '24px' }}>
                          <FormItem label="スポンサー / 代理店" value={`${selectedRequest.sponsor_name} / ${selectedRequest.metadata?.ba || selectedRequest.metadata?.agency || '---'}`} />
                          <FormItem label="案件名" value={selectedRequest.name} />
                          <FormItem label="パブ種別" value={Array.isArray(selectedRequest.metadata?.pub_types) ? selectedRequest.metadata.pub_types.join(', ') : (selectedRequest.metadata?.pub_types || '---')} />
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '24px', borderTop: '1px dashed #F1E4C9', paddingTop: '20px' }}>
                          <FormItem label="依頼期間" value={`${selectedRequest.start_date || '---'} 〜 ${selectedRequest.end_date || '---'}`} />
                          <FormItem label="依頼ゾーン" value={`${selectedRequest.metadata?.start_hour || '05'}:00 〜 ${selectedRequest.metadata?.end_hour || '24'}:00`} />
                          <FormItem label="素材搬入開始日" value={selectedRequest.metadata?.material_start_date || selectedRequest.metadata?.material_deadline || '未設定'} />
                       </div>
                    </div>
                 </div>
                 <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #F1E4C9', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                    <SectionTitle title="枠情報入力" />
                    <div style={{ display: 'grid', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>番組名</label>
                              <input type="text" value={formProgramName} onChange={(e) => setFormProgramName(e.target.value)} placeholder="番組名を入力" style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} />
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>パブ種別</label>
                              <select value={formPubType} onChange={(e) => setFormPubType(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', cursor: 'pointer' }}>
                                 <option value="">種別を選択</option>
                                 {availablePubTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        {dashboardStats.occupancy === '0%' && (
                        <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#B91C1C', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <Shield size={16} /> 
                          <span>ストレージバケットが未設定です。ファイル機能は現在シミュレーションモードで動作しています。</span>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>OA日</label>
                              <button onClick={() => setActiveModal('formOADate')} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: formOADate ? '#3E2723' : '#94a3b8', outline: 'none', textAlign: 'left', cursor: 'pointer' }}>{formOADate || '日付を選択'}</button>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>開始・終了時間</label>
                              <input type="text" value={formTimeRange} onChange={(e) => setFormTimeRange(e.target.value)} placeholder="12:00〜12:30" style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} />
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>OA尺</label>
                              <select value={formOADuration} onChange={(e) => setFormOADuration(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', cursor: 'pointer' }}>
                                 {[15, 30, 45, 60, 90, 120, 180].map(v => <option key={v} value={v}>{v}秒</option>)}
                              </select>
                           </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>素材搬入〆切</label>
                              <button onClick={() => setActiveModal('formMaterialDeadlineLimit')} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: formMaterialDeadlineLimit ? '#3E2723' : '#94a3b8', outline: 'none', textAlign: 'left', cursor: 'pointer' }}>{formMaterialDeadlineLimit || '日付を選択'}</button>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>収録日</label>
                              <input type="date" value={formRecordingDate} onChange={(e) => setFormRecordingDate(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none' }} />
                           </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>素材送付先</label>
                              <select value={formMaterialDest} onChange={(e) => setFormMaterialDest(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', cursor: 'pointer' }}>
                                 <option value="">メンバーを選択</option>
                                 {puddingUsers.map(u => <option key={u.id} value={u.name}>{u.name} ({u.org})</option>)}
                              </select>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>修正稿送付先</label>
                              <select value={formRevisionDest} onChange={(e) => setFormRevisionDest(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #F1E4C9', backgroundColor: '#fcfcfd', fontSize: '14px', fontWeight: '800', color: '#3E2723', outline: 'none', cursor: 'pointer' }}>
                                 <option value="">メンバーを選択</option>
                                 {puddingUsers.map(u => <option key={u.id} value={u.name}>{u.name} ({u.org})</option>)}
                              </select>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', paddingTop: '32px', borderTop: '1.5px solid #F1E4C9' }}>
                     <button 
                        onClick={() => handleStationSave(false)}
                        disabled={isSubmitting}
                        style={{ padding: '14px 48px', borderRadius: '16px', backgroundColor: 'white', color: '#3E2723', border: '2px solid #F1E4C9', fontWeight: '950', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                     >
                        {isSubmitting ? '処理中...' : '一時保存'}
                     </button>
                     <button 
                        onClick={() => handleStationSave(true)}
                        disabled={isSubmitting}
                        style={{ padding: '14px 64px', borderRadius: '16px', backgroundColor: '#34D399', color: 'white', border: 'none', fontWeight: '950', cursor: 'pointer', boxShadow: '0 8px 20px rgba(52, 211, 153, 0.3)', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                     >
                        {isSubmitting ? '送信中...' : '枠出し'}
                     </button>
                  </div>
               </div>
           </PageView>
        );

      case 'slot-move-suspended':
        const slotMoveProjects = projects.filter(p => {
          // 管理者の場合は全件表示、放送局の場合は自局に関連する案件のみ表示
          const stations = p.metadata?.selectedStations || p.selectedStations || [];
          let myName = fullProfile?.broadcaster_name || fullProfile?.name || '系列局A';
          
          // 依頼局に含まれていない場合、デモ用に最初の依頼局を自局と見なすロジック（他の画面と統一）
          if (stations.length > 0 && !stations.includes(myName)) {
             myName = stations[0];
          }

          const statusOrder = ['requesting', 'slots', 'materials', 'rewrites', 'recordings', 'completed'];
          const currentIndex = statusOrder.indexOf(p.status);
          const materialsIndex = statusOrder.indexOf('materials');
          
          const isPostMaterials = currentIndex >= materialsIndex;
          const isTargetStation = stations.includes(myName);
          
          return isPostMaterials && (role === 'admin' || isTargetStation);
        });

        return (
          <PageView title="枠移動・休止" desc="登録済みの枠情報を変更・休止します。" icon={History} color="#EF4444">
             <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1.5px solid #F1E4C9', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ backgroundColor: '#fcfcfd', borderBottom: '1.5px solid #F1E4C9' }}>
                      <tr>
                         <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>スポンサー / 代理店</th>
                         <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>案件名</th>
                         <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>OA日</th>
                         <th style={{ padding: '20px 32px', textAlign: 'left', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>開始・終了時間</th>
                         <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>尺</th>
                         <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>素材〆切</th>
                         <th style={{ padding: '20px 32px', textAlign: 'center', fontWeight: '950', color: '#8B4513', fontSize: '13px' }}>収録日</th>
                         <th style={{ padding: '20px 32px', textAlign: 'center', width: '120px' }}>操作</th>
                      </tr>
                   </thead>
                   <tbody>
                      {slotMoveProjects.length === 0 ? (
                         <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>対象の案件はありません</td></tr>
                      ) : slotMoveProjects.map(p => (
                         <tr key={p.id} style={{ borderBottom: '1px solid #F1E4C9' }}>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ fontSize: '13px', color: '#8B4513', fontWeight: '800' }}>{p.sponsor_name} / {p.metadata?.ba || '---'}</div>
                            </td>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723' }}>{p.name}</div>
                            </td>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.oa_date || '---'}</div>
                            </td>
                            <td style={{ padding: '20px 32px' }}>
                               <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.time_range || '---'}</div>
                            </td>
                            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                               <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.duration ? `${p.metadata.duration}s` : '---'}</div>
                            </td>
                            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                               <div style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444' }}>{p.metadata?.material_deadline || '---'}</div>
                            </td>
                            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                               <div style={{ fontSize: '14px', fontWeight: '800', color: '#3E2723' }}>{p.metadata?.recording_date || p.metadata?.recordingDate || '---'}</div>
                            </td>
                            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                               <button 
                                  onClick={() => {
                                     setSelectedRequest(p);
                                     setActiveModal('slot-edit');
                                  }}
                                  style={{ 
                                    padding: '10px 20px', borderRadius: '12px', backgroundColor: '#FFFBE6', 
                                    color: '#8B4513', border: '1.5px solid #F1E4C9', fontWeight: '950', 
                                    cursor: 'pointer'
                                  }}
                                >
                                  変更
                                </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </PageView>
        );

      case 'calendar':
        return (
          <PageView title="放送カレンダー" desc="OA予定を管理します。" icon={Calendar} color="#F59E0B">
             <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1.5px solid #F1E4C9', padding: '32px' }}>
                <h3>2026年 5月</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#F1E4C9', marginTop: '20px' }}>
                   {Array.from({ length: 35 }).map((_, i) => <div key={i} style={{ backgroundColor: 'white', minHeight: '80px', padding: '8px' }}>{i - 3 > 0 && i - 3 <= 31 ? i - 3 : ''}</div>)}
                </div>
             </div>
          </PageView>
        );

      case 'slot-management-table':
        return (
          <PageView title="スプシ連携設定" desc="Googleスプレッドシートと連携します。" icon={Link} color="#34D399">
             <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>
                <input type="text" placeholder="スプレッドシート URL" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #F1E4C9' }} />
                <button style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '8px', backgroundColor: '#34D399', color: 'white', border: 'none', fontWeight: '900' }}>接続確認</button>
             </div>
          </PageView>
        );

      case 'admin-dashboard':
        return (
          <PageView title="総合ダッシュボード" desc="システム全体のモニタリング。" icon={Monitor} color="#3E2723">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {['局数', 'ユーザー数', '案件数', '稼働率'].map(h => <div key={h} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>{h}</div>)}
             </div>
          </PageView>
        );

      case 'ai-rewrite-settings':
        return (
          <PageView title="AIリライト設定" desc="AIのトンマナを学習させます。" icon={Settings} color="#10b981">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>前稿</div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>後稿</div>
             </div>
          </PageView>
        );

      case 'ai-narration-settings':
        return (
          <PageView title="AIナレーション生成" desc="音声を自動生成します。" icon={Mic} color="#6366f1">
             <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>音声設定...</div>
          </PageView>
        );

      case 'inbox':
        return (
          <PageView title="メール依頼受理" desc="メールから案件を取り込みます。" icon={Inbox} color="#8B4513">
             <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #F1E4C9', height: '400px' }}>メール一覧...</div>
          </PageView>
        );

      case 'chat':
        return <ChatView activeChannel={activeChatChannel} />;

      case 'select-stations':
        const networks = ['N系', 'J系', 'CX系', 'EX系', 'TX系', '独U'];
        const prefectures = ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];
        const toggleStation = (pref, net) => {
          const id = `${pref}-${net}`;
          if (selectedStations.includes(id)) {
            setSelectedStations(selectedStations.filter(s => s !== id));
          } else {
            setSelectedStations([...selectedStations, id]);
          }
        };
        return (
          <PageView title="依頼局選択" desc="放送局を選択してください。" icon={Monitor} color="#3E2723" 
            action={<button onClick={() => setActiveTab('new-request')} style={{ padding: '12px 24px', borderRadius: '16px', backgroundColor: '#3E2723', color: 'white', fontWeight: '950', border: 'none' }}>保存して戻る</button>}
          >
             <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1.5px solid #F1E4C9', overflow: 'hidden', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 32px', backgroundColor: '#FFFBE6', borderBottom: '1.5px solid #F1E4C9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '14px', fontWeight: '950', color: '#8B4513' }}>選択済み: {selectedStations.length} 局</div>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => {
                         const all = [];
                         prefectures.forEach(p => networks.forEach(n => all.push(`${p}-${n}`)));
                         setSelectedStations(all);
                      }} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #F1E4C9', fontSize: '12px', fontWeight: '900' }}>全選択</button>
                      <button onClick={() => {
                         const filtered = [];
                         prefectures.forEach(p => networks.filter(n => n !== '独U').forEach(n => filtered.push(`${p}-${n}`)));
                         setSelectedStations(filtered);
                      }} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #F1E4C9', fontSize: '12px', fontWeight: '900' }}>全選択（独U除外）</button>
                      <button onClick={() => setSelectedStations([])} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #F1E4C9', fontSize: '12px', fontWeight: '900' }}>全解除</button>
                   </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                   <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc' }}>
                         <tr>
                            <th style={{ position: 'sticky', left: 0, zIndex: 20, backgroundColor: '#f8fafc', padding: '16px', borderBottom: '2px solid #F1E4C9', borderRight: '2px solid #F1E4C9' }}>都道府県</th>
                            {networks.map(net => <th key={net} style={{ padding: '16px', borderBottom: '2px solid #F1E4C9' }}>{net}</th>)}
                         </tr>
                      </thead>
                      <tbody>
                         {prefectures.map(pref => (
                            <tr key={pref}>
                               <td style={{ position: 'sticky', left: 0, zIndex: 5, backgroundColor: 'white', padding: '12px 24px', borderBottom: '1px solid #F1E4C9', borderRight: '2px solid #F1E4C9', fontWeight: '950' }}>{pref}</td>
                               {networks.map(net => {
                                  const isSelected = selectedStations.includes(`${pref}-${net}`);
                                  return (
                                     <td key={net} style={{ padding: '8px', borderBottom: '1px solid #F1E4C9', textAlign: 'center' }}>
                                        <div onClick={() => toggleStation(pref, net)} style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: isSelected ? '#FFD93D20' : 'transparent', border: isSelected ? '2px solid #FFD93D' : '1px solid #F1E4C9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                           {isSelected && <Check size={20} color="#8B4513" />}
                                        </div>
                                     </td>
                                  );
                               })}
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </PageView>
        );

      case 'ba-settings':
        const agencyOrgs = [...new Set(puddingUsers.filter(u => u.role === 'agency' || u.role === 'admin').map(u => u.org))];
        return (
          <PageView title="BA組織のマッピング" desc="自社組織とBA組織の連携を設定します。" icon={Monitor} color="#3E2723">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>
                   <SectionTitle title="自社組織選択" />
                   <div style={{ display: 'grid', gap: '8px' }}>
                      {['本社', '大阪支社', '名古屋支社'].map(o => (
                         <div key={o} onClick={() => setSelectedMaId(o)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: selectedMaId === o ? '#3E2723' : '#fcfcfc', color: selectedMaId === o ? 'white' : '#3E2723', cursor: 'pointer', fontWeight: '950', border: '1px solid #F1E4C9' }}>{o}</div>
                      ))}
                   </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1.5px solid #F1E4C9' }}>
                   <SectionTitle title="連携BA組織設定" />
                   {selectedMaId ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                         {agencyOrgs.filter(o => o !== selectedMaId).map(o => (
                            <div key={o} onClick={() => {
                               const current = maBaMappings[selectedMaId] || [];
                               const next = current.includes(o) ? current.filter(x => x !== o) : [...current, o];
                               saveMaBaMappings({...maBaMappings, [selectedMaId]: next});
                            }} style={{ padding: '12px', borderRadius: '12px', border: (maBaMappings[selectedMaId] || []).includes(o) ? '2px solid #10b981' : '1.5px solid #e2e8f0', cursor: 'pointer' }}>{o}</div>
                         ))}
                      </div>
                   ) : <div style={{ textAlign: 'center', color: '#94a3b8' }}>MAを選択してください</div>}
                </div>
             </div>
          </PageView>
        );

      case 'manual':
        return <ManualView />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {renderContent()}

      {activeModal === 'slot-edit' && selectedRequest && (
          <Modal title="枠情報変更" onClose={() => setActiveModal(null)} width="800px">
             <div style={{ display: 'grid', gap: '32px' }}>
                {/* 上段: 案件情報 */}
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
                   <SectionTitle title="案件情報" />
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px' }}>
                      <FormItem label="スポンサー" value={selectedRequest.sponsor_name} />
                      <FormItem label="案件名" value={selectedRequest.name} />
                      <FormItem label="依頼期間" value={`${selectedRequest.start_date || '---'} 〜 ${selectedRequest.end_date || '---'}`} />
                   </div>
                </div>

                {/* 下段: 枠情報入力 */}
                <div>
                   <SectionTitle title="枠情報入力" />
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>OA日</label>
                         <input type="date" value={formOADate} onChange={(e) => setFormOADate(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                      </div>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>開始終了時間</label>
                         <input type="text" value={formTimeRange} onChange={(e) => setFormTimeRange(e.target.value)} placeholder="例: 19:00〜19:30" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                      </div>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>尺 (秒)</label>
                         <select value={formOADuration} onChange={(e) => setFormOADuration(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white' }}>
                            <option value="15">15s</option>
                            <option value="30">30s</option>
                            <option value="60">60s</option>
                         </select>
                      </div>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>素材〆切</label>
                         <input type="date" value={formMaterialDeadlineLimit} onChange={(e) => setFormMaterialDeadlineLimit(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                      </div>
                      <div className="input-group">
                         <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>収録日</label>
                         <input type="date" value={formRecordingDate} onChange={(e) => setFormRecordingDate(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
                      </div>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                   <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'white', border: '2px solid #F1E4C9', fontWeight: '950', cursor: 'pointer' }}>キャンセル</button>
                   <button onClick={handleEditSave} disabled={isSubmitting} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontWeight: '950', cursor: isSubmitting ? 'wait' : 'pointer' }}>{isSubmitting ? '保存中...' : '変更を保存する'}</button>
                </div>
             </div>
          </Modal>
       )}

      {activeModal === 'bulk-change' && (
         <Modal title="一括変更" onClose={() => setActiveModal(null)}>
            <div style={{ display: 'grid', gap: '24px' }}>
               <p style={{ fontSize: '14px', color: '#64748b' }}>選択した{selectedBulkProjectIds.length}件の案件を一括で更新します。変更したい項目のみ入力してください。</p>
               <div className="input-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>案件名</label>
                  <input type="text" value={bulkChangeName} onChange={(e) => setBulkChangeName(e.target.value)} placeholder="一括設定する案件名" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '800' }} />
               </div>
               <div className="input-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '8px' }}>依頼期間</label>
                  <div onClick={() => setActiveModal('bulk-period')} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <Calendar size={18} color="#8B4513" />
                     <span style={{ color: bulkChangeDateRange.start ? '#3E2723' : '#94a3b8' }}>
                        {bulkChangeDateRange.start && bulkChangeDateRange.end ? `${bulkChangeDateRange.start} 〜 ${bulkChangeDateRange.end}` : '期間を選択してください'}
                     </span>
                  </div>
               </div>
               <div className="input-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '950', color: '#8B4513', marginBottom: '12px' }}>素材搬入開始日</label>
                  <input type="date" value={bulkChangeMaterialDeadline} onChange={(e) => setBulkChangeMaterialDeadline(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: '2px solid #F1E4C9', fontSize: '15px', fontWeight: '700' }} />
               </div>
               <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: 'white', border: '2px solid #F1E4C9', fontWeight: '950', cursor: 'pointer' }}>キャンセル</button>
                  <button onClick={handleBulkChange} disabled={isSubmitting} style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#3E2723', color: 'white', border: 'none', fontWeight: '950', cursor: isSubmitting ? 'wait' : 'pointer' }}>{isSubmitting ? '更新中...' : '変更を適用する'}</button>
               </div>
            </div>
         </Modal>
      )}

      {activeModal === 'bulk-cancel' && (
         <Modal title="一括取消の確認" onClose={() => setActiveModal(null)}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
               <div style={{ color: '#EF4444', marginBottom: '20px' }}>
                  <Trash2 size={64} style={{ margin: '0 auto' }} />
               </div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#3E2723', marginBottom: '12px' }}>本当に取り消しますか？</h3>
               <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6' }}>
                  選択した{selectedBulkProjectIds.length}件の案件を取り消します。<br/>
                  この操作は取り消せません。よろしいですか？
               </p>
               <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'white', border: '2px solid #F1E4C9', fontWeight: '950', cursor: 'pointer' }}>キャンセル</button>
                  <button onClick={handleBulkCancel} disabled={isSubmitting} style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: '#EF4444', color: 'white', border: 'none', fontWeight: '950', cursor: isSubmitting ? 'wait' : 'pointer' }}>{isSubmitting ? '処理中...' : '取り消しを確定する'}</button>
               </div>
            </div>
         </Modal>
      )}

      {activeModal === 'bulk-period' && (() => {
         const year = viewMonth.getFullYear();
         const month = viewMonth.getMonth();
         const daysInMonth = new Date(year, month + 1, 0).getDate();
         const firstDayOffset = new Date(year, month, 1).getDay();
         
         const handlePrevMonth = () => setViewMonth(new Date(year, month - 1, 1));
         const handleNextMonth = () => setViewMonth(new Date(year, month + 1, 1));

         return (
            <Modal title="依頼期間を一括選択" onClose={() => setActiveModal('bulk-change')} width="400px">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={handlePrevMonth} style={{ background: 'none', border: '1.5px solid #F1E4C9', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: '950', color: '#8B4513' }}>&lt;</button>
                  <div style={{ fontSize: '18px', fontWeight: '950', color: '#8B4513' }}>
                     {year}年 {month + 1}月
                  </div>
                  <button onClick={handleNextMonth} style={{ background: 'none', border: '1.5px solid #F1E4C9', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: '950', color: '#8B4513' }}>&gt;</button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {['日','月','火','水','木','金','土'].map(d => <div key={d} style={{ textAlign: 'center', fontWeight: '950', fontSize: '12px', color: '#64748b' }}>{d}</div>)}
                  
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                     const isSelected = bulkChangeDateRange.start === dateStr || bulkChangeDateRange.end === dateStr;
                     const isInRange = bulkChangeDateRange.start && bulkChangeDateRange.end && dateStr > bulkChangeDateRange.start && dateStr < bulkChangeDateRange.end;
                     
                     return (
                       <div 
                         key={day} 
                         onClick={() => {
                           if (!bulkChangeDateRange.start || (bulkChangeDateRange.start && bulkChangeDateRange.end)) {
                             setBulkChangeDateRange({ start: dateStr, end: '' });
                           } else {
                             if (dateStr < bulkChangeDateRange.start) {
                               setBulkChangeDateRange({ start: dateStr, end: bulkChangeDateRange.start });
                             } else {
                               setBulkChangeDateRange({ ...bulkChangeDateRange, end: dateStr });
                             }
                           }
                         }}
                         style={{ 
                           textAlign: 'center', padding: '10px', borderRadius: '12px', cursor: 'pointer',
                           backgroundColor: isSelected ? '#FFD93D' : isInRange ? '#FFFBE6' : 'transparent',
                           fontWeight: isSelected ? '950' : 'normal',
                           border: isSelected ? '1.5px solid #8B4513' : 'none',
                           fontSize: '14px',
                           transition: 'all 0.2s'
                         }}
                         onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                         onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = isInRange ? '#FFFBE6' : 'transparent'; }}
                       >
                         {day}
                       </div>
                     );
                  })}
               </div>
               <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button onClick={() => setActiveModal('bulk-change')} style={{ padding: '12px 48px', borderRadius: '16px', backgroundColor: '#3E2723', color: 'white', fontWeight: '950', border: 'none', cursor: 'pointer' }}>期間を確定する</button>
               </div>
            </Modal>
         );
      })()}

      {activeModal === 'period' && (() => {

         const year = viewMonth.getFullYear();
         const month = viewMonth.getMonth();
         const daysInMonth = new Date(year, month + 1, 0).getDate();
         const firstDayOffset = new Date(year, month, 1).getDay();
         
         const handlePrevMonth = () => setViewMonth(new Date(year, month - 1, 1));
         const handleNextMonth = () => setViewMonth(new Date(year, month + 1, 1));

         return (
            <Modal title="依頼期間を選択" onClose={() => setActiveModal(null)} width="400px">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={handlePrevMonth} style={{ background: 'none', border: '1.5px solid #F1E4C9', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: '950', color: '#8B4513' }}>&lt;</button>
                  <div style={{ fontSize: '18px', fontWeight: '950', color: '#8B4513' }}>
                     {year}年 {month + 1}月
                  </div>
                  <button onClick={handleNextMonth} style={{ background: 'none', border: '1.5px solid #F1E4C9', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: '950', color: '#8B4513' }}>&gt;</button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {['日','月','火','水','木','金','土'].map(d => <div key={d} style={{ textAlign: 'center', fontWeight: '950', fontSize: '12px', color: '#64748b' }}>{d}</div>)}
                  
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                     const isSelected = requestDateRange.start === dateStr || requestDateRange.end === dateStr;
                     const isInRange = requestDateRange.start && requestDateRange.end && dateStr > requestDateRange.start && dateStr < requestDateRange.end;
                     
                     return (
                       <div 
                         key={day} 
                         onClick={() => {
                           if (!requestDateRange.start || (requestDateRange.start && requestDateRange.end)) {
                             setRequestDateRange({ start: dateStr, end: '' });
                           } else {
                             if (dateStr < requestDateRange.start) {
                               setRequestDateRange({ start: dateStr, end: requestDateRange.start });
                             } else {
                               setRequestDateRange({ ...requestDateRange, end: dateStr });
                             }
                           }
                         }}
                         style={{ 
                           textAlign: 'center', padding: '10px', borderRadius: '12px', cursor: 'pointer',
                           backgroundColor: isSelected ? '#FFD93D' : isInRange ? '#FFFBE6' : 'transparent',
                           fontWeight: isSelected ? '950' : 'normal',
                           border: isSelected ? '1.5px solid #8B4513' : 'none',
                           fontSize: '14px',
                           transition: 'all 0.2s'
                         }}
                         onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                         onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = isInRange ? '#FFFBE6' : 'transparent'; }}
                       >
                         {day}
                       </div>
                     );
                  })}
               </div>
               <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                  開始日と終了日を順にクリックして選択してください。<br/>
                  月をまたぐ場合は、次月へ移動して終了日を選択してください。
               </div>
            </Modal>
         );
      })()}

      {activeModal === 'pubType' && (
         <Modal title="パブ種別を選択" onClose={() => setActiveModal(null)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               {[
                  'ストレートパブ打診', 'ストレートパブ確定', 
                  '取材パブ打診', '取材パブ確定',
                  '対談パブ打診', '対談パブ確定',
                  'プレゼントパブ打診', 'プレゼントパブ確定'
               ].map(type => (
                  <button key={type} onClick={() => setSelectedPubTypes(selectedPubTypes.includes(type) ? selectedPubTypes.filter(t => t !== type) : [...selectedPubTypes, type])} style={{ padding: '16px', borderRadius: '16px', border: selectedPubTypes.includes(type) ? '2px solid #FFD93D' : '1.5px solid #F1E4C9', backgroundColor: selectedPubTypes.includes(type) ? '#FFFBE6' : 'white', cursor: 'pointer' }}>{type}</button>
               ))}
            </div>
         </Modal>
      )}

      {(activeModal === 'reviewer-rewrite' || activeModal === 'reviewer-recording') && (
         <Modal title="共有者を選択" onClose={() => setActiveModal(null)}>
            <div style={{ display: 'grid', gap: '12px' }}>
               {puddingUsers.map(u => (
                  <button key={u.id} onClick={() => {
                     if (activeModal === 'reviewer-rewrite') setRewriteReviewer(u.name);
                     else setRecordingReviewer(u.name);
                     setActiveModal(null);
                  }} style={{ padding: '16px', borderRadius: '16px', border: '1.5px solid #F1E4C9', backgroundColor: 'white', textAlign: 'left', cursor: 'pointer' }}>{u.name} ({u.org})</button>
               ))}
            </div>
         </Modal>
      )}

      {activeModal === 'zone' && (
         <Modal title="依頼ゾーンを設定" onClose={() => setActiveModal(null)} width="400px">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div>
                  <label>開始</label>
                  <select value={startHour} onChange={(e) => setStartHour(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                     {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i}:00</option>)}
                  </select>
               </div>
               <div>
                  <label>終了</label>
                  <select value={endHour} onChange={(e) => setEndHour(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                     {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i}:00</option>)}
                  </select>
               </div>
            </div>
         </Modal>
      )}

      {(activeModal === 'formOADate' || activeModal === 'formMaterialDeadlineLimit' || activeModal === 'rewrite-deadline') && (() => {
         const year = viewMonth.getFullYear();
         const month = viewMonth.getMonth();
         const daysInMonth = new Date(year, month + 1, 0).getDate();
         const firstDayOffset = new Date(year, month, 1).getDay();
         
         const handlePrevMonth = () => setViewMonth(new Date(year, month - 1, 1));
         const handleNextMonth = () => setViewMonth(new Date(year, month + 1, 1));

         const isOADate = activeModal === 'formOADate';
         const isRewriteDeadline = activeModal === 'rewrite-deadline';
         const title = isOADate ? "OA日を選択" : (isRewriteDeadline ? "修正〆切を選択" : "素材搬入予定日を選択");

         return (
            <Modal title={title} onClose={() => setActiveModal(null)} width="400px">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <button onClick={handlePrevMonth} style={{ background: 'none', border: '1.5px solid #F1E4C9', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: '950', color: '#8B4513' }}>&lt;</button>
                  <div style={{ fontSize: '18px', fontWeight: '950', color: '#8B4513' }}>
                     {year}年 {month + 1}月
                  </div>
                  <button onClick={handleNextMonth} style={{ background: 'none', border: '1.5px solid #F1E4C9', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: '950', color: '#8B4513' }}>&gt;</button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {['日','月','火','水','木','金','土'].map(d => <div key={d} style={{ textAlign: 'center', fontWeight: '950', fontSize: '12px', color: '#64748b' }}>{d}</div>)}
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                     
                     let isDisabled = false;
                     if (isOADate) {
                        const start = selectedRequest?.start_date;
                        const end = selectedRequest?.end_date;
                        if (start && dateStr < start) isDisabled = true;
                        if (end && dateStr > end) isDisabled = true;
                     } else if (isRewriteDeadline) {
                        // 修正〆切は収録日以前である必要がある
                        const recordingDate = selectedRequest?.metadata?.recording_date;
                        if (recordingDate && dateStr > recordingDate) isDisabled = true;
                     } else {
                        const materialStart = selectedRequest?.metadata?.material_start_date || selectedRequest?.metadata?.material_deadline;
                        if (materialStart && dateStr < materialStart) isDisabled = true;
                     }

                     const isSelected = isOADate ? formOADate === dateStr : (isRewriteDeadline ? rewriteDeadline === dateStr : formMaterialDeadlineLimit === dateStr);
                     
                     return (
                        <div 
                          key={day} 
                          onClick={() => {
                            if (isDisabled) return;
                            if (isOADate) setFormOADate(dateStr);
                            else if (isRewriteDeadline) {
                               setRewriteDeadline(dateStr);
                               handleUpdateRewriteDeadline(selectedRequest, dateStr);
                            }
                            else setFormMaterialDeadlineLimit(dateStr);
                            setActiveModal(null);
                          }}
                          style={{ 
                            textAlign: 'center', padding: '10px', borderRadius: '12px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                            backgroundColor: isSelected ? '#FFD93D' : 'transparent',
                            color: isDisabled ? '#cbd5e1' : '#3E2723',
                            fontWeight: isSelected ? '950' : 'normal',
                            border: isSelected ? '1.5px solid #8B4513' : 'none',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {day}
                        </div>
                     );
                  })}
               </div>
               <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                  {isOADate ? "依頼期間内（" + selectedRequest?.start_date + " 〜 " + selectedRequest?.end_date + "）の日付のみ選択可能です。" : (isRewriteDeadline ? (selectedRequest?.metadata?.recording_date ? "収録日（" + selectedRequest.metadata.recording_date + "）以前の日付を選択してください。" : "修正〆切日を選択してください。") : "素材搬入開始（" + (selectedRequest?.metadata?.material_start_date || selectedRequest?.metadata?.material_deadline) + "）以降の日付のみ選択可能です。")}
               </div>
            </Modal>
         );
      })()}
    </div>
  );
};

export default PuddingView;
