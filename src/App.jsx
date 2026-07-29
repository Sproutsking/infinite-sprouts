import React, { useState, useEffect, useRef } from 'react';
import CSS from './styles/global.css.js';
import I from './icons/icons.jsx';
import { Toasts, Toggle } from './components/index.jsx';
import { fmt } from './utils/helpers.js';
import SEED from './data/seed.js';
import LinkSection from './sections/link/LinkSection.jsx';
import FarmSection from './sections/farm/FarmSection.jsx';
import LabsSection from './sections/labs/LabsSection.jsx';
import WalletSection from './sections/wallet/WalletSection.jsx';
import MessagesSection from './sections/messages/MessagesSection.jsx';
import AccountSection from './sections/account/AccountSection.jsx';
import SupportSection from './overlays/SupportSection.jsx';
import NotificationsSection from './overlays/NotificationsSection.jsx';

export default function App(){
  const [theme,setTheme]=useState("dark");
  const [section,setSection]=useState("farm");
  const [toasts,setToasts]=useState([]);
  const [walletIST,setWalletIST]=useState(50000);
  const [walletNaira,setWalletNaira]=useState(250000);
  const [transactions,setTransactions]=useState(SEED.transactions);
  const [ddOpen,setDdOpen]=useState(false);
  const [supportOpen,setSupportOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const [farmListOpen,setFarmListOpen]=useState(false);
  const [farmActiveTab,setFarmActiveTab]=useState("produce");
  const ddRef=useRef(null);

  useEffect(()=>{
    const el=document.createElement("style");
    el.id="sprouts-v4";el.textContent=CSS;
    document.head.appendChild(el);
    return()=>{document.getElementById("sprouts-v4")?.remove();};
  },[]);

  useEffect(()=>{document.documentElement.setAttribute("data-theme",theme);},[theme]);

  useEffect(()=>{
    function h(e){if(ddRef.current&&!ddRef.current.contains(e.target))setDdOpen(false);}
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  function toast(type,msg){
    const id=Date.now();
    setToasts(p=>[...p,{id,type,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200);
  }
  function spend(wallet,amount,title){
    if(wallet==="ist") setWalletIST(p=>Math.max(0,p-amount));
    else setWalletNaira(p=>Math.max(0,p-amount));
    setTransactions(p=>[{id:Date.now(),type:"out",title,sub:"Marketplace",amount:"−"+fmt(amount)+" "+(wallet==="ist"?"IST":"₦"),date:"Now",wallet},...p]);
  }
  function walletAction(action,amount,to){
    if(action==="send"){
      setWalletNaira(p=>Math.max(0,p-amount));
      setTransactions(p=>[{id:Date.now(),type:"out",title:"OPay to "+to,sub:"Naira · OPay",amount:"−₦"+fmt(amount),date:"Now",wallet:"naira"},...p]);
    }
  }

  const sectionTitle={link:"Link",farm:"Farm",labs:"Labs",wallet:"Wallet",messages:"Messages",account:"Account"};
  const navItems=[
    {k:"link",l:"Link",ic:I.Link},
    {k:"farm",l:"Farm",ic:I.Farm},
    {k:"labs",l:"Labs",ic:I.Labs},
    {k:"wallet",l:"Wallet",ic:I.Wallet},
    {k:"messages",l:"DM",ic:I.Msg,badge:4},
  ];

  return(
    <div className="shell">
      <header className="root-hd">
        <div className="hd-left">
          <div className="profile-wrap" ref={ddRef}>
            <button className="profile-btn" onClick={()=>setDdOpen(v=>!v)}>YO</button>
            {ddOpen&&(
              <div className="profile-dd">
                <div className="dd-head">
                  <div className="dd-av">YO</div>
                  <div className="dd-name">Your Name</div>
                  <div className="dd-email">yourname@email.com</div>
                </div>
                <div className="dd-sect">
                  <button className="dd-item" onClick={()=>{setSection("account");setDdOpen(false);}}>
                    <div className="dd-ico"><I.User/></div>View Profile
                  </button>
                  <div className="dd-theme-row">
                    <div className="dd-theme-lbl"><div className="dd-ico">{theme==="dark"?<I.Moon/>:<I.Sun/>}</div>Dark Mode</div>
                    <Toggle on={theme==="dark"} set={()=>setTheme(t=>t==="dark"?"light":"dark")}/>
                  </div>
                </div>
                <div className="dd-div"/>
                <div className="dd-sect">
                  <button className="dd-item" onClick={()=>{setSupportOpen(true);setDdOpen(false);}}>
                    <div className="dd-ico"><I.Help/></div>Help & Support
                  </button>
                  <button className="dd-item danger" onClick={()=>{toast("info","Signed out.");setDdOpen(false);}}>
                    <div className="dd-ico"><I.LogOut/></div>Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hd-center">{sectionTitle[section]||""}</div>

        <div className="hd-right">
          {section==="farm"&&farmActiveTab!=="invest"&&(
            <button className="btn btn-p btn-sm" onClick={()=>setFarmListOpen(true)} style={{marginRight:4}}><I.Plus/>List</button>
          )}
          <button className="hd-btn" onClick={()=>setSupportOpen(true)} title="Help"><I.Help/></button>
          <button className="hd-btn" onClick={()=>setNotifOpen(true)} title="Notifications"><I.Bell/><div className="dot"/></button>
        </div>
      </header>

      <nav className="sidebar">
        <div className="nav-lbl">Navigate</div>
        {navItems.map(item=>(
          <button key={item.k} className={"nav-item"+(section===item.k?" on":"")} onClick={()=>setSection(item.k)}>
            <span className="nav-ico-wrap"><item.ic/></span>
            <span className="nav-item-text">{item.l}</span>
            {item.badge&&<span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
        <div className="nav-spacer"/>
        <div className="nav-div"/>
        <button className={"nav-item nav-item-account"+(section==="account"?" on":"")} onClick={()=>setSection("account")}>
          <span className="nav-ico-wrap"><I.User/></span><span className="nav-item-text">Account</span>
        </button>
      </nav>

      {section==="link"&&<LinkSection showToast={toast} onGoToMessages={()=>setSection("messages")}/>}
      {section==="farm"&&<FarmSection walletIST={walletIST} walletNaira={walletNaira} onSpend={spend} showToast={toast} listOpen={farmListOpen} setListOpen={setFarmListOpen} activeFarmTab={farmActiveTab} setActiveFarmTab={setFarmActiveTab}/>}
      {section==="labs"&&<LabsSection showToast={toast}/>}
      {section==="wallet"&&<WalletSection walletIST={walletIST} walletNaira={walletNaira} transactions={transactions} onAction={walletAction} showToast={toast}/>}
      {section==="messages"&&<MessagesSection/>}
      {section==="account"&&<AccountSection theme={theme} setTheme={setTheme} showToast={toast} onOpenNotifications={()=>setNotifOpen(true)} onOpenSupport={()=>setSupportOpen(true)}/>}

      {supportOpen&&<SupportSection onClose={()=>setSupportOpen(false)}/>}
      {notifOpen&&<NotificationsSection onClose={()=>setNotifOpen(false)}/>}
      <Toasts list={toasts}/>
    </div>
  );
}
