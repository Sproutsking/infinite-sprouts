import React, { useState, useEffect } from 'react';
import I from '../../../icons/icons.jsx';
import { Av, Modal } from '../../../components/index.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { createPost } from '../../../services/postService.js';
import { uploadSocialImage } from '../../../services/profileService.js';
import { socialActionError } from '../../../utils/socialActionError.js';

function CommunityFeed({community,users,posts,onBack,onGoProfile,onToggleFollow,onToggleNotif,onRightRailChange,PostCardComp,onNewPost,onUpdateCommunity,onReviewMember,onFetchPendingMembers,onFetchCommunityMembers,showToast}){
  const { user, profile } = useAuth();
  const [composerOpen,setComposerOpen]=useState(false);
  const [compose,setCompose]=useState("");
  const [composeImageFile,setComposeImageFile]=useState(null);
  const [composeImagePreview,setComposeImagePreview]=useState('');
  const [composeLocation,setComposeLocation]=useState(null);
  const [emojiPickerOpen,setEmojiPickerOpen]=useState(false);
  const composeImageInputRef=React.useRef(null);
  const [postError,setPostError]=useState('');
  const [localPosts,setLocalPosts]=useState(posts);
  const [activeView,setActiveView]=useState('feed');

  // Keep localPosts in sync if parent posts prop changes
  useEffect(()=>setLocalPosts(posts),[posts]);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [settingsDraft,setSettingsDraft]=useState(null);
  const [savingSettings,setSavingSettings]=useState(false);
  const [pendingMembers,setPendingMembers]=useState([]);
  const [loadingMembers,setLoadingMembers]=useState(false);
  const [communityMembers,setCommunityMembers]=useState([]);
  const [loadingCommunityMembers,setLoadingCommunityMembers]=useState(false);
  const [memberSearch,setMemberSearch]=useState('');
  const [memberSort,setMemberSort]=useState('newest');
  const currentUserId=profile?.id||user?.id;
  const isOwner=Boolean(community?.ownerId&&currentUserId&&String(community.ownerId)===String(currentUserId));
  const categoryHue={Crops:108,Livestock:38,Equipment:65,Market:145,Research:190,Jobs:275,Local:88};
  const communityAccent = `hsl(${categoryHue[community?.category]??116} 74% 48%)`;
  const railActions=React.useRef({});
  railActions.current={onToggleFollow,onToggleNotif};
  function openComposer(){
    setPostError('');
    setComposerOpen(true);
  }
  function closeComposer(){
    setComposerOpen(false);
    setCompose('');
    setComposeImageFile(null);
    setComposeImagePreview('');
    setComposeLocation(null);
    setEmojiPickerOpen(false);
    setPostError('');
    if(composeImageInputRef.current) composeImageInputRef.current.value='';
  }


  useEffect(()=>{
    if(!community) return;
    setSettingsDraft({
      name:community.name,
      desc:community.desc,
      ico:community.ico,
      imageUrl:community.imageUrl,
      category:community.category,
      privacy:community.privacy,
      joinApproval:community.joinApproval,
      postsEnabled:community.postsEnabled,
      commentsEnabled:community.commentsEnabled,
      rules:community.rules,
      coverImageUrl:community.coverImageUrl,
    });
  },[community]);

  useEffect(()=>setActiveView('feed'),[community?.id]);

  const canReadMembers=Boolean(currentUserId&&(community?.privacy!=='private'||community?.followed||isOwner));
  const visibleCommunityMembers=communityMembers
    .filter(member=>{
      const profile=member.profile||{};
      const query=memberSearch.trim().toLocaleLowerCase();
      return !query||[profile.full_name,profile.username,profile.role,profile.state].filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
    })
    .sort((a,b)=>{
      if(memberSort==='name') return (a.profile?.full_name||'').localeCompare(b.profile?.full_name||'');
      const difference=new Date(a.created_at||0)-new Date(b.created_at||0);
      return memberSort==='oldest'?difference:-difference;
    });
  useEffect(()=>{
    if(activeView!=='members'||!community||!canReadMembers) return undefined;
    let active=true;
    setLoadingCommunityMembers(true);
    onFetchCommunityMembers?.(community.id)
      .then(members=>{if(active)setCommunityMembers(members||[]);})
      .catch(error=>showToast?.('error',error.message||'Unable to load community members.'))
      .finally(()=>{if(active)setLoadingCommunityMembers(false);});
    return()=>{active=false;};
  },[activeView,community?.id,canReadMembers,onFetchCommunityMembers,showToast]);

  useEffect(()=>{
    if(!community){
      onRightRailChange?.(null);
      return undefined;
    }
    const owner=users?.[community.ownerId];
    onRightRailChange?.(
      <CommunitySideRail
        community={community}
        isOwner={isOwner}
        ownerName={owner?.name}
        pendingCount={pendingMembers.length}
        activeView={activeView}
        onOpenView={setActiveView}
        onOpenSettings={()=>setSettingsOpen(true)}
        onToggleFollow={(...args)=>railActions.current.onToggleFollow(...args)}
        onToggleNotif={(...args)=>railActions.current.onToggleNotif(...args)}
        onCreatePost={openComposer}
      />
    );
    return ()=>onRightRailChange?.(null);
  },[community,isOwner,pendingMembers.length,activeView,users,onRightRailChange]);

  useEffect(()=>{
    let active=true;
    setPendingMembers([]);
    if(!isOwner||!community) {
      setLoadingMembers(false);
      return;
    }
    setLoadingMembers(true);
    onFetchPendingMembers?.(community.id)
      .then(members=>{if(active)setPendingMembers(members);})
      .catch(error=>showToast?.('error',error.message||'Unable to load membership requests.'))
      .finally(()=>{if(active)setLoadingMembers(false);});
    return()=>{active=false;};
  },[community?.id,isOwner]);

  async function saveSettings(){
    setSavingSettings(true);
    try{
      await onUpdateCommunity?.(community.id,settingsDraft);
      showToast?.('ok','Community settings saved.');
      setSettingsOpen(false);
    }catch(error){showToast?.('error',error.message||'Unable to save community settings.');}
    finally{setSavingSettings(false);}
  }

  async function reviewMember(userId,approve){
    try{
      await onReviewMember?.(community.id,userId,approve);
      setPendingMembers(items=>items.filter(item=>item.user_id!==userId));
      showToast?.('ok',approve?'Member approved.':'Request declined.');
    }catch(error){showToast?.('error',error.message||'Unable to review member request.');}
  }
  async function submitPost(){
    if(!compose.trim()&&!composeImageFile) return;
    if(!currentUserId){
      const message='Sign in to publish in this community.';
      setPostError(message);
      showToast?.('error', message);
      return;
    }
    if(!community.followed&&!isOwner){
      const imageUrl=composeImageFile?await uploadSocialImage(currentUserId,composeImageFile,'post-image'):null;
      const location=composeLocation?.trim()||null;
      const savedPost = await createPost({...payload,image:imageUrl,location});
      setPostError(message);
      showToast?.('error', message);
      return;
    }
    if(!community.postsEnabled){
      const message='Posting is disabled for this community.';
      setPostError(message);
      showToast?.('error', message);
      return;
    }
    setPostError('');
    const tagMatches=compose.match(/#([a-zA-Z0-9_]+)/g)||[];
    const extractedTags=[...new Set(tagMatches.map(t=>t.slice(1)))];
    const cleanBody=compose.replace(/#([a-zA-Z0-9_]+)/g," ").replace(/\s{2,}/g," ").trim();
    const payload = {
      author_id: currentUserId,
      body: cleanBody,
      tags: extractedTags,
      community_id: community.id,
      comments_enabled: community.commentsEnabled,
      likes: 0,
      shares: 0,
      created_at: new Date().toISOString(),
    };

    try {
      const savedPost = await createPost(payload);
      const formatted = {
        id: savedPost.id,
        authorId: savedPost.authorId || profile?.id || user.id,
        body: savedPost.body || cleanBody,
        createdAt: savedPost.createdAt || savedPost.created_at || new Date().toISOString(),
        tags: savedPost.tags || extractedTags,
        likes: savedPost.likes || 0,
        comments: savedPost.comments || 0,
        shares: savedPost.shares || 0,
        communityId: savedPost.communityId || community.id,
        image: savedPost.image || null,
        location: savedPost.location || location,
        commentsEnabled: savedPost.commentsEnabled !== false,
      };
      setLocalPosts(p => [formatted, ...p.filter(item => item.id !== formatted.id)]);
      setCompose("");
      setComposeImageFile(null);
      setComposeImagePreview('');
      setComposeLocation(null);
      setEmojiPickerOpen(false);
      if(composeImageInputRef.current) composeImageInputRef.current.value='';
      setComposerOpen(false);
      if(onNewPost) onNewPost(formatted);
      showToast?.('ok', 'Community post published.');
    } catch (error) {
      console.error('Community post create error', error);
      const message=socialActionError(error,'publish in this community');
      setPostError(message);
      showToast?.('error', message);
    }
  }

  const liveTags=[...new Set((compose.match(/#([a-zA-Z0-9_]+)/g)||[]).map(t=>t.slice(1)))];
  const membershipLabel=isOwner?'Community steward':community?.pending?'Request in review':community?.followed?'Member access':'Public preview';

  if(!community) return null;
  const canReadPosts=community.privacy!=='private'||community.followed||isOwner;
  return(
    <div className="main main-link community-page" style={{'--community-accent':communityAccent}}>
      <div className="community-nav">
        <button className="ib" onClick={onBack} aria-label="Back to communities"><I.ArrowL/></button>
        <div className="community-crumb">
          <span>FIELD NETWORK <i/> COMMUNITY</span>
          <strong>{community.name}</strong>
        </div>
        <button className={"community-notification"+(community.notif?" active":"")} title={community.notif?"Notifications on":"Notifications off"} aria-label={community.notif?"Turn community notifications off":"Turn community notifications on"} onClick={()=>onToggleNotif(community.id)}>
          <I.Bell/><span>{community.notif?'Alerts on':'Alerts'}</span>
        </button>
      </div>
      <div className="scroll" style={{padding:0}}>
        <div className="community-cover" style={community.coverImageUrl?{backgroundImage:`url("${community.coverImageUrl}")`}:{}}>
          <div className="community-cover-grid"/>
          <div className="community-cover-top">
            <span className="community-cover-chip"><I.Seedling/>{community.category||'General'} circle</span>
            <span className="community-cover-chip">{community.privacy==='private'?<I.Lock/>:<I.Globe/>}{community.privacy==='private'?'Private network':'Open network'}</span>
          </div>
          <div className="community-cover-title">
            <span>INFINITE SPROUTS <i/> FIELD NETWORK</span>
            <h1>{community.name}</h1>
          </div>
          <div className="community-mark" aria-hidden="true">{community.imageUrl?<img src={community.imageUrl} alt=""/>:community.ico}</div>
        </div>
        <div className="community-profile">
        <div className="community-profile-main">
          <div className="community-profile-copy">
            <div className="community-title-row"><span className="community-membership"><i/>{membershipLabel}</span>{isOwner&&<span className="community-owner-badge"><I.Shield/>Owner view</span>}</div>
            <p className="community-description">{community.desc||'The community owner has not added a description yet.'}</p>
          </div>
          <div className="community-profile-actions">
            {isOwner&&<button className="community-icon-action" title="Community settings" aria-label="Community settings" onClick={()=>setSettingsOpen(true)}><I.Settings/></button>}
            {!isOwner&&<button className={"btn community-follow-btn"+(community.followed?" btn-g":" btn-p")} onClick={()=>onToggleFollow(community.id)} disabled={community.pending}>
              {community.followed?<><I.Check/>Following</>:community.pending?'Request sent':<><I.Plus/>{community.privacy==='private'||community.joinApproval?'Request to join':'Join community'}</>}
            </button>}
            {community.followed&&community.postsEnabled&&<button className="btn btn-p community-post-btn" onClick={openComposer}><I.Plus/>Create post</button>}
            {community.pending&&<button className="btn btn-g community-cancel-btn" onClick={()=>onToggleFollow(community.id,false)}>Cancel request</button>}
          </div>
        </div>
        <div className="community-metrics" aria-label="Community activity">
          <div className="community-metric"><span>GROWERS IN THIS CIRCLE</span><strong>{Number(community.members||0).toLocaleString()}</strong></div>
          <div className="community-metric"><span>FIELD NOTES SHARED</span><strong>{Number(community.posts||0).toLocaleString()}</strong></div>
          <div className="community-metric community-metric-access"><span>POSTING ACCESS</span><strong><i className={community.postsEnabled?'open':''}/>{community.postsEnabled?'Open':'Paused'}</strong></div>
        </div>
        </div>

        <div className="community-view-tabs" role="tablist" aria-label="Community sections">
        <button className={activeView==='feed'?'active':''} role="tab" aria-selected={activeView==='feed'} onClick={()=>setActiveView('feed')}><I.Comment/>Field notes<span>{localPosts.length}</span></button>
        <button className={activeView==='about'?'active':''} role="tab" aria-selected={activeView==='about'} onClick={()=>setActiveView('about')}><I.Info/>The circle</button>
        <button className={activeView==='members'?'active':''} role="tab" aria-selected={activeView==='members'} onClick={()=>setActiveView('members')}><I.Users/>Members<span>{Number(community.members||0).toLocaleString()}</span></button>
        {isOwner&&<button className={activeView==='manage'?'active':''} role="tab" aria-selected={activeView==='manage'} onClick={()=>setActiveView('manage')}><I.Settings/>Steward tools{pendingMembers.length>0&&<span>{pendingMembers.length}</span>}</button>}
        </div>

        {activeView==='feed'&&<div className="community-content">
        {(community.followed||isOwner)&&community.postsEnabled&&<button className="community-composer-prompt" onClick={openComposer}>
          <Av initials={profile?.initials||'US'} size="md" src={profile?.avatar_url}/>
          <span>Share something with {community.name}…</span>
          <span className="community-composer-action"><I.Plus/>Post</span>
        </button>}
        {(community.followed||isOwner)&&!community.postsEnabled&&<div className="community-status-note"><I.Info/>Posting is currently paused by the community owner.</div>}
        {canReadPosts&&<div className="community-feed-heading"><div><span className="community-eyebrow">COMMUNITY ACTIVITY</span><h2>Latest from the field</h2></div><span className="community-feed-count">{localPosts.length} {localPosts.length===1?'post':'posts'}</span></div>}
        {canReadPosts?<div className="post-feed">
          {localPosts.length===0?
            <div className="community-empty"><div className="community-empty-orbit"><span>{community.ico}</span></div><span className="community-eyebrow">A FRESH FIELD</span><h2>No posts here yet</h2><p>{community.followed||isOwner?'Start the conversation with a practical update, question, or idea.':'Join the community to see what members are sharing.'}</p>
              {(community.followed||isOwner)&&community.postsEnabled&&<button className="btn btn-p" onClick={openComposer}><I.Plus/>Write the first post</button>}
            </div>:
            localPosts.map(p=><PostCardComp key={p.id} p={p}/>)
          }
        </div>:<div className="community-locked-feed"><span className="community-locked-icon">{community.pending?<I.Check/>:<I.Lock/>}</span><strong>{community.pending?'Your request is being reviewed':'Member posts are private'}</strong><span>{community.pending?'The owner will approve your access request.':'Request access to read discussions and share with this community.'}</span></div>}
        </div>}

        {activeView==='members'&&<div className="community-content">
          <div className="community-members-heading"><div><span className="community-eyebrow">PEOPLE IN THIS CIRCLE</span><h2>Community members</h2></div><span>{Number(community.members||communityMembers.length).toLocaleString()} members</span></div>
          {!canReadMembers?<div className="community-locked-feed"><span className="community-locked-icon">{currentUserId?<I.Lock/>:<I.User/>}</span><strong>{currentUserId?'Members are private':'Sign in to view members'}</strong><span>{currentUserId?'Join this community to see its member directory.':'Sign in to explore people in this community.'}</span></div>:loadingCommunityMembers?<div className="community-empty-state">Loading members…</div>:communityMembers.length===0?<div className="community-empty"><div className="community-empty-orbit"><I.Users/></div><span className="community-eyebrow">YOUR CIRCLE STARTS HERE</span><h2>No members to show yet</h2><p>Approved community members will appear here.</p></div>:<div className="community-members-grid">
            <div className="community-members-tools"><input className="field" type="search" aria-label="Search members" placeholder="Search name, role, or state" value={memberSearch} onChange={event=>setMemberSearch(event.target.value)}/><select className="field" aria-label="Sort members" value={memberSort} onChange={event=>setMemberSort(event.target.value)}><option value="newest">Recently joined</option><option value="oldest">Earliest members</option><option value="name">Name A-Z</option></select></div>
            {visibleCommunityMembers.length===0?<div className="community-empty-state">No members match that search.</div>:visibleCommunityMembers.map(member=>{
              const memberProfile=member.profile||{};
              const memberName=memberProfile.full_name||'Community member';
              return <button className="community-member-card" type="button" key={member.user_id} onClick={()=>onGoProfile?.(member.user_id)}>
                <Av initials={memberProfile.initials||memberName.split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase()} size="lg" src={memberProfile.avatar_url}/>
                <strong>{memberName}</strong>
                <span>{member.role==='owner'?'Community owner':memberProfile.role||'Member'}</span>
                {memberProfile.state&&<small>{memberProfile.state}</small>}
                <small><I.Calendar/>{member.created_at?`Member since ${new Date(member.created_at).toLocaleDateString(undefined,{month:'short',year:'numeric'})}`:'Community member'}</small>
              </button>;
            })}
          </div>}
        </div>}

        {activeView==='about'&&<div className="community-content community-about-grid">
        <section className="community-info-card community-about-intro">
          <span className="community-eyebrow">WHY THIS COMMUNITY EXISTS</span>
          <h2>Grow knowledge together.</h2>
          <p>{community.desc||'The community owner has not added a description yet.'}</p>
        </section>
        <section className="community-info-card">
          <div className="community-info-title"><span className="community-info-icon"><I.Shield/></span><div><span className="community-eyebrow">COMMUNITY GUIDE</span><h3>Rules & expectations</h3></div></div>
          <p className="community-rules">{community.rules||'The owner has not added community rules yet.'}</p>
        </section>
        <section className="community-info-card">
          <div className="community-info-title"><span className="community-info-icon">{community.privacy==='private'?<I.Lock/>:<I.Globe/>}</span><div><span className="community-eyebrow">ACCESS</span><h3>{community.privacy==='private'?'Private community':'Open community'}</h3></div></div>
          <p>{community.privacy==='private'?'Membership requests are reviewed by the community owner. Posts are visible to approved members.':'Anyone can discover this community. Joining may be subject to owner approval.'}</p>
          <div className="community-about-facts"><span>Posts {community.postsEnabled?'enabled':'paused'}</span><span>Comments {community.commentsEnabled?'enabled':'paused'}</span></div>
        </section>
        </div>}

        {activeView==='manage'&&isOwner&&<div className="community-content">
        <section className="community-owner-panel">
          <div className="community-owner-heading">
            <div><span className="community-eyebrow">OWNER TOOLS</span><h2>Membership requests</h2><p>Review who can join your community.</p></div>
            <span className="community-pending-count">{pendingMembers.length} pending</span>
          </div>
          {loadingMembers?<div className="community-empty-state">Loading requests…</div>:pendingMembers.length===0?<div className="community-empty-state"><span className="community-empty-orbit small"><I.Check/></span><strong>You’re all caught up</strong><span>New join requests will appear here.</span></div>:pendingMembers.map(member=>(
            <div className="community-request-row" key={member.user_id}>
              <Av initials={member.profile?.initials||'?'} size="md" src={member.profile?.avatar_url}/>
              <div className="folder-info"><div className="folder-name">{member.profile?.full_name||'Community member'}</div><div className="folder-count">Requested {new Date(member.created_at).toLocaleDateString()}</div></div>
              <button className="btn btn-g btn-sm" onClick={()=>reviewMember(member.user_id,false)}>Decline</button>
              <button className="btn btn-p btn-sm" onClick={()=>reviewMember(member.user_id,true)}><I.Check/>Approve</button>
            </div>
          ))}
        </section>
        <section className="community-info-card community-manage-card"><div className="community-info-title"><span className="community-info-icon"><I.Settings/></span><div><span className="community-eyebrow">IDENTITY & SAFETY</span><h3>Community settings</h3></div></div><p>Update your community details, access rules, and posting controls.</p><button className="btn btn-g btn-sm" onClick={()=>setSettingsOpen(true)}><I.Settings/>Open settings</button></section>
        </div>}
        <div style={{height:20}}/>
      </div>

      {/* Community Post Composer Modal — fully self-contained here */}
      <Modal open={composerOpen} onClose={closeComposer} title={`Post in ${community.name}`}
        footer={<>
          <button className="btn btn-g" onClick={closeComposer}>Cancel</button>
          <button className="btn btn-p" onClick={submitPost} disabled={!compose.trim()&&!composeImageFile}><I.Send/>Publish</button>
        </>}>
        {/* Community identity row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--sf3)",borderRadius:"var(--r12)",border:"1px solid var(--bd)",marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:"var(--rf)",background:community.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{community.ico}</div>
          <div>
            <div style={{fontWeight:700,fontSize:12.5,color:"var(--t1)",lineHeight:1.3}}>{community.name}</div>
            <div style={{fontSize:10.5,color:"var(--t4)"}}>{profile?.full_name || user?.user_metadata?.full_name || 'Member'} · posting as member</div>
          </div>
          {postError&&<div className="notice social-action-error" role="alert"><I.Info/><span>{postError}</span></div>}
          <span className="badge b-g" style={{marginLeft:"auto"}}>Community</span>
        </div>
        {/* Composer */}
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <input ref={composeImageInputRef} type="file" accept="image/*" hidden onChange={event=>{const file=event.target.files?.[0];if(!file)return;setComposeImageFile(file);const reader=new FileReader();reader.onload=()=>setComposeImagePreview(reader.result);reader.readAsDataURL(file);}}/>
          <Av initials={profile?.initials || 'US'} size="lg" green src={profile?.avatar_url}/>
          <textarea
            className="compose-input"
            placeholder={`What's on your mind in ${community.name}? Use #hashtags to tag topics.`}
            value={compose}
            onChange={e=>{setCompose(e.target.value);setPostError('');}}
            rows={5}
            autoFocus
            style={{flex:1}}
          />
        </div>
        {composeImagePreview&&<div className="compose-attachment-preview"><img src={composeImagePreview} alt="Post attachment preview"/><button className="ib" type="button" title="Remove image" aria-label="Remove image" onClick={()=>{setComposeImageFile(null);setComposeImagePreview('');if(composeImageInputRef.current)composeImageInputRef.current.value='';}}><I.X/></button></div>}
        {composeLocation!==null&&<div className="compose-location-field"><I.Map/><input className="field" aria-label="Post location" placeholder="Add a place or area" value={composeLocation} onChange={event=>setComposeLocation(event.target.value)}/><button className="ib" type="button" title="Remove location" aria-label="Remove location" onClick={()=>setComposeLocation(null)}><I.X/></button></div>}
        {emojiPickerOpen&&<div className="compose-emoji-picker" role="group" aria-label="Choose an emoji">{['🌱','🌾','🌿','🌻','🌽','🍅','🌧️','☀️','💧','🚜','📈','💡','👏','❤️','😊','🔥'].map(emoji=><button key={emoji} type="button" aria-label={`Insert ${emoji}`} onClick={()=>setCompose(value=>value+emoji)}>{emoji}</button>)}</div>}
        {/* Live hashtag preview */}
        {liveTags.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10,paddingTop:8,borderTop:"1px solid var(--bd)"}}>
            <span style={{fontSize:10.5,color:"var(--t4)",fontWeight:600,marginRight:2}}>Tags:</span>
            {liveTags.map(t=><span key={t} className="post-tag">#{t}</span>)}
          </div>
        )}
        {/* Attachment row */}
        <div className="compose-tools">
          <button className="ib" type="button" title="Add an image" aria-label="Add an image" onClick={()=>composeImageInputRef.current?.click()}><I.Image/></button>
          <button className={'ib'+(composeLocation!==null?' active':'')} type="button" title="Add a location" aria-label="Add a location" onClick={()=>setComposeLocation(value=>value===null?'':null)}><I.Map/></button>
          <button className={'ib'+(emojiPickerOpen?' active':'')} type="button" title="Add emoji" aria-label="Add emoji" onClick={()=>setEmojiPickerOpen(value=>!value)}>😊</button>
        </div>
      </Modal>

      {settingsDraft&&<Modal open={settingsOpen} onClose={()=>setSettingsOpen(false)} title="Community settings" lg
        footer={<><button className="btn btn-g" onClick={()=>setSettingsOpen(false)}>Cancel</button><button className="btn btn-p" onClick={saveSettings} disabled={savingSettings||!settingsDraft.name.trim()}><I.Check/>{savingSettings?'Saving…':'Save settings'}</button></>}>
        <div className="community-settings-section"><div className="sh">Identity & appearance</div>
          <div className="form-row">
            <div className="form-g"><label className="label">Name</label><input className="field" value={settingsDraft.name} onChange={e=>setSettingsDraft(d=>({...d,name:e.target.value}))}/></div>
            <div className="form-g"><label className="label">Category</label><select className="field" value={settingsDraft.category} onChange={e=>setSettingsDraft(d=>({...d,category:e.target.value}))}>{['General','Crops','Livestock','Equipment','Market','Research','Jobs','Local'].map(category=><option key={category}>{category}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-g"><label className="label">Icon fallback</label><input className="field" value={settingsDraft.ico} onChange={e=>setSettingsDraft(d=>({...d,ico:e.target.value}))}/></div>
            <div className="form-g"><label className="label">Community profile image</label><input className="field" type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const imageUrl=await uploadSocialImage(currentUserId,file,'community-logo');setSettingsDraft(d=>({...d,imageUrl}));}catch(error){showToast?.('error',error.message||'Unable to upload community image.');}}}/>{settingsDraft.imageUrl&&<img className="community-settings-image-preview" src={settingsDraft.imageUrl} alt="Community profile preview"/>}</div>
          </div>
          <div className="form-g"><label className="label">Community banner</label><input className="field" type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const coverImageUrl=await uploadSocialImage(currentUserId,file,'community-banner');setSettingsDraft(d=>({...d,coverImageUrl}));}catch(error){showToast?.('error',error.message||'Unable to upload community banner.');}}}/>{settingsDraft.coverImageUrl&&<img className="community-settings-banner-preview" src={settingsDraft.coverImageUrl} alt="Community banner preview"/>}</div>
          <div className="form-g"><label className="label">Description</label><textarea className="field textarea" value={settingsDraft.desc} onChange={e=>setSettingsDraft(d=>({...d,desc:e.target.value}))}/></div>
        </div>
        <div className="community-settings-section"><div className="sh">Access & participation</div>
          <div className="form-row">
            <div className="form-g"><label className="label">Visibility</label><select className="field" value={settingsDraft.privacy} onChange={e=>setSettingsDraft(d=>({...d,privacy:e.target.value}))}><option value="public">Public</option><option value="private">Private</option></select></div>
            <label className="community-setting-toggle"><input type="checkbox" checked={settingsDraft.joinApproval} onChange={e=>setSettingsDraft(d=>({...d,joinApproval:e.target.checked}))}/>Require approval to join</label>
          </div>
          <label className="community-setting-toggle"><input type="checkbox" checked={settingsDraft.postsEnabled} onChange={e=>setSettingsDraft(d=>({...d,postsEnabled:e.target.checked}))}/>Allow members to publish posts</label>
          <label className="community-setting-toggle"><input type="checkbox" checked={settingsDraft.commentsEnabled} onChange={e=>setSettingsDraft(d=>({...d,commentsEnabled:e.target.checked}))}/>Allow comments and replies</label>
          <div className="form-g"><label className="label">Community rules</label><textarea className="field textarea" value={settingsDraft.rules} onChange={e=>setSettingsDraft(d=>({...d,rules:e.target.value}))} placeholder="One guideline per line" rows={5}/></div>
        </div>
      </Modal>}
    </div>
  );
}

function CommunitySideRail({community,isOwner,ownerName,pendingCount,activeView,onOpenView,onOpenSettings,onToggleFollow,onToggleNotif,onCreatePost}){
  const requiresApproval=community.privacy==='private'||community.joinApproval;
  const isMember=community.followed||isOwner;
  const membershipLabel=isOwner?'Steward':community.pending?'Request pending':community.followed?'Member':'Visitor';
  return <>
    <section className="community-rail-identity">
      <div className="community-rail-node">{community.imageUrl?<img src={community.imageUrl} alt=""/>:community.ico}</div>
      <span className="community-eyebrow">FIELD CIRCLE / {community.category||'GENERAL'}</span>
      <h2>{community.name}</h2>
      <span className="community-rail-membership"><i/>{membershipLabel}</span>
    </section>

    <section className="community-rail-stats" aria-label="Community totals">
      <div><strong>{Number(community.members||0).toLocaleString()}</strong><span>GROWERS</span></div>
      <div><strong>{Number(community.posts||0).toLocaleString()}</strong><span>FIELD NOTES</span></div>
    </section>

    <section className="community-rail-panel">
      <div className="community-rail-heading"><span className="community-eyebrow">CIRCLE CONDITIONS</span><I.Seedling/></div>
      <div className="community-rail-row"><span>Visibility</span><strong>{community.privacy==='private'?'Private':'Open'}</strong></div>
      <div className="community-rail-row"><span>Joining</span><strong>{requiresApproval?'Owner approval':'Open to join'}</strong></div>
      <div className="community-rail-row"><span>Publishing</span><strong className={community.postsEnabled?'is-open':'is-paused'}>{community.postsEnabled?'Available':'Paused'}</strong></div>
      <div className="community-rail-row"><span>Conversation</span><strong className={community.commentsEnabled?'is-open':'is-paused'}>{community.commentsEnabled?'Comments on':'Comments paused'}</strong></div>
    </section>

    <section className="community-rail-panel community-rail-actions">
      <div className="community-rail-heading"><span className="community-eyebrow">YOUR NEXT STEP</span></div>
      {isOwner?<>
        {ownerName&&<div className="community-steward"><span className="community-steward-icon"><I.Shield/></span><span><small>STEWARDING THIS CIRCLE</small><strong>{ownerName}</strong></span></div>}
        <button className="community-rail-action primary" onClick={()=>onOpenView('manage')}><I.Users/>Review join requests{pendingCount>0&&<b>{pendingCount}</b>}</button>
        <button className="community-rail-action" onClick={onOpenSettings}><I.Settings/>Edit community</button>
      </>:<>
        {isMember&&community.postsEnabled&&<button className="community-rail-action primary" onClick={onCreatePost}><I.Plus/>Share a field note</button>}
        <button className="community-rail-action" onClick={()=>onToggleNotif(community.id)}><I.Bell/>{community.notif?'Turn alerts off':'Turn alerts on'}<span className="community-rail-action-state">{community.notif?'ON':'OFF'}</span></button>
      </>}
      <button className="community-rail-action" onClick={()=>onOpenView('about')}><I.Info/>Read circle guidelines<I.ArrowR/></button>
    </section>
  </>;
}

export default CommunityFeed;
