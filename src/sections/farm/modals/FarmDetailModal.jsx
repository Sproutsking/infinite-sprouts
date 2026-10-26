import React, { useEffect, useState } from 'react';
import I from '../../../icons/icons.jsx';
import { Modal, Av } from '../../../components/index.jsx';
import { fmt } from '../../../utils/helpers.js';
import farmService from '../../../services/farmService.js';

function FarmDetailModal({farm,onClose,onInvest,canInvest=true,isOwner=false,farmerId,showToast}){
  const [milestones,setMilestones]=useState([]);
  const [milestoneError,setMilestoneError]=useState('');
  const [reportDrafts,setReportDrafts]=useState({});
  const [submittingMilestone,setSubmittingMilestone]=useState(null);

  useEffect(()=>{
    let cancelled=false;
    async function loadMilestones(){
      setMilestones([]);
      if(!farm?.id) return;
      setMilestoneError('');
      setReportDrafts({});
      try{
        const items=await farmService.getFarmMilestones(farm.id);
        if(!cancelled) setMilestones(items);
      }catch(error){
        console.error('Campaign milestone load error:',error);
        if(!cancelled) setMilestoneError('Campaign schedule is temporarily unavailable.');
      }
    }
    loadMilestones();
    return()=>{cancelled=true;};
  },[farm?.id]);

  if(!farm) return null;
  const goal=Number(farm.goal_amount)||0;
  const shares=Number(farm.total_shares)||0;
  const sp=Number(farm.price_per_share)||0;
  const location=farm.location||[farm.lga,farm.state].filter(Boolean).join(', ');
  const chartColors=['#278548','#6ab877','#e3ad4e','#579c9b','#8b77c4','#d17d62'];
  let releaseStop=0;
  const chartStops=milestones.map((milestone,index)=>{
    const start=releaseStop;
    releaseStop+=Number(milestone.release_percent)||0;
    return `${chartColors[index%chartColors.length]} ${start}% ${releaseStop}%`;
  });
  async function submitMilestone(event,milestone){
    event.preventDefault();
    const draft=reportDrafts[milestone.id]||{};
    setSubmittingMilestone(milestone.id);
    setMilestoneError('');
    try{
      const updated=await farmService.submitFarmMilestone({
        farmId:farm.id,
        milestoneId:milestone.id,
        farmerId,
        update:draft.update||'',
        file:draft.file,
      });
      setMilestones(items=>items.map(item=>item.id===updated.id?updated:item));
      setReportDrafts(items=>({...items,[milestone.id]:{}}));
      showToast?.('ok','Milestone evidence submitted for review.');
    }catch(error){
      console.error('Milestone report submission error:',error);
      setMilestoneError(error.message||'Unable to submit milestone evidence.');
    }finally{
      setSubmittingMilestone(null);
    }
  }
  return(
    <Modal open={!!farm} onClose={onClose} title="Farm Details" wide
      footer={<><button className="btn btn-g" onClick={onClose}>Close</button>{canInvest&&<button className="btn btn-p btn-lg" onClick={onInvest}><I.Rocket/>Invest Now</button>}</>}>
      <div className="farm-detail-hero" style={{borderRadius:"var(--r16)",padding:18,color:"#fff",marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{fontSize:46,marginBottom:8}}>{farm.project_image||farm.icon||'🌾'}</div>
        <div style={{fontFamily:"var(--fd)",fontWeight:900,fontSize:18,marginBottom:2}}>{farm.name}</div>
        <div style={{fontSize:12,opacity:.75,marginBottom:14}}>{location}</div>
        <span className="badge b-g" style={{position:"absolute",top:14,right:14}}>{Number(farm.return_share_percent)||0}% investor pool</span>
      </div>
      <div className="form-row" style={{marginBottom:14}}>
        {[["Crop Type",farm.crop_type||'—'],["Farm Size",farm.farm_size_hectares?`${farm.farm_size_hectares} hectares`:'—'],["Timeline",(farm.timeline_months||'—')+" months"],["Campaign goal",fmt(goal)+" IST"],["Participation units",fmt(shares)],["Indicative unit value",fmt(sp)+" IST"]].map(([k,v])=>(
          <div key={k} style={{background:"var(--sf3)",padding:"10px 12px",borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
            <div style={{fontSize:9.5,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
            <div style={{fontSize:12.5,fontWeight:600,color:"var(--t1)",textTransform:"capitalize"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:14,background:"var(--blue-l)",border:"1px solid var(--blue-b)",borderRadius:"var(--r10)",padding:11,fontSize:11.5,color:"var(--t2)"}}>
        Funding progress is not shown until Cardano transaction indexing is connected. Values from the legacy app ledger are not on-chain verified.
      </div>
      <div role="note" style={{marginBottom:12,background:"var(--gold-l)",border:"1px solid var(--gold-b)",borderRadius:"var(--r10)",padding:11,fontSize:11.5,color:"var(--t2)"}}>
        Harvest sales are accounted for in Naira, while the selected payout asset is IST. The conversion rate and timing have not been defined; no payout amount is implied or guaranteed.
      </div>
      <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.65,background:"var(--sf3)",padding:13,borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
        {farm.description||'Farm project funding details and harvest information will be provided by the farmer.'}
      </div>
      <div className="form-row" style={{marginTop:12}}>
        <div style={{flex:1,background:"var(--sf3)",padding:12,borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
          <div style={{fontSize:9.5,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Investor pool</div>
          <div style={{fontSize:13,fontWeight:700,color:"var(--t1)"}}>{Number(farm.return_share_percent)||0}% of gross verified harvest sales</div>
          <div style={{fontSize:11,color:"var(--t4)",marginTop:4}}>Payout asset: IST (Cardano; settlement not live)</div>
        </div>
        <div style={{flex:1,background:"var(--sf3)",padding:12,borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
          <div style={{fontSize:9.5,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Funding deadline</div>
          <div style={{fontSize:13,fontWeight:700,color:"var(--t1)"}}>{farm.funding_deadline||'Not set'}</div>
          {Number(farm.expected_roi)>0&&<div style={{fontSize:11,color:"var(--t4)",marginTop:4}}>Forecast scenario: {Number(farm.expected_roi)}% (not guaranteed)</div>}
        </div>
      </div>
      <div style={{marginTop:12,background:"var(--sf3)",padding:13,borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
        <div style={{fontSize:10,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Use of funds</div>
        <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.6}}>{farm.use_of_funds||'Not provided'}</div>
      </div>
      <div style={{marginTop:10,background:"var(--gold-l)",padding:13,borderRadius:"var(--r10)",border:"1px solid var(--gold-b)"}}>
        <div style={{fontSize:10,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Campaign risks</div>
        <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.6}}>{farm.risk_disclosure||'Risk disclosure not provided.'}</div>
      </div>
      <div style={{marginTop:14,borderTop:"1px solid var(--bd)",paddingTop:14}}>
        <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:14,color:"var(--t1)",marginBottom:10}}>Milestone release plan</div>
        {milestoneError&&<div role="alert" style={{fontSize:12,color:"var(--red)"}}>{milestoneError}</div>}
        {!milestoneError&&milestones.length===0&&<div style={{fontSize:12,color:"var(--t4)"}}>No milestone schedule is available yet.</div>}
        {milestones.length>0&&<div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          <div role="img" aria-label="Budget release allocation by milestone" style={{width:112,height:112,borderRadius:"50%",background:`conic-gradient(${chartStops.join(', ')})`,display:"grid",placeItems:"center",flexShrink:0}}>
            <div style={{width:66,height:66,borderRadius:"50%",background:"var(--sf)",display:"grid",placeItems:"center",fontFamily:"var(--fd)",fontWeight:900,fontSize:15,color:"var(--t1)"}}>100%</div>
          </div>
          <div style={{flex:1,minWidth:190}}>
            {milestones.map((milestone,index)=><div key={milestone.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:index===milestones.length-1?"none":"1px solid var(--bd)"}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:chartColors[index%chartColors.length],marginTop:4,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:11.5,fontWeight:700,color:"var(--t1)"}}><span>{milestone.title}</span><span>{milestone.release_percent}% · {fmt(goal*Number(milestone.release_percent)/100)} IST</span></div>
                {milestone.description&&<div style={{fontSize:10.5,color:"var(--t4)",marginTop:2}}>{milestone.description}</div>}
                <div style={{fontSize:10,color:"var(--t5)",marginTop:2}}>Due {milestone.due_date} · {milestone.status === 'approved' ? 'Evidence approved · no funds released' : milestone.status === 'submitted' ? 'Evidence submitted · under review' : milestone.status}</div>
                {milestone.reviewer_notes&&<div style={{fontSize:10.5,color:"var(--t3)",marginTop:4}}>Reviewer: {milestone.reviewer_notes}</div>}
                {isOwner&&['active','in_progress'].includes(farm.status)&&['planned','rejected'].includes(milestone.status)&&<form onSubmit={event=>submitMilestone(event,milestone)} style={{marginTop:8}}>
                  <label className="label" htmlFor={`milestone-update-${milestone.id}`}>Progress update (minimum 20 characters)</label>
                  <textarea id={`milestone-update-${milestone.id}`} className="field" rows={2} value={reportDrafts[milestone.id]?.update||''} onChange={event=>setReportDrafts(items=>({...items,[milestone.id]:{...items[milestone.id],update:event.target.value}}))} required minLength={20} maxLength={2000} placeholder="Describe the work completed and any issues."/>
                  <label className="label" htmlFor={`milestone-evidence-${milestone.id}`} style={{display:'block',marginTop:6}}>Attach evidence (PDF, JPEG, PNG; max 10 MB)</label>
                  <input key={`${milestone.id}-${milestone.status}`} id={`milestone-evidence-${milestone.id}`} className="field" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required onChange={event=>setReportDrafts(items=>({...items,[milestone.id]:{...items[milestone.id],file:event.target.files?.[0]||null}}))}/>
                  <button className="btn btn-g btn-sm" type="submit" disabled={submittingMilestone===milestone.id} style={{marginTop:7}}>{submittingMilestone===milestone.id?'Uploading…':'Submit milestone evidence'}</button>
                </form>}
              </div>
            </div>)}
          </div>
        </div>}
      </div>
      <div style={{fontSize:11,color:"var(--t4)",lineHeight:1.55,marginTop:14}}>
        Participation units describe each investor's proportional claim on the campaign investor pool; they do not represent ownership of the farm. Any realized payout depends on actual harvest sales and the campaign's disclosed terms. Cardano investment and escrow are not live yet.
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
