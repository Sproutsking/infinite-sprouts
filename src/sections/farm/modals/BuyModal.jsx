import React, { useState } from 'react';
import I from '../../../icons/icons.jsx';
import { Modal, Av, ProgBar } from '../../../components/index.jsx';
import { fmt, pct } from '../../../utils/helpers.js';

import TxPortal from './TxPortal.jsx';

function BuyModal({open,onClose,item,isLabor,walletIST,walletNaira,onConfirm}){
  const [qty,setQty]=useState(1);
  const [wallet,setWallet]=useState("ist");
  const [portalOpen,setPortalOpen]=useState(false);
  const [portalData,setPortalData]=useState(null);
  if(!open&&!portalOpen) return null;
  if(!item) return null;
  const unitPrice=isLabor?item.rate:item.price;
  const sub=unitPrice*qty;
  const fee=Math.round(sub*0.01);
  const total=sub+fee;
  const bal=wallet==="ist"?walletIST:walletNaira;
  const canPay=bal>=total;
  function doConfirm(){
    onConfirm(item,qty,wallet,total);onClose();
    setPortalData({item,qty,total,isLabor});setPortalOpen(true);setQty(1);
  }
  return(<>
    <Modal open={open} onClose={()=>{onClose();setQty(1);}} title={isLabor?"Hire Team":"Purchase Item"} lg sheet
      footer={<><button className="btn btn-g" onClick={()=>{onClose();setQty(1);}}>Cancel</button><button className="btn btn-p btn-lg" disabled={!canPay} onClick={doConfirm}><I.Check/>{canPay?"Confirm — "+fmt(total)+" IST":"Insufficient Balance"}</button></>}>
      <div style={{display:"flex",gap:10,padding:"10px 12px",background:"var(--sf3)",borderRadius:"var(--r12)",border:"1px solid var(--bd)",marginBottom:16}}>
        <span style={{fontSize:28}}>{item.icon}</span>
        <div><div style={{fontWeight:700,fontSize:13,color:"var(--t1)"}}>{item.name}</div><div style={{fontSize:11,color:"var(--t4)"}}>{fmt(unitPrice)} IST {isLabor?"/day":"per "+item.unit}</div></div>
      </div>
      <div className="form-row" style={{marginBottom:12}}>
        <div className="form-g">
          <label className="label">{isLabor?"Days":"Quantity"}</label>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--sf3)",padding:"7px 10px",borderRadius:"var(--r10)",border:"1px solid var(--bd2)"}}>
            <button className="btn btn-g btn-sm" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
            <span style={{fontWeight:800,fontSize:16,minWidth:32,textAlign:"center",color:"var(--t1)",fontFamily:"var(--fd)"}}>{qty}</span>
            <button className="btn btn-g btn-sm" onClick={()=>setQty(q=>q+1)}>+</button>
          </div>
        </div>
        <div className="form-g"><label className="label">Unit Price</label><div style={{padding:"10px 12px",background:"var(--sf3)",borderRadius:"var(--r10)",border:"1px solid var(--bd)",fontFamily:"var(--fd)",fontWeight:700,fontSize:15,color:"var(--ac)"}}>{fmt(unitPrice)} IST</div></div>
      </div>
      <div className="form-g">
        <label className="label">Pay With</label>
        {[{k:"ist",l:"IST Token",b:fmt(walletIST)+" IST"},{k:"naira",l:"Naira Wallet",b:"₦"+fmt(walletNaira)}].map(w=>{
          const wBal=w.k==="ist"?walletIST:walletNaira;
          return <div key={w.k} className={"pay-opt"+(wallet===w.k?" on":"")+(wBal<total?" dim":"")} onClick={()=>{if(wBal>=total)setWallet(w.k);}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div className="pay-radio"/><div><div style={{fontWeight:600,fontSize:12.5,color:"var(--t1)"}}>{w.l}</div><div style={{fontSize:11,color:"var(--t4)"}}>{w.b}</div></div></div>
            {wBal<total&&<span className="badge b-red">Low</span>}
          </div>;
        })}
      </div>
      <div style={{background:"var(--sf3)",borderRadius:"var(--r12)",padding:"13px 15px",border:"1px solid var(--bd)"}}>
        {[["Price per unit",fmt(unitPrice)+" IST"],["Qty / Days",String(qty)],["Platform fee (1%)",fmt(fee)+" IST"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--t4)",marginBottom:6}}><span>{l}</span><span style={{fontWeight:600,color:"var(--t2)"}}>{v}</span></div>
        ))}
        <div className="div" style={{margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800,color:"var(--t1)"}}><span>Total</span><span style={{color:"var(--ac)",fontFamily:"var(--fd)"}}>{fmt(total)} IST</span></div>
      </div>
    </Modal>
    {portalData&&<TxPortal open={portalOpen} onClose={()=>setPortalOpen(false)} item={portalData.item} isLabor={portalData.isLabor} qty={portalData.qty} total={portalData.total}/>}
  </>);
}

/* InvestModal */

export default BuyModal;
