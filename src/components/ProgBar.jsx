import React from 'react';
import { fmt, pct } from '../utils/helpers.js';

function ProgBar({value,max}){
  const p=pct(value,max);
  return <div>
    <div className="pi"><span>{fmt(value)} IST raised</span><span style={{fontWeight:700}}>{p}%</span></div>
    <div className="pt"><div className="pf" style={{width:p+"%"}}/></div>
    <div className="pi" style={{marginTop:3}}><span/><span>Goal: {fmt(max)} IST</span></div>
  </div>;
}

export default ProgBar;
