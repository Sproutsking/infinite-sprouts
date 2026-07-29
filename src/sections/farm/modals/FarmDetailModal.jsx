import React, { useState } from 'react';
import I from '../../../icons/icons.jsx';
import { Modal, Av, ProgBar } from '../../../components/index.jsx';
import { fmt, pct } from '../../../utils/helpers.js';

function FarmDetailModal({farm,onClose,onInvest}){
  if(!farm) return null;
  const sp=Math.round(farm.goal/farm.shares);
  const avail=farm.goal-farm.funded;
  const pctFunded=pct(farm.funded,farm.goal);
  return(
    <Modal open={!!farm} onClose={onClose} title="Farm Details" wide sheet
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p btn-lg" onClick={onInvest}><I.Rocket/>Invest Now</button></>}>
      <div style={{background:"linear-gradient(135deg,var(--g800),var(--g550))",borderRadius:"var(--r16)",padding:18,color:"#fff",marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{fontSize:46,marginBottom:8}}>{farm.icon}</div>
        <div style={{fontFamily:"var(--fd)",fontWeight:900,fontSize:18,marginBottom:2}}>{farm.name}</div>
        <div style={{fontSize:12,opacity:.75,marginBottom:14}}>{farm.location}</div>
        <span className="badge b-g" style={{position:"absolute",top:14,right:14}}>{farm.roi}% ROI</span>
      </div>
      <div className="form-row" style={{marginBottom:14}}>
        {[["Crop Type",farm.crop],["Timeline",farm.timeline+" months"],["Share Price",sp+" IST"],["Available",fmt(avail)+" IST"]].map(([k,v])=>(
          <div key={k} style={{background:"var(--sf3)",padding:"10px 12px",borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
            <div style={{fontSize:9.5,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
            <div style={{fontSize:12.5,fontWeight:600,color:"var(--t1)",textTransform:"capitalize"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:14}}>
        <ProgBar value={farm.funded} max={farm.goal}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div className="stat-tile"><div className="stat-ico"><I.Users/></div><div className="stat-v">{Math.round(farm.sold/10)}</div><div className="stat-l">Investors</div></div>
        <div className="stat-tile"><div className="stat-ico"><I.TrendUp/></div><div className="stat-v">{pctFunded}%</div><div className="stat-l">Funded</div></div>
      </div>
      <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.65,background:"var(--sf3)",padding:13,borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
        This farm is funded through Infinite Sprouts' IST token system. Investors receive proportional shares of harvest proceeds based on capital contributed. Funds are held in escrow and released to the farm operator in milestone-based tranches, verified by on-the-ground field agents.
      </div>
    </Modal>
  );
}
/* ============================================================
   LINK SECTION
   ============================================================ */
/* ============================================================
   PROFILE POPOVER — DM / Follow / See Profile
   ============================================================ */

export default FarmDetailModal;
