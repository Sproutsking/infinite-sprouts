import React, { useState, useEffect } from 'react';
import I from '../../../icons/icons.jsx';
import { Av, Modal } from '../../../components/index.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { createPost } from '../../../services/postService.js';
import { socialActionError } from '../../../utils/socialActionError.js';

function CommunityFeed({community,users,posts,onBack,onToggleFollow,onToggleNotif,onRightRailChange,PostCardComp,onNewPost,onUpdateCommunity,onReviewMember,onFetchPendingMembers,showToast}){
  const { user, profile } = useAuth();
  const [composerOpen,setComposerOpen]=useState(false);
  const [compose,setCompose]=useState("");
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


  useEffect(()=>{
    if(!community) return;
    setSettingsDraft({
      name:community.name,
      desc:community.desc,
      ico:community.ico,
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
    if(!compose.trim()) return;
    if(!currentUserId){
      const message='Sign in to publish in this community.';
      setPostError(message);
      showToast?.('error', message);
      return;
    }
    if(!community.followed&&!isOwner){
      const message='Join this community before publishing a post.';
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
      };
      setLocalPosts(p => [formatted, ...p.filter(item => item.id !== formatted.id)]);
      setCompose("");
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
          <div className="community-mark" aria-hidden="true">{community.ico}</div>
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
        {isOwner&&<button className={activeView==='manage'?'active':''} role="tab" aria-selected={activeView==='manage'} onClick={()=>setActiveView('manage')}><I.Settings/>Steward tools{pendingMembers.length>0&&<span>{pendingMembers.length}</span>}</button>}
        </div>

        {activeView==='feed'&&<div className="community-content">
        {!community.followed&&!isOwner&&!community.pending&&<div className="community-join-callout">
          <div className="community-join-icon">{community.privacy==='private'?<I.Lock/>:<I.Users/>}</div>
          <div className="community-join-copy"><strong>Join the conversation</strong><span>{community.privacy==='private'||community.joinApproval?'Request access to see member posts and share your own updates.':'Join this community to post, follow activity, and connect with growers.'}</span></div>
          <button className="btn btn-p btn-sm" onClick={()=>onToggleFollow(community.id)}><I.Plus/>{community.privacy==='private'||community.joinApproval?'Request access':'Join'}</button>
        </div>}
        {community.pending&&!isOwner&&<div className="community-join-callout pending"><div className="community-join-icon"><I.Check/></div><div className="community-join-copy"><strong>Request awaiting approval</strong><span>The community owner will review your request.</span></div><button className="btn btn-g btn-sm" onClick={()=>onToggleFollow(community.id,false)}>Cancel</button></div>}
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
      <Modal open={composerOpen} onClose={()=>{setComposerOpen(false);setCompose("");setPostError('');}} title={`Post in ${community.name}`}
        footer={<>
          <button className="btn btn-g" onClick={()=>{setComposerOpen(false);setCompose("");setPostError('');}}>Cancel</button>
          <button className="btn btn-p" onClick={submitPost} disabled={!compose.trim()}><I.Send/>Publish</button>
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
        {/* Live hashtag preview */}
        {liveTags.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10,paddingTop:8,borderTop:"1px solid var(--bd)"}}>
            <span style={{fontSize:10.5,color:"var(--t4)",fontWeight:600,marginRight:2}}>Tags:</span>
            {liveTags.map(t=><span key={t} className="post-tag">#{t}</span>)}
          </div>
        )}
        {/* Attachment row */}
        <div style={{display:"flex",gap:5}}>
          {[I.Image,I.Map,I.Globe].map((IC,i)=><button key={i} className="btn btn-g btn-sm"><IC/></button>)}
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
            <div className="form-g"><label className="label">Icon</label><input className="field" value={settingsDraft.ico} onChange={e=>setSettingsDraft(d=>({...d,ico:e.target.value}))}/></div>
            <div className="form-g"><label className="label">Cover image URL</label><input className="field" value={settingsDraft.coverImageUrl} onChange={e=>setSettingsDraft(d=>({...d,coverImageUrl:e.target.value}))} placeholder="https://…"/></div>
          </div>
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
      <div className="community-rail-node">{community.ico}</div>
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
        {!isMember&&!community.pending&&<button className="community-rail-action primary" onClick={()=>onToggleFollow(community.id)}><I.Plus/>{requiresApproval?'Request to join':'Join this circle'}</button>}
        {community.pending&&<button className="community-rail-action" onClick={()=>onToggleFollow(community.id,false)}><I.ArrowL/>Cancel join request</button>}
        {isMember&&community.postsEnabled&&<button className="community-rail-action primary" onClick={onCreatePost}><I.Plus/>Share a field note</button>}
        <button className="community-rail-action" onClick={()=>onToggleNotif(community.id)}><I.Bell/>{community.notif?'Turn alerts off':'Turn alerts on'}<span className="community-rail-action-state">{community.notif?'ON':'OFF'}</span></button>
      </>}
      <button className="community-rail-action" onClick={()=>onOpenView('about')}><I.Info/>Read circle guidelines<I.ArrowR/></button>
    </section>
  </>;
}

export default CommunityFeed;
