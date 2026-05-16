import React, { useState } from 'react';
import { Download, Upload, FileText, Check, AlertCircle, Sparkles, ChevronRight, Play } from 'lucide-react';

const Icons = { Download, Upload, FileText, Check, AlertCircle, Sparkles, ChevronRight, Play };

const UrlMaterialRewriteDemo = () => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [rewriteResult, setRewriteResult] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleAiRewrite = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setRewriteResult('【リライト案】\n本日はサントリーのザ・プレミアム・モルツをご紹介します。今回の夏キャンペーンでは、清涼感あふれるパッケージデザインを一新。最高級の原料とこだわりの製法が生み出す、深いコクと華やかな香りをぜひお楽しみください。');
      setIsAiProcessing(false);
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#fdfbf7', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <header style={{ marginBottom: '32px', backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(62,39,35,0.05)', border: '1.5px solid #F1E4C9' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                 <div style={{ fontSize: '12px', fontWeight: '950', color: '#8B4513', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Production & Rewrite</div>
                 <h1 style={{ fontSize: '2rem', fontWeight: '950', color: '#3E2723', margin: 0 }}>素材ダウンロード・リライト</h1>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', padding: '12px 24px', borderRadius: '14px', border: '1.5px solid #dcfce7' }}>
                 <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '950' }}>ステータス</div>
                 <div style={{ fontSize: '15px', color: '#16a34a', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icons.Check size={16} /> 素材受領済み
                 </div>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '24px', backgroundColor: '#fcfcfd', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div>
                 <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '4px' }}>スポンサー</label>
                 <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>株式会社サントリーホールディングス</div>
              </div>
              <div>
                 <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '4px' }}>案件名</label>
                 <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>ザ・プレミアム・モルツ 2026夏キャンペーン</div>
              </div>
              <div>
                 <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '950', display: 'block', marginBottom: '4px' }}>リライト〆切</label>
                 <div style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>2026年5月30日(土) 18:00</div>
              </div>
           </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
           
           {/* Left: Material Download & AI Rewrite */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Material Download Card */}
              <section style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(62,39,35,0.05)', border: '1.5px solid #F1E4C9' }}>
                 <h2 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#3E2723', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icons.Download size={20} color="#8B4513" /> 元素材ダウンロード
                 </h2>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                       { name: 'キャンペーン実施概要.pdf', size: '1.2MB' },
                       { name: '商品紹介原稿_初案.docx', size: '450KB' }
                    ].map((file, idx) => (
                       <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fcfcfd', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <div style={{ backgroundColor: '#edf2ff', padding: '8px', borderRadius: '10px' }}>
                                <Icons.FileText size={18} color="#3b82f6" />
                             </div>
                             <div>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{file.name}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{file.size}</div>
                             </div>
                          </div>
                          <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                             <Icons.Download size={18} />
                          </button>
                       </div>
                    ))}
                 </div>
              </section>

              {/* AI Rewrite Tool Card */}
              <section style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(62,39,35,0.05)', border: '1.5px solid #F1E4C9', background: 'linear-gradient(to bottom right, white, #fffcf0)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#3E2723', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <Icons.Sparkles size={20} color="#f59e0b" /> AIリライト案の生成
                    </h2>
                    <span style={{ fontSize: '10px', backgroundColor: '#fff7ed', color: '#f97316', padding: '4px 8px', borderRadius: '8px', fontWeight: '900', border: '1px solid #ffedd5' }}>Beta</span>
                 </div>
                 <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
                    元原稿をベースに、放送局のトーン＆マナーに合わせたリライト案をAIが生成します。
                 </p>
                 <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '950', color: '#8B4513', display: 'block', marginBottom: '8px' }}>生成モデルの選択</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #F1E4C9', fontSize: '13px', fontWeight: '700', outline: 'none', backgroundColor: 'white' }}>
                       <option>Claude 3.5 Sonnet (推奨)</option>
                       <option>GPT-4o</option>
                       <option>Gemini 1.5 Pro</option>
                    </select>
                 </div>
                 <button 
                    onClick={handleAiRewrite}
                    disabled={isAiProcessing}
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: isAiProcessing ? '#e2e8f0' : '#f59e0b', color: 'white', border: 'none', fontWeight: '950', cursor: isAiProcessing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                 >
                    {isAiProcessing ? (
                       <>生成中...</>
                    ) : (
                       <><Icons.Play size={16} fill="currentColor" /> リライト案を生成する</>
                    )}
                 </button>
                 
                 {rewriteResult && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fcfcfd', borderRadius: '14px', border: '1.5px dashed #f59e0b', animation: 'fadeIn 0.5s ease' }}>
                       <div style={{ fontSize: '12px', color: '#3E2723', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {rewriteResult}
                       </div>
                    </div>
                 )}
              </section>
           </div>

           {/* Right: Rewrite Upload */}
           <section style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(62,39,35,0.05)', border: '1.5px solid #F1E4C9', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#3E2723', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <Icons.Upload size={24} color="#8B4513" /> リライト稿のアップロード
              </h2>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div 
                    onClick={() => document.getElementById('rewrite-upload').click()}
                    style={{ flex: 1, border: '2px dashed #F1E4C9', borderRadius: '20px', backgroundColor: '#fffcf7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff9eb'; e.currentTarget.style.borderColor = '#FFD93D'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fffcf7'; e.currentTarget.style.borderColor = '#F1E4C9'; }}
                 >
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                       <Icons.Upload size={32} color="#8B4513" />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '950', color: '#3E2723', marginBottom: '8px' }}>ファイルを選択またはドラッグ</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Word, PDF, テキスト形式 (最大20MB)</div>
                    <input type="file" id="rewrite-upload" style={{ display: 'none' }} onChange={handleFileUpload} />
                 </div>

                 {uploadedFile && (
                    <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1.5px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <Icons.Check size={20} color="#16a34a" />
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '950', color: '#16a34a' }}>アップロード準備完了</div>
                          <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700' }}>{uploadedFile}</div>
                       </div>
                    </div>
                 )}

                 <div style={{ padding: '20px', backgroundColor: '#fcfcfd', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '950', color: '#3E2723', marginBottom: '12px' }}>特記事項・メッセージ</h4>
                    <textarea 
                       placeholder="制作担当者への伝達事項があれば入力してください"
                       style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontWeight: '700', outline: 'none', resize: 'none' }}
                    ></textarea>
                 </div>

                 <button 
                    disabled={!uploadedFile}
                    style={{ padding: '18px', borderRadius: '20px', backgroundColor: !uploadedFile ? '#e2e8f0' : '#3E2723', color: 'white', border: 'none', fontSize: '16px', fontWeight: '950', cursor: !uploadedFile ? 'default' : 'pointer', boxShadow: !uploadedFile ? 'none' : '0 15px 35px rgba(62,39,35,0.15)', transition: 'all 0.2s' }}
                 >
                    リライト稿を確定・送信する
                 </button>
              </div>
           </section>
        </div>

        <footer style={{ marginTop: '40px', textAlign: 'center', paddingBottom: '40px' }}>
           <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
              Powered by ぷりん (TV Pub Linker)
           </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default UrlMaterialRewriteDemo;
