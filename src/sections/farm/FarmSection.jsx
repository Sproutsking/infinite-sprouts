import React, { useState, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal, ProgBar, CreateFarmModal, CreateProduceListingModal, CreateLaborServiceModal, FarmerOnboarding } from '../../components/index.jsx';
import { fmt, pct } from '../../utils/helpers.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import farmService from '../../services/farmService.js';
import produceService from '../../services/produceService.js';
import laborService from '../../services/laborService.js';
import BuyModal from './modals/BuyModal.jsx';
import InvestModal from './modals/InvestModal.jsx';
import FarmDetailModal from './modals/FarmDetailModal.jsx';

function FarmSection({walletIST,walletNaira,onSpend,showToast,listOpen,setListOpen,activeFarmTab,setActiveFarmTab}){
  const { user, profile } = useAuth();
  const { roleType, setupFarmerProfile } = useProfile();
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
  const [buyItem,setBuyItem]=useState(null);
  const [detailItem,setDetailItem]=useState(null);
  const [investFarm,setInvestFarm]=useState(null);
  const [investOpen,setInvestOpen]=useState(false);
  const [farmDetail,setFarmDetail]=useState(null);
  const [loading,setLoading]=useState(true);
  
  // Modal states
  const [createFarmOpen,setCreateFarmOpen]=useState(false);
  const [createProduceOpen,setCreateProduceOpen]=useState(false);
  const [createLaborOpen,setCreateLaborOpen]=useState(false);

  // Tabs
  const farmTabs=[
    {k:"invest",l:"Invest",ic:<I.TrendUp/>},
    {k:"farms",l:"Farms",ic:<I.Seedling/>},
    {k:"produce",l:"Produce",ic:<I.Seedling/>},
    {k:"labor",l:"Labor",ic:<I.Users/>},
    ...(roleType==='farmer' ? [
      {k:"my-farms",l:"My Farms",ic:<I.Seedling/>},
      {k:"my-produce",l:"My Produce",ic:<I.Seedling/>},
      {k:"my-labor",l:"My Services",ic:<I.Users/>},
    ] : []),
  ];

  // Load marketplace data
  useEffect(()=>{
    async function loadMarketData(){
      setLoading(true);
      try {
        const [farmsData,produceData,laborData]=await Promise.all([
          farmService.fetchAllFarms(50),
          produceService.searchProduce('',null,50),
          laborService.searchLaborServices('',null,null,50),
        ]);
        setFarms(farmsData||[]);
        setProduce(produceData||[]);
        setLaborServices(laborData||[]);
      } catch(error){
        console.error('Error loading market data:',error);
        showToast('error','Failed to load marketplace data');
      } finally{
        setLoading(false);
      }
    }
    loadMarketData();
  },[showToast]);

  // Load user's own data (if farmer)
  useEffect(()=>{
    if(!user?.id||roleType!=='farmer') return;
    async function loadMyData(){
      try{
        const [myFarmsData,myProduceData,myServicesData]=await Promise.all([
          farmService.fetchFarmerProjects(user.id),
          produceService.getSellerListings(user.id),
          laborService.getWorkerServices(user.id),
        ]);
        setMyFarms(myFarmsData||[]);
        setMyProduce(myProduceData||[]);
        setMyServices(myServicesData||[]);
      }catch(error){
        console.error('Error loading my data:',error);
      }
    }
    loadMyData();
  },[user?.id,roleType]);

  // Get current items based on tab
  function currentItems(){
    const s=search.toLowerCase();
    let items=[];
    if(tab==='farms') items=farms;
    else if(tab==='produce') items=produce;
    else if(tab==='labor') items=laborServices;
    else if(tab==='my-farms') items=myFarms;
    else if(tab==='my-produce') items=myProduce;
    else if(tab==='my-labor') items=myServices;
    return items.filter(i=>!s||(i.name+" "+(i.description||"")).toLowerCase().includes(s));
  }

  async function confirmBuy(item,qty,wallet,total){
    try{
      await produceService.createProduceOrder({
        listing_id:item.id,
        buyer_id:user.id,
        seller_id:item.seller_id,
        quantity_ordered:qty,
        unit_price:item.price_per_unit,
        total_amount:total,
        delivery_address:profile?.state||'',
        estimated_delivery:new Date(Date.now()+7*24*60*60*1000).toISOString().split('T')[0],
      });
      onSpend(wallet,total,"Bought: "+item.name);
      showToast("ok","Order placed for "+item.name);
      const updatedProduce=await produceService.searchProduce('',null,50);
      setProduce(updatedProduce||[]);
    }catch(error){
      console.error('Error placing order:',error);
      showToast('error','Failed to place order');
    }
  }

  async function confirmInvest(farm,amount,shares,fee){
    try{
      await farmService.investInFarm(farm.id,user.id,shares,amount);
      const t=amount+fee;
      onSpend("ist",t,"Invest: "+farm.name);
      setFarms(p=>p.map(f=>f.id===farm.id?{...f,funded_amount:f.funded_amount+amount,sold_shares:f.sold_shares+shares}:f));
      showToast("ok","Invested "+fmt(amount)+" IST in "+farm.name+"!");
    }catch(error){
      console.error('Error investing:',error);
      showToast('error','Failed to invest in farm');
    }
  }

  return(
    <div className="main">
      <div className="sub-hd">
        {farmTabs.map(t=>(
          <button key={t.k} className={"sub-tab"+(tab===t.k?" on":"")} onClick={()=>{setTab(t.k);setSearch("");}}>
            {t.ic}{t.l}
          </button>
        ))}
        {!["invest"].includes(tab)&&<div className="sub-hd-sp"/>}
      </div>
      <div className="scroll">
        {tab==="invest"?<>
          <div className="stat-row">
            {[
              ["🌾",farms.length||0,"Active Farms"],
              ["💎",fmt((farms||[]).reduce((sum,f)=>sum+Number(f.funded_amount||0),0)),"IST Invested"],
              ["📈",farms.length?`${Math.round((farms.reduce((sum,f)=>sum+Number(f.expected_roi||0),0)/farms.length)*10)/10}%`:'0%',"Avg ROI"],
              ["🏷️",(farms||[]).reduce((sum,f)=>sum+Number(f.total_shares||0),0),"Shares Listed"],
            ].map(([ic,v,l])=>(
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="invest-grid">
            {farms.map(f=>(
              <div key={f.id} className="inv-card">
                <div className="inv-banner">
                  <span className="inv-banner-ico">{f.icon||'🌾'}</span>
                  <span className="badge b-g" style={{position:"absolute",top:8,right:8,zIndex:2}}>{f.expected_roi}% ROI</span>
                </div>
                <div className="inv-body">
                  <div className="inv-name">{f.name}</div>
                  <div className="inv-loc">{f.location}</div>
                  <div className="inv-stats">
                    <div className="ist"><div className="ist-l">Timeline</div><div className="ist-v">{f.timeline_months}mo</div></div>
                    <div className="ist"><div className="ist-l">Share Price</div><div className="ist-v">{fmt(f.price_per_share)} IST</div></div>
                  </div>
                  <ProgBar value={f.funded_amount} max={f.goal_amount}/>
                  <div className="item-acts" style={{marginTop:10}}>
                    <button className="btn btn-p btn-sm" onClick={()=>{setInvestFarm(f);setInvestOpen(true);}}><I.Rocket/>Invest</button>
                    <button className="btn btn-g btn-sm" onClick={()=>setFarmDetail(f)}>Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>:<>
          <div className="fbar">
            <div className="sbar"><I.Search/><input placeholder={"Search "+tab+"…"} value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <button className="btn btn-g btn-sm"><I.Filter/>Filter</button>
          </div>
          {currentItems().length===0?
            <div className="empty"><div className="empty-ico">📭</div><div className="empty-t">No {tab} yet</div><div className="empty-s">{["my-farms","my-produce","my-labor"].includes(tab)?'Create your first listing to get started':'Try a different search'}</div></div>:
            <div className="items-grid">
              {currentItems().map(item=>(
                <div key={item.id} className="item-card">
                  <div className="item-thumb">
                    <span className="ith-icon">{item.icon||'🌿'}</span>
                    <span className="ith-badge"><span className="badge" style={{background:["my-farms","my-produce","my-labor"].includes(tab)&&item.status==='active'?'var(--g)':item.team_size?'var(--ac)':'var(--t4)'}}>{item.status||item.team_size||item.quantity_available}</span></span>
                  </div>
                  <div className="item-body">
                    <div className="item-name">{item.name}</div>
                    <div className="item-sub">{item.crop_type||item.produce_type||item.service_type||item.location||''}</div>
                    <div className="item-pr">
                      <span className="item-price">{fmt(item.daily_rate||item.price_per_unit)} IST{tab==="labor"||tab==="my-labor"?"/d":""}</span>
                      <span className="item-qty">{item.quantity_available||item.team_size||'1'}</span>
                    </div>
                    <div className="item-acts">
                      {["my-farms","my-produce","my-labor"].includes(tab)?<>
                        <button className="btn btn-g btn-sm">Edit</button>
                        <button className="btn btn-red btn-sm">Archive</button>
                      </>:<>
                        <button className="btn btn-p btn-sm" onClick={()=>setBuyItem(item)}><I.Cart/>{tab==="labor"?"Hire":"Buy"}</button>
                        <button className="btn btn-g btn-sm" onClick={()=>setDetailItem(item)}>Details</button>
                      </>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
          {roleType==='farmer'&&["my-farms","my-produce","my-labor"].includes(tab)&&(
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

      <BuyModal open={!!buyItem} onClose={()=>setBuyItem(null)} item={buyItem} isLabor={tab==="labor"} walletIST={walletIST} walletNaira={walletNaira} onConfirm={confirmBuy}/>
      <InvestModal open={investOpen} onClose={()=>setInvestOpen(false)} farm={investFarm} walletIST={walletIST} onConfirm={confirmInvest}/>
      <FarmDetailModal farm={farmDetail} onClose={()=>setFarmDetail(null)} onInvest={()=>{setInvestFarm(farmDetail);setInvestOpen(true);setFarmDetail(null);}}/>
      <Modal open={!!detailItem} onClose={()=>setDetailItem(null)} title="Details" sheet footer={<><button className="btn btn-g" onClick={()=>setDetailItem(null)}>Close</button><button className="btn btn-p" onClick={()=>{setBuyItem(detailItem);setDetailItem(null);}}><I.Cart/>{tab==="labor"?"Hire":"Buy"}</button></>}>
        {detailItem&&<div>
          <div style={{fontSize:48,textAlign:"center",marginBottom:10}}>{detailItem.icon||'🌿'}</div>
          <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:900,textAlign:"center",color:"var(--t1)",marginBottom:3}}>{detailItem.name}</div>
          <div style={{textAlign:"center",color:"var(--ac)",fontFamily:"var(--fd)",fontSize:19,fontWeight:900,marginBottom:16}}>{fmt(detailItem.daily_rate||detailItem.price_per_unit)} IST</div>
          <div style={{color:"var(--t4)",fontSize:13,lineHeight:1.5}}>{detailItem.description}</div>
        </div>}
      </Modal>

      <CreateFarmModal open={createFarmOpen} onClose={()=>setCreateFarmOpen(false)} onSuccess={()=>{setCreateFarmOpen(false);farmService.fetchFarmerProjects(user.id).then(d=>setMyFarms(d||[]))}} showToast={showToast}/>
      <CreateProduceListingModal open={createProduceOpen} onClose={()=>setCreateProduceOpen(false)} onSuccess={()=>{setCreateProduceOpen(false);produceService.getSellerListings(user.id).then(d=>setMyProduce(d||[]))}} showToast={showToast}/>
      <CreateLaborServiceModal open={createLaborOpen} onClose={()=>setCreateLaborOpen(false)} onSuccess={()=>{setCreateLaborOpen(false);laborService.getWorkerServices(user.id).then(d=>setMyServices(d||[]))}} showToast={showToast}/>
    </div>
  );
}

/* ============================================================
   LABS SECTION
   ============================================================ */

export default FarmSection;
