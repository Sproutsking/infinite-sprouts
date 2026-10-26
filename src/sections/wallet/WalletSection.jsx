import React, { useState } from 'react';
import I from '../../icons/icons.jsx';
import { useWallet } from '../../context/serviceIndex.jsx';

function WalletSection() {
  const { transactions = [] } = useWallet();
  const [tab, setTab] = useState('overview');
  const [txFilter, setTxFilter] = useState('all');
  const filtered = txFilter === 'all' ? transactions : transactions.filter(item => item.wallet === txFilter);

  function TransactionRows({ items }) {
    if (items.length === 0) {
      return <div className="empty"><div className="empty-ico">📊</div><div className="empty-t">No legacy ledger entries</div></div>;
    }
    return (
      <div className="tx-list">
        {items.map(tx => (
          <div key={tx.id} className="tx-row">
            <div className={"tx-ico " + (tx.type === 'in' ? 'tx-in' : tx.type === 'out' ? 'tx-out' : 'tx-n')}>{tx.type === 'in' ? '📥' : tx.type === 'out' ? '📤' : '🔄'}</div>
            <div className="tx-info"><div className="tx-title">{tx.title}</div><div className="tx-sub">{tx.sub} · {tx.date}</div></div>
            <div>
              <div className={"tx-amt " + (tx.type === 'in' ? 'tx-amt-in' : 'tx-amt-out')}>{tx.amount}</div>
              <div className="tx-date">{tx.wallet === 'ist' ? 'IST' : '₦'}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="main main-wallet">
      <div className="sub-hd">
        {[['overview', 'Overview'], ['naira', 'Naira'], ['ist', 'IST'], ['history', 'History']].map(([key, label]) => (
          <button key={key} className={"sub-tab" + (tab === key ? " on" : "")} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      <div className="scroll">
        {tab === 'overview' && <>
          <div className="w-cards">
            <button className="w-mini" type="button" style={{textAlign:'left',font:'inherit',color:'inherit',width:'100%',cursor:'pointer'}} onClick={() => setTab('naira')}>
              <div className="w-mini-lbl">Naira wallet</div>
              <div className="w-mini-amt">Not connected</div>
              <div className="w-mini-note">Paystack / OPay setup pending</div>
              <div className="opay-badge"><div className="opay-dot"/><span>Payments unavailable</span></div>
            </button>
            <button className="w-mini" type="button" style={{textAlign:'left',font:'inherit',color:'inherit',width:'100%',cursor:'pointer'}} onClick={() => setTab('ist')}>
              <div className="w-mini-lbl">IST native asset</div>
              <div className="w-mini-amt">Not connected</div>
              <div className="w-mini-note">Cardano mainnet token not deployed</div>
              <div className="opay-badge"><div className="opay-dot"/><span>No on-chain balance</span></div>
            </button>
          </div>
          <div className="notice ni"><I.Info/><span>Numbers recorded by the legacy app ledger are not proof of cleared Naira payments or Cardano transactions.</span></div>
          <div className="sh" style={{marginBottom:8}}>Legacy app ledger · not payment-confirmed</div>
          <TransactionRows items={transactions.slice(0, 6)}/>
        </>}

        {tab === 'naira' && <>
          <div className="w-card"><div className="wci"><div className="wc-lbl">Naira wallet</div><div className="wc-amt">Unavailable</div><div className="wc-sub">Paystack and OPay are not connected</div></div></div>
          <div className="notice ni"><I.Info/><span>Top-ups, transfers, and purchases are disabled until a payment provider and server-side payment verification are deployed. Legacy ledger entries are not proof of payment.</span></div>
          <div className="sh" style={{marginBottom:8}}>Legacy Naira ledger entries</div>
          <TransactionRows items={transactions.filter(item => item.wallet === 'naira')}/>
        </>}

        {tab === 'ist' && <>
          <div className="w-card"><div className="wci"><div className="wc-lbl">IST Cardano native asset</div><div className="wc-amt">Not connected</div><div className="wc-sub">Fixed-supply token and wallet integration are not deployed</div></div></div>
          <div className="notice nok"><I.Info/><span>IST sends, receives, purchases, and farm investments are disabled. A database ledger is never shown as an on-chain token balance.</span></div>
          <div className="sh" style={{marginBottom:8}}>Legacy IST ledger entries</div>
          <TransactionRows items={transactions.filter(item => item.wallet === 'ist')}/>
        </>}

        {tab === 'history' && <>
          <div className="notice ni"><I.Info/><span>This history contains legacy app records only; it is not an authoritative bank statement or blockchain transaction history.</span></div>
          <div className="stat-row">
            {[
              ['📤', transactions.filter(item => item.type === 'out').length, 'Legacy outgoing'],
              ['📥', transactions.filter(item => item.type === 'in').length, 'Legacy incoming'],
              ['📊', transactions.length, 'Legacy records'],
            ].map(([icon, value, label]) => (
              <div key={label} className="stat-tile"><div className="stat-ico">{icon}</div><div className="stat-v">{value}</div><div className="stat-l">{label}</div></div>
            ))}
          </div>
          <div className="chip-row">
            {['all', 'ist', 'naira'].map(filter => (
              <button key={filter} className={"chip" + (txFilter === filter ? " on" : "")} onClick={() => setTxFilter(filter)}>{filter === 'all' ? 'All' : filter.toUpperCase()}</button>
            ))}
          </div>
          <TransactionRows items={filtered}/>
        </>}
      </div>
    </div>
  );
}

export default WalletSection;
