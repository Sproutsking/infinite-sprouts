import React, { useState, useRef, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal } from '../../components/index.jsx';
import { fmt } from '../../utils/helpers.js';
import { SocialCtx } from '../../context/SocialContext.jsx';
import SEED from '../../data/seed.js';
import { AuthorTrigger } from '../../popovers/ProfilePopover.jsx';
import { CommunityTrigger } from '../../popovers/CommunityPopover.jsx';
import PostActionMenu from '../../popovers/PostActionMenu.jsx';
import SaveFolderPanel from '../../popovers/SaveFolderPanel.jsx';
import SharePanel from '../../popovers/SharePanel.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PostView from './pages/PostView.jsx';
import CommunityFeed from './pages/CommunityFeed.jsx';

function LinkSection({showToast,onGoToMessages}){
  const [page,setPage]=useState({type:"feed"});
  const [tab,setTab]=useState("discover");
  const [posts,setPosts]=useState(SEED.posts);
  const [comments,setComments]=useState(SEED.comments);
  const [communities,setCommunities]=useState(SEED.communities);
  const [users]=useState(SEED.users);
  const [liked,setLiked]=useState({});
  const [following,setFollowing]=useState({"chidi-okafor":false,"amaka-eze":false,"musa-abdullahi":false});
  const [compose,setCompose]=useState("");
  const [reqCommOpen,setReqCommOpen]=useState(false);
  const [savedMap,setSavedMap]=useState({});
  const [saveOpen,setSaveOpen]=useState(null);
  const [shareOpen,setShareOpen]=useState(null);
  const [discoverSearch,setDiscoverSearch]=useState("");
  const [discoverFilter,setDiscoverFilter]=useState("All");
  const [filterDropOpen,setFilterDropOpen]=useState(false);
  const filterRef=useRef(null);
  useEffect(()=>{
    function h(e){if(filterRef.current&&!filterRef.current.contains(e.target))setFilterDropOpen(false);}
    if(filterDropOpen) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[filterDropOpen]);

  function toggleLike(id){
    setLiked(p=>({...p,[id]:!p[id]}));
    setPosts(p=>p.map(x=>x.id===id?{...x,likes:x.likes+(liked[id]?-1:1)}:x));
  }
  function submitPost(communityId){
    if(!compose.trim()) return;
    // Extract hashtags from body text
    const tagMatches=compose.match(/#([a-zA-Z0-9_]+)/g)||[];
    const extractedTags=[...new Set(tagMatches.map(t=>t.slice(1)))];
    // Strip hashtags from body — keep body clean, tags go to tags array
    const cleanBody=compose.replace(/#([a-zA-Z0-9_]+)/g,"").replace(/\s{2,}/g," ").trim();
    const newPost={id:Date.now(),authorId:"you",author:"Your Name",initials:"YO",role:"Member",time:"now",body:cleanBody,tags:extractedTags,likes:0,comments:0,shares:0,communityId:communityId||null};
    setPosts(p=>[newPost,...p]);
    setCompose("");
    if(communityId){
      setCommunities(p=>p.map(c=>c.id===communityId?{...c,posts:c.posts+1}:c));
    } else {
      setTab("discover");
    }
    showToast("ok","Post published!");
  }
  function toggleFollow(userId){setFollowing(p=>({...p,[userId]:!p[userId]}));}
  function toggleFollowCommunity(id){setCommunities(p=>p.map(c=>c.id===id?{...c,followed:!c.followed,members:c.members+(c.followed?-1:1)}:c));}
  function toggleNotif(id){setCommunities(p=>p.map(c=>c.id===id?{...c,notif:!c.notif}:c));}
  function toggleSave(postId,folderId){
    setSavedMap(p=>{
      const cur=p[postId]||[];
      const next=cur.includes(folderId)?cur.filter(f=>f!==folderId):[...cur,folderId];
      return {...p,[postId]:next};
    });
  }
  function handleDM(user){
    showToast("info","Opening a chat with "+user.name+"…");
    onGoToMessages&&onGoToMessages();
  }
  function goProfile(userId){setPage({type:"profile",userId});}
  function goPost(postId,highlightCommentId){setPage({type:"post",postId,highlightCommentId:highlightCommentId||null});}
  function goCommunity(communityId){
    setCommunities(p=>p.map(c=>c.id===communityId?{...c,count:0}:c));
    setPage({type:"community",communityId});
  }
  function goFeed(){setPage({type:"feed"});}

  const socialCtxValue={
    users,
    communities,
    following,
    onToggleFollow:toggleFollow,
    onToggleFollowCommunity:toggleFollowCommunity,
    onDM:handleDM,
    onSeeProfile:goProfile,
    onGoCommunity:goCommunity,
  };

  const filteredPosts=posts.filter(p=>{
    if(p.communityId) return false; // community posts live in their community feed only
    const q=discoverSearch.trim().toLowerCase();
    const matchesSearch=!q||p.body.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q))||(users[p.authorId]?.name||"").toLowerCase().includes(q);
    const matchesFilter=discoverFilter==="All"||(p.tags||[]).some(t=>t.toLowerCase()===discoverFilter.toLowerCase());
    return matchesSearch&&matchesFilter;
  });

  function PostCard({p}){
    const isOwner=p.authorId==="you";
    return(
      <div className={"post-card"+(p.image?" has-media":"")}>
        <div className="post-hd">
          <AuthorTrigger userId={p.authorId}/>
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
            {p.communityId&&(
              <CommunityTrigger communityId={p.communityId}>
                <span style={{fontSize:10.5,color:"var(--ac)",fontWeight:600,background:"var(--as)",padding:"2px 8px",borderRadius:"var(--rf)",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:3}}>
                  {(socialCtxValue.communities||[]).find(c=>c.id===p.communityId)?.ico} Community
                </span>
              </CommunityTrigger>
            )}
            <PostActionMenu post={p} isOwner={isOwner} onDelete={()=>showToast("ok","Post deleted.")} showToast={showToast}/>
          </div>
        </div>
        <div className="post-content" onClick={()=>goPost(p.id)} style={{cursor:"pointer"}}>
          <div className="post-text-col">
            <div className="post-body">{p.body}</div>
            {!p.image&&p.tags&&p.tags.length>0&&<div className="post-tags">{p.tags.map(t=><span key={t} className="post-tag">#{t}</span>)}</div>}
          </div>
          {p.image&&<div className="post-img">{p.image}</div>}
        </div>
        {p.image&&p.tags&&p.tags.length>0&&<div className="post-tags">{p.tags.map(t=><span key={t} className="post-tag">#{t}</span>)}</div>}
        <div className="post-acts">
          <button className={"post-act"+(liked[p.id]?" liked":"")} onClick={()=>toggleLike(p.id)}><I.Heart/>{p.likes+(liked[p.id]?1:0)}</button>
          <button className="post-act" onClick={()=>goPost(p.id)}><I.Comment/>{(comments[p.id]||[]).reduce((n,c)=>n+1+(c.replies?.length||0),0)}</button>
          <button className="post-act" onClick={e=>{e.stopPropagation();setShareOpen(p);}}><I.Share/>{p.shares}</button>
          <button className="post-act post-act-save" onClick={e=>{e.stopPropagation();setSaveOpen(p);}}><I.Bookmark/></button>
        </div>
      </div>
    );
  }

  /* ===== PAGE ROUTER ===== */
  if(page.type==="profile"){
    return <SocialCtx.Provider value={socialCtxValue}><ProfilePage userId={page.userId} users={users} posts={posts} comments={comments} following={following} onToggleFollow={toggleFollow} onDM={handleDM} onBack={goFeed} onGoPost={goPost} PostCardComp={PostCard}/></SocialCtx.Provider>;
  }
  if(page.type==="post"){
    return <SocialCtx.Provider value={socialCtxValue}><PostView postId={page.postId} highlightCommentId={page.highlightCommentId} posts={posts} comments={comments} setComments={setComments} users={users} liked={liked} onToggleLike={toggleLike} onBack={goFeed} showToast={showToast} onSave={p=>setSaveOpen(p)} onShare={p=>setShareOpen(p)} onDeletePost={()=>{showToast("ok","Post deleted.");goFeed();}}/></SocialCtx.Provider>;
  }
  if(page.type==="community"){
    const community=communities.find(c=>c.id===page.communityId);
    const commPosts=posts.filter(p=>p.communityId===page.communityId);
    return <SocialCtx.Provider value={socialCtxValue}><CommunityFeed community={community} posts={commPosts} onBack={goFeed} onToggleFollow={toggleFollowCommunity} onToggleNotif={toggleNotif} PostCardComp={PostCard}/></SocialCtx.Provider>;
  }

  return(
    <SocialCtx.Provider value={socialCtxValue}>
    <div className="main">
      <div className="sub-hd">
        {[["discover","Discover"],["create","Create"],["community","Community"]].map(([k,l])=>(
          <button key={k} className={"sub-tab"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="scroll">
        {tab==="discover"&&<>
          <div className="fbar">
            <div className="sbar"><I.Search/><input placeholder="Search posts, farmers, topics…" value={discoverSearch} onChange={e=>setDiscoverSearch(e.target.value)}/></div>
            <div className="filter-dd-anchor" ref={filterRef}>
              <button className="btn btn-g btn-sm" onClick={()=>setFilterDropOpen(v=>!v)}><I.Filter/>{discoverFilter}<I.ChevD style={{width:11,height:11,marginLeft:2}}/></button>
              {filterDropOpen&&(
                <div className="filter-dd">
                  {["All","Grains","Vegetables","Research","Jobs","Equipment"].map(c=>(
                    <button key={c} className={"filter-dd-item"+(discoverFilter===c?" on":"")} onClick={()=>{setDiscoverFilter(c);setFilterDropOpen(false);}}>
                      {discoverFilter===c&&<I.Check/>}{c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="post-feed">
            {filteredPosts.map(p=><PostCard key={p.id} p={p}/>)}
            {filteredPosts.length===0&&(
              <div className="empty"><div className="empty-ico">🔍</div><div className="empty-t">No posts found</div><div className="empty-s">Try a different search or filter</div></div>
            )}
          </div>
        </>}
        {tab==="create"&&<div style={{maxWidth:560}}>
          <p className="subsh">Share knowledge, updates, or job opportunities with the farming community.</p>
          <div className="compose-box">
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <Av initials="YO" size="lg" green/>
              <textarea className="compose-input" placeholder="What is happening on your farm? Use #hashtags to tag topics." value={compose} onChange={e=>setCompose(e.target.value)} rows={4}/>
            </div>
            {/* Live hashtag preview */}
            {(compose.match(/#([a-zA-Z0-9_]+)/g)||[]).length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10,paddingTop:8,borderTop:"1px solid var(--bd)"}}>
                <span style={{fontSize:10.5,color:"var(--t4)",fontWeight:600,marginRight:2}}>Tags:</span>
                {[...new Set((compose.match(/#([a-zA-Z0-9_]+)/g)||[]).map(t=>t.slice(1)))].map(t=>(
                  <span key={t} className="post-tag">#{t}</span>
                ))}
              </div>
            )}
            <div className="compose-foot">
              <div style={{display:"flex",gap:4}}>
                {[I.Image,I.Map,I.Globe].map((IC,i)=><button key={i} className="ib"><IC/></button>)}
              </div>
              <button className="btn btn-p" onClick={()=>submitPost(null)} disabled={!compose.trim()}><I.Send/>Publish</button>
            </div>
          </div>
          <div className="notice ni"><I.Info/><span>Type #hashtags anywhere in your post — they will be automatically extracted as tags when you publish.</span></div>
        </div>}
        {tab==="community"&&<>
          <div className="stat-row">
            {[["👥","12,400+","Members"],["🌍","24","States"],["🏆","340","Expert Farmers"],["💬","8,900+","Posts / Month"]].map(([ic,v,l])=>(
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div className="sh" style={{marginBottom:0}}>Communities</div>
            <button className="btn btn-p btn-sm" onClick={()=>setReqCommOpen(true)}><I.Plus/>Create Community</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:8,marginBottom:18}}>
            {communities.map(c=>(
              <div key={c.id} className="comm-card" onClick={()=>goCommunity(c.id)}>
                <div className="comm-banner" style={{background:c.bg}}>
                  <span style={{fontSize:34,position:"relative",zIndex:2}}>{c.ico}</span>
                  <button className={"comm-notif-btn"+(c.notif?" active":"")} onClick={e=>{e.stopPropagation();toggleNotif(c.id);}}>
                    <I.Bell/>
                    {c.count>0&&<span className="comm-notif-count">{c.count}</span>}
                  </button>
                </div>
                <div className="comm-body">
                  <div className="comm-name">{c.name}</div>
                  <div className="comm-meta">{c.members.toLocaleString()} members · {c.posts} posts</div>
                  <button className={"btn btn-sm btn-full"+(c.followed?" btn-g":" btn-p")} onClick={e=>{e.stopPropagation();toggleFollowCommunity(c.id);}}>
                    {c.followed?"Following":"Follow"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="sh">Featured Members</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:8}}>
            {Object.values(users).filter(u=>u.id!=="you").map(u=>(
              <div key={u.id} className="card card-p" style={{textAlign:"center",cursor:"pointer"}} onClick={()=>goProfile(u.id)}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Av initials={u.initials} size="lg" green/></div>
                <div style={{fontWeight:700,fontSize:12.5,color:"var(--t1)",marginBottom:2}}>{u.name}</div>
                <div style={{fontSize:11,color:"var(--t4)",marginBottom:9}}>{u.role}</div>
                <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                  <button className={"btn btn-sm"+(following[u.id]?" btn-g":" btn-p")} style={{flex:1}} onClick={()=>toggleFollow(u.id)}>{following[u.id]?"Following":"Follow"}</button>
                  <button className="btn btn-g btn-sm" onClick={()=>handleDM(u)}><I.Msg/></button>
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* Request community */}
      <Modal open={reqCommOpen} onClose={()=>setReqCommOpen(false)} title="Create a Community" sheet
        footer={<><button className="btn btn-g" onClick={()=>setReqCommOpen(false)}>Cancel</button><button className="btn btn-p" onClick={()=>{setReqCommOpen(false);showToast("ok","Community request submitted for review!");}}><I.Check/>Submit Request</button></>}>
        <div className="notice nw"><I.Info/><span>Communities are reviewed by Sprouts admins before going live. Approval usually takes 24–48 hours.</span></div>
        <div className="form-g"><label className="label">Community Name</label><input className="field" placeholder="e.g. Nigerian Maize Growers"/></div>
        <div className="form-g"><label className="label">Focus Area</label><input className="field" placeholder="e.g. Maize, Irrigation, AgriTech…"/></div>
        <div className="form-g"><label className="label">Visibility</label>
          {[{k:"public",l:"Public",s:"Anyone can join and view posts"},{k:"private",l:"Private",s:"Invite-only, posts hidden from non-members"}].map(v=>(
            <div key={v.k} className="pay-opt" style={{marginBottom:7}}><div style={{display:"flex",alignItems:"center",gap:10}}><div className="pay-radio"/><div><div style={{fontWeight:600,fontSize:12.5,color:"var(--t1)"}}>{v.l}</div><div style={{fontSize:11,color:"var(--t4)"}}>{v.s}</div></div></div></div>
          ))}
        </div>
        <div className="form-g"><label className="label">Description</label><textarea className="field textarea" placeholder="What is this community about?"/></div>
      </Modal>

      <SaveFolderPanel open={!!saveOpen} onClose={()=>setSaveOpen(null)} post={saveOpen} savedMap={savedMap} onToggleSave={toggleSave} showToast={showToast}/>
      <SharePanel open={!!shareOpen} onClose={()=>setShareOpen(null)} post={shareOpen} users={users} showToast={showToast}/>
    </div>
    </SocialCtx.Provider>
  );
}

/* ============================================================
   PROFILE PAGE — X-style: bio top, Posts/Replies tabs
   ============================================================ */

export default LinkSection;
