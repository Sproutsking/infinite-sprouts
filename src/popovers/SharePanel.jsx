import React from 'react';
import I from '../icons/icons.jsx';
import AnchoredPopover from '../components/AnchoredPopover.jsx';

function SharePanel({open,onClose,anchor,post,showToast,onShare}){
  if(!post) return null;
  const postUrl = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(post.body || 'A post from Infinite Sprouts');
  const shareVia=[
    {k:"copy",l:"Copy link",ico:<I.Link/>,color:"var(--t3)",bg:"var(--sf3)"},
    {k:"whatsapp",l:"WhatsApp",ico:<I.WhatsApp/>,color:"#fff",bg:"#25D366",url:`https://wa.me/?text=${encodedText}%20${encodedUrl}`},
    {k:"twitter",l:"X",ico:<I.XLogo/>,color:"#fff",bg:"#000",url:`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`},
    {k:"facebook",l:"Facebook",ico:<I.Facebook/>,color:"#fff",bg:"#1877F2",url:`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`},
    {k:"telegram",l:"Telegram",ico:<I.Telegram/>,color:"#fff",bg:"#229ED9",url:`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`},
    {k:"linkedin",l:"LinkedIn",ico:<I.LinkedIn/>,color:"#fff",bg:"#0A66C2",url:`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`},
    {k:"native",l:"More options",ico:<I.Share/>,color:"var(--t3)",bg:"var(--sf3)"},
  ];
  async function handleShareVia(option){
    if(option.k==="copy"){
      try {
        await navigator.clipboard.writeText(postUrl);
        showToast("ok","Link copied. Copying a link does not count as a completed share.");
      } catch {
        showToast("error","Unable to copy the post link.");
      }
      return;
    }
    onClose();
    if(option.k==="native"){
      await onShare?.(post, 'native');
      return;
    }
    const shareWindow = window.open(option.url, '_blank', 'noopener,noreferrer');
    if (!shareWindow) showToast('error','Your browser blocked the share destination. Allow pop-ups to continue.');
  }
  return(
    <AnchoredPopover open={open} anchor={anchor} onClose={onClose} title="Share Post" className="share-post-popover">
      <div className="anchored-popover-body">
      <div className="save-post-preview"><span className="save-post-ico"><I.Share/></span><span className="save-post-label">Share</span><span className="save-post-text">{post.body}</span></div>
      <div className="share-via-grid">
        {shareVia.map(s=>(
          <button key={s.k} type="button" className="share-via-btn" onClick={()=>handleShareVia(s)}>
            <div className="share-via-ico" style={{background:s.bg,color:s.color}}>{s.ico}</div>
            <span className="share-via-label">{s.l}</span>
          </button>
        ))}
      </div>
      <p className="share-count-note">Shares count only when the native share sheet completes. Copying or opening an external share page does not increase the count.</p>
      </div>
    </AnchoredPopover>
  );
}

/* ============================================================
   POST ACTION MENU — top-right dropdown, owner vs non-owner
   ============================================================ */

export default SharePanel;
