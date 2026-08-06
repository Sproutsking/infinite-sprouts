import React, { useState, useRef, useEffect } from 'react';
import I from '../../../icons/icons.jsx';
import { Av, Modal } from '../../../components/index.jsx';
import { useSocial } from '../../../context/SocialContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { AuthorTrigger, AuthorName } from '../../../popovers/ProfilePopover.jsx';
import { CommentActionMenu } from '../../../popovers/CommentActionMenu.jsx';
import PostActionMenu from '../../../popovers/PostActionMenu.jsx';

function ProfilePage({userId,users,posts,comments,following,onToggleFollow,onDM,onBack,onGoPost,PostCardComp}){
  const { user: authUser, profile } = useAuth();
  const currentUserId = profile?.id || authUser?.id;
  const [tab,setTab]=useState("posts");
  const fallbackUser = id => {
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
  const user=users[userId] || fallbackUser(userId);
  const isMe=String(userId)===String(currentUserId);

  const myPosts=posts.filter(p=>String(p.authorId)===String(userId));

  // Build replies list: every comment/reply by this user, across all posts
  const myReplies=[];
  Object.entries(comments).forEach(([postId,list])=>{
    list.forEach(c=>{
      if(c.authorId===userId) myReplies.push({...c,postId:Number(postId),isReply:false});
      (c.replies||[]).forEach(r=>{
        if(r.authorId===userId) myReplies.push({...r,postId:Number(postId),isReply:true,parentId:c.id});
      });
    });
  });

  return(
    <div className="main">
      <div className="profile-page-hd">
        <button className="ib" onClick={onBack}><I.ArrowL/></button>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:"var(--t1)"}}>{user.name}</div>
          <div style={{fontSize:10.5,color:"var(--t4)"}}>{myPosts.length} posts</div>
        </div>
      </div>
      <div className="scroll" style={{padding:0}}>
        <div className="profile-banner"/>
        <div className="profile-block">
          <Av initials={user.initials} size="xl" src={user.avatarUrl} green />
          <div className="profile-name-row">
            <div className="profile-name">{user.name}</div>
            {!isMe&&(
              <div style={{display:"flex",gap:7}}>
                <button className="btn btn-g btn-sm" onClick={()=>onDM(user)}><I.Msg/>Message</button>
                <button className={"btn btn-sm"+(following[userId]?" btn-g":" btn-p")} onClick={()=>onToggleFollow(userId)}>{following[userId]?"Following":"Follow"}</button>
              </div>
            )}
          </div>
          <div className="profile-role">{user.role}</div>
          <div className="profile-bio">{user.bio}</div>
          <div className="profile-meta-row">
            <span>📅 Joined {user.joined}</span>
          </div>
          <div className="profile-meta-row">
            <span><b>{user.following}</b> Following</span>
            <span><b>{user.followers.toLocaleString()}</b> Followers</span>
          </div>
        </div>
        <div className="profile-tabs">
          <div className={"profile-tab"+(tab==="posts"?" on":"")} onClick={()=>setTab("posts")}>Posts</div>
          <div className={"profile-tab"+(tab==="replies"?" on":"")} onClick={()=>setTab("replies")}>Replies</div>
        </div>
        {tab==="posts"&&<div style={{padding:14}}>
          <div className="post-feed">
            {myPosts.length===0?
              <div className="empty"><div className="empty-ico">📝</div><div className="empty-t">No posts yet</div></div>:
              myPosts.map(p=><PostCardComp key={p.id} p={p}/>)
            }
          </div>
        </div>}
        {tab==="replies"&&<div>
          {myReplies.length===0?
            <div className="empty"><div className="empty-ico">💬</div><div className="empty-t">No replies yet</div></div>:
            myReplies.map(r=>{
              const parentPost=posts.find(p=>p.id===r.postId);
              return(
                <div key={r.id} className="reply-card" onClick={()=>onGoPost(r.postId,r.isReply?r.parentId:r.id)}>
                  <div className="reply-context">Replying to a post by <AuthorName userId={parentPost?.authorId||""}/></div>
                  <div className="reply-text">{r.text}</div>
                </div>
              );
            })
          }
        </div>}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ============================================================
   POST VIEW — full screen, threaded comment system
   ============================================================ */

export default ProfilePage;
