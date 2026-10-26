import React, { useState, useRef, useEffect } from 'react';
import I from '../icons/icons.jsx';
import { Av } from '../components/index.jsx';
import { useSocial } from '../context/SocialContext.jsx';
import { formatPostTime } from '../utils/postTime.js';
import { createDefaultUsername } from '../utils/username.js';

function ProfilePopover({user,open,onClose}){
  const ctx=useSocial();
  const ref=useRef(null);
  const [anchorClass,setAnchorClass]=useState("measuring");

  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target))onClose();}
    if(open) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);

  // Measure on mount and correct position if overflowing
  useEffect(()=>{
    if(!open||!ref.current) return;
    const rect=ref.current.getBoundingClientRect();
    const vw=window.innerWidth;
    if(rect.right>vw-8){
      setAnchorClass("anchor-right");
    } else {
      setAnchorClass("");
    }
  },[open]);

  if(!open||!user||!ctx) return null;
  const {following,onToggleFollow,onDM,onSeeProfile,currentUserId}=ctx;
  const isMe=Boolean(currentUserId&&String(user.id)===String(currentUserId));
  const isFollowing=!isMe&&!!following[user.id];
  return(
    <div className={"profile-pop "+anchorClass} ref={ref} onClick={e=>e.stopPropagation()}>
      <div className="pp-top">
        <Av initials={user.initials} size="lg" green src={user.avatarUrl}/>
        <div>
          <div className="pp-name">{user.name}</div>
          <div className="pp-role">{isMe?'Your profile':user.role}</div>
        </div>
      </div>
      <div className="pp-stats"><span><b>{Number(user.followers||0).toLocaleString()}</b> followers</span><span><b>{Number(user.following||0).toLocaleString()}</b> following</span></div>
      {isMe
        ? <div className="pp-acts"><button className="pp-btn primary" style={{width:"100%"}} onClick={()=>{onSeeProfile(user.id);onClose();}}><I.User/>View your profile</button></div>
        : <div className="pp-acts">
          <button className="pp-btn" onClick={()=>{onDM(user);onClose();}}><I.Msg/>DM</button>
          <button className={"pp-btn"+(isFollowing?" following":" primary")} onClick={()=>{onToggleFollow(user.id);}}>
            {isFollowing?<><I.Check/>Following</>:<><I.Plus/>Follow</>}
          </button>
          <button className="pp-btn" onClick={()=>{onSeeProfile(user.id);onClose();}}><I.User/>Profile</button>
        </div>}
    </div>
  );
}

/* Clickable author trigger — works anywhere in the app via context */

function AuthorTrigger({userId,size,createdAt}){
  const ctx=useSocial();
  const [open,setOpen]=useState(false);
  if(!ctx) return null;
  const {users,onSeeProfile,currentUserId}=ctx;
  const user=users[userId] || { id:userId, name:'Member', initials:'ME', role:'Member' };
  const isMe=Boolean(currentUserId&&String(userId)===String(currentUserId));
  return(
    <div className="profile-pop-anchor">
      <button className="author-trigger" onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}>
        <Av initials={user.initials} size={size||"md"} src={user.avatarUrl}/>
        <div>
          <div className="author-name-link">{user.name}</div>
          <div className="post-meta">{[
            `@${String(user.username || (user.id ? createDefaultUsername(user.name, user.id) : 'unknown_user')).replace(/^@/, '')}`,
            createdAt ? formatPostTime(createdAt) : '',
          ].filter(Boolean).join(' · ')}</div>
        </div>
      </button>
      {open&&<ProfilePopover user={user} open={open} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

/* Inline clickable author name only — for comment rows, reply context, etc. */

function AuthorName({userId,style}){
  const ctx=useSocial();
  const [open,setOpen]=useState(false);
  if(!ctx) return null;
  const {users}=ctx;
  const user=users[userId];
  if(!user) return <span style={style}>Member</span>;
  return(
    <div className="profile-pop-anchor" style={{display:"inline-block"}}>
      <span
        className="author-name-link"
        style={{cursor:"pointer",...style}}
        onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}>
        {user.name}
      </span>
      {open&&<ProfilePopover user={user} open={open} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

/* ============================================================
   COMMUNITY POPOVER — Follow / See Community
   ============================================================ */

export { ProfilePopover, AuthorTrigger, AuthorName };
