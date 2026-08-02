import React, { useState, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal } from '../../components/index.jsx';
import { fmt, pct } from '../../utils/helpers.js';
import { fetchFarms, fetchMarketItems, buyItem } from '../../services/supabaseService.js';
import BuyModal from './modals/BuyModal.jsx';
import InvestModal from './modals/InvestModal.jsx';
import FarmDetailModal from './modals/FarmDetailModal.jsx';

function FarmSection({walletIST,walletNaira,onSpend,showToast,listOpen,setListOpen,activeFarmTab,setActiveFarmTab}){
  const tab=activeFarmTab;
  const setTab=setActiveFarmTab;
  const [farms,setFarms]=useState([]);
  const [produce,setProduce]=useState([]);
  const [equipment,setEquipment]=useState([]);
  const [supplies,setSupplies]=useState([]);
  const [labor,setLabor]=useState([]);
  const [search,setSearch]=useState("");
  const [buyItem,setBuyItem]=useState(null);
  const [buyLabor,setBuyLabor]=useState(false);
  const [detailItem,setDetailItem]=useState(null);
  const [investFarm,setInvestFarm]=useState(null);
  const [investOpen,setInvestOpen]=useState(false);
  const [farmDetail,setFarmDetail]=useState(null);
  const [loading,setLoading]=useState(true);
  const sets={produce,equipment,supplies,labor};
  const tabMeta={
    produce:{title:"List Produce",fields:[["Produce Name","e.g. Fresh Maize"],["Price (IST/kg)","0"],["Quantity (kg)","0"],["Crop Type","e.g. Maize"]]},
    equipment:{title:"List Equipment",fields:[["Equipment Name","e.g. Tractor"],["Price (IST)","0"],["Quantity","1"],["Category","e.g. Machinery"]]},
    supplies:{title:"List Supply",fields:[["Supply Name","e.g. NPK Fertilizer"],["Price (IST/bag)","0"],["Stock","0"],["Category","e.g. Fertilizer"]]},
    labor:{title:"List Service",fields:[["Service Name","e.g. Planting Crew"],["Daily Rate (IST)","0"],["Team Size","0"],["Service Type","e.g. Planting"]]},
  };
  const lfc=tabMeta[tab]||tabMeta.produce;
  function currentItems(){
    const s=search.toLowerCase();
    return(sets[tab]||[]).filter(i=>!s||(i.name+" "+(i.desc||"")).toLowerCase().includes(s));
  }
  function confirmBuy(item,qty,wallet,total){onSpend(wallet,total,"Bought: "+item.name);showToast("ok","Order placed for "+item.name);}
  function confirmInvest(farm,amount,shares,fee){
    const t=amount+fee;
    onSpend("ist",t,"Invest: "+farm.name);
    setFarms(p=>p.map(f=>f.id===farm.id?{...f,funded:f.funded+amount,sold:f.sold+shares}:f));
    showToast("ok","Invested "+fmt(amount)+" IST in "+farm.name+"!");
  }
  const farmTabs=[
    {k:"produce",l:"Produce",ic:<I.Seedling/>},
    {k:"equipment",l:"Equipment",ic:<I.Settings/>},
    {k:"supplies",l:"Supplies",ic:<I.Layers/>},
    {k:"labor",l:"Services",ic:<I.Users/>},
    {k:"invest",l:"Invest",ic:<I.TrendUp/>},
  ];

  useEffect(()=>{
    async function loadFarmData(){
      setLoading(true);
      try {
        const [farmRows, marketItems] = await Promise.all([fetchFarms(), fetchMarketItems()]);
        setFarms(farmRows || []);
        const produceItems=[];
        const equipmentItems=[];
        const suppliesItems=[];
        const laborItems=[];
        (marketItems || []).forEach(item => {
          const type = (item.type || item.category || '').toString().toLowerCase();
          if (type.includes('equip') || type.includes('machinery') || type.includes('tractor') || type.includes('tools')) {
            equipmentItems.push(item);
          } else if (type.includes('supply') || type.includes('fertilizer') || type.includes('feed') || type.includes('seed')) {
            suppliesItems.push(item);
          } else if (type.includes('labor') || type.includes('service') || type.includes('crew') || type.includes('workers')) {
            laborItems.push(item);
          } else {
            produceItems.push(item);
          }
        });
        setProduce(produceItems);
        setEquipment(equipmentItems);
        setSupplies(suppliesItems);
        setLabor(laborItems);
      } catch (error) {
        console.error('Error loading farm data', error);
        showToast('error','Unable to load farm marketplace.');
      } finally {
        setLoading(false);
      }
    }
    loadFarmData();
  }, [showToast]);

  async function confirmBuy(item,qty,wallet,total){
    try {
      await buyItem({
        item_id: item.id,
        quantity: qty,
        total,
        wallet,
        created_at: new Date().toISOString(),
      });
      onSpend(wallet,total,"Bought: "+item.name);
      showToast("ok","Order placed for "+item.name);
    } catch (error) {
      console.error('Error placing order', error);
      onSpend(wallet,total,"Bought: "+item.name);
      showToast('info','Order queued locally; live marketplace is still syncing.');
    }
  }

  return (
    <div className="main">
      <div className="sub-hd">
        {farmTabs.map(t=>(
          <button key={t.k} className={"sub-tab"+(tab===t.k?" on":"")} onClick={()=>{setTab(t.k);setSearch("");}}>
            {t.ic}{t.l}
          </button>
        ))}
        {tab!=="invest"&&<div className="sub-hd-sp"/>}
      </div>
      <div className="scroll">
        {tab==="invest"?<>
          <div className="stat-row">
            {[["🌾","24","Active Farms"],["👥","1,247","Investors"],["💎","12.5M","IST Invested"],["📈","92%","Success Rate"]].map(([ic,v,l])=>(
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="invest-grid">
            {farms.map(f=>(
              <div key={f.id} className="inv-card">
                <div className="inv-banner">
                  <span className="inv-banner-ico">{f.icon}</span>
                  <span className="badge b-g" style={{position:"absolute",top:8,right:8,zIndex:2}}>{f.roi}% ROI</span>
                </div>
                <div className="inv-body">
                  <div className="inv-name">{f.name}</div>
                  <div className="inv-loc">{f.location}</div>
                  <div className="inv-stats">
                    <div className="ist"><div className="ist-l">Timeline</div><div className="ist-v">{f.timeline}mo</div></div>
                    <div className="ist"><div className="ist-l">Share Price</div><div className="ist-v">{fmt(Math.round(f.goal/f.shares))} IST</div></div>
                  </div>
                  <ProgBar value={f.funded} max={f.goal}/>
                  <div className="item-acts" style={{marginTop:10}}>
                    <button className="btn btn-p btn-sm" onClick={()=>{setInvestFarm(f);setInvestOpen(true);}}><I.Rocket/>Invest Now</button>
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
            <div className="empty"><div className="empty-ico">🌾</div><div className="empty-t">No {tab} found</div><div className="empty-s">Try a different search</div></div>:
            <div className="items-grid">
              {currentItems().map(item=>(
                <div key={item.id} className="item-card">
                  <div className="item-thumb">
                    <span className="ith-icon">{item.icon}</span>
                    <span className="ith-badge">{tab==="labor"?<span className="badge b-blue">{item.workers}w</span>:<span className="badge b-muted">{item.qty} {item.unit}</span>}</span>
                  </div>
                  <div className="item-body">
                    <div className="item-name">{item.name}</div>
                    <div className="item-sub">{tab==="labor"?item.lga+", "+item.state:item.seller}</div>
                    <div className="item-pr">
                      <span className="item-price">{fmt(item.rate||item.price)} IST{tab==="labor"?"/d":""}</span>
                      {tab==="labor"?<span className="item-qty">{item.duration}</span>:<span className="item-qty">{item.qty} {item.unit}</span>}
                    </div>
                    <div className="item-acts">
                      <button className="btn btn-p btn-sm" onClick={()=>{setBuyItem(item);setBuyLabor(tab==="labor");}}><I.Cart/>{tab==="labor"?"Hire":"Buy"}</button>
                      <button className="btn btn-g btn-sm" onClick={()=>setDetailItem(item)}>Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </>}
      </div>
      <BuyModal open={!!buyItem} onClose={()=>setBuyItem(null)} item={buyItem} isLabor={buyLabor} walletIST={walletIST} walletNaira={walletNaira} onConfirm={confirmBuy}/>
      <InvestModal open={investOpen} onClose={()=>setInvestOpen(false)} farm={investFarm} walletIST={walletIST} onConfirm={confirmInvest}/>
      <FarmDetailModal farm={farmDetail} onClose={()=>setFarmDetail(null)} onInvest={()=>{setInvestFarm(farmDetail);setInvestOpen(true);setFarmDetail(null);}}/>
      <Modal open={!!detailItem} onClose={()=>setDetailItem(null)} title="Item Details" sheet
        footer={<><button className="btn btn-g" onClick={()=>setDetailItem(null)}>Close</button><button className="btn btn-p" onClick={()=>{setBuyItem(detailItem);setBuyLabor(tab==="labor");setDetailItem(null);}}><I.Cart/>{tab==="labor"?"Hire":"Buy"}</button></>}>
        {detailItem&&<div>
          <div style={{fontSize:48,textAlign:"center",marginBottom:10}}>{detailItem.icon}</div>
          <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:900,textAlign:"center",color:"var(--t1)",marginBottom:3}}>{detailItem.name}</div>
          <div style={{textAlign:"center",color:"var(--ac)",fontFamily:"var(--fd)",fontSize:19,fontWeight:900,marginBottom:16}}>{fmt(detailItem.rate||detailItem.price)} IST</div>
          <div className="form-row" style={{marginBottom:12}}>
            {[["Seller",detailItem.seller||detailItem.workers+" workers"],["State",detailItem.state],["LGA",detailItem.lga],["Quantity",detailItem.workers?detailItem.workers+" workers":detailItem.qty+" "+detailItem.unit]].map(([k,v])=>(
              <div key={k} style={{background:"var(--sf3)",padding:"10px 12px",borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>
                <div style={{fontSize:9.5,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                <div style={{fontSize:12.5,fontWeight:600,color:"var(--t1)"}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12.5,color:"var(--t2)",lineHeight:1.65,background:"var(--sf3)",padding:12,borderRadius:"var(--r10)",border:"1px solid var(--bd)"}}>{detailItem.desc}</div>
        </div>}
      </Modal>
      <Modal open={listOpen} onClose={()=>setListOpen(false)} title={lfc.title} lg sheet
        footer={<><button className="btn btn-g" onClick={()=>setListOpen(false)}>Cancel</button><button className="btn btn-p" onClick={()=>{setListOpen(false);showToast("ok","Listing submitted!");}}><I.Check/>Submit</button></>}>
        <div className="notice ni" style={{marginBottom:14}}><I.Info/><span>You are listing in <strong>{tab}</strong>. Listings go live after quick review.</span></div>
        <div className="form-row">{lfc.fields.slice(0,2).map(([l,ph])=><div key={l} className="form-g"><label className="label">{l}</label><input className="field" placeholder={ph}/></div>)}</div>
        <div className="form-row">{lfc.fields.slice(2,4).map(([l,ph])=><div key={l} className="form-g"><label className="label">{l}</label><input className="field" placeholder={ph}/></div>)}</div>
        <div className="form-row">
          <div className="form-g"><label className="label">State</label><input className="field" placeholder="e.g. Kaduna"/></div>
          <div className="form-g"><label className="label">LGA</label><input className="field" placeholder="e.g. Zaria"/></div>
        </div>
        <div className="form-g"><label className="label">Description</label><textarea className="field textarea" placeholder="Describe your listing…"/></div>
      </Modal>
    </div>
  );
}

/* ============================================================
   LABS SECTION
   ============================================================ */

export default FarmSection;
