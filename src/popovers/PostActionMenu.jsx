import React, { useState, useRef, useEffect } from 'react';
import I from '../icons/icons.jsx';

function PostActionMenu({post,isOwner,onDelete,onEdit,onCopyLink,onTurnOffComments,showToast}){
  const [open,setOpen]=useState(false);
  const [dropUp,setDropUp]=useState(false);
  const ref=useRef(null);
  const btnRef=useRef(null);
  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    if(open) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);
  function handleToggle(e){
    e.stopPropagation();
    if(!open&&btnRef.current){
      const rect=btnRef.current.getBoundingClientRect();
      const spaceBelow=window.innerHeight-rect.bottom;
      setDropUp(spaceBelow<260);
    }
    setOpen(v=>!v);
  }
  return(
    <div className="post-menu-anchor" ref={ref}>
      <button ref={btnRef} className="post-ico-btn" onClick={handleToggle}><I.MoreV/></button>
      {open&&(
        <div className={"post-menu-dd"+(dropUp?" drop-up":"")} onClick={e=>e.stopPropagation()}>
          {isOwner?<>
            <button className="pmd-item" onClick={()=>{setOpen(false);onEdit&&onEdit(post);}}><I.Edit/>Edit Post</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);showToast("info","Pin coming soon!");}}><I.TrendUp/>Pin to Profile</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onCopyLink?onCopyLink(post):showToast("ok","Link copied!");}}><I.Globe/>Copy Link</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onTurnOffComments?onTurnOffComments(post):showToast("ok","Comments turned off.");}}><I.Comment/>Turn Off Comments</button>
            <div className="pmd-div"/>
            <button className="pmd-item danger" onClick={()=>{setOpen(false);onDelete&&onDelete(post);}}><I.Trash/>Delete Post</button>
          </>:<>
            <button className="pmd-item" onClick={()=>{setOpen(false);onCopyLink?onCopyLink(post):showToast("ok","Link copied!");}}><I.Globe/>Copy Link</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);showToast("info","Post hidden from your feed.");}}><I.X/>Not Interested</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);showToast("ok","User muted.");}}><I.Bell/>Mute User</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);showToast("ok","User blocked.");}}><I.Ban/>Block User</button>
            <div className="pmd-div"/>
            <button className="pmd-item danger" onClick={()=>{setOpen(false);showToast("ok","Report submitted. Thank you.");}}><I.Ban/>Report Post</button>
          </>}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMMENT ACTION MENU — left of comment/reply
   ============================================================ */

export default PostActionMenu;
