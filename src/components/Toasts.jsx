import React from 'react';

function Toasts({list}){
  return <div className="toast-area">{list.map(t=>(
    <div key={t.id} className={"toast "+t.type}>
      <span style={{fontSize:15}}>{t.type==="ok"?"✅":t.type==="err"?"⚠️":"ℹ️"}</span>
      <span>{t.msg}</span>
    </div>
  ))}</div>;
}

export default Toasts;
