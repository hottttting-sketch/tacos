import React, { useState } from 'react';
import { Icons } from './IconLibrary';

const UrlRevisionsDemo = () => {
  const [stationName] = useState('札幌テレビ');
  
  // ダミーデータ
  const memo = "素材搬入日の調整をお願いします。\n15秒版の枠を増やしました。\nまた、該当箇所の表現について確認をお願いいたします。";
  const annotations = [
    { id: 1, type: 'rect', x: 20, y: 30, width: 250, height: 120, color: '#e11d48' },
    { id: 2, type: 'text', x: 20, y: 15, text: 'この部分の修正をお願いします', color: '#e11d48', fontSize: 18 },
    { id: 3, type: 'arrow', x: 400, y: 300, rotation: 45, fontSize: 32, color: '#0ea5e9' },
    { id: 4, type: 'text', x: 440, y: 320, text: '差し替え候補', color: '#0ea5e9', fontSize: 18 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', backgroundColor: 'rgba(15, 23, 42, 0.95)', overflow: 'hidden', borderRadius: '24px', position: 'relative' }}>
      
      {/* ヘッダー */}
      <header style={{ padding: '20px 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--tacos-red)', color: 'white', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Edit size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '950', color: '#1e293b' }}>書き込み改案の確認 : {stationName}</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>代理店からの指示内容や改案依頼を確認します</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ height: '40px', padding: '0 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '950', backgroundColor: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>閉じる</button>
        </div>
      </header>
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* メインビューアー（左側） */}
        <div style={{ flex: 1, backgroundColor: '#334155', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px', overflow: 'auto' }}>
          
          <div style={{ 
            width: '100%', maxWidth: '850px', height: '1200px', backgroundColor: 'white', position: 'relative', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden'
          }}>
            {/* プレースホルダー背景（提案書風の装飾） */}
            <div style={{ position: 'absolute', inset: 0, padding: '40px', opacity: 0.1, backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* 提案書ダミーコンテンツ */}
            <div style={{ position: 'absolute', top: '80px', left: '10%', right: '10%', padding: '40px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px', height: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.FileText size={64} color="#94a3b8" />
              <h2 style={{ marginTop: '24px', color: '#475569', fontSize: '24px', fontWeight: '900' }}>サマーキャンペーン企画書 v2</h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '800' }}>プレビュー用のダミーファイルです</p>
            </div>

            {/* アノテーションの描画 */}
            {annotations.map((ann) => {
              if (ann.type === 'rect') {
                return (
                  <div key={ann.id} style={{
                    position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`, 
                    width: `${ann.width}px`, height: `${ann.height}px`,
                    border: `4px solid ${ann.color}`, backgroundColor: `${ann.color}20`,
                    borderRadius: '8px', pointerEvents: 'none', zIndex: 10
                  }} />
                );
              }
              if (ann.type === 'text') {
                return (
                  <div key={ann.id} style={{
                    position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`,
                    color: ann.color, fontSize: `${ann.fontSize}px`, fontWeight: '950',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 2px white', pointerEvents: 'none', zIndex: 10
                  }}>
                    {ann.text}
                  </div>
                );
              }
              if (ann.type === 'arrow') {
                return (
                  <div key={ann.id} style={{
                    position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`,
                    color: ann.color, fontSize: `${ann.fontSize}px`, transform: `rotate(${ann.rotation}deg)`,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 10
                  }}>
                    ➔
                  </div>
                );
              }
              return null;
            })}
          </div>

        </div>

        {/* サイドバー（右側） */}
        <div style={{ width: '400px', borderLeft: '1.5px solid #cbd5e1', backgroundColor: 'white', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.FileText size={18} color="var(--tacos-red)" />
              修正依頼内容メモ
            </h4>
            <textarea
              readOnly={true}
              style={{ 
                width: '100%', height: '180px', padding: '20px', borderRadius: '16px', 
                border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '800', lineHeight: '1.6', 
                color: '#334155', outline: 'none', resize: 'none', backgroundColor: '#f8fafc',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
              value={memo}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '950', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Edit size={18} color="var(--tacos-red)" />
              配置済みのアノテーション
            </h4>
            
            <div style={{ 
              flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc', borderRadius: '16px', 
              border: '1.5px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' 
            }}>
              {annotations.map((ann) => (
                <div key={ann.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                  backgroundColor: 'white', borderRadius: '12px', border: `1.5px solid ${ann.color}40`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: ann.color }} />
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#475569', textTransform: 'uppercase' }}>
                    {ann.type === 'rect' ? '枠線（矩形）' : ann.type === 'text' ? 'テキストメモ' : '矢印'}
                  </span>
                  {ann.text && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', marginLeft: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                      "{ann.text}"
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1.5px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
              Powered by タコス (TV Planning Linker)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlRevisionsDemo;
