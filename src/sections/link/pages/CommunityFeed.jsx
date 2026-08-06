import React, { useState, useEffect } from 'react';
import I from '../../../icons/icons.jsx';
import { Av, Modal } from '../../../components/index.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { createPost } from '../../../services/postService.js';

function CommunityFeed({community,posts,onBack,onToggleFollow,onToggleNotif,PostCardComp,onNewPost}){
  const { user } = useAuth();
  const [composerOpen,setComposerOpen]=useState(false);
  const [compose,setCompose]=useState("");
  const [localPosts,setLocalPosts]=useState(posts);

  // Keep localPosts in sync if parent posts prop changes
  useEffect(()=>setLocalPosts(posts),[posts]);

  async function submitPost(){
    if(!compose.trim() || !user?.id) return;
    const tagMatches=compose.match(/#([a-zA-Z0-9_]+)/g)||[];
    const extractedTags=[...new Set(tagMatches.map(t=>t.slice(1)))];
    const cleanBody=compose.replace(/#([a-zA-Z0-9_]+)/g," ").replace(/\s{2,}/g," ").trim();
    const payload = {
      author_id: user.id,
      body: cleanBody,
      tags: extractedTags,
      community_id: community.id,
      likes: 0,
      shares: 0,
      created_at: new Date().toISOString(),
    };

    try {
      const savedPost = await createPost(payload);
      const formatted = {
        id: savedPost.id,
        authorId: savedPost.authorId || user.id,
        body: savedPost.body || cleanBody,
        time: savedPost.createdAt ? new Date(savedPost.createdAt).toLocaleDateString() : 'now',
        tags: savedPost.tags || extractedTags,
        likes: savedPost.likes || 0,
        comments: savedPost.comments || 0,
        shares: savedPost.shares || 0,
        communityId: savedPost.communityId || community.id,
        image: savedPost.image || null,
      };
      setLocalPosts(p=>[formatted,...p]);
      setCompose("");
      setComposerOpen(false);
      if(onNewPost) onNewPost(formatted);
    } catch (error) {
      console.error('Community post create error', error);
    }
  }

  const liveTags=[...new Set((compose.match(/#([a-zA-Z0-9_]+)/g)||[]).map(t=>t.slice(1)))];

  if(!community) return null;
  return(
    <div className="main">
      <div className="post-view-hd">
        <button className="ib" onClick={onBack}><I.ArrowL/></button>
        <div style={{fontWeight:700,fontSize:13,color:"var(--t1)",flex:1}}>{community.name}</div>
        <button className={"ib"+(community.notif?" active-bell":"")} title={community.notif?"Notifications on":"Notifications off"} onClick={()=>onToggleNotif(community.id)}>
          <I.Bell/>
        </button>
      </div>
      <div className="scroll" style={{padding:0}}>
        <div className="comm-feed-hero" style={{background:community.bg}}>
          <div className="comm-feed-hero-c">
            <div className="comm-feed-ico">{community.ico}</div>
            <div className="comm-feed-name">{community.name}</div>
          </div>
        </div>
        <div className="comm-feed-meta">
          <div className="comm-feed-desc">{community.desc}</div>
          <div className="comm-feed-stats">
            <span><b>{community.members.toLocaleString()}</b> members</span>
            <span><b>{community.posts}</b> posts</span>
          </div>
          <div className="comm-feed-acts">
            <button className={"btn btn-sm"+(community.followed?" btn-g":" btn-p")} onClick={()=>onToggleFollow(community.id)}>
              {community.followed?<><I.Check/>Following</>:<><I.Plus/>Follow</>}
            </button>
            {community.followed&&(
              <button className="btn btn-p btn-sm" onClick={()=>setComposerOpen(true)}><I.Plus/>Post</button>
            )}
          </div>
        </div>

        {!community.followed&&(
          <div className="gate-card">
            <div className="gate-card-ico">🔒</div>
            <div style={{fontWeight:700,fontSize:13,color:"var(--t1)",marginBottom:4}}>Follow to post here</div>
            <div style={{fontSize:12,color:"var(--t4)"}}>Join {community.name} to share updates with the community.</div>
          </div>
        )}

        <div style={{padding:14}}>
          <div className="post-feed">
            {localPosts.length===0?
              <div className="empty"><div className="empty-ico">🌱</div><div className="empty-t">No posts yet</div><div className="empty-s">Be the first to post in this community</div></div>:
              localPosts.map(p=><PostCardComp key={p.id} p={p}/>)
            }
          </div>
        </div>
        <div style={{height:20}}/>
      </div>

      {/* Community Post Composer Modal — fully self-contained here */}
      <Modal open={composerOpen} onClose={()=>{setComposerOpen(false);setCompose("");}} title={`Post in ${community.name}`} sheet
        footer={<>
          <button className="btn btn-g" onClick={()=>{setComposerOpen(false);setCompose("");}}>Cancel</button>
          <button className="btn btn-p" onClick={submitPost} disabled={!compose.trim()}><I.Send/>Publish</button>
        </>}>
        {/* Community identity row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--sf3)",borderRadius:"var(--r12)",border:"1px solid var(--bd)",marginBottom:14}}>
          <div style={{width:36,height:36,borderRadius:"var(--rf)",background:community.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{community.ico}</div>
          <div>
            <div style={{fontWeight:700,fontSize:12.5,color:"var(--t1)",lineHeight:1.3}}>{community.name}</div>
            <div style={{fontSize:10.5,color:"var(--t4)"}}>Your Name · posting as member</div>
          </div>
          <span className="badge b-g" style={{marginLeft:"auto"}}>Community</span>
        </div>
        {/* Composer */}
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <Av initials="YO" size="lg" green/>
          <textarea
            className="compose-input"
            placeholder={`What's on your mind in ${community.name}? Use #hashtags to tag topics.`}
            value={compose}
            onChange={e=>setCompose(e.target.value)}
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
    </div>
  );
}

/* ============================================================
   FARM SECTION
   ============================================================ */

export default CommunityFeed;
