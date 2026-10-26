import React from 'react';
import I from '../icons/icons.jsx';

function Modal({open,onClose,title,wide,lg,children,footer}){
  if(!open) return null;
  return(
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
  );
}

export default Modal;
