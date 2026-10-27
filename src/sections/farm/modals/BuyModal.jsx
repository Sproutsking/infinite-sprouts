import React from 'react';
import I from '../../../icons/icons.jsx';
import { Modal } from '../../../components/index.jsx';
import { fmt } from '../../../utils/helpers.js';


function BuyModal({open,onClose,item,isLabor}){
  if(!open) return null;
  if(!item) return null;
  const unitPrice=isLabor?item.daily_rate:item.price_per_unit;
  const priceUnit=isLabor?'per day':`per ${item.unit||'unit'}`;
  return(
    <Modal open={open} onClose={onClose} title={isLabor?"Hire Team":"Purchase Item"} lg
      footer={<><button className="btn btn-g" onClick={onClose}>Close</button><button className="btn btn-p btn-lg" disabled title="Payments are disabled until the real payment and Cardano integrations are deployed"><I.Check/>Payments unavailable</button></>}>
      <div style={{display:"flex",gap:10,padding:"10px 12px",background:"var(--sf3)",borderRadius:"var(--r12)",border:"1px solid var(--bd)",marginBottom:16}}>
        {/^https?:\/\//i.test(item.image_url||'')?<img className="buy-item-image" src={item.image_url} alt={item.name||item.service_name}/>:<span style={{fontSize:28}}>{item.icon||'🌿'}</span>}
        <div><div style={{fontWeight:700,fontSize:13,color:"var(--t1)"}}>{item.name||item.service_name}</div><div style={{fontSize:11,color:"var(--t4)"}}>{fmt(unitPrice)} IST {priceUnit}</div></div>
      </div>
      <div className="form-g">
        <label className="label">Checkout unavailable</label>
        <div className="notice ni"><I.Info/><span>Naira payments require a configured Paystack/OPay payment flow. IST purchases require the Cardano token and wallet integration. No balance will be debited and no order will be placed here.</span></div>
      </div>
    </Modal>
  );
}

export default BuyModal;
