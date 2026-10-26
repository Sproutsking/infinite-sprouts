import React, { useEffect, useState } from 'react';
import I from '../icons/icons.jsx';

function SupportSection({onClose}){
  const [openFaq,setOpenFaq]=useState(null);
  useEffect(()=>{
    const handleKeyDown=event=>{if(event.key==='Escape') onClose();};
    window.addEventListener('keydown',handleKeyDown);
    return()=>window.removeEventListener('keydown',handleKeyDown);
  },[onClose]);
  const faqs=[
    ["What is IST Token?","IST is planned as Infinite Sprouts' fixed-supply Cardano native asset. It has not yet been deployed; balances and transfers are not available in this app."],
    ["How do I invest in a farm?","Farm campaigns are being prepared for review. On-chain investment is not available until IST and an audited Cardano escrow are deployed. Campaign returns will depend on actual realized harvest proceeds and are not guaranteed."],
    ["How does the Naira wallet work?","Paystack and OPay integrations have not yet been configured. Naira balances, deposits, and transfers shown in older app-ledger history are not proof of payment."],
    ["How do I top up my Naira wallet?","Naira top-ups are not available yet. They will be enabled after a payment provider integration and server-side payment verification are in place."],
    ["How do I buy IST tokens?","IST is not deployed yet, so token purchases and transfers are disabled. Never send funds to an address claiming to be an Infinite Sprouts token sale."],
    ["Is my farm investment insured?","No insurance or guarantee is currently offered. Each campaign will need clear, campaign-specific risk disclosures before an investment flow is enabled."],
    ["How do I create a marketplace listing?","Open Farm, choose Farms, Produce, or Labor, then select List. If you have not set up a farmer profile, the app will guide you through that first. Farm campaigns start as drafts and must pass review before publication."],
    ["How do I create or join a community?","Go to Link → Community. Tap Follow on any community to join. To create one, tap Create Community and submit a request for admin approval."],
  ];
  return(
    <div className="sup-overlay" onMouseDown={event=>{if(event.target===event.currentTarget) onClose();}}>
      <section className="sup-window sup-window-support" role="dialog" aria-modal="true" aria-label="Help and support">
        <div className="sup-hd">
          <button className="ib" onClick={onClose} aria-label="Close help and support"><I.ArrowL/></button>
          <div style={{fontFamily:"var(--fd)",fontSize:15,fontWeight:700,color:"var(--t1)"}}>Help & Support</div>
        </div>
        <div className="sup-body">
          <div className="sup-hero">
            <div className="sup-hero-c">
              <div style={{fontSize:48,marginBottom:10}}>🌱</div>
              <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:900,marginBottom:6}}>How can we help?</div>
              <div style={{fontSize:12.5,opacity:.78,lineHeight:1.65}}>We are here for every farmer and investor on the platform.</div>
            </div>
          </div>
          <div className="sup-content">
            <div className="sup-grid">
              {[{ico:"💬",t:"Live Chat",d:"Chat with our team in real-time"},{ico:"📧",t:"Email Us",d:"support@infinitesprouts.ng"},{ico:"📞",t:"Call Us",d:"+234 800 SPROUTS"},{ico:"📚",t:"Farm Guides",d:"Tips, tutorials and best practices"}].map(c=>(
                <div key={c.t} className="sup-card">
                  <div className="sup-card-ico">{c.ico}</div>
                  <div className="sup-card-t">{c.t}</div>
                  <div className="sup-card-d">{c.d}</div>
                </div>
              ))}
            </div>
            <div className="sh">Frequently Asked Questions</div>
            {faqs.map(([q,a],i)=>(
              <div key={i} className="faq-item">
                <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)} role="button" tabIndex={0} onKeyDown={event=>{if(event.key==='Enter'||event.key===' ')setOpenFaq(openFaq===i?null:i);}}>
                  <span>{q}</span>
                  <I.ChevD style={{width:14,height:14,transform:openFaq===i?"rotate(180deg)":"none",transition:"transform .2s",color:"var(--t4)"}}/>
                </div>
                {openFaq===i&&<div className="faq-a">{a}</div>}
              </div>
            ))}
            <div style={{height:20}}/>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS SECTION
   ============================================================ */

export default SupportSection;
