import React, { useState, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal, ProgBar, CreateFarmModal, CreateProduceListingModal, CreateLaborServiceModal, FarmerOnboarding } from '../../components/index.jsx';
import FarmerVerificationPanel from '../../components/FarmerVerificationPanel.jsx';
import FarmReviewPanel from '../../components/FarmReviewPanel.jsx';
import { fmt, pct } from '../../utils/helpers.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import farmService from '../../services/farmService.js';
import produceService from '../../services/produceService.js';
import laborService from '../../services/laborService.js';
import { filterMarketplaceItems } from '../../models/marketplaceModel.js';
import BuyModal from './modals/BuyModal.jsx';
import FarmDetailModal from './modals/FarmDetailModal.jsx';
import LaborRequestModal from '../../components/LaborRequestModal.jsx';
import LaborContractsPanel from '../../components/LaborContractsPanel.jsx';

function CampaignReviewNote({ farmId, showToast }) {
  const [review, setReview] = useState(null);
  useEffect(() => {
    let cancelled = false;
    farmService.getLatestFarmCampaignReview(farmId).then(result => {
      if (!cancelled) setReview(result);
    }).catch(error => {
      console.error('Campaign review note load error:', error);
      if (!cancelled) showToast('error', 'Unable to load campaign review notes.');
    });
    return () => { cancelled = true; };
  }, [farmId, showToast]);

  if (!review?.reviewer_notes) return null;
  return <div role="note" style={{ color: 'var(--t3)', background: 'var(--sf3)', borderRadius: 'var(--r10)', padding: 10, fontSize: 12, marginTop: 8 }}>
    Latest {review.decision} review: {review.reviewer_notes}
  </div>;
}

function FarmSection({showToast,listOpen,setListOpen,activeFarmTab,setActiveFarmTab}){
  const { user } = useAuth();
  const { roleType } = useProfile();
  const tab=activeFarmTab;
  const setTab=setActiveFarmTab;
  
  // Data states
  const [farms,setFarms]=useState([]);
  const [produce,setProduce]=useState([]);
  const [laborServices,setLaborServices]=useState([]);
  const [myFarms,setMyFarms]=useState([]);
  const [myProduce,setMyProduce]=useState([]);
  const [myServices,setMyServices]=useState([]);
  
  // UI states
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({category:'',condition:'',state:'',minPrice:'',maxPrice:'',sort:'newest'});
  const [buyItem,setBuyItem]=useState(null);
  const [laborRequestService,setLaborRequestService]=useState(null);
  const [detailItem,setDetailItem]=useState(null);
  const [farmDetail,setFarmDetail]=useState(null);
  const [loading,setLoading]=useState(true);
  const [farmerVerificationStatus,setFarmerVerificationStatus]=useState(null);
  const [isFarmReviewer,setIsFarmReviewer]=useState(false);
  
  // Modal states
  const [createFarmOpen,setCreateFarmOpen]=useState(false);
  const [editingFarm,setEditingFarm]=useState(null);
  const [createProduceOpen,setCreateProduceOpen]=useState(false);
  const [createLaborOpen,setCreateLaborOpen]=useState(false);
  const [farmerOnboardingOpen,setFarmerOnboardingOpen]=useState(false);

  function openListingForTab(targetTab){
    if(targetTab==='farms'||targetTab==='my-farms') setCreateFarmOpen(true);
    else if(targetTab==='produce'||targetTab==='my-produce') setCreateProduceOpen(true);
    else if((targetTab==='labor'||targetTab==='my-labor')&&user?.id) setCreateLaborOpen(true);
    else showToast('info','Choose Farms, Produce, or Labor before creating a listing.');
  }

  useEffect(()=>{
    if(!listOpen) return;
    setListOpen(false);
    if(roleType!=='farmer'&&tab!=='labor'&&tab!=='my-labor'){
      if(!user?.id){
        showToast('info','Sign in to set up a farmer profile and create a listing.');
        return;
      }
      setFarmerOnboardingOpen(true);
      return;
    }
    openListingForTab(tab);
  },[listOpen,roleType,tab,setListOpen,showToast,user?.id]);

  useEffect(()=>{
    let cancelled=false;
    setIsFarmReviewer(false);
    farmService.isFarmReviewer().then(isReviewer=>{
      if(!cancelled) {
        setIsFarmReviewer(isReviewer);
        if(!isReviewer&&tab==='review') setTab('farms');
      }
    }).catch(error=>{
      console.error('Farm reviewer authorization lookup error:',error);
      if(!cancelled) showToast('error','Unable to check farm review access.');
    });
    return ()=>{cancelled=true;};
  },[user?.id,showToast]);

  // Tabs
  const farmTabs=[
    {k:"invest",l:"Invest",ic:<I.TrendUp/>},
    {k:"farms",l:"Farms",ic:<I.Seedling/>},
    {k:"produce",l:"Produce",ic:<I.Seedling/>},
    {k:"labor",l:"Labor",ic:<I.Users/>},
    ...(roleType==='farmer' ? [
      {k:"my-farms",l:"My Farms",ic:<I.Seedling/>},
      {k:"my-produce",l:"My Produce",ic:<I.Seedling/>},
    ] : []),
    ...(user?.id ? [
      {k:"my-labor",l:"My Services",ic:<I.Users/>},
      {k:"my-hires",l:"My Hires",ic:<I.Cart/>},
      {k:"labor-requests",l:"Worker Requests",ic:<I.Users/>},
    ] : []),
    ...(isFarmReviewer ? [{k:"review",l:"Review queue",ic:<I.Check/>}] : []),
  ];

  // Load marketplace data
  useEffect(()=>{
    async function loadMarketData(){
      setLoading(true);
      try {
        const results=await Promise.allSettled([
          farmService.fetchAllFarms(50),
          produceService.searchProduce('',null,50),
          laborService.searchLaborServices('',null,null,50),
        ]);
        const [farmsResult,produceResult,laborResult]=results;
        if(farmsResult.status==='fulfilled') setFarms(farmsResult.value||[]);
        else { console.error('Error loading farm marketplace:',farmsResult.reason); showToast('error','Unable to load farm campaigns.'); }
        if(produceResult.status==='fulfilled') setProduce(produceResult.value||[]);
        else { console.error('Error loading produce marketplace:',produceResult.reason); showToast('error','Unable to load produce listings.'); }
        if(laborResult.status==='fulfilled') setLaborServices(laborResult.value||[]);
        else { console.error('Error loading labor marketplace:',laborResult.reason); showToast('error','Unable to load labor services.'); }
      } finally{
        setLoading(false);
      }
    }
    loadMarketData();
  },[showToast]);

  // Load user's own data (if farmer)
  useEffect(()=>{
    if(!user?.id) return;
    async function loadMyData(){
      try{
      const requests=[
        roleType==='farmer'?farmService.fetchFarmerProjects(user.id):Promise.resolve([]),
        roleType==='farmer'?produceService.getSellerListings(user.id):Promise.resolve([]),
          laborService.getWorkerServices(user.id),
      ];
      const [farmsResult,produceResult,servicesResult]=await Promise.allSettled(requests);
      if(farmsResult.status==='fulfilled') setMyFarms(farmsResult.value||[]);
      else {console.error('Farmer campaigns load error:',farmsResult.reason);showToast('error','Unable to load your farm campaigns.');}
      if(produceResult.status==='fulfilled') setMyProduce(produceResult.value||[]);
      else {console.error('Seller produce load error:',produceResult.reason);showToast('error','Unable to load your produce listings.');}
      if(servicesResult.status==='fulfilled') setMyServices(servicesResult.value||[]);
      else {console.error('Worker services load error:',servicesResult.reason);showToast('error','Unable to load your labor services.');}
    }catch(error){
      console.error('Error loading my data:',error);
      showToast('error','Unable to load your marketplace listings.');
    }
    }
    loadMyData();
  },[user?.id,roleType,showToast]);

  // Get current items based on tab
  function currentItems(){
    let items=[];
    if(tab==='farms') items=farms;
    else if(tab==='produce') items=produce;
    else if(tab==='labor') items=laborServices;
    else if(tab==='my-farms') items=myFarms;
    else if(tab==='my-produce') items=myProduce;
    else if(tab==='my-labor') items=myServices;
    return filterMarketplaceItems(items,tab,{...filters,query:search});
  }
  const visibleItems=currentItems();
  const filterItems=tab==='produce'?produce:tab==='labor'?laborServices:[];
  const categories=[...new Set(filterItems.map(item=>tab==='labor'?item.service_type:item.produce_type).filter(Boolean))].sort();
  const states=[...new Set(filterItems.map(item=>item.state).filter(Boolean))].sort();

  async function submitCampaignForReview(farm){
    if(farmerVerificationStatus!=='approved'){
      showToast('error','Submit and complete farmer certification before requesting campaign review.');
      return;
    }
    try{
      const updated=await farmService.updateFarmProject(farm.id,{status:'active'});
      setMyFarms(items=>items.map(item=>item.id===farm.id?updated:item));
      showToast('ok','Campaign submitted for platform review.');
    }catch(error){
      console.error('Campaign review submission error:',error);
      showToast('error','Unable to submit this campaign for review.');
    }
  }

  async function setFarmArchived(farm){
    const nextStatus=farm.status==='archived'?'active':farm.status==='active'?'archived':null;
    if(!nextStatus) return;
    try{
      const updated=await farmService.updateFarmProject(farm.id,{status:nextStatus});
      setMyFarms(items=>items.map(item=>item.id===farm.id?updated:item));
      setFarms(items=>nextStatus==='active'?[updated,...items.filter(item=>item.id!==farm.id)]:items.filter(item=>item.id!==farm.id));
      showToast('ok',nextStatus==='archived'?'Farm listing archived.':'Farm listing restored.');
    }catch(error){
      console.error('Error updating farm listing status:',error);
      showToast('error','Unable to update this farm listing.');
    }
  }

  return(
    <div className="main main-farm">
      <div className="sub-hd">
        {farmTabs.map(t=>(
          <button key={t.k} className={"sub-tab"+(tab===t.k?" on":"")} onClick={()=>{setTab(t.k);setSearch("");setFilters({category:'',condition:'',state:'',minPrice:'',maxPrice:'',sort:'newest'});}}>
            {t.ic}{t.l}
          </button>
        ))}
        {!["invest"].includes(tab)&&<div className="sub-hd-sp"/>}
      </div>
      <div className="scroll">
        {tab==="invest"?<>
          <div className="stat-row">
            {[
              ["🌾",farms.length||0,"Verified campaigns"],
              ["🤝",farms.length?`${Math.round((farms.reduce((sum,f)=>sum+Number(f.return_share_percent||0),0)/farms.length)*10)/10}%`:'0%',"Avg proceeds pool"],
              ["🛡️","Reviewed","Campaigns screened"],
              ["⛓️","Coming soon","Cardano investing"],
            ].map(([ic,v,l])=>(
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          {loading?<div className="empty"><div className="empty-ico">🌱</div><div className="empty-t">Loading verified campaigns</div><div className="empty-s">Only reviewed campaigns can appear here.</div></div>:farms.length===0?
            <div className="empty"><div className="empty-ico">🛡️</div><div className="empty-t">No verified campaigns yet</div><div className="empty-s">Campaigns appear after farmer certification and campaign review. Cardano investing opens after IST and escrow are deployed.</div></div>:
          <div className="invest-grid">
            {farms.map(f=>(
              <div key={f.id} className="inv-card">
                <div className="inv-banner">
                  <span className="inv-banner-ico">{f.project_image||f.icon||'🌾'}</span>
                  <span className="badge b-g" style={{position:"absolute",top:8,right:8,zIndex:2}}>{Number(f.return_share_percent)||0}% proceeds pool</span>
                </div>
                <div className="inv-body">
                  <div className="inv-name">{f.name}</div>
                  <div className="inv-loc">{f.location||[f.lga,f.state].filter(Boolean).join(', ')||'Location not provided'}</div>
                  <div className="inv-stats">
                    <div className="ist"><div className="ist-l">Timeline</div><div className="ist-v">{f.timeline_months||'—'}mo</div></div>
                    <div className="ist"><div className="ist-l">Share Price</div><div className="ist-v">{fmt(f.price_per_share)} IST</div></div>
                  </div>
                  <div className="ist" style={{marginTop:10}}><div className="ist-l">Campaign goal</div><div className="ist-v">{fmt(f.goal_amount)} IST</div></div>
                  <div className="item-acts" style={{marginTop:10}}>
                    <button className="btn btn-g btn-sm" onClick={()=>setFarmDetail(f)}>Details</button>
                  </div>
                  <div style={{fontSize:10.5,color:'var(--t4)',marginTop:8}}>Cardano investing will open after IST and campaign escrow are deployed.</div>
                </div>
              </div>
            ))}
          </div>}
        </>:tab==='review'&&isFarmReviewer?<FarmReviewPanel showToast={showToast}/>
        :tab==='my-hires'&&user?.id?<LaborContractsPanel userId={user.id} view="farmer" showToast={showToast}/>
        :tab==='labor-requests'&&user?.id?<LaborContractsPanel userId={user.id} view="worker" showToast={showToast}/>:<>
          {tab==='my-farms'&&roleType==='farmer'&&<FarmerVerificationPanel showToast={showToast} onStatusChange={setFarmerVerificationStatus}/>}
          <div className="fbar">
            <div className="sbar"><I.Search/><input placeholder={"Search "+tab+"…"} value={search} onChange={e=>setSearch(e.target.value)}/></div>
            {['produce','labor'].includes(tab)&&<div className="market-filterbar">
              <select className="field" aria-label={tab==='labor'?'Filter by service type':'Filter by produce type'} value={filters.category} onChange={e=>setFilters(value=>({...value,category:e.target.value}))}>
                <option value="">All {tab==='labor'?'services':'produce'}</option>
                {categories.map(category=><option key={category} value={category}>{category}</option>)}
              </select>
              <select className="field" aria-label="Filter by state" value={filters.state} onChange={e=>setFilters(value=>({...value,state:e.target.value}))}>
                <option value="">All states</option>
                {states.map(state=><option key={state} value={state}>{state}</option>)}
              </select>
              {tab==='produce'&&<select className="field" aria-label="Filter by produce condition" value={filters.condition} onChange={e=>setFilters(value=>({...value,condition:e.target.value}))}>
                <option value="">All conditions</option>
                {[['fresh','Freshly harvested'],['good','Good'],['processing','Processing grade'],['stored','Dried / stored'],['unspecified','Not specified']].map(([value,label])=><option key={value} value={value}>{label}</option>)}
              </select>}
              <input className="field" aria-label="Minimum price in IST" type="number" min="0" placeholder="Min IST" value={filters.minPrice} onChange={e=>setFilters(value=>({...value,minPrice:e.target.value}))}/>
              <input className="field" aria-label="Maximum price in IST" type="number" min="0" placeholder="Max IST" value={filters.maxPrice} onChange={e=>setFilters(value=>({...value,maxPrice:e.target.value}))}/>
              <select className="field" aria-label="Sort marketplace listings" value={filters.sort} onChange={e=>setFilters(value=>({...value,sort:e.target.value}))}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                {tab==='produce'&&<option value="condition">Condition</option>}
              </select>
            </div>}
          </div>
          {visibleItems.length===0?
            <div className="empty"><div className="empty-ico">📭</div><div className="empty-t">No {tab} yet</div><div className="empty-s">{["my-farms","my-produce","my-labor"].includes(tab)?'Create your first listing to get started':'Try a different search'}</div></div>:
            <div className="items-grid">
              {visibleItems.map(item=>(
                <div key={item.id} className="item-card">
                  <div className="item-thumb">
                    <span className="ith-icon">{item.icon||'🌿'}</span>
                    <span className="ith-badge"><span className="badge" style={{background:["my-farms","my-produce","my-labor"].includes(tab)&&item.status==='active'?'var(--g)':item.team_size?'var(--ac)':'var(--t4)'}}>{tab==='my-farms'?`${item.status} · ${item.verification_status}`:item.status||item.team_size||item.quantity_available}</span></span>
                  </div>
                  <div className="item-body">
                    <div className="item-name">{item.name}</div>
                    <div className="item-sub">{tab==='my-farms'?(item.location||[item.lga,item.state].filter(Boolean).join(', ')):item.crop_type||item.produce_type||item.service_type||item.location||''}{item.state&&tab!=='my-farms'?` · ${item.lga?`${item.lga}, `:''}${item.state}`:''}</div>
                    <div className="item-pr">
                      {tab==='my-farms'?<>
                        <span className="item-price">Goal: {fmt(item.goal_amount||0)} IST</span>
                        <span className="item-qty">{item.total_shares||0} units</span>
                      </>:<>
                        <span className="item-price">{fmt(item.daily_rate||item.price_per_unit)} IST{tab==="labor"||tab==="my-labor"?"/day":item.unit?`/${item.unit}`:''}</span>
                        <span className="item-qty">{item.quantity_available||item.team_size||'1'}</span>
                      </>}
                    </div>
                    {tab==='produce'&&<div className="item-sub" style={{marginTop:7}}>Condition: {({fresh:'Freshly harvested',good:'Good',processing:'Processing grade',stored:'Dried / stored'})[item.quality_condition]||'Not specified'}{item.certification?` · ${item.certification}`:''}</div>}
                    <div className="item-acts">
                      {["my-farms","my-produce","my-labor"].includes(tab)?<>
                        {tab==='my-farms'?<>
                          <button className="btn btn-g btn-sm" onClick={()=>setFarmDetail(item)}>Details</button>
                          <button className="btn btn-g btn-sm" disabled={item.status!=='draft'} onClick={()=>{setEditingFarm(item);setCreateFarmOpen(true);}}>Edit draft</button>
                          {item.status==='draft'&&<button className="btn btn-p btn-sm" disabled={farmerVerificationStatus!=='approved'} title={farmerVerificationStatus!=='approved'?'Complete farmer verification first':''} onClick={()=>submitCampaignForReview(item)}>Request review</button>}
                          {['active','archived'].includes(item.status)&&<button className={item.status==='archived'?'btn btn-g btn-sm':'btn btn-red btn-sm'} onClick={()=>setFarmArchived(item)}>{item.status==='archived'?'Restore':'Archive'}</button>}
                          <CampaignReviewNote farmId={item.id} showToast={showToast}/>
                        </>:<>
                          <button className="btn btn-g btn-sm" disabled>Edit</button>
                          <button className="btn btn-red btn-sm" disabled>Archive</button>
                        </>}
                      </>:<>
                        <button className="btn btn-p btn-sm" disabled={tab==="labor"&&item.worker_id===user?.id} onClick={()=>tab==="labor"?setLaborRequestService(item):setBuyItem(item)}><I.Cart/>{tab==="labor"?(item.worker_id===user?.id?'Your service':'Request hire'):'Buy'}</button>
                        <button className="btn btn-g btn-sm" onClick={()=>setDetailItem(item)}>Details</button>
                      </>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
          {user?.id&&(["my-labor"].includes(tab)||(roleType==='farmer'&&["my-farms","my-produce"].includes(tab)))&&(
            <div style={{position:'fixed',bottom:20,right:20}}>
              <button className="btn btn-p btn-lg" onClick={()=>{
                if(tab==='my-farms') setCreateFarmOpen(true);
                else if(tab==='my-produce') setCreateProduceOpen(true);
                else if(tab==='my-labor') setCreateLaborOpen(true);
              }}><I.Plus/>Create</button>
            </div>
          )}
        </>}
      </div>

      <BuyModal open={!!buyItem} onClose={()=>setBuyItem(null)} item={buyItem} isLabor={false}/>
      {laborRequestService&&<LaborRequestModal service={laborRequestService} onClose={()=>setLaborRequestService(null)} onSuccess={()=>setLaborRequestService(null)} showToast={showToast}/>}
      <FarmDetailModal farm={farmDetail} canInvest={false} isOwner={farmDetail?.owner_id===user?.id} farmerId={user?.id} showToast={showToast} onClose={()=>setFarmDetail(null)}/>
      <Modal open={!!detailItem} onClose={()=>setDetailItem(null)} title="Details" footer={<><button className="btn btn-g" onClick={()=>setDetailItem(null)}>Close</button><button className="btn btn-p" onClick={()=>{if(tab==='labor')setLaborRequestService(detailItem);else setBuyItem(detailItem);setDetailItem(null);}}><I.Cart/>{tab==="labor"?"Request hire":"Buy"}</button></>}>
        {detailItem&&<div>
          <div style={{fontSize:48,textAlign:"center",marginBottom:10}}>{detailItem.icon||'🌿'}</div>
          <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:900,textAlign:"center",color:"var(--t1)",marginBottom:3}}>{detailItem.name}</div>
          <div style={{textAlign:"center",color:"var(--ac)",fontFamily:"var(--fd)",fontSize:19,fontWeight:900,marginBottom:16}}>{fmt(detailItem.daily_rate||detailItem.price_per_unit)} IST {tab==='labor'?'/ day':`/ ${detailItem.unit||'unit'}`}</div>
          <div style={{color:"var(--t4)",fontSize:13,lineHeight:1.5}}>{detailItem.description}</div>
        </div>}
      </Modal>

      <CreateFarmModal open={createFarmOpen} farm={editingFarm} onClose={()=>{setCreateFarmOpen(false);setEditingFarm(null);}} onSuccess={async()=>{setCreateFarmOpen(false);setEditingFarm(null);try{const [mine,market]=await Promise.all([farmService.fetchFarmerProjects(user.id),farmService.fetchAllFarms(50)]);setMyFarms(mine||[]);setFarms(market||[]);setTab('my-farms');}catch(error){console.error('Error refreshing farm listings:',error);showToast('error','Farm saved, but listings could not be refreshed.');}}} showToast={showToast}/>
      <CreateProduceListingModal open={createProduceOpen} onClose={()=>setCreateProduceOpen(false)} onSuccess={async()=>{
        setCreateProduceOpen(false);
        try{
          const [mine,market]=await Promise.all([
            produceService.getSellerListings(user.id),
            produceService.searchProduce('',null,50),
          ]);
          setMyProduce(mine||[]);
          setProduce(market||[]);
        }
        catch(error){console.error('Error refreshing produce listings:',error);showToast('error','Produce listed, but your listings could not be refreshed.');}
      }} showToast={showToast}/>
      <CreateLaborServiceModal open={createLaborOpen} onClose={()=>setCreateLaborOpen(false)} onSuccess={async()=>{
        setCreateLaborOpen(false);
        try{
          const [mine,market]=await Promise.all([
            laborService.getWorkerServices(user.id),
            laborService.searchLaborServices('',null,null,50),
          ]);
          setMyServices(mine||[]);
          setLaborServices(market||[]);
        }
        catch(error){console.error('Error refreshing labor listings:',error);showToast('error','Service listed, but your listings could not be refreshed.');}
      }} showToast={showToast}/>
      <FarmerOnboarding open={farmerOnboardingOpen} onClose={()=>setFarmerOnboardingOpen(false)} onSuccess={()=>openListingForTab(tab)}/>
    </div>
  );
}

/* ============================================================
   LABS SECTION
   ============================================================ */

export default FarmSection;
