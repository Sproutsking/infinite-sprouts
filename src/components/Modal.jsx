import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import I from '../icons/icons.jsx';

function Modal({open,onClose,title,wide,lg,children,footer}){
  useEffect(()=>{
    if(!open) return undefined;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previousOverflow;};
  },[open]);

  useEffect(()=>{
    if(!open) return undefined;
    const handleKeyDown=event=>{if(event.key==='Escape') onClose();};
    window.addEventListener('keydown',handleKeyDown);
    return()=>window.removeEventListener('keydown',handleKeyDown);
  },[open,onClose]);

  if(!open) return null;
  return createPortal((
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={"mbox"+(wide?" mbox-wide":lg?" mbox-lg":"")} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mhd">
          <span className="mt">{title}</span>
          <button className="ib" onClick={onClose}><I.X/></button>
        </div>
        <div className="mbody">{children}</div>
        {footer&&<div className="mfoot">{footer}</div>}
      </div>
    </div>
  ),document.body);
}

export default Modal;
