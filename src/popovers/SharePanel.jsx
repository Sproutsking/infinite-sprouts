import React from 'react';
import I from '../icons/icons.jsx';
import { Av, Modal } from '../components/index.jsx';

function SharePanel({open,onClose,post,users,showToast}){
  if(!post) return null;
  const recents=Object.values(users).filter(u=>u.id!=="you").slice(0,4);
  const shareVia=[
    {k:"copy",l:"Copy Link",ico:<I.Link/>,color:"var(--t3)",bg:"var(--sf3)"},
    {k:"whatsapp",l:"WhatsApp",ico:<I.WhatsApp/>,color:"#fff",bg:"#25D366"},
    {k:"twitter",l:"Twitter/X",ico:<I.XLogo/>,color:"#fff",bg:"#000"},
    {k:"facebook",l:"Facebook",ico:<I.Facebook/>,color:"#fff",bg:"#1877F2"},
    {k:"telegram",l:"Telegram",ico:<I.Telegram/>,color:"#fff",bg:"#229ED9"},
    {k:"instagram",l:"Instagram",ico:<I.Instagram/>,color:"#fff",bg:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"},
    {k:"linkedin",l:"LinkedIn",ico:<I.LinkedIn/>,color:"#fff",bg:"#0A66C2"},
    {k:"more",l:"More",ico:<I.Share/>,color:"var(--t3)",bg:"var(--sf3)"},
  ];
  function handleShareVia(k,l){
    onClose();
    if(k==="copy") showToast("ok","Link copied to clipboard!");
    else showToast("ok","Opening "+l+"…");
  }
  function handleSendTo(user){
    onClose();
    showToast("ok","Post sent to "+user.name+"!");
  }
  return(
    <Modal open={open} onClose={onClose} title="Share Post" sheet>
      <div className="sbar" style={{marginBottom:16}}><I.Search/><input placeholder="Search people by name or username…"/></div>
      <div style={{fontSize:"9.5px",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",color:"var(--t5)",marginBottom:8}}>Recent Conversations</div>
      <div className="share-recent-row">
        {recents.map(u=>(
          <div key={u.id} className="share-recent-item" onClick={()=>handleSendTo(u)}>
            <Av initials={u.initials} size="lg" green/>
            <span className="share-recent-name">{u.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>
      <div className="share-divider-row"><div className="share-divider-line"/><span className="share-divider-text">Or share via</span><div className="share-divider-line"/></div>
      <div className="share-via-grid">
        {shareVia.map(s=>(
          <div key={s.k} className="share-via-btn" onClick={()=>handleShareVia(s.k,s.l)}>
            <div className="share-via-ico" style={{background:s.bg,color:s.color}}>{s.ico}</div>
            <span className="share-via-label">{s.l}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ============================================================
   POST ACTION MENU — top-right dropdown, owner vs non-owner
   ============================================================ */

export default SharePanel;
