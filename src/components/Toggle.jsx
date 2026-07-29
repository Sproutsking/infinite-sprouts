import React from 'react';

function Toggle({on,set}){
  return <button className={"tog "+(on?"on":"off")} onClick={()=>set(v=>!v)}><div className="tog-k"/></button>;
}

export default Toggle;
