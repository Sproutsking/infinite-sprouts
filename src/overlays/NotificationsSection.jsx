import React, { useState } from 'react';
import I from '../icons/icons.jsx';

function NotificationsSection({onClose}){
  const [filter,setFilter]=useState("all");
  const notifs=[
    {id:1,type:"return",ico:"💰",title:"Harvest dividend received",body:"+12,500 IST from Green Valley Maize Q3 harvest.",time:"2m ago",unread:true},
    {id:2,type:"message",ico:"💬",title:"New message from Chidi Okafor",body:"The maize yield report is ready for review.",time:"15m ago",unread:true},
    {id:3,type:"community",ico:"🌽",title:"Nigerian Maize Growers",body:"5 new posts in your community.",time:"1h ago",unread:true},
    {id:4,type:"order",ico:"📦",title:"Order shipped",body:"Your NPK Fertilizer order is in transit.",time:"3h ago",unread:false},
    {id:5,type:"invest",ico:"📈",title:"Investment milestone reached",body:"Sunrise Rice Farm hit 80% funding goal.",time:"5h ago",unread:false},
    {id:6,type:"security",ico:"🔒",title:"New login detected",body:"Login from a new device in Lagos, Nigeria.",time:"Yesterday",unread:false},
    {id:7,type:"wallet",ico:"📲",title:"OPay transfer received",body:"+₦50,000 from Adaeze O.",time:"Jun 4",unread:false},
  ];
  const filters=[["all","All"],["return","Returns"],["message","Messages"],["community","Community"],["wallet","Wallet"]];
  const filtered=filter==="all"?notifs:notifs.filter(n=>n.type===filter);
  return(
    <div className="sup-overlay">
      <div className="sup-hd">
        <button className="ib" onClick={onClose}><I.ArrowL/></button>
        <div style={{fontFamily:"var(--fd)",fontSize:15,fontWeight:700,color:"var(--t1)"}}>Notifications</div>
        <div className="sub-hd-sp"/>
        <button className="btn btn-g btn-sm">Mark all read</button>
      </div>
      <div className="sup-body">
        <div className="sup-content">
          <div className="chip-row">
            {filters.map(([k,l])=>(
              <span key={k} className={"chip"+(filter===k?" on":"")} onClick={()=>setFilter(k)}>{l}</span>
            ))}
          </div>
          {filtered.length===0?
            <div className="empty"><div className="empty-ico">🔔</div><div className="empty-t">No notifications</div><div className="empty-s">You are all caught up</div></div>:
            <div className="notif-list">
              {filtered.map(n=>(
                <div key={n.id} className={"notif-row"+(n.unread?" unread":"")}>
                  <div className="notif-ico">{n.ico}</div>
                  <div className="notif-info">
                    <div className="notif-title-row">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                    <div className="notif-body">{n.body}</div>
                  </div>
                  {n.unread&&<div className="notif-dot"/>}
                </div>
              ))}
            </div>
          }
          <div style={{height:20}}/>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */

export default NotificationsSection;
