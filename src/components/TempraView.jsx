import React from 'react';
import { Calendar, Monitor, Users, ExternalLink } from 'lucide-react';

const TempraView = () => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <iframe 
        src="https://tempra.tempra-sv.com/login" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Tempra Screen"
      />
    </div>
  );
};

export default TempraView;
