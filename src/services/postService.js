import supabase from '../lib/supabaseClient.js';
import { callEdgeFunction, functionsUrl } from './edgeService.js';
import { PostModel, CommentModel, ShareModel } from '../models/index.js';

export async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(post => PostModel.fromPayload(post));
}

export async function fetchCommentsForPost(postId) {
  const { data, error } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  if (error) throw error;
  const parents = (data || []).filter(c => !c.parent_comment_id).map(c => ({ ...CommentModel.fromPayload(c), replies: [] }));
  const replies = (data || []).filter(c => c.parent_comment_id).map(c => CommentModel.fromPayload(c));
  replies.forEach(r => {
    const parent = parents.find(p => p.id === r.parentCommentId);
    if (parent) {
      parent.replies = parent.replies || [];
      parent.replies.push(r);
    }
  });
  return parents;
}

export async function fetchCommentsForPosts(postIds = []) {
  if (!postIds.length) return {};
  const { data, error } = await supabase.from('comments').select('*').in('post_id', postIds).order('created_at', { ascending: true });
  if (error) throw error;
  const map = {};
  const parents = (data || []).filter(c => !c.parent_comment_id).map(c => ({ ...CommentModel.fromPayload(c), replies: [] }));
  const replies = (data || []).filter(c => c.parent_comment_id).map(c => CommentModel.fromPayload(c));
  parents.forEach(p => {
    map[p.postId] = map[p.postId] || [];
    map[p.postId].push(p);
  });
  replies.forEach(r => {
    const parent = map[r.postId]?.find(p => p.id === r.parentCommentId);
    if (parent) {
      parent.replies = parent.replies || [];
      parent.replies.push(r);
    }
  });
  return map;
}

export async function createPost(payload) {
  const resolvedAuthorId = payload?.author_id || payload?.authorId || payload?.user_id || null;
  let authorId = resolvedAuthorId;

  if (!authorId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    authorId = user?.id || null;
  }

  if (!authorId) {
    throw new Error('Authentication required to create a post.');
  }

  const model = PostModel.fromPayload({ ...payload, author_id: authorId, authorId });
  const bodyPayload = PostModel.toPayload(model);

  if (functionsUrl) {
    try {
      const response = await callEdgeFunction('create-post', bodyPayload);
      return PostModel.fromPayload(response);
    } catch (error) {
      console.warn('Post edge function failed, falling back to direct Supabase insert.', error);
    }
  }

  const { data, error } = await supabase.from('posts').insert(bodyPayload).select('*').single();
  if (error) throw error;
  return PostModel.fromPayload(data);
}

export async function createComment(payload) {
  const resolvedAuthorId = payload?.author_id || payload?.authorId || payload?.user_id || null;
  let authorId = resolvedAuthorId;

  if (!authorId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    authorId = user?.id || null;
  }

  if (!authorId || !payload?.postId) {
    throw new Error('Authentication and post context are required to comment.');
  }

  const model = CommentModel.fromPayload({ ...payload, author_id: authorId, authorId });
  const bodyPayload = CommentModel.toPayload(model);
  const { data, error } = await supabase.from('comments').insert(bodyPayload).select('*').single();
  if (error) throw error;
  return CommentModel.fromPayload(data);
}

export async function togglePostLike(postId, userId, liked) {
  const { data: current, error: fetchError } = await supabase.from('posts').select('id, likes').eq('id', postId).single();
  if (fetchError) throw fetchError;
  const nextLikes = liked ? Math.max(0, Number(current?.likes || 0) - 1) : Number(current?.likes || 0) + 1;
  const { data, error } = await supabase.from('posts').update({ likes: nextLikes }).eq('id', postId).select('*').single();
  if (error) throw error;
  return PostModel.fromPayload({ ...data, likes: nextLikes });
}

export async function sharePost(postId, userId, message = '') {
  const { data: current, error: fetchError } = await supabase.from('posts').select('id, shares').eq('id', postId).single();
  if (fetchError) throw fetchError;
  const nextShares = Number(current?.shares || 0) + 1;
  const { data, error } = await supabase.from('posts').update({ shares: nextShares }).eq('id', postId).select('*').single();
  if (error) throw error;
  return {
    share: ShareModel.fromPayload({ post_id: postId, author_id: userId, message, created_at: new Date().toISOString() }),
    post: PostModel.fromPayload({ ...data, shares: nextShares }),
  };
}

export default {
  fetchPosts,
  fetchCommentsForPost,
  fetchCommentsForPosts,
  createPost,
  createComment,
  togglePostLike,
  sharePost,
};
