import React from 'react';

function Av({initials,size,green,src}){
  const className = "av av-" + (size||"md") + " " + (green ? "av-g" : "av-c");
  return src ? (
    <div className={className}>
      <img src={src} alt={initials} />
    </div>
  ) : (
    <div className={className}>{initials}</div>
  );
}

export default Av;
