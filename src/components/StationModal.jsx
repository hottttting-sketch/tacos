import React, { useState, useEffect } from 'react';
import { Icons } from './IconLibrary';

const NETWORKS = ["N系", "J系", "CX系", "EX系", "TX系", "独"];

// 都道府県別の系列局マッピング例
const STATION_GRID_DATA = {
  "北海道": { "N系": "札幌テレビ", "J系": "北海道放送", "CX系": "北海道文化放送", "EX系": "北海道テレビ", "TX系": "テレビ北海道" },
  "青森": { "N系": "青森放送", "J系": "青森テレビ", "EX系": "青森朝日放送" },
  "岩手": { "N系": "テレビ岩手", "J系": "岩手放送", "CX系": "岩手めんこいテレビ", "EX系": "岩手朝日テレビ" },
  "宮城": { "N系": "ミヤギテレビ", "J系": "東北放送", "CX系": "仙台放送", "EX系": "東日本放送" },
  "秋田": { "N系": "秋田放送", "CX系": "秋田テレビ", "EX系": "秋田朝日放送" },
  "山形": { "N系": "山形放送", "J系": "テレビユー山形", "CX系": "さくらんぼテレビ", "EX系": "山形テレビ" },
  "福島": { "N系": "福島中央テレビ", "J系": "テレビユー福島", "CX系": "福島テレビ", "EX系": "福島放送" },
  "東京": { "N系": "日本テレビ", "J系": "TBS", "CX系": "フジテレビ", "EX系": "テレビ朝日", "TX系": "テレビ東京", "独": "TOKYO MX" },
  "神奈川": { "独": "テレビ神奈川" },
  "埼玉": { "独": "テレビ埼玉" },
  "千葉": { "独": "千葉テレビ" },
  "茨城": {}, "栃木": { "独": "とちぎテレビ" }, "群馬": { "独": "群馬テレビ" },
  "山梨": { "N系": "山梨放送", "J系": "テレビ山梨" },
  "新潟": { "N系": "テレビ新潟", "J系": "新潟放送", "CX系": "新潟総合テレビ", "EX系": "新潟テレビ21" },
  "長野": { "N系": "テレビ信州", "J系": "信越放送", "CX系": "長野放送", "EX系": "長野朝日放送" },
  "静岡": { "N系": "静岡第一テレビ", "J系": "静岡放送", "CX系": "テレビ静岡", "EX系": "静岡朝日テレビ" },
  "富山": { "N系": "北日本放送", "J系": "チューリップテレビ", "CX系": "富山テレビ" },
  "石川": { "N系": "テレビ金沢", "J系": "北陸放送", "CX系": "石川テレビ", "EX系": "北陸朝日放送" },
  "福井": { "N系": "福井放送", "CX系": "福井テレビ" },
  "愛知": { "N系": "中京テレビ", "J系": "CBCテレビ", "CX系": "東海テレビ", "EX系": "名古屋テレビ", "TX系": "テレビ愛知" },
  "岐阜": { "独": "岐阜放送" },
  "三重": { "独": "三重テレビ" },
  "大阪": { "N系": "読売テレビ", "J系": "毎日放送", "CX系": "関西テレビ", "EX系": "朝日放送テレビ", "TX系": "テレビ大阪" },
  "兵庫": { "独": "サンテレビ" },
  "京都": { "独": "KBS京都" },
  "滋賀": { "独": "びわ湖放送" },
  "奈良": { "独": "奈良テレビ" },
  "和歌山": { "独": "テレビ和歌山" },
  "広島": { "N系": "広島テレビ", "J系": "中国放送", "CX系": "テレビ新広島", "EX系": "広島ホームテレビ" },
  "岡山": { "N系": "西日本放送", "J系": "RSK山陽放送", "CX系": "岡山放送", "EX系": "瀬戸内海放送", "TX系": "テレビせとうち" },
  "香川": { "N系": "西日本放送", "J系": "RSK山陽放送", "CX系": "岡山放送", "EX系": "瀬戸内海放送", "TX系": "テレビせとうち" },
  "徳島": { "N系": "四国放送" },
  "愛媛": { "N系": "南海放送", "J系": "あいテレビ", "CX系": "テレビ愛媛", "EX系": "愛媛朝日テレビ" },
  "高知": { "N系": "高知放送", "J系": "テレビ高知", "CX系": "高知さんさんテレビ" },
  "鳥取": { "N系": "日本海テレビ", "J系": "山陰放送", "CX系": "山陰中央テレビ" },
  "島根": { "N系": "日本海テレビ", "J系": "山陰放送", "CX系": "山陰中央テレビ" },
  "山口": { "N系": "山口放送", "J系": "テレビ山口", "EX系": "山口朝日放送" },
  "福岡": { "N系": "福岡放送", "J系": "RKB毎日放送", "CX系": "テレビ西日本", "EX系": "九州朝日放送", "TX系": "TVQ九州放送" },
  "佐賀": { "CX系": "サガテレビ" },
  "長崎": { "N系": "長崎国際テレビ", "J系": "長崎放送", "CX系": "テレビ長崎", "EX系": "長崎文化放送" },
  "熊本": { "N系": "くまもと県民テレビ", "J系": "熊本放送", "CX系": "テレビ熊本", "EX系": "熊本朝日放送" },
  "大分": { "N系": "テレビ大分", "J系": "大分放送", "EX系": "大分朝日放送" },
  "宮崎": { "N系": "テレビ宮崎", "J系": "宮崎放送" },
  "鹿児島": { "N系": "鹿児島読売テレビ", "J系": "南日本放送", "CX系": "鹿児島テレビ", "EX系": "鹿児島放送" },
  "沖縄": { "J系": "琉球放送", "CX系": "沖縄テレビ", "EX系": "琉球朝日放送" }
};

const StationModal = ({ isOpen, onClose, onSave, selectedAreas = [], initialStations = [] }) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (initialStations && initialStations.length > 0) {
        setSelected(initialStations);
      } else {
        // デフォルトで全選択（選択されたエリア内の局）
        const auto = [];
        selectedAreas.forEach(area => {
          const areaStations = STATION_GRID_DATA[area] || {};
          Object.values(areaStations).forEach(s => {
            if (!auto.includes(s)) auto.push(s);
          });
        });
        setSelected(auto);
      }
    }
  }, [isOpen, initialStations, selectedAreas]);

  if (!isOpen) return null;

  const toggleStation = (station) => {
    setSelected(prev => prev.includes(station) ? prev.filter(s => s !== station) : [...prev, station]);
  };

  const handleSelectArea = (area) => {
    const areaStations = Object.values(STATION_GRID_DATA[area] || {});
    const allSelected = areaStations.every(s => selected.includes(s));
    if (allSelected) {
      setSelected(prev => prev.filter(s => !areaStations.includes(s)));
    } else {
      setSelected(prev => [...new Set([...prev, ...areaStations])]);
    }
  };

  const handleSelectNetwork = (net) => {
    const netStations = selectedAreas.map(area => STATION_GRID_DATA[area]?.[net]).filter(Boolean);
    const allSelected = netStations.every(s => selected.includes(s));
    if (allSelected) {
      setSelected(prev => prev.filter(s => !netStations.includes(s)));
    } else {
      setSelected(prev => [...new Set([...prev, ...netStations])]);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
       <div className="animate-pop" style={{ backgroundColor: 'white', width: '95%', maxWidth: '1100px', height: '90vh', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '8px', backgroundColor: 'rgba(230,0,18,0.1)', borderRadius: '12px', color: 'var(--tacos-red)' }}>
                      <Icons.Tv size={24} />
                   </div>
                   依頼局の設定
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>選択地域（{selectedAreas.length}エリア）の放送局を系列ごとに選択してください。</p>
             </div>
             <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>×</button>
          </div>
          
          <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
             <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                   <tr>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#64748b', fontSize: '0.8rem', fontWeight: '900', width: '120px' }}>エリア</th>
                      {NETWORKS.map(net => (
                         <th key={net} style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '900', marginBottom: '8px' }}>{net}</div>
                            <button 
                               onClick={() => handleSelectNetwork(net)}
                               style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #e1e4e8', background: 'white', fontSize: '10px', fontWeight: '800', cursor: 'pointer', color: '#0ea5e9' }}
                            >
                               一括
                            </button>
                         </th>
                      ))}
                      <th style={{ width: '80px' }}></th>
                   </tr>
                </thead>
                <tbody>
                   {(selectedAreas.length > 0 ? selectedAreas : Object.keys(STATION_GRID_DATA)).map(area => (
                      <tr key={area}>
                         <td style={{ padding: '12px', fontWeight: '900', color: '#1e293b', backgroundColor: '#f8fafc', borderRadius: '12px 0 0 12px' }}>{area}</td>
                         {NETWORKS.map(net => {
                            const station = STATION_GRID_DATA[area]?.[net];
                            const isSelected = station && selected.includes(station);
                            return (
                               <td key={net} style={{ padding: '8px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                                  {station ? (
                                     <div 
                                        onClick={() => toggleStation(station)}
                                        style={{ 
                                           padding: '10px 4px', borderRadius: '10px', border: '2px solid',
                                           borderColor: isSelected ? 'var(--tacos-red)' : 'white',
                                           backgroundColor: isSelected ? 'white' : 'white',
                                           color: isSelected ? 'var(--tacos-red)' : '#64748b',
                                           cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.75rem', fontWeight: isSelected ? '900' : '600',
                                           boxShadow: isSelected ? '0 4px 8px rgba(230,0,18,0.1)' : 'none'
                                        }}
                                     >
                                        {station}
                                     </div>
                                  ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                               </td>
                            );
                         })}
                         <td style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '0 12px 12px 0', textAlign: 'center' }}>
                            <button 
                               onClick={() => handleSelectArea(area)}
                               style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', color: '#448aff', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                            >
                               全選択
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div style={{ padding: '24px 32px', backgroundColor: '#fcfdfe', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '800' }}>
                設定局: <span style={{ color: 'var(--tacos-red)', fontSize: '1.3rem', fontWeight: '900' }}>{selected.length}</span> 局
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '800' }}>キャンセル</button>
                <button className="btn-primary" onClick={() => { onSave(selected); onClose(); alert('放送局に送信しました'); }} style={{ padding: '12px 48px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 8px 20px rgba(230, 0, 18, 0.2)' }}>
                   選択を確定して送信
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default StationModal;
