import React from 'react';
import I from '../icons/icons.jsx';

function Modal({open,onClose,title,wide,lg,sheet,children,footer}){
  if(!open) return null;
  return(
    <div className={"overlay"+(sheet?" mob-sheet":"")} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={"mbox"+(wide?" mbox-wide":lg?" mbox-lg":"")}>
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
