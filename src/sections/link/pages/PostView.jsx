import React, { useState, useRef, useEffect } from 'react';
import I from '../../../icons/icons.jsx';
import { Av } from '../../../components/index.jsx';
import { useSocial } from '../../../context/SocialContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { AuthorTrigger, AuthorName } from '../../../popovers/ProfilePopover.jsx';
import { CommentActionMenu } from '../../../popovers/CommentActionMenu.jsx';
import PostActionMenu from '../../../popovers/PostActionMenu.jsx';
import ReactionButton from '../../../components/ReactionButton.jsx';
import ActionDialog from '../../../components/ActionDialog.jsx';
import { createComment, deleteComment, fetchLikedCommentIds, toggleCommentLike as toggleCommentLikeService } from '../../../services/postService.js';
import { formatPostTime } from '../../../utils/postTime.js';

const EMPTY_COMMENTS = [];

function PostView({postId,highlightCommentId,posts,setPosts,comments,setComments,users,liked,onToggleLike,onBack,showToast,onSave,onShare,onEditPost,onToggleComments,onDeletePost,onCopyLink,onPinPost,onHidePost,onModerateUser,onConfirmBlock,onReportPost,onReportComment}){
  const { user, profile } = useAuth();
  const currentUserId = profile?.id || user?.id;
  const post=posts.find(p=>p.id===postId);
  const postComments=comments[postId]||EMPTY_COMMENTS;
  const [commentText,setCommentText]=useState("");
  const [replyingTo,setReplyingTo]=useState(null);
  const [replyText,setReplyText]=useState("");
  const [commentLiked,setCommentLiked]=useState({});
  const [actionDialog,setActionDialog]=useState(null);
  const highlightRef=useRef(null);
  const commentInputRef=useRef(null);

  useEffect(() => {
    if (!currentUserId) return;
    const commentIds = postComments.flatMap(comment => [comment.id, ...(comment.replies || []).map(reply => reply.id)]);
    let active = true;
    fetchLikedCommentIds(currentUserId, commentIds)
      .then(ids => {
        if (active) setCommentLiked(Object.fromEntries(ids.map(id => [id, true])));
      })
      .catch(error => console.error('Error loading comment likes', error));
    return () => { active = false; };
  }, [currentUserId, postComments]);

  useEffect(()=>{
    if(highlightCommentId&&highlightRef.current){
      setTimeout(()=>highlightRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),150);
    }
  },[highlightCommentId]);

  if(!post) return null;
  const author=users[post.authorId] || { name: 'Unknown', initials: '??', role: 'Member' };

  async function postComment(){
    if(!commentText.trim()) return;
    try {
      const createdComment = await createComment({
        postId,
        authorId: profile?.id || user?.id,
        body: commentText.trim(),
        createdAt: new Date().toISOString(),
      });
      const createdAt = createdComment.createdAt || createdComment.created_at || new Date().toISOString();
      const c = {
        id: createdComment.id,
        authorId: createdComment.authorId || profile?.id || user?.id,
        body: createdComment.body || commentText.trim(),
        text: createdComment.body || commentText.trim(),
        createdAt,
        likes: 0,
        replies: [],
      };
      setComments(p => ({ ...p, [postId]: [...(p[postId]||[]), c] }));
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
      const createdAt = createdReply.createdAt || createdReply.created_at || new Date().toISOString();
      const r = {
        id: createdReply.id,
        authorId: createdReply.authorId || profile?.id || user?.id,
        body: createdReply.body || replyText.trim(),
        text: createdReply.body || replyText.trim(),
        createdAt,
        likes: 0,
      };
      setComments(p => ({ ...p, [postId]: (p[postId]||[]).map(c => c.id===commentId ? { ...c, replies: [...(c.replies||[]), r] } : c) }));
      setReplyText("");
      setReplyingTo(null);
      showToast("ok","Reply posted!");
    } catch (error) {
      console.error('Error creating reply', error);
      showToast('error','Unable to post reply.');
    }
  }
  async function toggleCommentLike(id){
    if (!currentUserId) {
      showToast('error', 'Sign in to like comments.');
      return;
    }
    try {
      const result = await toggleCommentLikeService(id);
      setCommentLiked(previous => ({ ...previous, [id]: result.liked }));
      setComments(previous => ({
        ...previous,
        [postId]: (previous[postId] || []).map(comment => comment.id === id
          ? { ...comment, likes: result.likes }
          : { ...comment, replies: (comment.replies || []).map(reply => reply.id === id ? { ...reply, likes: result.likes } : reply) }),
      }));
      return result.liked;
    } catch (error) {
      console.error('Comment like error', error);
      showToast('error', error.message || 'Unable to update comment reaction.');
      return false;
    }
  }
  function removeComment(commentId, parentId = null){
    setActionDialog({
      title: 'Delete comment?',
      message: 'This comment will be permanently deleted.',
      confirmLabel: 'Delete comment',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteComment(commentId, currentUserId);
          setComments(previous => ({
            ...previous,
            [postId]: parentId
              ? (previous[postId] || []).map(comment => comment.id === parentId ? { ...comment, replies: (comment.replies || []).filter(reply => reply.id !== commentId) } : comment)
              : (previous[postId] || []).filter(comment => comment.id !== commentId),
          }));
          showToast('ok', 'Comment deleted.');
          return true;
        } catch (error) {
          console.error('Comment delete error', error);
          showToast('error', error.message || 'Unable to delete comment.');
          return false;
        }
      },
    });
  }

  const CommentRow=({c,isReply,parentId})=>{
    const cUser=users[c.authorId];
    const isHighlighted=highlightCommentId===c.id;
    const isOwner=String(c.authorId)===String(currentUserId);
    const isReplying=!isReply&&replyingTo===c.id;
    const bodyText = c.body || c.text || '';
    const commentTime = c.createdAt ? formatPostTime(c.createdAt) : c.time || 'Just now';
    return(
      <div className={"comment-item"+(isHighlighted?" highlight":"")} ref={isHighlighted?highlightRef:null}>
        <div className="comment-row-wrap">
          <CommentActionMenu isOwner={isOwner} onDelete={()=>removeComment(c.id, isReply ? parentId : null)} onMute={()=>onModerateUser?.({authorId:c.authorId},'muted_users')} onReport={()=>onReportComment?.(c.id)} showToast={showToast}/>
          <Av initials={cUser?.initials||"?"} size="sm" src={cUser?.avatarUrl}/>
          <div className="comment-body-col">
            <div className="comment-meta-row">
              <AuthorName userId={c.authorId} style={{fontSize:"12.5px",fontWeight:700}}/>
              <span className="comment-time">· {commentTime}</span>
            </div>
            <div className="comment-text">{bodyText}</div>
            <div className="comment-acts-row">
              <ReactionButton className="comment-act-btn" liked={!!commentLiked[c.id]} count={c.likes || 0} onToggle={()=>toggleCommentLike(c.id)} label={`${commentLiked[c.id]?'Unlike':'Like'} comment; ${c.likes || 0} likes`} />
              {!isReply&&post.commentsEnabled&&<button className="comment-act-btn" onClick={()=>setReplyingTo(isReplying?null:c.id)}>{isReplying?<><I.X/>Cancel</>:<><I.Comment/>Reply</>}</button>}
            </div>
            {isReplying&&(
              <div className="reply-compose-row">
                <Av initials={profile?.initials || 'US'} size="sm" green src={profile?.avatar_url}/>
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

  const isOwner = String(post.authorId) === String(currentUserId);
  const timeLabel = formatPostTime(post.createdAt);

  return(
    <>
    <div className="main main-link post-view-page">
      <div className="post-view-hd">
        <button className="ib" onClick={onBack}><I.ArrowL/></button>
        <div style={{fontWeight:700,fontSize:13,color:"var(--t1)",flex:1}}>Post</div>
        <PostActionMenu post={post} isOwner={isOwner} onEdit={onEditPost} onTurnOffComments={onToggleComments} onDelete={()=>{onDeletePost&&onDeletePost(post);}} onCopyLink={onCopyLink} onPin={onPinPost} onHide={onHidePost} onMute={()=>onModerateUser?.(post,'muted_users')} onBlock={()=>onConfirmBlock?.(post)} onReport={onReportPost} showToast={showToast}/>
      </div>
      <div className="scroll" style={{padding:0}}>
        <div className="post-view-main">
          <AuthorTrigger userId={post.authorId} size="lg" createdAt={post.createdAt}/>
          <div className="post-view-body">{post.body}</div>
          {post.location&&<div className="post-location post-view-location"><I.Map/>{post.location}</div>}
          {post.image&&<div className="post-view-img">{/^https?:\/\//i.test(post.image)?<img src={post.image} alt="Post attachment"/>:post.image}</div>}
          {post.tags&&post.tags.length>0&&<div className="post-tags">{post.tags.map(t=><span key={t} className="post-tag">#{t}</span>)}</div>}
          <div className="post-view-time">{timeLabel} · Infinite Sprouts</div>
          <div className="post-view-stats">
            <span><b>{(comments[postId]||[]).reduce((n,c)=>n+1+(c.replies?.length||0),0)}</b> <span>Comments</span></span>
            <span><b>{post.shares}</b> <span>Shares</span></span>
            <span><b>{post.likes}</b> <span>Likes</span></span>
          </div>
          <div className="post-view-acts">
            <ReactionButton className="post-act" liked={!!liked[postId]} count="Like" onToggle={()=>onToggleLike(postId)} label={`${liked[postId]?'Unlike':'Like'} post`} />
            <button className="post-act" disabled={!post.commentsEnabled} onClick={()=>commentInputRef.current?.focus()}><I.Comment/>Comment</button>
            <button className="post-act" onClick={event=>onShare?.(post,event.currentTarget)}><I.Share/>Share</button>
            <button className="post-act" onClick={event=>onSave?.(post,event.currentTarget)}><I.Bookmark/>Save</button>
          </div>
        </div>
        {post.commentsEnabled ? <div className="comment-composer">
          <Av initials={profile?.initials || 'US'} size="sm" green src={profile?.avatar_url}/>
          <div className="comment-input-wrap">
            <textarea ref={commentInputRef} className="comment-input" rows={1} placeholder="Post your reply…" value={commentText} onChange={e=>setCommentText(e.target.value)}/>
            <div className="comment-composer-foot"><button className="btn btn-p btn-sm" onClick={postComment} disabled={!commentText.trim()}><I.Send/>Reply</button></div>
          </div>
        </div> : <div className="notice ni"><I.Info/><span>The author has turned off comments for this post.</span></div>}
        <div className="comment-thread">
          {postComments.length===0?
            <div className="empty comment-empty"><div className="empty-ico"><I.Comment/></div><div className="empty-t">{post.commentsEnabled?'No comments yet':'Comments are turned off'}</div><div className="empty-s">{post.commentsEnabled?'Be the first to reply':'The author has disabled replies on this post.'}</div></div>:
            postComments.map(c=><CommentRow key={c.id} c={c}/>)
          }
        </div>
        <div style={{height:20}}/>
      </div>
    </div>
    <ActionDialog
      dialog={actionDialog}
      onClose={() => setActionDialog(null)}
      onSubmit={value => actionDialog?.onConfirm?.(value)}
    />
    </>
  );
}

/* ============================================================
   COMMUNITY FULL FEED PAGE
   ============================================================ */

export default PostView;
