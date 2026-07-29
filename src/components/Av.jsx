import React from 'react';

function Av({initials,size,green}){
  return <div className={"av av-"+(size||"md")+" "+(green?"av-g":"av-c")}>{initials}</div>;
}

export default Av;
