import React, { useState, useRef, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av } from '../../components/index.jsx';
import { nowTime } from '../../utils/helpers.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchConversations, fetchMessages, sendMessage } from '../../services/supabaseService.js';
import { fetchProfiles } from '../../services/profileService.js';
import { deleteMessage, deleteOwnMessages } from '../../services/messagingService.js';
import ActionDialog from '../../components/ActionDialog.jsx';

function MessagesSection({ showToast, onUnreadChange }){
  const { user } = useAuth();
  const [convos,setConvos]=useState([]);
  const [active,setActive]=useState(null);
  const [input,setInput]=useState("");
  const [mobileView,setMobileView]=useState("list");
  const [chatActionOpen,setChatActionOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [actionDialog,setActionDialog]=useState(null);
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
        const [data, profiles] = await Promise.all([fetchConversations(user.id), fetchProfiles()]);
        const profileById = Object.fromEntries((profiles || []).map(item => [item.id, item]));
        const convosList = (data||[]).map(conv => {
          const otherId = (conv.participant_ids || []).find(id => id !== user.id);
          const otherProfile = profileById[otherId];
          const storedName = conv.name && conv.name !== 'Conversation' ? conv.name : '';
          const name = otherProfile?.full_name || storedName || `Member ${String(otherId || conv.id).slice(0, 8)}`;
          const initials = otherProfile?.initials || name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '??';
          return {
          ...conv,
          name,
          avatarUrl: otherProfile?.avatar_url || null,
          initials,
          preview: conv.preview || '',
          unread: conv.unread || 0,
          time: conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Now',
        };});
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

  async function removeMessage(message){
    setActionDialog({
      title: 'Delete message?',
      message: 'This message will be permanently deleted from the conversation.',
      confirmLabel: 'Delete message',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteMessage(message.id, user.id);
          const remaining = active.messages.filter(item => item.id !== message.id);
          const preview = remaining.at(-1)?.text || '';
          setActive(current => ({ ...current, messages: remaining }));
          setConvos(items => items.map(item => item.id === active.id ? { ...item, preview } : item));
          showToast('ok', 'Message deleted.');
          return true;
        } catch (error) {
          console.error('Message delete error', error);
          showToast('error', error.message || 'Unable to delete this message.');
          return false;
        }
      },
    });
  }

  async function clearOwnMessages(){
    if (!active) return;
    setChatActionOpen(false);
    setActionDialog({
      title: 'Delete your messages?',
      message: 'This removes every message you sent in this conversation. Other participants’ messages will remain.',
      confirmLabel: 'Delete my messages',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteOwnMessages(active.id, user.id);
          const remaining = active.messages.filter(message => !message.me);
          setActive(current => ({ ...current, messages: remaining }));
          const preview = remaining.at(-1)?.text || '';
          setConvos(items => items.map(item => item.id === active.id ? { ...item, preview } : item));
          showToast('ok', 'Your messages were deleted.');
          return true;
        } catch (error) {
          console.error('Message history delete error', error);
          showToast('error', error.message || 'Unable to delete your messages.');
          return false;
        }
      },
    });
  }

  const chatActions=[{l:"Delete my messages",ic:<I.Trash/>,danger:true,run:clearOwnMessages}];
  const visibleConversations = convos.filter(conversation => `${conversation.name} ${conversation.preview}`.toLowerCase().includes(search.toLowerCase()));

  const MsgList=(
    <div className="msg-sb">
      <div className="msg-sb-hd">
        <div className="sbar"><I.Search/><input placeholder="Search messages…" value={search} onChange={event=>setSearch(event.target.value)}/></div>
      </div>
      <div className="msg-list">
        {visibleConversations.map(c=>(
          <div key={c.id} className={"convo"+(active&&active.id===c.id&&mobileView==="chat"?" on":"")} onClick={()=>openConvo(c)}>
            <Av initials={c.initials} src={c.avatarUrl}/>
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
        <Av initials={active.initials} src={active.avatarUrl}/>
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
                <button key={i} className={"cad-item"+(a.danger?" danger":"")} onClick={a.run}>
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
            {!m.me&&<Av initials={active.initials} size="sm" src={active.avatarUrl}/>}
            <div className="bub-wrap">
              <div className={"bub"+(m.me?" bub-me":" bub-them")}>{m.text}</div>
              {m.me&&<button className="msg-delete-btn" type="button" title="Delete message" aria-label="Delete message" onClick={()=>removeMessage(m)}><I.Trash/></button>}
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
    <div className="main main-messages">
      <div style={{flex:1,overflow:"hidden"}}>
        <div className={"msg-shell"+(mobileView==="list"?" msg-list-view":" msg-chat-view")}>
          {MsgList}
          {ChatView}
        </div>
      </div>
      <ActionDialog
        dialog={actionDialog}
        onClose={() => setActionDialog(null)}
        onSubmit={value => actionDialog?.onConfirm?.(value)}
      />
    </div>
  );
}

/* ============================================================
   ACCOUNT SECTION
   ============================================================ */

export default MessagesSection;
