import React, { useState } from 'react';
import I from '../icons/icons.jsx';

function SupportSection({onClose}){
  const [openFaq,setOpenFaq]=useState(null);
  const faqs=[
    ["What is IST Token?","IST (Infinite Sprouts Token) is the platform's native currency used for investing in farms, buying produce, hiring labor, and receiving harvest dividends."],
    ["How do I invest in a farm?","Go to Farm → Invest tab, select a farm, enter your amount (minimum 1,000 IST), and confirm. Returns are paid automatically at harvest."],
    ["How does the OPay wallet work?","Your Naira wallet is linked to your OPay account. Send and receive Naira instantly to any OPay number — no bank account needed."],
    ["How do I top up my Naira wallet?","Go to Wallet → Naira and tap Top Up. Fund via OPay, bank transfer, USSD, or debit card."],
    ["How do I buy IST tokens?","Go to Wallet → IST and tap Buy IST. Select a package or enter a custom amount. IST is purchased using your Naira wallet."],
    ["Is my farm investment insured?","All farm investments are covered by the Sprouts Farmer Guarantee Fund up to ₦5,000,000. Full details are in the Terms of Investment."],
    ["How do I list items on the marketplace?","Go to Farm, select any tab (Produce, Equipment, Supplies, Services), and tap the List button. Your listing goes live after a quick review."],
    ["How do I create or join a community?","Go to Link → Community. Tap Follow on any community to join. To create one, tap Create Community and submit a request for admin approval."],
  ];
  return(
    <div className="sup-overlay">
      <div className="sup-hd">
        <button className="ib" onClick={onClose}><I.ArrowL/></button>
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
              <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <span>{q}</span>
                <I.ChevD style={{width:14,height:14,transform:openFaq===i?"rotate(180deg)":"none",transition:"transform .2s",color:"var(--t4)"}}/>
              </div>
              {openFaq===i&&<div className="faq-a">{a}</div>}
            </div>
          ))}
          <div style={{height:20}}/>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS SECTION
   ============================================================ */

export default SupportSection;
