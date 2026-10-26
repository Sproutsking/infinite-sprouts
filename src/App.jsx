import React, { useState, useEffect, useRef, useCallback } from 'react';
import CSS from './styles/global.css.js';
import I from './icons/icons.jsx';
import { Av, Toasts, Toggle } from './components/index.jsx';
import Sidebar from './components/Sidebar.jsx';
import { fmt } from './utils/helpers.js';
import { useAuth } from './context/AuthContext.jsx';
import { useWallet, useNotifications } from './context/serviceIndex.jsx';
import LinkSection from './sections/link/LinkSection.jsx';
import FarmSection from './sections/farm/FarmSection.jsx';
import LabsSection from './sections/labs/LabsSection.jsx';
import WalletSection from './sections/wallet/WalletSection.jsx';
import MessagesSection from './sections/messages/MessagesSection.jsx';
import AccountSection from './sections/account/AccountSection.jsx';
import SupportSection from './overlays/SupportSection.jsx';
import NotificationsSection from './overlays/NotificationsSection.jsx';

export default function App(){
  const [theme,setTheme]=useState('dark');
  const [section,setSection]=useState('farm');
  const [toasts,setToasts]=useState([]);
  const [ddOpen,setDdOpen]=useState(false);
  const { user, profile, signOut } = useAuth();
  const { wallet, transactions, addTransaction, adjustBalance, refreshWallet } = useWallet();
  const { notifications } = useNotifications();
  const [supportOpen,setSupportOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const [farmListOpen,setFarmListOpen]=useState(false);
  const [farmActiveTab,setFarmActiveTab]=useState('produce');
  const [createPostRequest,setCreatePostRequest]=useState(0);
  const [communityRightRail,setCommunityRightRail]=useState(null);
  const [messageUnreadCount,setMessageUnreadCount]=useState(0);
  const [messageBadgeText,setMessageBadgeText]=useState('');
  const [linkStats,setLinkStats]=useState(null);
  const ddRef=useRef(null);

  const walletIST = wallet?.ist || 0;
  const walletNaira = wallet?.naira || 0;
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  useEffect(() => {
    setMessageBadgeText(messageUnreadCount > 9 ? '10+' : messageUnreadCount > 0 ? String(messageUnreadCount) : '');
  }, [messageUnreadCount]);

  useEffect(()=>{
    const el=document.createElement('style');
    el.id='sprouts-v4';
    el.textContent=CSS;
    document.head.appendChild(el);
    return()=>document.getElementById('sprouts-v4')?.remove();
  },[CSS]);

  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme);},[theme]);

  useEffect(()=>{
    if(section!=='link') {
      setCommunityRightRail(null);
      setLinkStats(null);
    }
  },[section]);

  useEffect(()=>{
    function h(e){if(ddRef.current&&!ddRef.current.contains(e.target))setDdOpen(false);}
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);

  const toast=useCallback((type,msg)=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,type,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200);
  },[]);
  const updateLinkStats=useCallback(stats=>setLinkStats(stats),[]);

  async function spend(walletType,amount,title){
    const total = Number(amount);
    if (!total || total <= 0) return;
    try {
      if (walletType === 'ist') {
        await adjustBalance({ ist_balance: Math.max(0, walletIST - total) });
      } else {
        await adjustBalance({ naira_balance: Math.max(0, walletNaira - total) });
      }
      await addTransaction({
        type: 'out',
        title,
        sub: walletType === 'ist' ? 'IST purchase' : 'Marketplace',
        amount: total,
        wallet: walletType,
        created_at: new Date().toISOString(),
      });
      await refreshWallet();
    } catch (error) {
      console.error('Wallet spend error', error);
      toast('err','Unable to complete the wallet transaction.');
    }
  }

  function walletAction(action,amount,to){
    if(action==='send'){
      spend('naira',amount,'OPay to '+to);
      toast('ok','₦'+fmt(Number(amount))+' sent via OPay!');
    }
  }

  function openCreatePost(){
    setSection('link');
    setCreatePostRequest(request => request + 1);
  }

  const sectionTitle={link:'Link',farm:'Farm',labs:'Labs',wallet:'Wallet',messages:'Messages',account:'Account'};
  const navItems=[
    {k:'link',l:'Link',ic:I.Link},
    {k:'farm',l:'Farm',ic:I.Farm},
    {k:'labs',l:'Labs',ic:I.Labs},
    {k:'wallet',l:'Wallet',ic:I.Wallet},
    {k:'messages',l:'DM',ic:I.Msg,badge:messageBadgeText},
  ];

  const railCards = {
    link: [
      { label: 'Posts', value: linkStats ? String(linkStats.posts) : '—', icon: <I.Link/> },
      { label: 'Communities', value: linkStats ? String(linkStats.communities) : '—', icon: <I.Users/> }
    ],
    wallet: [
      { label: 'Balance', value: `₦${fmt(walletNaira || 0)}`, icon: <I.Wallet/> },
      { label: 'IST', value: `${fmt(walletIST || 0)} IST`, icon: <I.CreditCard/> }
    ],
    messages: [
      { label: 'Unread', value: String(messageUnreadCount || 0), icon: <I.Msg/> }
    ]
  };

  return(
    <div className='shell'>
      <header className='root-hd'>
        <div className='hd-left'>
          <div className='profile-wrap' ref={ddRef}>
            <button className='profile-btn' onClick={()=>setDdOpen(v=>!v)} aria-label="Open profile menu">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit'}}/> : profile?.initials||'YO'}
            </button>
            {ddOpen&&(
              <div className='profile-dd'>
                <div className='dd-head'>
                  <div className='dd-av'>{profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit'}}/> : profile?.initials||'YO'}</div>
                  <div className='dd-name'>{profile?.full_name||user?.user_metadata?.full_name||'Your Name'}</div>
                  <div className='dd-email'>{user?.email||'you@example.com'}</div>
                </div>
                <div className='dd-sect'>
                  <button className='dd-item' onClick={()=>{setSection('account');setDdOpen(false);}}>
                    <div className='dd-ico'><I.User/></div>View Profile
                  </button>
                  <div className='dd-theme-row'>
                    <div className='dd-theme-lbl'><div className='dd-ico'>{theme==='dark'?<I.Moon/>:<I.Sun/>}</div>Dark Mode</div>
                    <Toggle on={theme==='dark'} set={()=>setTheme(t=>t==='dark'?'light':'dark')}/>
                  </div>
                </div>
                <div className='dd-div'/>
                <div className='dd-sect'>
                  <button className='dd-item' onClick={()=>{setSupportOpen(true);setDdOpen(false);}}>
                    <div className='dd-ico'><I.Help/></div>Help & Support
                  </button>
                  <button className='dd-item danger' onClick={()=>{signOut();toast('info','Signed out.');setDdOpen(false);}}>
                    <div className='dd-ico'><I.LogOut/></div>Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='hd-center'>{sectionTitle[section]||''}</div>

        <div className='hd-right'>
          {section==='farm'&&farmActiveTab!=='invest'&&(
            <button className='btn btn-p btn-sm' onClick={()=>setFarmListOpen(true)} style={{marginRight:4}}><I.Plus/>List</button>
          )}
          <button className='hd-btn' onClick={()=>setSupportOpen(true)} title='Help'><I.Help/></button>
          <button className='hd-btn' onClick={()=>setNotifOpen(true)} title='Notifications'>
            <I.Bell/>{unreadCount>0&&<span className='nav-badge'>{unreadCount}</span>}
          </button>
        </div>
      </header>

      <div className='workspace'>
        <Sidebar navItems={navItems} section={section} setSection={setSection} onCreatePost={openCreatePost} />

        <div className={'main-shell' + (section === 'messages' ? ' messages-layout' : '') + (communityRightRail && section === 'link' ? ' community-layout' : '')}>
          <div className='section-host'>
            {section==='link'&&<LinkSection showToast={toast} onGoToMessages={()=>setSection('messages')} createPostRequest={createPostRequest} onCommunityRightRailChange={setCommunityRightRail} onLinkStatsChange={updateLinkStats}/>}
            {section==='farm'&&<FarmSection walletIST={walletIST} walletNaira={walletNaira} onSpend={spend} showToast={toast} listOpen={farmListOpen} setListOpen={setFarmListOpen} activeFarmTab={farmActiveTab} setActiveFarmTab={setFarmActiveTab}/>}
            {section==='labs'&&<LabsSection showToast={toast}/>}
            {section==='wallet'&&<WalletSection showToast={toast}/>}
            {section==='messages'&&<MessagesSection showToast={toast} onUnreadChange={setMessageUnreadCount}/>}
            {section==='account'&&<AccountSection theme={theme} setTheme={setTheme} showToast={toast} onOpenNotifications={()=>setNotifOpen(true)} onOpenSupport={()=>setSupportOpen(true)}/>}
          </div>

          {section !== 'messages' && (
          communityRightRail && section==='link'
            ? <aside className='right-rail community-right-rail'>{communityRightRail}</aside>
            : <aside className='right-rail'>
          <div className='rail-card'>
            <div className='rail-copy'>
              <div className='rail-title'>Overview</div>
              <div className='rail-headline'>{sectionTitle[section] || 'Overview'}</div>
              <div className='rail-sub'>Everything in one focused command center.</div>
            </div>
            {railCards[section]?.map((card, index) => (
              <button key={`${section}-${index}`} className='rail-button' type='button'>
                <span className='rail-label'>
                  <span className='rail-ico'>{card.icon}</span>
                  {card.label}
                </span>
                <span className='rail-value'>{card.value}</span>
              </button>
            ))}
          </div>

          <div className='rail-card'>
            <div className='rail-copy'>
              <div className='rail-title'>Quick actions</div>
              <div className='rail-headline'>Stay ahead</div>
              <div className='rail-sub'>Fast access to your most active workflows.</div>
            </div>
            <button className='rail-button' type='button' onClick={()=>{setSection('farm');setFarmActiveTab('produce');setFarmListOpen(true);}}>
              <span className='rail-label'><span className='rail-ico'><I.Plus/></span>New listing</span>
              <span className='rail-value'>+</span>
            </button>
            <button className='rail-button' type='button' onClick={()=>setNotifOpen(true)}>
              <span className='rail-label'><span className='rail-ico'><I.Bell/></span>Alerts</span>
              <span className='rail-value'>{unreadCount}</span>
            </button>
            <button className='rail-button' type='button' onClick={()=>setSupportOpen(true)}>
              <span className='rail-label'><span className='rail-ico'><I.Help/></span>Support</span>
              <span className='rail-value'>↗</span>
            </button>
          </div>
            </aside>
          )}
        </div>
      </div>

      {supportOpen && <SupportSection onClose={()=>setSupportOpen(false)} />}
      {notifOpen && <NotificationsSection onClose={()=>setNotifOpen(false)} />}
    </div>
  );
}
