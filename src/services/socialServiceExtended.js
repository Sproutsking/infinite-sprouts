import supabase from '../lib/supabaseClient.js';
import { PostModel, CommentModel, ShareModel } from '../models/index.js';

export async function fetchSocialPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(post => PostModel.fromPayload(post));
}

export async function createSocialPost(input) {
  const model = PostModel.fromPayload(input);
  const payload = PostModel.toPayload(model);
  const { data, error } = await supabase.from('posts').insert(payload).select('*').single();
  if (error) throw error;
  return PostModel.fromPayload(data);
}

export async function fetchSocialComments(postIds = []) {
  if (!postIds.length) return {};
  const { data, error } = await supabase.from('comments').select('*').in('post_id', postIds).order('created_at', { ascending: true });
  if (error) throw error;

  const byPost = {};
  const parents = (data || []).filter(comment => !comment.parent_comment_id).map(comment => CommentModel.fromPayload(comment));
  const replies = (data || []).filter(comment => comment.parent_comment_id).map(comment => CommentModel.fromPayload(comment));

  parents.forEach(parent => {
    byPost[parent.postId] = byPost[parent.postId] || [];
    byPost[parent.postId].push({ ...parent, replies: [] });
  });

  replies.forEach(reply => {
    const parentList = byPost[reply.postId] || [];
    const parent = parentList.find(item => item.id === reply.parentCommentId);
    if (parent) {
      parent.replies = parent.replies || [];
      parent.replies.push(reply);
    }
  });

  return byPost;
}

export async function createSocialComment(input) {
  const model = CommentModel.fromPayload(input);
  const payload = CommentModel.toPayload(model);
  const { data, error } = await supabase.from('comments').insert(payload).select('*').single();
  if (error) throw error;
  return CommentModel.fromPayload(data);
}

export async function createSocialShare(input) {
  const model = ShareModel.fromPayload(input);
  const payload = ShareModel.toPayload(model);
  const { data, error } = await supabase.from('shares').insert(payload).select('*').single();
  if (error) throw error;
  return ShareModel.fromPayload(data);
}

export async function toggleSocialLike(postId, userId, liked) {
  const { data, error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId, created_at: new Date().toISOString() }).select('*').single();
  if (error) throw error;
  return data;
}
