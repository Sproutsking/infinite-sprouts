// Pure helper functions
const fmt = n => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n);
const pct = (v,max) => Math.min(100,Math.round((v/max)*100));
const nowTime = () => new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

/* ============================================================
   SOCIAL CONTEXT — shared user/community/follow state
   ============================================================ */

export { fmt, pct, nowTime };
