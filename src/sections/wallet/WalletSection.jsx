import React, { useState } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal, ProgBar } from '../../components/index.jsx';
import { fmt } from '../../utils/helpers.js';

function WalletSection({walletIST,walletNaira,transactions,onAction,showToast}){
  const [tab,setTab]=useState("overview");
  const [sendOpen,setSendOpen]=useState(false);
  const [recvOpen,setRecvOpen]=useState(false);
  const [topupOpen,setTopupOpen]=useState(false);
  const [buyISTOpen,setBuyISTOpen]=useState(false);
  const [sendPhone,setSendPhone]=useState("");
  const [sendAmt,setSendAmt]=useState("");
  const [topupMethod,setTopupMethod]=useState("opay");
  const [topupAmt,setTopupAmt]=useState("");
  const [txFilter,setTxFilter]=useState("all");
  const [selPkg,setSelPkg]=useState(null);
  const filtered=txFilter==="all"?transactions:transactions.filter(t=>t.wallet===txFilter);
  const istPkgs=[
    {amt:"1,000 IST",naira:"₦8,000",bonus:"",val:1000},
    {amt:"5,000 IST",naira:"₦38,000",bonus:"+200 bonus",val:5000},
    {amt:"10,000 IST",naira:"₦72,000",bonus:"+600 bonus",val:10000},
    {amt:"50,000 IST",naira:"₦340,000",bonus:"+4,000 bonus",val:50000},
  ];
  function doSend(){
    if(!sendPhone||!sendAmt) return;
    onAction("send",parseFloat(sendAmt),sendPhone);
    setSendOpen(false);setSendPhone("");setSendAmt("");
    showToast("ok","₦"+fmt(parseFloat(sendAmt))+" sent via OPay!");
  }
  function doTopup(){
    if(!topupAmt) return;
    showToast("ok","₦"+fmt(parseFloat(topupAmt))+" top-up initiated!");
    setTopupOpen(false);setTopupAmt("");
  }
  function doBuyIST(){
    if(!selPkg) return;
    showToast("ok",selPkg.amt+" purchased successfully!");
    setBuyISTOpen(false);setSelPkg(null);
  }

  const WalletCard=({label,amt,sub,onSend,onRecv,onTopup,onBuyIST})=>(
    <div className="w-card">
      <div className="wci">
        <div className="wc-lbl">{label}</div>
        <div className="wc-amt">{amt}</div>
        <div className="wc-sub">{sub}</div>
        <div className="wc-act-grid">
          {onSend&&<button className="wc-act-btn" onClick={onSend}>
            <div className="wc-act-ico"><I.ArrowUr/></div>Send
          </button>}
          {onRecv&&<button className="wc-act-btn" onClick={onRecv}>
            <div className="wc-act-ico"><I.ArrowDl/></div>Receive
          </button>}
          {onTopup&&<button className="wc-act-btn" onClick={onTopup}>
            <div className="wc-act-ico"><I.Plus/></div>Top Up
          </button>}
          {onBuyIST&&<button className="wc-act-btn" onClick={onBuyIST}>
            <div className="wc-act-ico"><I.Swap/></div>Buy IST
          </button>}
        </div>
      </div>
    </div>
  );

  return(
    <div className="main">
      <div className="sub-hd">
        {[["overview","Overview"],["naira","Naira"],["ist","IST"],["history","History"]].map(([k,l])=>(
          <button key={k} className={"sub-tab"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="scroll">
        {tab==="overview"&&<>
          <div className="w-cards">
            <div className="w-mini" style={{cursor:"pointer"}} onClick={()=>setTab("naira")}>
              <div className="w-mini-lbl">Naira Wallet</div>
              <div className="w-mini-amt">₦{fmt(walletNaira)}</div>
              <div className="w-mini-note">OPay · Instant transfers</div>
              <div className="opay-badge"><div className="opay-dot"/><span>Connected · OPay</span></div>
            </div>
            <div className="w-mini" style={{cursor:"pointer"}} onClick={()=>setTab("ist")}>
              <div className="w-mini-lbl">IST Token</div>
              <div className="w-mini-amt">{fmt(walletIST)}</div>
              <div className="w-mini-note">Platform currency</div>
              <div className="opay-badge"><div className="opay-dot"/><span>Active · Sprouts Chain</span></div>
            </div>
          </div>
          <div className="sh" style={{marginBottom:8}}>Recent Transactions</div>
          <div className="tx-list">
            {transactions.slice(0,6).map(tx=>(
              <div key={tx.id} className="tx-row">
                <div className={"tx-ico "+(tx.type==="in"?"tx-in":tx.type==="out"?"tx-out":"tx-n")}>{tx.type==="in"?"📥":tx.type==="out"?"📤":"🔄"}</div>
                <div className="tx-info"><div className="tx-title">{tx.title}</div><div className="tx-sub">{tx.sub} · {tx.date}</div></div>
                <div><div className={"tx-amt "+(tx.type==="in"?"tx-amt-in":"tx-amt-out")}>{tx.amount}</div><div className="tx-date">{tx.wallet==="ist"?"IST":"₦"}</div></div>
              </div>
            ))}
          </div>
        </>}

        {tab==="naira"&&<>
          <WalletCard label="Naira Wallet" amt={"₦"+fmt(walletNaira)} sub="OPay-powered · Instant transfers" onSend={()=>setSendOpen(true)} onRecv={()=>setRecvOpen(true)} onTopup={()=>setTopupOpen(true)}/>
          <div className="notice ni"><I.Info/><span>Naira transactions are powered by OPay. Send to any OPay number and receive from any OPay user instantly.</span></div>
          <div className="sh" style={{marginBottom:8}}>Naira Transactions</div>
          <div className="tx-list">
            {transactions.filter(t=>t.wallet==="naira").map(tx=>(
              <div key={tx.id} className="tx-row">
                <div className={"tx-ico "+(tx.type==="in"?"tx-in":"tx-out")}>{tx.type==="in"?"📥":"📤"}</div>
                <div className="tx-info"><div className="tx-title">{tx.title}</div><div className="tx-sub">{tx.sub} · {tx.date}</div></div>
                <div><div className={"tx-amt "+(tx.type==="in"?"tx-amt-in":"tx-amt-out")}>{tx.amount}</div></div>
              </div>
            ))}
          </div>
        </>}

        {tab==="ist"&&<>
          <WalletCard label="IST Token Balance" amt={fmt(walletIST)+" IST"} sub={"≈ ₦"+fmt(walletNaira)+" equivalent"} onSend={()=>showToast("info","IST send coming soon!")} onRecv={()=>showToast("info","IST receive coming soon!")} onBuyIST={()=>setBuyISTOpen(true)}/>
          <div className="notice nok"><I.Info/><span>IST is the Infinite Sprouts native token — invest in farms, buy from the marketplace, pay for labor, and receive harvest dividends.</span></div>
          <div className="sh" style={{marginBottom:8}}>IST Transactions</div>
          <div className="tx-list">
            {transactions.filter(t=>t.wallet==="ist").map(tx=>(
              <div key={tx.id} className="tx-row">
                <div className={"tx-ico "+(tx.type==="in"?"tx-in":"tx-out")}>{tx.type==="in"?"📥":"📤"}</div>
                <div className="tx-info"><div className="tx-title">{tx.title}</div><div className="tx-sub">{tx.sub} · {tx.date}</div></div>
                <div><div className={"tx-amt "+(tx.type==="in"?"tx-amt-in":"tx-amt-out")}>{tx.amount}</div></div>
              </div>
            ))}
          </div>
        </>}

        {tab==="history"&&<>
          <div className="stat-row">
            {[["📤",transactions.filter(t=>t.type==="out").length,"Outgoing"],["📥",transactions.filter(t=>t.type==="in").length,"Incoming"],["📊",transactions.length,"Total"]].map(([ic,v,l])=>(
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="chip-row">
            {["all","ist","naira"].map(f=><span key={f} className={"chip"+(txFilter===f?" on":"")} onClick={()=>setTxFilter(f)}>{f==="all"?"All":f.toUpperCase()}</span>)}
          </div>
          <div className="tx-list">
            {filtered.map(tx=>(
              <div key={tx.id} className="tx-row">
                <div className={"tx-ico "+(tx.type==="in"?"tx-in":tx.type==="out"?"tx-out":"tx-n")}>{tx.type==="in"?"📥":tx.type==="out"?"📤":"🔄"}</div>
                <div className="tx-info"><div className="tx-title">{tx.title}</div><div className="tx-sub">{tx.sub} · {tx.date}</div></div>
                <div><div className={"tx-amt "+(tx.type==="in"?"tx-amt-in":"tx-amt-out")}>{tx.amount}</div><div className="tx-date">{tx.wallet==="ist"?"IST":"₦"}</div></div>
              </div>
            ))}
            {filtered.length===0&&<div className="empty"><div className="empty-ico">📊</div><div className="empty-t">No transactions found</div></div>}
          </div>
        </>}
      </div>

      {/* SEND */}
      <Modal open={sendOpen} onClose={()=>setSendOpen(false)} title="Send via OPay" lg sheet
        footer={<><button className="btn btn-g" onClick={()=>setSendOpen(false)}>Cancel</button><button className="btn btn-p btn-lg" onClick={doSend} disabled={!sendPhone||!sendAmt}><I.Send/>Send Money</button></>}>
        <div className="sr-hero">
          <div className="sr-hero-ico">📤</div>
          <div className="sr-hero-t">Send Naira</div>
          <div className="sr-hero-s">Instant transfer to any OPay number</div>
        </div>
        <div style={{background:"var(--sf3)",borderRadius:"var(--r12)",padding:"12px 14px",border:"1px solid var(--bd)",marginBottom:14}}>
          <div style={{fontSize:10.5,color:"var(--t4)",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Available Balance</div>
          <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:900,color:"var(--ac)"}}>₦{fmt(walletNaira)}</div>
        </div>
        <div className="notice ni"><I.Info/><span>Only OPay phone numbers accepted. Transfers are instant and irreversible.</span></div>
        <div className="form-g"><label className="label">Recipient OPay Number</label><input className="field" placeholder="e.g. 0801 234 5678" value={sendPhone} onChange={e=>setSendPhone(e.target.value)}/></div>
        <div className="form-g"><label className="label">Amount (₦)</label><input className="field" type="number" placeholder="0.00" value={sendAmt} onChange={e=>setSendAmt(e.target.value)} style={{fontSize:20,fontWeight:800,fontFamily:"var(--fd)"}}/></div>
        <div className="form-g"><label className="label">Note (optional)</label><input className="field" placeholder="What is this payment for?"/></div>
        {sendAmt&&<div style={{textAlign:"center",padding:11,background:"var(--as)",borderRadius:"var(--r10)",fontSize:12.5,fontWeight:600,color:"var(--ac)"}}>Balance after: ₦{fmt(walletNaira-parseFloat(sendAmt||0))}</div>}
      </Modal>

      {/* RECEIVE */}
      <Modal open={recvOpen} onClose={()=>setRecvOpen(false)} title="Receive via OPay" sheet>
        <div className="sr-hero">
          <div className="sr-hero-ico">📲</div>
          <div className="sr-hero-t">Receive Naira</div>
          <div className="sr-hero-s">Share your OPay number to receive money</div>
        </div>
        <div style={{background:"var(--sf3)",border:"1px solid var(--bd)",borderRadius:"var(--r16)",padding:20,textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:13,color:"var(--t4)",marginBottom:6}}>Your OPay-Linked Number</div>
          <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:900,color:"var(--ac)",marginBottom:10}}>0801 234 5678</div>
          <div style={{fontSize:12,color:"var(--t4)",lineHeight:1.65}}>Share this number. Sender must use OPay. Funds reflect instantly.</div>
        </div>
        <button className="btn btn-p btn-full btn-lg"><I.Check/>Copy Number</button>
        <div className="notice ni" style={{marginTop:12}}><I.Info/><span>Only OPay transfers are accepted. Bank wires not supported.</span></div>
      </Modal>

      {/* TOP UP */}
      <Modal open={topupOpen} onClose={()=>setTopupOpen(false)} title="Top Up Naira Wallet" lg sheet
        footer={<><button className="btn btn-g" onClick={()=>setTopupOpen(false)}>Cancel</button><button className="btn btn-p btn-lg" onClick={doTopup} disabled={!topupAmt}><I.Download/>Top Up Now</button></>}>
        <div className="sr-hero">
          <div className="sr-hero-ico">💳</div>
          <div className="sr-hero-t">Add Money</div>
          <div className="sr-hero-s">Fund your Naira wallet instantly</div>
        </div>
        <div className="form-g">
          <label className="label">Top-Up Method</label>
          {[{k:"opay",l:"OPay Wallet",s:"Instant · Zero fees",ico:"📱"},{k:"bank",l:"Bank Transfer",s:"3–5 mins · ₦50 fee",ico:"🏦"},{k:"ussd",l:"USSD (*737#)",s:"Works without data",ico:"📞"},{k:"card",l:"Debit Card",s:"Instant · 1.5% fee",ico:"💳"}].map(m=>(
            <div key={m.k} className={"pay-opt"+(topupMethod===m.k?" on":"")} onClick={()=>setTopupMethod(m.k)} style={{marginBottom:7}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><div className="pay-radio"/><span style={{fontSize:20}}>{m.ico}</span><div><div style={{fontWeight:600,fontSize:12.5,color:"var(--t1)"}}>{m.l}</div><div style={{fontSize:11,color:"var(--t4)"}}>{m.s}</div></div></div>
            </div>
          ))}
        </div>
        <div className="form-g"><label className="label">Amount (₦)</label><input className="field" type="number" placeholder="0.00" value={topupAmt} onChange={e=>setTopupAmt(e.target.value)} style={{fontSize:22,fontWeight:800,fontFamily:"var(--fd)"}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:12}}>
          {[5000,10000,50000,100000].map(v=>(
            <button key={v} className="btn btn-g btn-sm" style={{fontSize:10}} onClick={()=>setTopupAmt(String(v))}>₦{fmt(v)}</button>
          ))}
        </div>
        <div className="notice nok"><I.Info/><span>Funds reflect in your Naira wallet after confirmation. You can convert to IST at any time.</span></div>
      </Modal>

      {/* BUY IST */}
      <Modal open={buyISTOpen} onClose={()=>setBuyISTOpen(false)} title="Buy IST Tokens" lg sheet
        footer={<><button className="btn btn-g" onClick={()=>setBuyISTOpen(false)}>Cancel</button><button className="btn btn-p btn-lg" disabled={!selPkg} onClick={doBuyIST}><I.Swap/>Confirm Purchase{selPkg?" — "+selPkg.naira:""}</button></>}>
        <div className="ist-buy-hero">
          <div className="ist-buy-hero-c">
            <div className="ist-token-ico">🌱</div>
            <div style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:900,marginBottom:4}}>IST Token</div>
            <div className="ist-rate-badge">1 IST = ₦8.00 · Rate locked for 15 min</div>
            <div style={{fontSize:12,opacity:.7,lineHeight:1.6}}>Use IST to invest in farms, buy produce, hire labor, and earn harvest dividends.</div>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label className="label">Select Package</label>
          <div className="ist-packages">
            {istPkgs.map(p=>(
              <div key={p.val} className={"ist-pkg"+(selPkg?.val===p.val?" on":"")} onClick={()=>setSelPkg(p)}>
                <div className="ist-pkg-amt">{p.amt}</div>
                <div className="ist-pkg-naira">{p.naira}</div>
                {p.bonus&&<div className="ist-pkg-bonus">{p.bonus}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="form-g"><label className="label">Or enter custom amount (IST)</label><input className="field" type="number" placeholder="e.g. 2500"/></div>
        {selPkg&&<div style={{background:"var(--sf3)",borderRadius:"var(--r12)",padding:"13px 15px",border:"1px solid var(--bd)"}}>
          {[["Package",selPkg.amt],["Cost",selPkg.naira],["Your balance",fmt(walletNaira)+" ₦"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--t4)",marginBottom:6}}><span>{l}</span><span style={{fontWeight:600,color:"var(--t1)"}}>{v}</span></div>
          ))}
        </div>}
        <div className="notice nw" style={{marginTop:12}}><I.Info/><span>IST is a platform token, not a financial security. Value may fluctuate. Only buy what you intend to use.</span></div>
      </Modal>
    </div>
  );
}

/* ============================================================
   MESSAGES SECTION
   ============================================================ */

export default WalletSection;
