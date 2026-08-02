import React, { useState, useRef, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av } from '../../components/index.jsx';
import { nowTime } from '../../utils/helpers.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchConversations, fetchMessages, sendMessage } from '../../services/supabaseService.js';

function MessagesSection({ showToast, onUnreadChange }){
  const { user } = useAuth();
  const [convos,setConvos]=useState([]);
  const [active,setActive]=useState(null);
  const [input,setInput]=useState("");
  const [mobileView,setMobileView]=useState("list");
  const [chatActionOpen,setChatActionOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const endRef=useRef(null);
  const actionRef=useRef(null);

  useEffect(()=>{
    if(endRef.current) endRef.current.scrollIntoView({behavior:"smooth"});
  },[active]);

  useEffect(()=>{
    async function loadConversations(){
      if(!user?.id) return;
      setLoading(true);
      try {
        const data = await fetchConversations(user.id);
        const convosList = (data||[]).map(conv => ({
          ...conv,
          name: conv.name || 'Conversation',
          initials: conv.initials || (conv.name ? conv.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase() : 'XX'),
          preview: conv.preview || '',
          unread: conv.unread || 0,
          time: conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Now',
        }));
        setConvos(convosList);
        onUnreadChange?.(convosList.reduce((sum, c) => sum + (c.unread || 0), 0));
      } catch (error) {
        console.error('Error loading conversations', error);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [user, onUnreadChange]);

  useEffect(()=>{
    function h(e){if(actionRef.current&&!actionRef.current.contains(e.target))setChatActionOpen(false);}
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  async function openConvo(c){
    try {
      const messages = await fetchMessages(c.id);
      const fresh = convos.find(cv=>cv.id===c.id) || c;
      const updated = {
        ...fresh,
        ...c,
        messages: (messages || []).map(m => ({
          id: m.id,
          me: m.sender_id === user?.id,
          text: m.text || m.body || '',
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : nowTime(),
        })),
        unread: 0,
      };
      setConvos(p=>{
        const updatedConvos = p.map(cv=>cv.id===c.id?{...cv,unread:0}:cv);
        onUnreadChange?.(updatedConvos.reduce((sum, cv) => sum + (cv.unread || 0), 0));
        return updatedConvos;
      });
      setActive(updated);
      setMobileView("chat");
    } catch (error) {
      console.error('Error loading chat messages', error);
      showToast?.('error','Unable to open conversation.');
    }
  }
  function goBack(){setMobileView("list");setActive(null);}
  async function send(){
    if(!input.trim()||!active||!user?.id) return;
    const localMessage={id:Date.now(),me:true,text:input,time:nowTime()};
    const updated={...active,messages:[...active.messages,localMessage],preview:input};
    setConvos(p=>p.map(c=>c.id===active.id?{...c,preview:input}:c));
    setActive(updated);
    setInput("");
    try {
      await sendMessage({
        conversation_id: active.id,
        sender_id: user.id,
        text: input,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending message', error);
      showToast('error','Unable to send message right now.');
    }
  }

  const chatActions=[
    {l:"Clear message history",ic:<I.Trash/>,danger:false},
    {l:"Change chat background",ic:<I.Palette/>,danger:false},
    {l:"View profile",ic:<I.User/>,danger:false},
    {l:"Block user",ic:<I.Ban/>,danger:true},
  ];

  const MsgList=(
    <div className="msg-sb">
      <div className="msg-sb-hd">
        <div className="sbar"><I.Search/><input placeholder="Search messages…"/></div>
      </div>
      <div className="msg-list">
        {convos.map(c=>(
          <div key={c.id} className={"convo"+(active&&active.id===c.id&&mobileView==="chat"?" on":"")} onClick={()=>openConvo(c)}>
            <Av initials={c.initials}/>
            <div className="convo-info"><div className="convo-name">{c.name}</div><div className="convo-prev">{c.preview}</div></div>
            <div className="convo-meta">
              <div className="convo-time">{c.time}</div>
              {c.unread>0&&<div className="unread">{c.unread}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatView=active?(
    <div className="chat-area">
      <div className="chat-hd">
        <button className="ib" onClick={goBack} style={{flexShrink:0}}><I.ArrowL/></button>
        <Av initials={active.initials}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13,color:"var(--t1)"}}>{active.name}</div>
          <div className="chat-status">● Online</div>
        </div>
        <button className="ib"><I.Phone/></button>
        <div style={{position:"relative"}} ref={actionRef}>
          <button className="ib" onClick={()=>setChatActionOpen(v=>!v)}><I.MoreV/></button>
          {chatActionOpen&&(
            <div className="chat-action-dd">
              {chatActions.map((a,i)=>(
                <button key={i} className={"cad-item"+(a.danger?" danger":"")} onClick={()=>{setChatActionOpen(false);}}>
                  {a.ic}{a.l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="chat-msgs">
        {active.messages.map(m=>(
          <div key={m.id} className={"brow"+(m.me?" me":"")}>
            {!m.me&&<Av initials={active.initials} size="sm"/>}
            <div className="bub-wrap">
              <div className={"bub"+(m.me?" bub-me":" bub-them")}>{m.text}</div>
              <div className="bub-time">{m.time||"now"}</div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div className="chat-bar">
        <button className="chat-plus-btn"><I.Plus/></button>
        <textarea className="chat-field" rows={1} placeholder="Message…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}/>
        <button className="send-btn" onClick={send}><I.Send/></button>
      </div>
    </div>
  ):(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",flex:1,background:"var(--bg)"}}>
      <div className="empty"><div className="empty-ico">💬</div><div className="empty-t">Select a conversation</div></div>
    </div>
  );

  return(
    <div className="main">
      <div style={{flex:1,overflow:"hidden"}}>
        <div className={"msg-shell"+(mobileView==="list"?" msg-list-view":" msg-chat-view")}>
          {MsgList}
          {ChatView}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACCOUNT SECTION
   ============================================================ */

export default MessagesSection;
