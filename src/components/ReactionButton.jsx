import React, { useState } from 'react';
import I from '../icons/icons.jsx';

export default function ReactionButton({ liked = false, count = 0, onToggle, className = 'post-act', label }) {
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleClick(event) {
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const isLiked = await onToggle?.();
      if (isLiked) {
        setBurst(false);
        requestAnimationFrame(() => setBurst(true));
        window.setTimeout(() => setBurst(false), 760);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={`${className}${liked ? ' liked' : ''} reaction-button`} onClick={handleClick} disabled={busy} aria-pressed={liked} aria-label={label || `${liked ? 'Unlike' : 'Like'}; ${count} likes`}>
      <span className="reaction-heart"><I.Heart/></span>
      <span>{count}</span>
      {burst && <span className="like-burst" aria-hidden="true"><i/><i/><i/><i/><i/><i/></span>}
    </button>
  );
}
