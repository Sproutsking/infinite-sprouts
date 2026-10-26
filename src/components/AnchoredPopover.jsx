import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import I from '../icons/icons.jsx';

export default function AnchoredPopover({ open, anchor, title, onClose, children, className = '' }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const panel = panelRef.current;
      if (!panel) return;

      const anchorRect = anchor?.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const margin = 12;
      let left = anchorRect
        ? anchorRect.right - panelRect.width
        : (window.innerWidth - panelRect.width) / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - panelRect.width - margin));

      let top = anchorRect ? anchorRect.bottom + 8 : (window.innerHeight - panelRect.height) / 2;
      if (top + panelRect.height > window.innerHeight - margin && anchorRect) {
        top = anchorRect.top - panelRect.height - 8;
      }
      top = Math.max(margin, Math.min(top, window.innerHeight - panelRect.height - margin));

      setPosition({ top, left, visibility: 'visible' });
    };

    const handlePointerDown = event => {
      if (!panelRef.current?.contains(event.target) && !anchor?.contains(event.target)) onClose();
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    const resizeObserver = panelRef.current && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updatePosition)
      : null;
    if (resizeObserver) resizeObserver.observe(panelRef.current);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      resizeObserver?.disconnect();
    };
  }, [anchor, onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <section
      ref={panelRef}
      className={`anchored-popover ${className}`}
      style={position}
      role="dialog"
      aria-modal="false"
      aria-label={title}
    >
      <header className="anchored-popover-header">
        <h2>{title}</h2>
        <button className="ib" type="button" onClick={onClose} aria-label={`Close ${title}`}>
          <I.X/>
        </button>
      </header>
      {children}
    </section>,
    document.body,
  );
}
