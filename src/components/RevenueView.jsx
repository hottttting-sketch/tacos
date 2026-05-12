import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';
import IconWrapper from './IconWrapper';
import { api } from '../utils/api';

const RevenueView = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [uploadStates, setUploadStates] = useState({
    estimates: false,
    edps: false,
    internal: false
  });

  const [sourceSettings, setSourceSettings] = useState({
    estimates: 'D',
    internal: 'D'
  });

  const fetchRevenues = async () => {
    try {
      const projs = await api.getProjects();
      const revItems = (projs || [])
        .filter(p => p.metadata?.type === 'revenue_item' || p.status === 'revenue_active')
        .map(p => ({
          id: p.id,
          period: p.metadata?.period || '未定',
          sp: p.sponsor_name,
          ag: p.metadata?.ag || '未設定',
          project: p.name,
          amount: p.budget_confirmed || p.metadata?.amount || 0,
          networkAmounts: p.metadata?.networkAmounts || { N: 0, J: 0, CX: 0, EX: 0, TX: 0 },
          areaTotal: p.total_budget || p.metadata?.areaTotal || 0,
          manager: p.metadata?.manager || '担当者',
          source: p.metadata?.source || '見積',
          selected: false
        }));

      setRevenueData(revItems);
    } catch (e) {
      console.error('Failed to fetch revenues:', e);
      setRevenueData([]);
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  const handleFileUpload = async (type) => {
    setUploadStates(prev => ({ ...prev, [type]: true }));
    let sourceLabel = type === 'estimates' ? '見積' : (type === 'edps' ? 'EDPS' : '裏数字');
    try {
      const newItem = {
        period: '2026/05/10 - 05/20',
        sp: '新規テストSP',
        ag: '電通',
        project: 'アップロード案件',
        amount: 3000000,
        networkAmounts: { N: 0, J: 3000000, CX: 1000000, EX: 0, TX: 0 },
        areaTotal: 4000000,
        manager: '田中',
        source: sourceLabel
      };

      await api.createProject({
        name: newItem.project,
        sponsor_name: newItem.sp,
        status: 'revenue_active',
        budget_confirmed: newItem.amount,
        total_budget: newItem.areaTotal,
        metadata: {
          type: 'revenue_item',
          period: newItem.period,
          ag: newItem.ag,
          networkAmounts: newItem.networkAmounts,
          manager: newItem.manager,
          source: newItem.source
        }
      });
      fetchRevenues();
      alert(`${sourceLabel} データを読み込み、DBに反映しました。`);
    } catch (e) {
      console.error(e);
      alert('データ読み込みに失敗しました。');
    }
  };

  // 行の削除
  const handleDelete = async (id) => {
    if (window.confirm('この案件データを削除しますか？')) {
      try {
        await api.deleteProject(id);
        fetchRevenues();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 金額および担当者の編集
  const handleEdit = async (item) => {
    const newSelfAmount = prompt('自社発注額を入力してください', item.amount);
    if (newSelfAmount === null) return;

    const newN = prompt('系列 N の金額を入力してください', item.networkAmounts.N);
    const newCX = prompt('系列 CX の金額を入力してください', item.networkAmounts.CX);
    const newEX = prompt('系列 EX の金額を入力してください', item.networkAmounts.EX);
    const newTX = prompt('系列 TX の金額を入力してください', item.networkAmounts.TX);
    
    const newManager = prompt('担当者を入力してください', item.manager);

    const updatedItem = {
      ...item,
      amount: parseInt(newSelfAmount) || 0,
      manager: newManager || item.manager,
      networkAmounts: {
        N: parseInt(newN) || 0,
        J: item.networkAmounts.J,
        CX: parseInt(newCX) || 0,
        EX: parseInt(newEX) || 0,
        TX: parseInt(newTX) || 0
      }
    };

    // マーケット合計を再計算
    updatedItem.areaTotal = updatedItem.amount + 
                             updatedItem.networkAmounts.N + 
                             updatedItem.networkAmounts.CX + 
                             updatedItem.networkAmounts.EX + 
                             updatedItem.networkAmounts.TX;

    try {
      await api.updateProject(item.id, {
        budget_confirmed: updatedItem.amount,
        total_budget: updatedItem.areaTotal,
        metadata: {
          type: 'revenue_item',
          period: updatedItem.period,
          ag: updatedItem.ag,
          networkAmounts: updatedItem.networkAmounts,
          manager: updatedItem.manager,
          source: updatedItem.source
        }
      });
      fetchRevenues();
      alert('入力内容を保存し、シェア率を再計算しました。');
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました。');
    }
  };

  // 履歴の表示
  const handleHistory = (item) => {
    alert(`【更新履歴: ${item.project}】\n・2026/04/26 10:00: ${item.source}データ読み込み\n・2026/04/26 10:15: 数値・担当者手動修正`);
  };

  // 自局の系列（例として'J'）を除外するリスト
  const competitorNetworks = ['N', 'CX', 'EX', 'TX'];

  return (
    <div className="animate-fade" style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>売上管理</h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>マーケット全体の投下状況と各局シェアをリアルタイムで分析します。</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontWeight: '800' }}>
             <Icons.Filter size={18} /> 見積抽出
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontWeight: '800' }}>
             <Icons.Chart size={18} /> 前年予算週報
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px', fontWeight: '900', backgroundColor: 'var(--tacos-red)', border: 'none', color: 'white' }}>
             <Icons.Board size={18} /> 会議資料
          </button>
        </div>
      </header>

      {/* 上段：データ読込エリア */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
        
        {/* 見積読込セクション */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
             onClick={() => alert('タコスから最新データを取得し、「見積」ステータスとして反映します')}
             style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #4338ca', backgroundColor: 'white', color: '#4338ca', fontSize: '13px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
             <Icons.Zap size={14} /> タコスから読込
          </button>
          <div className="glass-card" style={{ padding: '32px', backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
            <IconWrapper size={48} color="#eef2ff" iconColor="#4338ca" style={{ margin: '0 auto 20px' }}>
              <Icons.FileText />
            </IconWrapper>
            <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', marginBottom: '8px' }}>見積読込</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>見積管理システムのデータをアップロード</p>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', justifyContent: 'center' }}>
               {['D', 'H（Excel）', 'H（AaaS）'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setSourceSettings({...sourceSettings, estimates: opt})}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid', borderColor: sourceSettings.estimates === opt ? '#4338ca' : '#e2e8f0', backgroundColor: sourceSettings.estimates === opt ? '#eef2ff' : 'white', color: sourceSettings.estimates === opt ? '#4338ca' : '#64748b', fontSize: '11px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
                  >{opt}</button>
               ))}
            </div>
            <button 
              onClick={() => handleFileUpload('estimates')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px dashed #cbd5e1', backgroundColor: uploadStates.estimates ? '#ebfbee' : '#f8fafc', color: uploadStates.estimates ? '#087f5b' : '#64748b', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {uploadStates.estimates ? '一覧に反映' : 'ファイルを選択'}
            </button>
          </div>
        </div>

        {/* EDPS読込セクション */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
             onClick={() => alert('営放メールからデータを解析し、「見積」ステータスとして反映します')}
             style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #087f5b', backgroundColor: 'white', color: '#087f5b', fontSize: '13px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
             <Icons.Inbox size={14} /> メールから読込
          </button>
          <div className="glass-card" style={{ padding: '32px', backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
            <IconWrapper size={48} color="#ebfbee" iconColor="#087f5b" style={{ margin: '0 auto 20px' }}>
              <Icons.Monitor />
            </IconWrapper>
            <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', marginBottom: '8px' }}>EDPS読込</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>基幹放送システム（実績）をアップロード</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['NEC', 'ユニゾン', '西コン', '富士通'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setSourceSettings({...sourceSettings, edps: opt})}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid', borderColor: sourceSettings.edps === opt ? '#087f5b' : '#e2e8f0', backgroundColor: sourceSettings.edps === opt ? '#ebfbee' : 'white', color: sourceSettings.edps === opt ? '#087f5b' : '#64748b', fontSize: '11px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
                >{opt}</button>
              ))}
            </div>
            <button 
              onClick={() => handleFileUpload('edps')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px dashed #cbd5e1', backgroundColor: uploadStates.edps ? '#ebfbee' : '#f8fafc', color: uploadStates.edps ? '#087f5b' : '#64748b', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {uploadStates.edps ? '一覧に反映' : 'ファイルを選択'}
            </button>
          </div>
        </div>

        {/* 裏数字読込セクション */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
             onClick={() => alert('手動入力（見積 / EDPS / 裏数字）を選択して反映します')}
             style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #f08c00', backgroundColor: 'white', color: '#f08c00', fontSize: '13px', fontWeight: '950', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
             <Icons.Edit size={14} /> 直接入力（選択式）
          </button>
          <div className="glass-card" style={{ padding: '32px', backgroundColor: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
            <IconWrapper size={48} color="#fff9db" iconColor="#f08c00" style={{ margin: '0 auto 20px' }}>
              <Icons.Chart />
            </IconWrapper>
            <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', marginBottom: '8px' }}>裏数字読込</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>営業進行（見込）データをアップロード</p>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', justifyContent: 'center' }}>
               {['D', 'H'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setSourceSettings({...sourceSettings, internal: opt})}
                    style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid', borderColor: sourceSettings.internal === opt ? '#f08c00' : '#e2e8f0', backgroundColor: sourceSettings.internal === opt ? '#fff9db' : 'white', color: sourceSettings.internal === opt ? '#f08c00' : '#64748b', fontSize: '11px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
                  >{opt}</button>
               ))}
            </div>
            <button 
              onClick={() => handleFileUpload('internal')}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px dashed #cbd5e1', backgroundColor: uploadStates.internal ? '#ebfbee' : '#f8fafc', color: uploadStates.internal ? '#087f5b' : '#64748b', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {uploadStates.internal ? '一覧に反映' : 'ファイルを選択'}
            </button>
          </div>
        </div>

      </div>

      {/* 下段：売上データ一覧 */}
      <div className="glass-card" style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
            <tr>
              <th style={{ padding: '20px 24px', width: '4%' }}><input type="checkbox" style={{ cursor: 'pointer' }} /></th>
              <th style={{ padding: '20px 10px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '6%' }}>ソース</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '22%' }}>SP / AG / 案件名</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '12%' }}>期間</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '12%' }}>自社発注額</th>
              <th style={{ padding: '15px 12px', width: '22%' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase' }}>エリア裏局</div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '9px', color: '#94a3b8', fontWeight: '900' }}>
                       {competitorNetworks.map(net => <span key={net} style={{ flex: 1 }}>{net}</span>)}
                    </div>
                 </div>
              </th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '10%' }}>エリア投下</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '7%' }}>担当者</th>
              <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', width: '5%', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {revenueData.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="hover-row">
                <td style={{ padding: '20px 24px' }}><input type="checkbox" checked={item.selected} style={{ cursor: 'pointer', readOnly: true }} /></td>
                <td style={{ padding: '20px 10px', verticalAlign: 'middle' }}>
                   <div style={{ 
                      display: 'inline-flex', padding: '3px 6px', borderRadius: '4px',
                      fontSize: '9px', fontWeight: '950',
                      backgroundColor: item.source === '見積' ? '#eef2ff' : (item.source === 'EDPS' ? '#ebfbee' : '#fff9db'),
                      color: item.source === '見積' ? '#4338ca' : (item.source === 'EDPS' ? '#087f5b' : '#f08c00'),
                      border: `1px solid ${item.source === '見積' ? '#c3dafe' : (item.source === 'EDPS' ? '#b2f2bb' : '#ffe066')}`
                   }}>
                      {item.source}
                   </div>
                </td>
                <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800' }}>{item.sp} / {item.ag}</div>
                      <div style={{ fontWeight: '950', color: '#1e293b', fontSize: '13px', lineHeight: '1.4' }}>{item.project}</div>
                   </div>
                </td>
                <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                   <div style={{ fontWeight: '900', color: '#475569', fontSize: '11px', lineHeight: '1.4', wordBreak: 'break-all' }}>{item.period}</div>
                </td>
                <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '950', color: '#1e293b' }}>¥{item.amount.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#4338ca', fontWeight: '950', backgroundColor: '#eef2ff', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                         {((item.amount / item.areaTotal) * 100).toFixed(1)}%
                      </div>
                   </div>
                </td>
                <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      {competitorNetworks.map(net => (
                         <div key={net} style={{ flex: 1, textAlign: 'center' }}>
                            {item.networkAmounts[net] > 0 ? (
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: '950', color: '#6366f1', backgroundColor: '#eef2ff', padding: '3px 0', borderRadius: '4px', margin: '0 4px' }}>
                                     ¥{(item.networkAmounts[net] / 1000000).toFixed(1)}M
                                  </div>
                                  <div style={{ fontSize: '9px', fontWeight: '900', color: '#64748b' }}>
                                     {((item.networkAmounts[net] / item.areaTotal) * 100).toFixed(1)}%
                                  </div>
                               </div>
                            ) : (
                               <div style={{ fontSize: '11px', color: '#cbd5e1' }}>-</div>
                            )}
                         </div>
                      ))}
                   </div>
                </td>
                <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                   <div style={{ fontSize: '14px', fontWeight: '950', color: '#4338ca' }}>¥{item.areaTotal.toLocaleString()}</div>
                </td>
                <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                   <div style={{ fontSize: '12px', fontWeight: '900', color: '#475569', whiteSpace: 'nowrap' }}>{item.manager}</div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'center', verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', color: '#94a3b8' }}>
                      <Icons.Edit size={16} style={{ cursor: 'pointer' }} onClick={() => handleEdit(item)} title="概要を編集" />
                      <Icons.History size={16} style={{ cursor: 'pointer' }} onClick={() => handleHistory(item)} title="履歴を表示" />
                      <Icons.Trash size={16} style={{ cursor: 'pointer' }} onClick={() => handleDelete(item.id)} title="削除" />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default RevenueView;
