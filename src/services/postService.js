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

export async function deletePost(postId) {
  const { data, error } = await supabase.rpc('delete_post_v2', {
    target_post_id: postId,
  });
  if (error) throw error;
  if (!data) throw new Error('Post not found or you do not have permission to delete it.');
  return { id: postId };
}

export async function updatePost(postId, authorId, updates) {
  let targetAuthorId = authorId || null;

  if (!targetAuthorId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    targetAuthorId = user?.id || null;
  }

  if (!targetAuthorId) {
    throw new Error('Authentication required to update a post.');
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ body: updates.body, tags: updates.tags || [] })
    .eq('id', postId)
    .eq('author_id', targetAuthorId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('You can only edit your own posts.');
  return PostModel.fromPayload(data);
}

export async function setPostCommentsEnabled(postId, authorId, enabled) {
  const { data, error } = await supabase
    .from('posts')
    .update({ comments_enabled: enabled })
    .eq('id', postId)
    .eq('author_id', authorId)
    .select('*')
    .single();
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

export async function deleteComment(commentId, authorId) {
  const { data, error } = await supabase.rpc('delete_comment', { target_comment_id: commentId });
  if (error) throw error;
  return data;
}

export async function fetchLikedCommentIds(userId, commentIds = []) {
  if (!userId || !commentIds.length) return [];
  const { data, error } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('user_id', userId)
    .in('comment_id', commentIds);
  if (error) throw error;
  return (data || []).map(row => row.comment_id);
}

export async function toggleCommentLike(commentId) {
  const { data, error } = await supabase.rpc('toggle_comment_like', { target_comment_id: commentId });
  if (error) throw error;
  return { liked: Boolean(data?.liked), likes: Number(data?.likes || 0) };
}

export async function togglePostLike(postId, userId, liked) {
  const { data, error } = await supabase.rpc('toggle_post_like', { target_post_id: postId });
  if (error) throw error;
  return { liked: Boolean(data?.liked), likes: Number(data?.likes || 0) };
}

export async function sharePost(postId, userId, message = '') {
  const requestId = globalThis.crypto?.randomUUID?.();
  if (!requestId) throw new Error('This browser cannot create a secure share request.');
  const { data, error } = await supabase.rpc('record_post_share_v2', {
    target_post_id: postId,
    share_method: message || 'native',
    request_id: requestId,
    share_message: null,
  });
  if (error) throw error;
  return {
    share: ShareModel.fromPayload({ id: data?.id, post_id: postId, author_id: userId, message: '', created_at: new Date().toISOString() }),
    post: { id: postId, shares: Number(data?.shares || 0) },
  };
}

export async function fetchLikedPostIds(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(row => row.post_id);
}

export async function fetchSaveCollections() {
  const { data, error } = await supabase.from('save_collections').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchSavedPostMap() {
  const { data, error } = await supabase.from('saved_posts').select('post_id, collection_id');
  if (error) throw error;
  return (data || []).reduce((map, row) => {
    const postKey = String(row.post_id);
    map[postKey] = [...(map[postKey] || []), row.collection_id];
    return map;
  }, {});
}

export async function createSaveCollection(name, color = '#38a038') {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in to create a collection.');
  const { data, error } = await supabase.from('save_collections')
    .insert({ user_id: user.id, name: name.trim(), color })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function toggleSavedPost(postId, collectionId) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in to save posts.');
  const existing = await supabase.from('saved_posts').select('post_id')
    .eq('user_id', user.id).eq('collection_id', collectionId).eq('post_id', postId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const { error } = await supabase.from('saved_posts').delete()
      .eq('user_id', user.id).eq('collection_id', collectionId).eq('post_id', postId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('saved_posts').insert({ user_id: user.id, collection_id: collectionId, post_id: postId });
  if (error) throw error;
  return true;
}

export async function fetchFeedPreferences() {
  const [hidden, muted, blocked] = await Promise.all([
    supabase.from('hidden_posts').select('post_id'),
    supabase.from('muted_users').select('target_user_id'),
    supabase.from('blocked_users').select('target_user_id'),
  ]);
  for (const result of [hidden, muted, blocked]) if (result.error) throw result.error;
  return {
    hiddenPostIds: (hidden.data || []).map(row => String(row.post_id)),
    mutedUserIds: (muted.data || []).map(row => String(row.target_user_id)),
    blockedUserIds: (blocked.data || []).map(row => String(row.target_user_id)),
  };
}

export async function hidePost(postId) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in to manage your feed.');
  const { error } = await supabase.from('hidden_posts').upsert({ user_id: user.id, post_id: postId }, { onConflict: 'user_id,post_id' });
  if (error) throw error;
}

export async function setUserModeration(targetUserId, table, enabled = true) {
  const allowedTables = new Set(['muted_users', 'blocked_users']);
  if (!allowedTables.has(table)) throw new Error('Unsupported moderation action.');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in to manage your feed.');
  let query = supabase.from(table);
  query = enabled
    ? query.upsert({ user_id: user.id, target_user_id: targetUserId }, { onConflict: 'user_id,target_user_id' })
    : query.delete().eq('user_id', user.id).eq('target_user_id', targetUserId);
  const { error } = await query;
  if (error) throw error;
}

export async function reportPost(postId, reason, details = '') {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in to report a post.');
  const { error } = await supabase.from('post_reports').insert({ reporter_id: user.id, post_id: postId, reason, details });
  if (error) throw error;
}

export async function reportComment(commentId, reason, details = '') {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in to report a comment.');
  const { error } = await supabase.from('comment_reports').insert({ reporter_id: user.id, comment_id: commentId, reason, details });
  if (error) throw error;
}

export async function togglePinnedPost(postId) {
  const { data, error } = await supabase.rpc('toggle_post_pin', { target_post_id: postId });
  if (error) throw error;
  return data;
}

export default {
  fetchPosts,
  fetchCommentsForPost,
  fetchCommentsForPosts,
  createPost,
  updatePost,
  createComment,
  togglePostLike,
  sharePost,
};
