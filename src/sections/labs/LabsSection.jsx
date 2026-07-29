import React, { useState, useRef, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av } from '../../components/index.jsx';
import { nowTime } from '../../utils/helpers.js';

function LabsSection({showToast}){
  const [tab,setTab]=useState("advisor");
  const [messages,setMessages]=useState([{id:1,me:false,text:"Hello! I am your Sprouts AI Advisor. Ask me about crops, weather, soil health, market prices, or investment analysis."}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [fsChat,setFsChat]=useState(false);
  const chatRef=useRef(null);
  const fsRef=useRef(null);
  const replies=[
    "Based on rainfall data in Kaduna, planting maize June 10–20 gives a 34% yield advantage over July.",
    "NPK 20:10:10 at 150kg/ha at planting + 50kg/ha at 6 weeks is optimal for your soil profile.",
    "Current maize price in Kaduna: ₦54,000/tonne (+8.2% MoM). Consider forward contracts before August peak.",
    "NDVI scan shows chlorophyll stress in your NE field quadrant — likely iron deficiency or waterlogging.",
    "Green Valley ROI revised to 28% based on Q2 soil data. Your portfolio is on track.",
  ];
  const mktData=[
    {c:"Maize",p:"₦54,000/t",ch:"+8.2%",s:"Kaduna",up:true,vol:"14,200t"},
    {c:"Paddy Rice",p:"₦98,000/t",ch:"+2.1%",s:"Kano",up:true,vol:"8,900t"},
    {c:"Tomato",p:"₦42,000/t",ch:"−5.3%",s:"Ogun",up:false,vol:"3,100t"},
    {c:"Cassava",p:"₦38,000/t",ch:"+1.7%",s:"Benue",up:true,vol:"22,400t"},
    {c:"Yam",p:"₦68,000/t",ch:"+4.5%",s:"Plateau",up:true,vol:"9,700t"},
    {c:"Sorghum",p:"₦45,000/t",ch:"−1.2%",s:"Kebbi",up:false,vol:"6,800t"},
    {c:"Groundnut",p:"₦120,000/t",ch:"+3.4%",s:"Katsina",up:true,vol:"4,500t"},
    {c:"Cowpea",p:"₦185,000/t",ch:"+7.1%",s:"Niger",up:true,vol:"2,800t"},
  ];
  const tickerItems=[...mktData,...mktData];

  useEffect(()=>{
    const el=fsChat?fsRef.current:chatRef.current;
    if(el) el.scrollTop=el.scrollHeight;
  },[messages,typing,fsChat]);

  function send(){
    if(!input.trim()) return;
    setMessages(p=>[...p,{id:Date.now(),me:true,text:input}]);
    setInput("");setTyping(true);
    setTimeout(()=>{setTyping(false);setMessages(p=>[...p,{id:Date.now()+1,me:false,text:replies[Math.floor(Math.random()*replies.length)]}]);},1400);
  }

  const ChatMsgs=({refEl,cls})=>(
    <div className={cls||"ai-chat"} ref={refEl}>
      {messages.map(m=>(
        <div key={m.id} className={"ai-msg"+(m.me?" me":"")}>
          {!m.me&&<div className="av av-sm av-g" style={{fontSize:10}}>AI</div>}
          <div className={"ai-bub"+(m.me?" ai-me":" ai-bot")}>{m.text}</div>
        </div>
      ))}
      {typing&&<div className="ai-msg"><div className="av av-sm av-g" style={{fontSize:10}}>AI</div><div className="ai-typing"><div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/></div></div>}
    </div>
  );
  const ChatInput=()=>(
    <div className="ai-input">
      <input className="field" placeholder="Ask about crops, weather, prices, investments…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} style={{flex:1}}/>
      <button className="btn btn-p" onClick={send}><I.Send/></button>
    </div>
  );
  const Prompts=()=>(
    <div className="ai-prompts">
      {["When to plant maize?","NPK for clay soil","Rice price forecast","Soil pH for cassava","Best fertilizer deal"].map(q=>(
        <button key={q} className="chip" onClick={()=>setInput(q)}>{q}</button>
      ))}
    </div>
  );

  if(fsChat) return(
    <div className="ai-fs">
      <div className="ai-fs-hd">
        <button className="ib" onClick={()=>setFsChat(false)}><I.ArrowL/></button>
        <div className="av av-sm av-g" style={{fontSize:10}}>AI</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"var(--fd)",fontSize:14,fontWeight:700,color:"var(--t1)"}}>Sprouts AI Advisor</div>
          <div style={{fontSize:10.5,color:"var(--g400)"}}>● Online</div>
        </div>
        <span className="badge b-g">Live</span>
      </div>
      <ChatMsgs refEl={fsRef} cls="ai-fs-msgs"/>
      <div className="ai-fs-foot"><Prompts/><ChatInput/></div>
    </div>
  );

  return(
    <div className="main">
      <div className="sub-hd">
        {[["advisor","AI Advisor"],["features","Features"],["market","Market Data"]].map(([k,l])=>(
          <button key={k} className={"sub-tab"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==="advisor"&&(
        <div className="chat-area">
          <div className="chat-hd">
            <div className="av av-sm av-g" style={{fontSize:10}}>AI</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--t1)"}}>Sprouts AI Advisor</div>
              <div className="chat-status">● Online — Powered by Sprouts AI</div>
            </div>
            <span className="badge b-g">Live</span>
          </div>
          <ChatMsgs refEl={chatRef} cls="chat-msgs"/>
          <div style={{background:"var(--sf)",borderTop:"1px solid var(--bd)"}}>
            <Prompts/>
            <ChatInput/>
          </div>
        </div>
      )}

      {tab!=="advisor"&&<div className="scroll">
        {tab==="features"&&<>
          <p className="subsh">Closing the gap between what farming is and what it can be. Every tool built for a real barrier.</p>
          <div className="labs-grid">
            {[{ic:"🧠",t:"AI Crop Advisor",d:"Personalised recommendations from live soil, weather and market data."},{ic:"🌦️",t:"Weather Forecasting",d:"14-day precision farming forecasts via satellite and ground sensors."},{ic:"📊",t:"Market Price Index",d:"Live commodity prices across 36 states, updated every 30 minutes."},{ic:"🛰️",t:"Satellite Field Scan",d:"NDVI crop health analysis from Sentinel-2 imagery for your fields."},{ic:"🧬",t:"Soil DNA Analysis",d:"Upload soil report for AI-powered fertilizer and pH recommendations."},{ic:"📱",t:"USSD Bridge",d:"Full platform access via *384*700# for farmers without smartphones."},{ic:"🔗",t:"IST Blockchain Ledger",d:"Immutable on-chain records for all investments, harvests and payouts."},{ic:"🤖",t:"Auto-Harvest Oracle",d:"Smart contracts auto-release funds at verified harvest milestones."}].map(f=>(
              <div key={f.t} className="labs-feat">
                <div className="labs-feat-ico">{f.ic}</div>
                <div className="labs-feat-t">{f.t}</div>
                <div className="labs-feat-d">{f.d}</div>
                <button className="btn btn-g btn-sm">Explore <I.ArrowR/></button>
              </div>
            ))}
          </div>
        </>}
        {tab==="market"&&<>
          {/* Hero */}
          <div className="mkt-hero">
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontSize:10,opacity:.65,fontWeight:700,textTransform:"uppercase",letterSpacing:.9,marginBottom:4}}>Nigerian Commodity Exchange</div>
                  <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:900,marginBottom:2}}>Market Price Index</div>
                  <div style={{fontSize:12,opacity:.7}}>1,400+ verified dealers · Updated 8 min ago</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:900}}>↑ 3.2%</div>
                  <div style={{fontSize:11,opacity:.7}}>Overall 30-day trend</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["📈 8 trending up","📉 2 trending down","🌍 24 states covered"].map(t=>(
                  <div key={t} style={{padding:"4px 10px",background:"rgba(255,255,255,.15)",borderRadius:"var(--rf)",fontSize:11,fontWeight:600}}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticker */}
          <div className="mkt-ticker">
            <div className="mkt-ticker-inner">
              {tickerItems.map((r,i)=>(
                <div key={i} className="mkt-tick-item">
                  <span style={{fontWeight:600}}>{r.c}</span>
                  <span className="mkt-tick-price">{r.p}</span>
                  <span className={r.up?"mkt-tick-up":"mkt-tick-dn"}>{r.ch}</span>
                  <span style={{color:"var(--bd3)",marginLeft:4}}>|</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market cards */}
          <div className="mkt-grid">
            {mktData.map(r=>(
              <div key={r.c} className={"mkt-card"+(r.up?" up":" dn")}>
                <div className="mkt-crop-name">{r.c}</div>
                <div className="mkt-crop-loc">{r.s} region</div>
                <div className="mkt-price-big">{r.p}</div>
                <div className="mkt-mini-row">
                  <span className="mkt-vol">Vol: {r.vol}</span>
                  <span className={"badge "+(r.up?"b-g":"b-red")}>{r.ch}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="notice nok"><I.Info/><span>Prices sourced from verified agro-dealer network across 36 states. Data refreshes every 30 minutes.</span></div>
        </>}
      </div>}
    </div>
  );
}

/* ============================================================
   WALLET SECTION
   ============================================================ */

export default LabsSection;
