import React from 'react';

const RoleIcon = ({ fullProfile, role, showLabel = false }) => {
  const actualRole = fullProfile?.role || role;
  
  let iconText = '??';
  let labelText = '';
  let bgColor = '#e2e8f0';
  let textColor = '#475569';

  if (actualRole === 'agency') {
    iconText = 'Ag';
    labelText = '代理店';
    bgColor = '#e0f2fe';
    textColor = '#0284c7';
  } else if (actualRole === 'broadcaster' || actualRole === 'station') {
    iconText = 'Bc';
    labelText = '放送局';
    bgColor = '#fce7f3';
    textColor = '#db2777';
  } else if (actualRole === 'admin') {
    iconText = 'Ad';
    labelText = '管理者';
    bgColor = '#fef3c7';
    textColor = '#d97706';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px', borderRadius: '50%',
        backgroundColor: bgColor, color: textColor, fontWeight: 'bold', fontSize: '14px'
      }}>
        {iconText}
      </div>
      {showLabel && <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>({labelText})</span>}
    </div>
  );
};

export default RoleIcon;
