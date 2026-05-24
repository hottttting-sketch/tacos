import React from 'react';
import { Icons } from './IconLibrary';

const UrlOrdersDemo = () => {
  // ダミーデータ（発注書情報）
  const orderData = {
    id: '20260504001',
    date: '2026年5月4日',
    station: '札幌テレビ',
    agency: '大手広告代理店',
    contact: '高橋',
    sponsor: '株式会社サンプル',
    name: '新商品サマーキャンペーン',
    startDate: '2026/07/01',
    endDate: '2026/08/31',
    deadline: '2026/05/20',
    orderAmount: '2,000,000',
    orderCost: '2,000,000 円',
    orderPrp: '100 PRP',
    servicePrp: '10 PRP',
    seconds: '15秒',
    indices: ['F1', 'F2'],
    periodRatio: '100%',
    remarks: '特記事項なし'
  };

  const handleDownload = () => {
    alert('PDFとしてダウンロードします（プレビュー用動作）');
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* ヘッダーエリア */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#1e293b', margin: 0 }}>発注書プレビュー</h2>
              <span style={{ fontSize: '11px', fontWeight: '900', color: 'white', backgroundColor: '#94a3b8', padding: '4px 10px', borderRadius: '8px' }}>プレビュー</span>
            </div>
            <p style={{ color: '#64748b', marginTop: '6px', fontSize: '15px', margin: 0 }}>代理店から送付される発注書のイメージ</p>
          </div>
          <button 
            onClick={handleDownload}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', 
              border: 'none', backgroundColor: 'var(--tacos-red)', color: 'white', 
              fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(230,0,18,0.2)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Icons.Download size={18} />
            発注書DL
          </button>
        </header>

        {/* 用紙レイアウト（A4風） */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0', 
          padding: '60px', 
          color: '#1e293b', 
          fontFamily: '"Noto Sans JP", sans-serif', 
          fontSize: '14px', 
          lineHeight: '1.6',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
          
          {/* No and Date */}
          <div style={{ textAlign: 'right', fontSize: '14px', marginBottom: '20px' }}>
            <div>No. {orderData.id}</div>
            <div>発注日：{orderData.date}</div>
          </div>

          {/* Title */}
          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 0 30px 0', letterSpacing: '8px' }}>発 注 書</h1>
          <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{orderData.station} 御中</h2>

          {/* Left greeting & right addressee details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '15px' }}>下記のとおり、発注致します。</div>
            </div>
            <div style={{ textAlign: 'left', fontSize: '15px', width: '220px' }}>
              <div>社名：{orderData.agency}</div>
              <div>〒 105-7001</div>
              <div>住所：東京都港区東新橋</div>
              <div>担当：{orderData.contact}</div>
            </div>
          </div>

          {/* Main 2-column Layout for tables */}
          <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', alignItems: 'flex-start' }}>
            {/* Left block (Info grid) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #1e293b' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '120px', backgroundColor: '#334155', color: '#ffffff', padding: '12px', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #1e293b' }}>スポンサー名</td>
                    <td style={{ padding: '12px', border: '1.5px solid #1e293b', fontSize: '14px' }}>{orderData.sponsor}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#334155', color: '#ffffff', padding: '12px', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #1e293b' }}>案件名</td>
                    <td style={{ padding: '12px', border: '1.5px solid #1e293b', fontSize: '14px', fontWeight: 'bold' }}>{orderData.name}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#334155', color: '#ffffff', padding: '12px', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #1e293b' }}>放送期間</td>
                    <td style={{ padding: '12px', border: '1.5px solid #1e293b', fontSize: '14px' }}>{orderData.startDate} 〜 {orderData.endDate}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#334155', color: '#ffffff', padding: '12px', fontWeight: 'bold', fontSize: '14px', border: '1.5px solid #1e293b' }}>初案〆切</td>
                    <td style={{ padding: '12px', border: '1.5px solid #1e293b', fontSize: '14px', color: '#dc2626', fontWeight: 'bold' }}>{orderData.deadline}</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Amount Box */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #1e293b' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '120px', backgroundColor: '#334155', color: '#ffffff', padding: '16px 12px', fontWeight: 'bold', fontSize: '15px', border: '1.5px solid #1e293b', textAlign: 'center' }}>発注金額</td>
                    <td style={{ padding: '16px 12px', border: '1.5px solid #1e293b', fontSize: '20px', fontWeight: 'bold', textAlign: 'right' }}>
                      {orderData.orderAmount} 円（税別）
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right block: Order Conditions Table */}
            <div style={{ flex: 1.1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #1e293b' }}>
                <thead>
                  <tr style={{ backgroundColor: '#334155', color: '#ffffff' }}>
                    <th style={{ width: '140px', padding: '10px', fontSize: '14px', border: '1.5px solid #1e293b', textAlign: 'center' }}>発注項目</th>
                    <th style={{ padding: '10px', fontSize: '14px', border: '1.5px solid #1e293b', textAlign: 'center' }}>適用条件</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const baseRows = [
                      { lbl: '発注コスト', val: orderData.orderCost },
                      { lbl: '発注PRP', val: orderData.orderPrp },
                      { lbl: 'サービスPRP', val: orderData.servicePrp },
                      { lbl: '秒数', val: orderData.seconds }
                    ];
                    
                    const finalRows = [...baseRows];
                    orderData.indices.forEach(idx => {
                      finalRows.push({ lbl: idx, val: 'N％' });
                    });

                    while (finalRows.length < 8) {
                      finalRows.push({ lbl: '', val: '' });
                    }
                    return finalRows.map((row, idx) => (
                      <tr key={idx} style={{ height: '40px' }}>
                        <td style={{ padding: '10px', border: '1.5px solid #1e293b', fontSize: '14px', fontWeight: 'bold', backgroundColor: row.lbl ? '#f8fafc' : '#ffffff' }}>{row.lbl}</td>
                        <td style={{ padding: '10px', border: '1.5px solid #1e293b', fontSize: '14px', textAlign: 'center' }}>{row.val}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom section (Remarks) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #1e293b' }}>
            <thead>
              <tr style={{ backgroundColor: '#334155', color: '#ffffff' }}>
                <th style={{ padding: '10px', fontSize: '14px', border: '1.5px solid #1e293b', textAlign: 'center' }}>備考</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: '120px' }}>
                <td style={{ padding: '16px', border: '1.5px solid #1e293b', fontSize: '14px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>期間比：{orderData.periodRatio}</div>
                  <div style={{ color: '#475569' }}>{orderData.remarks}</div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
        
        <footer style={{ marginTop: '40px', textAlign: 'center', paddingBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
            Powered by タコス (TV Planning Linker)
          </div>
        </footer>

      </div>
    </div>
  );
};

export default UrlOrdersDemo;
