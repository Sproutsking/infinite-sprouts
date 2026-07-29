import React, { useState } from 'react';
import I from '../../../icons/icons.jsx';
import { Modal, Av, ProgBar } from '../../../components/index.jsx';
import { fmt, pct } from '../../../utils/helpers.js';

function TxPortal({open,onClose,item,isLabor,qty,total}){
  const [step,setStep]=useState(0);
  useEffect(()=>{
    if(!open){setStep(0);return;}
    const t1=setTimeout(()=>setStep(1),700);
    const t2=setTimeout(()=>setStep(2),1600);
    const t3=setTimeout(()=>setStep(3),2800);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[open]);
  if(!open||!item) return null;
  const steps=[
    {t:"Order Confirmed",s:"Your purchase request has been submitted."},
    {t:"Payment Processing",s:"Deducting "+fmt(total)+" IST from your wallet."},
    {t:"Seller Notified",s:"Seller has been alerted and is preparing your order."},
    {t:"In Transit / Preparation",s:"Your order is being packaged and dispatched."},
    {t:"Delivered — Confirm Receipt",s:"Confirm to release payment to seller."},
  ];
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mbox mbox-lg">
        <div className="mhd"><span className="mt">Transaction Portal</span><button className="ib" onClick={onClose}><I.X/></button></div>
        <div className="mbody">
          <div className="txp">
            <div className="txp-hd"><div className="txp-ico">{item.icon}</div><div className="txp-title">{item.name}</div><div className="txp-sub">{isLabor?qty+" days":qty+" "+item.unit} · {fmt(total)} IST</div></div>
            <div className="txp-body">
              {steps.map((s,i)=>(
                <div key={i} className="txp-step">
                  <div className={"txp-num"+(i<step?" done":i===step&&step<4?" pend":"")}>{i<step?<I.Check/>:i+1}</div>
                  <div><div className="txp-t">{s.t}</div><div className="txp-s">{s.s}</div></div>
                </div>
              ))}
            </div>
          </div>
          {step>=3&&step<4&&<div className="notice nw" style={{marginTop:12}}><I.Info/><span>Only confirm once you have physically received and verified your order.</span></div>}
          {step>=4&&<div className="notice nok" style={{marginTop:12}}><I.Check/><span>Order complete! Payment released to seller.</span></div>}
        </div>
        <div className="mfoot">
          {step<3&&<button className="btn btn-g" onClick={onClose}>Track Later</button>}
          {step>=3&&step<4&&<button className="btn btn-p btn-lg" onClick={()=>setStep(4)}><I.Check/>Confirm Receipt</button>}
          {step>=4&&<button className="btn btn-p" onClick={onClose}><I.Check/>Done</button>}
        </div>
      </div>
    </div>
  );
}

/* BuyModal */

export default TxPortal;
