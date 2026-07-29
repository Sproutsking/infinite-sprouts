import React from 'react';

const SocialCtx = React.createContext(null);
function useSocial(){ return React.useContext(SocialCtx); }

/* ============================================================
   ICONS
   ============================================================ */

export { SocialCtx, useSocial };
