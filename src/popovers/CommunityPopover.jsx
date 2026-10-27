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
  const isPending=community.pending;
  const requiresApproval=community.privacy==='private'||community.joinApproval;
  return(
    <div className={"profile-pop community-popover "+anchorClass} ref={ref} onClick={e=>e.stopPropagation()}>
      <div className="community-popover-cover" style={community.coverImageUrl?{backgroundImage:`url("${community.coverImageUrl}")`}:{background:community.bg}}>
        <span className="community-popover-category"><I.Seedling/>{community.category||'General'}</span>
        <span className="community-popover-mark">{community.imageUrl?<img src={community.imageUrl} alt=""/>:community.ico}</span>
      </div>
      <div className="community-popover-content">
        <div className="community-popover-name">{community.name}</div>
        <div className="community-popover-access">{community.privacy==='private'?<I.Lock/>:<I.Globe/>}{community.privacy==='private'?'Private circle':'Open circle'}<i/>{requiresApproval?'Approval required':'Open joining'}</div>
        <div className="community-popover-stats">
          <span><b>{Number(community.members||0).toLocaleString()}</b> growers</span>
          <span><b>{Number(community.posts||0).toLocaleString()}</b> field notes</span>
        </div>
        {community.desc&&<div className="community-popover-description">{community.desc.slice(0,110)}{community.desc.length>110?"…":""}</div>}
        <div className="community-popover-actions">
          <button className={"pp-btn"+(isFollowing?" following":" primary")} onClick={()=>onToggleFollowCommunity(community.id,isPending?false:undefined)}>
            {isFollowing?<><I.Check/>Member</>:isPending?'Cancel request':<><I.Plus/>{requiresApproval?'Request to join':'Join circle'}</>}
          </button>
          <button className="pp-btn" onClick={()=>{onGoCommunity(community.id);onClose();}}><I.ArrowR/>Open</button>
        </div>
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
