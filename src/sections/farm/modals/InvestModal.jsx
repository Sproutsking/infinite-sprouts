import React, { useState } from 'react';
import I from '../../../icons/icons.jsx';
import { Modal, Av, ProgBar } from '../../../components/index.jsx';
import { fmt, pct } from '../../../utils/helpers.js';

function InvestModal({open,onClose,farm,walletIST,onConfirm}){
  const [amt,setAmt]=useState("");
  if(!open||!farm) return null;
  const sp=Number(farm.price_per_share)||0;
  const goal=Number(farm.goal_amount)||0;
  const funded=Number(farm.funded_amount)||0;
  const totalShares=Number(farm.total_shares)||0;
  const avail=Math.max(0,goal-funded);
  const num=parseFloat(amt)||0;
  const shares=sp>0?Math.floor(num/sp):0;
  const principal=shares*sp;
  const fee=Math.round(principal*0.02);
  const total=principal+fee;
  const own=totalShares>0?((shares/totalShares)*100).toFixed(2):'0.00';
  const ret=Math.round(principal*(Number(farm.expected_roi)||0)/100);
  const maxShares=sp>0?Math.floor(avail/sp):0;
  const ok=shares>0&&principal<=avail&&walletIST>=total;
  return(
    <Modal open={open} onClose={()=>{onClose();setAmt("");}} title={"Invest — "+farm.name} wide
      footer={<><button className="btn btn-g" onClick={()=>{onClose();setAmt("");}}>Cancel</button><button className="btn btn-p btn-lg" disabled={!ok} onClick={()=>{onConfirm(farm,principal,shares,fee);onClose();setAmt("");}}><I.Rocket/>{ok?"Confirm Investment":shares===0?"Enter enough for one share":principal>walletIST?"Insufficient balance":"Check Amount"}</button></>}>
      <div className="flex-columns">
        <div>
          <div className="farm-detail-hero" style={{borderRadius:"var(--r16)",padding:16,color:"#fff",marginBottom:12}}>
            <div style={{fontSize:40,marginBottom:8}}>{farm.icon}</div>
            <div style={{fontFamily:"var(--fd)",fontWeight:900,fontSize:15,marginBottom:2}}>{farm.name}</div>
            <div style={{fontSize:11.5,opacity:.75,marginBottom:12}}>{farm.location||[farm.lga,farm.state].filter(Boolean).join(', ')}</div>
            <div className="flex-pair" style={{gap:7}}>
              {[["ROI",(Number(farm.expected_roi)||0)+"%"],["Timeline",(farm.timeline_months||'—')+"mo"],["Share Price",fmt(sp)+" IST"],["Available",fmt(avail)+" IST"]].map(([l,v])=>(
                <div key={l} style={{background:"rgba(255,255,255,.14)",borderRadius:"var(--r10)",padding:"7px 9px"}}>
                  <div style={{fontSize:9.5,opacity:.7,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <ProgBar value={funded} max={goal}/>
        </div>
        <div>
          <div className="form-g"><label className="label">Amount (IST)</label><input className="field" type="number" min={sp} step={sp||1} max={avail} placeholder={`Minimum ${fmt(sp)} IST`} value={amt} onChange={e=>setAmt(e.target.value)} style={{fontSize:18,fontWeight:800,fontFamily:"var(--fd)"}}/></div>
          <div className="flex-presets">
            {[1,5,10,maxShares].map((units,i)=>(
              <button key={i} className="btn btn-g btn-sm" style={{fontSize:10}} disabled={!sp||units>maxShares} onClick={()=>setAmt(String(units*sp))}>{i===3?"MAX":fmt(units*sp)}</button>
            ))}
          </div>
          <div style={{background:"var(--ac)",borderRadius:"var(--r14)",padding:14,textAlign:"center",marginBottom:12,color:"#fff"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:900}}>{own}%</div>
            <div style={{fontSize:10.5,opacity:.8,textTransform:"uppercase",letterSpacing:".5px"}}>Farm Ownership</div>
          </div>
          <div style={{background:"var(--sf3)",borderRadius:"var(--r12)",padding:"13px 15px",border:"1px solid var(--bd)"}}>
            {[["Shares",shares.toLocaleString()],["Investment",fmt(principal)+" IST"],["Fee (2%)",fmt(fee)+" IST"],["Projected profit","+"+fmt(ret)+" IST"],["Total",fmt(total)+" IST"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:"var(--t4)"}}>{l}</span><span style={{fontWeight:700,color:"var(--t1)"}}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   FARM DETAIL MODAL — centered modal across screen sizes
   ============================================================ */

export default InvestModal;
