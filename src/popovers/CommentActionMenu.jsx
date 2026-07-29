import React, { useState, useRef, useEffect } from 'react';
import I from '../icons/icons.jsx';

function CommentActionMenu({isOwner,onDelete,showToast}){
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
      setDropUp(window.innerHeight-rect.bottom<160);
    }
    setOpen(v=>!v);
  }
  return(
    <div className="comment-menu-anchor" ref={ref}>
      <button ref={btnRef} className="comment-menu-trigger" onClick={handleToggle}><I.MoreV/></button>
      {open&&(
        <div className={"comment-menu-dd"+(dropUp?" drop-up":"")} onClick={e=>e.stopPropagation()}>
          {isOwner?
            <button className="pmd-item danger" onClick={()=>{setOpen(false);onDelete&&onDelete();}}><I.Trash/>Delete</button>:
            <>
              <button className="pmd-item" onClick={()=>{setOpen(false);showToast("ok","User muted.");}}><I.Bell/>Mute</button>
              <button className="pmd-item danger" onClick={()=>{setOpen(false);showToast("ok","Comment reported.");}}><I.Ban/>Report</button>
            </>
          }
        </div>
      )}
    </div>
  );
}

export { CommentActionMenu };
