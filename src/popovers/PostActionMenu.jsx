import React, { useState, useRef, useEffect } from 'react';
import I from '../icons/icons.jsx';

function PostActionMenu({post,isOwner,onDelete,onEdit,onCopyLink,onTurnOffComments,onPin,onHide,onMute,onBlock,onReport}){
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
            <button className="pmd-item" onClick={()=>{setOpen(false);onPin?.(post);}}><I.TrendUp/>{post.pinnedAt?'Unpin from Profile':'Pin to Profile'}</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onCopyLink?.(post);}}><I.Globe/>Copy Link</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onTurnOffComments&&onTurnOffComments(post);}}><I.Comment/>{post.commentsEnabled === false ? 'Turn On Comments' : 'Turn Off Comments'}</button>
            <div className="pmd-div"/>
            <button className="pmd-item danger" onClick={()=>{setOpen(false);onDelete?.(post);}}><I.Trash/>Delete Post</button>
          </>:<>
            <button className="pmd-item" onClick={()=>{setOpen(false);onCopyLink?.(post);}}><I.Globe/>Copy Link</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onHide?.(post);}}><I.X/>Not Interested</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onMute?.(post);}}><I.Bell/>Mute User</button>
            <button className="pmd-item" onClick={()=>{setOpen(false);onBlock?.(post);}}><I.Ban/>Block User</button>
            <div className="pmd-div"/>
            <button className="pmd-item danger" onClick={()=>{setOpen(false);onReport?.(post);}}><I.Ban/>Report Post</button>
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
