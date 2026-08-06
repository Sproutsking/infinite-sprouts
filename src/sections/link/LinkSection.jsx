import React, { useState, useRef, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal } from '../../components/index.jsx';
import { fmt } from '../../utils/helpers.js';
import { SocialCtx } from '../../context/SocialContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AuthorTrigger } from '../../popovers/ProfilePopover.jsx';
import { CommunityTrigger } from '../../popovers/CommunityPopover.jsx';
import PostActionMenu from '../../popovers/PostActionMenu.jsx';
import SaveFolderPanel from '../../popovers/SaveFolderPanel.jsx';
import SharePanel from '../../popovers/SharePanel.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PostView from './pages/PostView.jsx';
import CommunityFeed from './pages/CommunityFeed.jsx';
import { fetchProfiles } from '../../services/supabaseService.js';
import { fetchPosts, fetchCommentsForPosts, createPost, togglePostLike, sharePost } from '../../services/postService.js';
import { fetchCommunities, createCommunity, toggleCommunityFollow as toggleCommunityFollowService, toggleCommunityNotif as toggleCommunityNotifService } from '../../services/socialService.js';

function LinkSection({showToast,onGoToMessages}){
  const { user, profile } = useAuth();
  const currentUserId = profile?.id || user?.id;
  const [page,setPage]=useState({type:"feed"});
  const [tab,setTab]=useState("discover");
  const [posts,setPosts]=useState([]);
  const [comments,setComments]=useState({});
  const [communities,setCommunities]=useState([]);
  const [users,setUsers]=useState({});
  const [liked,setLiked]=useState({});
  const [following,setFollowing]=useState({});
  const [compose,setCompose]=useState("");
  const [reqCommOpen,setReqCommOpen]=useState(false);
  const [newCommunityName,setNewCommunityName]=useState('');
  const [newCommunityFocus,setNewCommunityFocus]=useState('');
  const [newCommunityDesc,setNewCommunityDesc]=useState('');
  const [newCommunityIcon,setNewCommunityIcon]=useState('🌱');
  const [creatingCommunity,setCreatingCommunity]=useState(false);
  const [savedMap,setSavedMap]=useState({});
  const [saveOpen,setSaveOpen]=useState(null);
  const [shareOpen,setShareOpen]=useState(null);
  const [discoverSearch,setDiscoverSearch]=useState("");
  const [discoverFilter,setDiscoverFilter]=useState("All");
  const [filterDropOpen,setFilterDropOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const filterRef=useRef(null);

  useEffect(()=>{
    function h(e){if(filterRef.current&&!filterRef.current.contains(e.target))setFilterDropOpen(false);}
    if(filterDropOpen) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[filterDropOpen]);

  useEffect(()=>{
    async function loadFeed(){
      setLoading(true);
      try {
        const [profiles, comms, postRows] = await Promise.all([
          fetchProfiles(),
          fetchCommunities(),
          fetchPosts(),
        ]);

        const getInitials = name => (name||'').split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase() || 'US';
        const makeFallbackUser = id => {
          const stringId = String(id || '').trim();
          return {
            id,
            name: stringId || 'Unknown User',
            initials: stringId ? stringId.slice(0,2).toUpperCase() : '??',
            role: 'Member',
            bio: '',
            followers: 0,
            following: 0,
            joined: '',
            avatarUrl: null,
          };
        };
        const profileMap = profiles.reduce((acc, item) => {
          const fullName = (item.full_name || item.name || item.email || 'Sprouts User').toString().trim();
          acc[item.id] = {
            id: item.id,
            name: fullName,
            initials: item.initials || getInitials(fullName),
            role: item.role || 'Member',
            bio: item.bio || '',
            followers: item.followers || 0,
            following: item.following || 0,
            joined: item.joined || '',
            avatarUrl: item.avatar_url || item.avatarUrl || item.photo_url || null,
          };
          return acc;
        }, {});
        if (profile?.id) {
          const currentName = (profile.full_name || profile.email || 'You').toString().trim();
          profileMap[profile.id] = {
            id: profile.id,
            name: currentName,
            initials: profile.initials || getInitials(currentName),
            role: profile.role || 'Member',
            bio: profile.bio || '',
            followers: profile.followers || 0,
            following: profile.following || 0,
            joined: profile.joined || '',
            avatarUrl: profile.avatar_url || null,
          };
        }

        const normalizedPosts = postRows.map(p => ({
          id: p.id,
          authorId: p.author_id || p.authorId || p.user_id || null,
          body: p.body || p.content || '',
          createdAt: p.created_at || p.createdAt || null,
          tags: p.tags || [],
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          communityId: p.community_id || p.communityId || null,
          image: p.image || p.media || null,
        }));

        normalizedPosts.forEach(post => {
          if (post.authorId && !profileMap[post.authorId]) {
            profileMap[post.authorId] = makeFallbackUser(post.authorId);
          }
        });

        const commentMap = await fetchCommentsForPosts(normalizedPosts.map(p => p.id));
        Object.values(commentMap).flat().forEach(comment => {
          const authorId = comment.authorId || comment.author_id;
          if (authorId && !profileMap[authorId]) {
            profileMap[authorId] = makeFallbackUser(authorId);
          }
          (comment.replies || []).forEach(reply => {
            const replyAuthorId = reply.authorId || reply.author_id;
            if (replyAuthorId && !profileMap[replyAuthorId]) {
              profileMap[replyAuthorId] = makeFallbackUser(replyAuthorId);
            }
          });
        });

        setUsers(profileMap);
        setCommunities(comms.map(c => ({
          ...c,
          members: c.members || 0,
          posts: c.posts || 0,
          followed: !!c.followed,
          notif: !!c.notif,
          count: c.count || 0,
          ico: c.ico || '🌱',
          desc: c.desc || '',
        })));
        setPosts(normalizedPosts);
        setComments(commentMap);
        setFollowing(Object.keys(profileMap).reduce((acc, key) => ({ ...acc, [key]: false }), {}));

          const params = new URLSearchParams(window.location.search);
        const resolveId = value => value && /^\d+$/.test(value) ? Number(value) : value;
        if (params.has('post')) {
          setPage({ type: 'post', postId: resolveId(params.get('post')), highlightCommentId: resolveId(params.get('comment')) || null });
        } else if (params.has('profile')) {
          setPage({ type: 'profile', userId: resolveId(params.get('profile')) });
        } else if (params.has('community')) {
          setPage({ type: 'community', communityId: resolveId(params.get('community')) });
        }
      } catch (error) {
        console.error('Error loading link feed', error);
        showToast('error', 'Unable to load social feed.');
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [showToast, profile, user]);

  async function toggleLike(id){
    if(!currentUserId){
      showToast('error','Please sign in to like posts.');
      return;
    }
    const isLiked = !!liked[id];
    try {
      const updatedPost = await togglePostLike(id, currentUserId, isLiked);
      setLiked(p=>({...p,[id]:!isLiked}));
      setPosts(p=>p.map(x=>x.id===id?{...x, likes: updatedPost.likes || 0}:x));
    } catch (error) {
      console.error('Error toggling like', error);
      showToast('error','Unable to update like.');
    }
  }

  async function copyPostLink(post){
    const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('ok','Post link copied to clipboard!');
    } catch (error) {
      console.warn('Clipboard copy failed', error);
      showToast('info','Copy this link: ' + url);
    }
  }

  async function submitPost(communityId){
    if(!compose.trim()) return;
    if(!currentUserId){
      showToast('error','Please sign in to publish posts.');
      return;
    }
    const tagMatches=compose.match(/#([a-zA-Z0-9_]+)/g)||[];
    const extractedTags=[...new Set(tagMatches.map(t=>t.slice(1)))];
    const cleanBody=compose.replace(/#([a-zA-Z0-9_]+)/g," ").replace(/\s{2,}/g," ").trim();
    const payload={
      author_id: profile?.id || user?.id,
      body: cleanBody,
      tags: extractedTags,
      community_id: communityId || null,
      likes:0,
      shares:0,
      created_at:new Date().toISOString(),
    };
    try {
      const newPost = await createPost(payload);
      const formatted = {
        id: newPost.id,
        authorId: newPost.authorId || profile?.id || user?.id,
        body: newPost.body || cleanBody,
        createdAt: newPost.createdAt || newPost.created_at || new Date().toISOString(),
        tags: newPost.tags || extractedTags,
        likes: newPost.likes || 0,
        comments: 0,
        shares: newPost.shares || 0,
        communityId: newPost.communityId || communityId || null,
        image: newPost.image || null,
      };
      setPosts(p=>[formatted,...p]);
      setCompose("");
      if(communityId){
        setCommunities(p=>p.map(c=>c.id===communityId?{...c,posts:(c.posts||0)+1}:c));
      } else {
        setTab("discover");
      }
      showToast("ok","Post published!");
    } catch (error) {
      console.error('Error creating post', error);
      showToast('error','Unable to publish post.');
    }
  }

  async function submitCommunityRequest(){
    if(!newCommunityName.trim()){
      showToast('error','Community name is required.');
      return;
    }
    if(!currentUserId){
      showToast('error','Please sign in to create a community.');
      return;
    }
    setCreatingCommunity(true);
    try {
      const community = await createCommunity({
        name: newCommunityName.trim(),
        desc: [newCommunityFocus.trim(), newCommunityDesc.trim()].filter(Boolean).join(' · '),
        ico: newCommunityIcon,
        members: 1,
        posts: 0,
        followed: true,
        notif: false,
        count: 0,
      });
      setCommunities(prev => [community, ...prev]);
      setNewCommunityName('');
      setNewCommunityFocus('');
      setNewCommunityDesc('');
      setNewCommunityIcon('🌱');
      setReqCommOpen(false);
      setPage({ type: 'community', communityId: community.id });
      showToast('ok','Community created successfully!');
    } catch (error) {
      console.error('Community create error', error);
      showToast('error','Unable to create community.');
    } finally {
      setCreatingCommunity(false);
    }
  }
  function toggleFollow(userId){setFollowing(p=>({...p,[userId]:!p[userId]}));}
  async function toggleFollowCommunity(id){
    const current = communities.find(c=>c.id===id);
    if(!current) return;
    const nextFollow = !current.followed;
    try {
      const updated = await toggleCommunityFollowService(id, nextFollow);
      setCommunities(p=>p.map(c=>c.id===id?{...c,...updated,followed:nextFollow,members:Math.max(0,(c.members||0) + (nextFollow?1:-1))}:c));
      showToast('ok', nextFollow ? 'Following community.' : 'Unfollowed community.');
    } catch (error) {
      console.error('Community follow error', error);
      showToast('error','Unable to update community follow status.');
    }
  }
  async function handleShare(post, method){
    if(!post) return;
    if(!currentUserId){
      showToast('error','Please sign in to share posts.');
      return;
    }
    try {
      if(method === 'copy'){
        const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
        await navigator.clipboard.writeText(url);
        showToast('ok','Post link copied to clipboard!');
        return;
      }
      const { post: updatedPost } = await sharePost(post.id, currentUserId, method || 'share');
      setPosts(p=>p.map(x=>x.id===post.id?{...x, shares: updatedPost.shares || (x.shares || 0) + 1}:x));
      showToast('ok','Post shared!');
    } catch (error) {
      console.error('Error sharing post', error);
      showToast('error', 'Unable to share post.');
    }
  }

  async function toggleNotif(id){
    const current = communities.find(c=>c.id===id);
    if(!current) return;
    const nextNotif = !current.notif;
    try {
      const updated = await toggleCommunityNotifService(id, nextNotif);
      setCommunities(p=>p.map(c=>c.id===id?{...c,...updated,notif:nextNotif}:c));
      showToast('ok', nextNotif ? 'Notifications enabled.' : 'Notifications disabled.');
    } catch (error) {
      console.error('Community notif error', error);
      showToast('error','Unable to update notification settings.');
    }
  }
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
    const isOwner=String(p.authorId)===String(currentUserId);
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
            <PostActionMenu post={p} isOwner={isOwner} onDelete={()=>showToast("ok","Post deleted.")} onCopyLink={copyPostLink} showToast={showToast}/>
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
          <button className={"post-act"+(liked[p.id]?" liked":"")} onClick={()=>toggleLike(p.id)}><I.Heart/>{p.likes}</button>
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
    return <SocialCtx.Provider value={socialCtxValue}><PostView postId={page.postId} highlightCommentId={page.highlightCommentId} posts={posts} setPosts={setPosts} comments={comments} setComments={setComments} users={users} liked={liked} onToggleLike={toggleLike} onBack={goFeed} showToast={showToast} onSave={p=>setSaveOpen(p)} onShare={handleShare} onDeletePost={()=>{showToast("ok","Post deleted.");goFeed();}} onCopyLink={copyPostLink}/></SocialCtx.Provider>;
  }
  if(page.type==="community"){
    const community=communities.find(c=>c.id===page.communityId);
    const commPosts=posts.filter(p=>p.communityId===page.communityId);
    return <SocialCtx.Provider value={socialCtxValue}><CommunityFeed community={community} posts={commPosts} onBack={goFeed} onToggleFollow={toggleFollowCommunity} onToggleNotif={toggleNotif} PostCardComp={PostCard} onNewPost={(newPost) => {
      setCommunities(prev => prev.map(c => c.id === community.id ? { ...c, posts: (c.posts || 0) + 1 } : c));
      setPosts(prev => [newPost, ...prev]);
    }}/></SocialCtx.Provider>;
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
              <button className="btn btn-p" onClick={()=>submitPost(null)} disabled={!compose.trim() || (!profile?.id && !user?.id)}><I.Send/>Publish</button>
            </div>
          </div>
          <div className="notice ni"><I.Info/><span>Type #hashtags anywhere in your post — they will be automatically extracted as tags when you publish.</span></div>
          {(!profile?.id && !user?.id)&&<div className="notice ni"><I.Info/><span>Sign in to publish and interact with the community.</span></div>}
        </div>}
        {tab==="community"&&<>
          <div className="stat-row">
            {[
              ['👥', communities.reduce((sum,c)=>sum + Number(c.members||0),0).toLocaleString(), 'Members'],
              ['🌍', new Set(communities.map(c=>c.state).filter(Boolean)).size || 0, 'Active Regions'],
              ['🏆', communities.length, 'Communities'],
              ['💬', communities.reduce((sum,c)=>sum + Number(c.posts||0),0), 'Live Posts'],
            ].map(([ic,v,l])=>(
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
                </div>
                <div className="comm-body">
                  <div className="comm-name">{c.name}</div>
                  <div className="comm-meta">{c.members.toLocaleString()} members · {c.posts} posts</div>
                  <button className={"btn btn-sm btn-full" + (c.followed ? " btn-g" : " btn-p")} onClick={e=>{e.stopPropagation(); toggleFollowCommunity(c.id);}}>
                    {c.followed ? "Following" : "Follow"}
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
      <Modal open={reqCommOpen} onClose={()=>{setReqCommOpen(false);setNewCommunityName('');setNewCommunityDesc('');setNewCommunityIcon('🌱');}} title="Create a Community" sheet
        footer={<><button className="btn btn-g" onClick={()=>{setReqCommOpen(false);setNewCommunityName('');setNewCommunityDesc('');setNewCommunityIcon('🌱');}}>Cancel</button><button className="btn btn-p" onClick={submitCommunityRequest} disabled={creatingCommunity||!newCommunityName.trim()}><I.Check/>{creatingCommunity ? 'Creating...' : 'Create Community'}</button></>}>
        <div className="notice nw"><I.Info/><span>Communities are live immediately. Create one and start sharing with your members.</span></div>
        <div className="form-g"><label className="label">Community Name</label><input className="field" placeholder="e.g. Nigerian Maize Growers" value={newCommunityName} onChange={e=>setNewCommunityName(e.target.value)}/></div>
        <div className="form-g"><label className="label">Focus Area</label><input className="field" placeholder="e.g. Maize, Irrigation, AgriTech…" value={newCommunityFocus} onChange={e=>setNewCommunityFocus(e.target.value)}/></div>
        <div className="form-g"><label className="label">Community Icon</label><input className="field" placeholder="Emoji icon" value={newCommunityIcon} onChange={e=>setNewCommunityIcon(e.target.value)}/></div>
        <div className="form-g"><label className="label">Description</label><textarea className="field textarea" placeholder="What is this community about?" value={newCommunityDesc} onChange={e=>setNewCommunityDesc(e.target.value)}/></div>
      </Modal>

      <SaveFolderPanel open={!!saveOpen} onClose={()=>setSaveOpen(null)} post={saveOpen} savedMap={savedMap} onToggleSave={toggleSave} showToast={showToast}/>
      <SharePanel open={!!shareOpen} onClose={()=>setShareOpen(null)} post={shareOpen} users={users} showToast={showToast} onShare={handleShare}/>
    </div>
    </SocialCtx.Provider>
  );
}

/* ============================================================
   PROFILE PAGE — X-style: bio top, Posts/Replies tabs
   ============================================================ */

export default LinkSection;
