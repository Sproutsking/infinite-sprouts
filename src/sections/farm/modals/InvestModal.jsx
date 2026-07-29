import React, { useState } from 'react';
import I from '../../../icons/icons.jsx';
import { Modal, Av, ProgBar } from '../../../components/index.jsx';
import { fmt, pct } from '../../../utils/helpers.js';

function InvestModal({open,onClose,farm,walletIST,onConfirm}){
  const [amt,setAmt]=useState("");
  if(!open||!farm) return null;
  const sp=Math.round(farm.goal/farm.shares);
  const avail=farm.goal-farm.funded;
  const num=parseFloat(amt)||0;
  const shares=Math.floor(num/sp);
  const fee=Math.round(num*0.02);
  const total=num+fee;
  const own=((shares/farm.shares)*100).toFixed(2);
  const ret=Math.round(num*(farm.roi/100));
  const ok=num>=1000&&num<=avail&&walletIST>=total;
  return(
    <Modal open={open} onClose={()=>{onClose();setAmt("");}} title={"Invest — "+farm.name} wide sheet
      footer={<><button className="btn btn-g" onClick={()=>{onClose();setAmt("");}}>Cancel</button><button className="btn btn-p btn-lg" disabled={!ok} onClick={()=>{onConfirm(farm,num,shares,fee);onClose();setAmt("");}}><I.Rocket/>{ok?"Confirm Investment":num<1000?"Min 1,000 IST":"Check Amount"}</button></>}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div style={{background:"linear-gradient(135deg,var(--g800),var(--g550))",borderRadius:"var(--r16)",padding:16,color:"#fff",marginBottom:12}}>
            <div style={{fontSize:40,marginBottom:8}}>{farm.icon}</div>
            <div style={{fontFamily:"var(--fd)",fontWeight:900,fontSize:15,marginBottom:2}}>{farm.name}</div>
            <div style={{fontSize:11.5,opacity:.75,marginBottom:12}}>{farm.location}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[["ROI",farm.roi+"%"],["Timeline",farm.timeline+"mo"],["Share Price",sp+" IST"],["Available",fmt(avail)+" IST"]].map(([l,v])=>(
                <div key={l} style={{background:"rgba(255,255,255,.14)",borderRadius:"var(--r10)",padding:"7px 9px"}}>
                  <div style={{fontSize:9.5,opacity:.7,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <ProgBar value={farm.funded} max={farm.goal}/>
        </div>
        <div>
          <div className="form-g"><label className="label">Amount (IST)</label><input className="field" type="number" placeholder="Min 1,000" value={amt} onChange={e=>setAmt(e.target.value)} style={{fontSize:18,fontWeight:800,fontFamily:"var(--fd)"}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:12}}>
            {[1000,5000,50000,avail].map((v,i)=>(
              <button key={i} className="btn btn-g btn-sm" style={{fontSize:10}} onClick={()=>setAmt(String(v))}>{i===3?"MAX":fmt(v)}</button>
            ))}
          </div>
          <div style={{background:"var(--ac)",borderRadius:"var(--r14)",padding:14,textAlign:"center",marginBottom:12,color:"#fff"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:900}}>{own}%</div>
            <div style={{fontSize:10.5,opacity:.8,textTransform:"uppercase",letterSpacing:".5px"}}>Farm Ownership</div>
          </div>
          <div style={{background:"var(--sf3)",borderRadius:"var(--r12)",padding:"13px 15px",border:"1px solid var(--bd)"}}>
            {[["Shares",shares.toLocaleString()],["Fee (2%)",fmt(fee)+" IST"],["Expected return","+"+fmt(ret)+" IST"],["Total",fmt(total)+" IST"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:"var(--t4)"}}>{l}</span><span style={{fontWeight:700,color:"var(--t1)"}}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   FARM DETAIL MODAL — modal on PC, full screen sheet on mobile
   ============================================================ */

export default InvestModal;
