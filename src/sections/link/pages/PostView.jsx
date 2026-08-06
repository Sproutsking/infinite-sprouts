import React, { useState, useRef, useEffect } from 'react';
import I from '../../../icons/icons.jsx';
import { Av, Modal } from '../../../components/index.jsx';
import { useSocial } from '../../../context/SocialContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { AuthorTrigger, AuthorName } from '../../../popovers/ProfilePopover.jsx';
import { CommentActionMenu } from '../../../popovers/CommentActionMenu.jsx';
import PostActionMenu from '../../../popovers/PostActionMenu.jsx';
import { createComment } from '../../../services/postService.js';

function PostView({postId,highlightCommentId,posts,comments,setComments,users,liked,onToggleLike,onBack,showToast,onSave,onShare,onDeletePost}){
  const { user, profile } = useAuth();
  const post=posts.find(p=>p.id===postId);
  const postComments=comments[postId]||[];
  const [commentText,setCommentText]=useState("");
  const [replyingTo,setReplyingTo]=useState(null);
  const [replyText,setReplyText]=useState("");
  const [commentLiked,setCommentLiked]=useState({});
  const highlightRef=useRef(null);

  useEffect(()=>{
    if(highlightCommentId&&highlightRef.current){
      setTimeout(()=>highlightRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),150);
    }
  },[highlightCommentId]);

  if(!post) return null;
  const author=users[post.authorId];

  async function postComment(){
    if(!commentText.trim()) return;
    try {
      const createdComment = await createComment({
        postId,
        authorId: profile?.id || user?.id,
        body: commentText.trim(),
        createdAt: new Date().toISOString(),
      });
      const c={id:createdComment.id,authorId:createdComment.authorId||profile?.id||user?.id,text:createdComment.body||commentText.trim(),time:createdComment.createdAt?new Date(createdComment.createdAt).toLocaleDateString():"now",likes:0,replies:[]};
      setComments(p=>({...p,[postId]:[...(p[postId]||[]),c]}));
      setCommentText("");
      showToast("ok","Comment posted!");
    } catch (error) {
      console.error('Error creating comment', error);
      showToast('error','Unable to post comment.');
    }
  }
  async function postReply(commentId){
    if(!replyText.trim()) return;
    try {
      const createdReply = await createComment({
        postId,
        parentCommentId: commentId,
        authorId: profile?.id || user?.id,
        body: replyText.trim(),
        createdAt: new Date().toISOString(),
      });
      const r={id:createdReply.id,authorId:createdReply.authorId||profile?.id||user?.id,text:createdReply.body||replyText.trim(),time:createdReply.createdAt?new Date(createdReply.createdAt).toLocaleDateString():"now",likes:0};
      setComments(p=>({...p,[postId]:(p[postId]||[]).map(c=>c.id===commentId?{...c,replies:[...(c.replies||[]),r]}:c)}));
      setReplyText("");setReplyingTo(null);
      showToast("ok","Reply posted!");
    } catch (error) {
      console.error('Error creating reply', error);
      showToast('error','Unable to post reply.');
    }
  }
  function toggleCommentLike(id){setCommentLiked(p=>({...p,[id]:!p[id]}));}
  function deleteTopComment(commentId){
    setComments(p=>({...p,[postId]:(p[postId]||[]).filter(c=>c.id!==commentId)}));
    showToast("ok","Comment deleted.");
  }
  function deleteReply(parentId,replyId){
    setComments(p=>({...p,[postId]:(p[postId]||[]).map(c=>c.id===parentId?{...c,replies:(c.replies||[]).filter(r=>r.id!==replyId)}:c)}));
    showToast("ok","Reply deleted.");
  }

  const CommentRow=({c,isReply,parentId})=>{
    const cUser=users[c.authorId];
    const isHighlighted=highlightCommentId===c.id;
    const isOwner=c.authorId==="you";
    const isReplying=!isReply&&replyingTo===c.id;
    return(
      <div className={"comment-item"+(isHighlighted?" highlight":"")} ref={isHighlighted?highlightRef:null}>
        <div className="comment-row-wrap">
          <CommentActionMenu isOwner={isOwner} onDelete={()=>isReply?deleteReply(parentId,c.id):deleteTopComment(c.id)} showToast={showToast}/>
          <Av initials={cUser?.initials||"?"} size="sm"/>
          <div className="comment-body-col">
            <div className="comment-meta-row">
              <AuthorName userId={c.authorId} style={{fontSize:"12.5px",fontWeight:700}}/>
              <span className="comment-time">· {c.time}</span>
            </div>
            <div className="comment-text">{c.text}</div>
            <div className="comment-acts-row">
              <button className={"comment-act-btn"+(commentLiked[c.id]?" liked":"")} onClick={()=>toggleCommentLike(c.id)}><I.Heart/>{(c.likes||0)+(commentLiked[c.id]?1:0)}</button>
              {!isReply&&<button className="comment-act-btn" onClick={()=>setReplyingTo(isReplying?null:c.id)}>{isReplying?<><I.X/>Cancel</>:<><I.Comment/>Reply</>}</button>}
            </div>
            {isReplying&&(
              <div className="reply-compose-row">
                <Av initials="YO" size="sm" green/>
                <textarea className="reply-compose-input" rows={1} placeholder={"Reply to "+(cUser?.name||"")+"…"} value={replyText} onChange={e=>setReplyText(e.target.value)} autoFocus/>
                <button className="ib" onClick={()=>postReply(c.id)}><I.Send/></button>
              </div>
            )}
            {!isReply&&c.replies&&c.replies.length>0&&(
              <div className="reply-list">
                {c.replies.map(r=><CommentRow key={r.id} c={r} isReply parentId={c.id}/>)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const commentInputRef=useRef(null);

  return(
    <div className="main">
      <div className="post-view-hd">
        <button className="ib" onClick={onBack}><I.ArrowL/></button>
        <div style={{fontWeight:700,fontSize:13,color:"var(--t1)",flex:1}}>Post</div>
        <PostActionMenu post={post} isOwner={post.authorId==="you"} onDelete={()=>{onDeletePost&&onDeletePost();}} onCopyLink={()=>showToast("ok","Link copied!")} showToast={showToast}/>
      </div>
      <div className="scroll" style={{padding:0}}>
        <div className="post-view-main">
          <AuthorTrigger userId={post.authorId} size="lg"/>
          <div className="post-view-body">{post.body}</div>
          {post.image&&<div className="post-view-img">{post.image}</div>}
          {post.tags&&post.tags.length>0&&<div className="post-tags">{post.tags.map(t=><span key={t} className="post-tag">#{t}</span>)}</div>}
          <div className="post-view-time">{post.time} ago · Infinite Sprouts</div>
          <div className="post-view-stats">
            <span><b>{(comments[postId]||[]).reduce((n,c)=>n+1+(c.replies?.length||0),0)}</b> <span>Comments</span></span>
            <span><b>{post.shares}</b> <span>Shares</span></span>
            <span><b>{post.likes+(liked[postId]?1:0)}</b> <span>Likes</span></span>
          </div>
          <div className="post-view-acts">
            <button className={"post-act"+(liked[postId]?" liked":"")} onClick={()=>onToggleLike(postId)}><I.Heart/>Like</button>
            <button className="post-act" onClick={()=>commentInputRef.current?.focus()}><I.Comment/>Comment</button>
            <button className="post-act" onClick={()=>onShare&&onShare(post)}><I.Share/>Share</button>
            <button className="post-act" onClick={()=>onSave&&onSave(post)}><I.Bookmark/>Save</button>
          </div>
        </div>
        <div className="comment-composer">
          <Av initials="YO" size="sm" green/>
          <div className="comment-input-wrap">
            <textarea ref={commentInputRef} className="comment-input" rows={1} placeholder="Post your reply…" value={commentText} onChange={e=>setCommentText(e.target.value)}/>
            <div className="comment-composer-foot"><button className="btn btn-p btn-sm" onClick={postComment} disabled={!commentText.trim()}><I.Send/>Reply</button></div>
          </div>
        </div>
        <div className="comment-thread">
          {postComments.length===0?
            <div className="empty"><div className="empty-ico">💬</div><div className="empty-t">No comments yet</div><div className="empty-s">Be the first to reply</div></div>:
            postComments.map(c=><CommentRow key={c.id} c={c}/>)
          }
        </div>
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ============================================================
   COMMUNITY FULL FEED PAGE
   ============================================================ */

export default PostView;
