import React from 'react';
const MonthModal = (props) => { 
  if(!props.isOpen) return null;
  return <div style={{position:'fixed', top:0, left:0, background:'rgba(0,0,0,0.5)', width:'100%', height:'100%', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center'}}>
    <div style={{background:'white', padding:'2rem', borderRadius:'8px'}}>
      <h3>MonthModal (Recovered Placeholder)</h3>
      <button onClick={props.onClose}>Close</button>
    </div>
  </div>; 
};
export default MonthModal;
