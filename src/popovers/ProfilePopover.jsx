import React, { useState, useRef, useEffect } from 'react';
import I from '../icons/icons.jsx';
import { Av } from '../components/index.jsx';
import { useSocial } from '../context/SocialContext.jsx';

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
  const {following,onToggleFollow,onDM,onSeeProfile}=ctx;
  const isFollowing=!!following[user.id];
  return(
    <div className={"profile-pop "+anchorClass} ref={ref} onClick={e=>e.stopPropagation()}>
      <div className="pp-top">
        <Av initials={user.initials} size="lg" green/>
        <div>
          <div className="pp-name">{user.name}</div>
          <div className="pp-role">{user.role}</div>
        </div>
      </div>
      <div className="pp-stats"><span><b>{user.followers?.toLocaleString()}</b> followers</span><span><b>{user.following}</b> following</span></div>
      <div className="pp-acts">
        <button className="pp-btn" onClick={()=>{onDM(user);onClose();}}><I.Msg/>DM</button>
        <button className={"pp-btn"+(isFollowing?" following":" primary")} onClick={()=>{onToggleFollow(user.id);}}>
          {isFollowing?<><I.Check/>Following</>:<><I.Plus/>Follow</>}
        </button>
        <button className="pp-btn" onClick={()=>{onSeeProfile(user.id);onClose();}}><I.User/>Profile</button>
      </div>
    </div>
  );
}

/* Clickable author trigger — works anywhere in the app via context */

function AuthorTrigger({userId,size}){
  const ctx=useSocial();
  const [open,setOpen]=useState(false);
  if(!ctx) return null;
  const {users,onSeeProfile}=ctx;
  const user=users[userId];
  if(!user) return null;
  const isMe=userId==="you";
  return(
    <div className="profile-pop-anchor">
      <button className="author-trigger" onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}>
        <Av initials={user.initials} size={size||"md"}/>
        <div>
          <div className="author-name-link">{user.name}</div>
          <div className="post-meta">{user.role}</div>
        </div>
      </button>
      {open&&(isMe?(
        <div className="profile-pop" onClick={e=>e.stopPropagation()}>
          <div className="pp-top"><Av initials={user.initials} size="lg" green/><div><div className="pp-name">{user.name}</div><div className="pp-role">{user.role}</div></div></div>
          <button className="pp-btn primary" style={{width:"100%"}} onClick={()=>{onSeeProfile(userId);setOpen(false);}}><I.User/>View Your Profile</button>
        </div>
      ):(
        <ProfilePopover user={user} open={open} onClose={()=>setOpen(false)}/>
      ))}
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
  if(!user) return <span style={style}>{userId}</span>;
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
