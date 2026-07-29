import React, { useState, useRef, useEffect } from 'react';
import I from '../icons/icons.jsx';
import { Av } from '../components/index.jsx';
import { useSocial } from '../context/SocialContext.jsx';

function CommunityPopover({community,open,onClose}){
  const ctx=useSocial();
  const ref=useRef(null);
  const [anchorClass,setAnchorClass]=useState("measuring");

  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target))onClose();}
    if(open) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);

  useEffect(()=>{
    if(!open||!ref.current) return;
    const rect=ref.current.getBoundingClientRect();
    if(rect.right>window.innerWidth-8) setAnchorClass("anchor-right");
    else setAnchorClass("");
  },[open]);

  if(!open||!community||!ctx) return null;
  const {onToggleFollowCommunity,onGoCommunity}=ctx;
  const isFollowing=community.followed;
  return(
    <div className={"profile-pop "+anchorClass} ref={ref} onClick={e=>e.stopPropagation()} style={{width:264}}>
      <div style={{borderRadius:"var(--r12)",height:52,background:community.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:12,position:"relative",overflow:"hidden"}}>
        <span style={{position:"relative",zIndex:1}}>{community.ico}</span>
      </div>
      <div className="pp-name" style={{marginBottom:2}}>{community.name}</div>
      <div className="pp-stats" style={{marginBottom:10}}>
        <span><b>{community.members?.toLocaleString()}</b> members</span>
        <span><b>{community.posts}</b> posts</span>
      </div>
      {community.desc&&<div style={{fontSize:11.5,color:"var(--t3)",lineHeight:1.55,marginBottom:12}}>{community.desc.slice(0,90)}{community.desc.length>90?"…":""}</div>}
      <div className="pp-acts">
        <button className={"pp-btn"+(isFollowing?" following":" primary")} style={{flex:2}} onClick={()=>onToggleFollowCommunity(community.id)}>
          {isFollowing?<><I.Check/>Following</>:<><I.Plus/>Follow</>}
        </button>
        <button className="pp-btn" style={{flex:1}} onClick={()=>{onGoCommunity(community.id);onClose();}}><I.Globe/>Open</button>
      </div>
    </div>
  );
}

/* Clickable community trigger — banner/name chip → popover */

function CommunityTrigger({communityId,children,showName}){
  const ctx=useSocial();
  const [open,setOpen]=useState(false);
  if(!ctx) return children||null;
  const {communities}=ctx;
  const community=(communities||[]).find(c=>c.id===communityId);
  if(!community) return children||null;
  return(
    <div className="profile-pop-anchor" style={{display:"inline-block"}}>
      <span className="author-name-link" style={{cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}
        onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}>
        {children||<>{community.ico} {showName!==false&&community.name}</>}
      </span>
      {open&&<CommunityPopover community={community} open={open} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

/* ============================================================
   SAVE TO FOLDER PANEL
   ============================================================ */

export { CommunityPopover, CommunityTrigger };
