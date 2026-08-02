import supabase from '../lib/supabaseClient.js';
import { callEdgeFunction, functionsUrl } from './edgeService.js';

export async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCommentsForPost(postId) {
  const { data, error } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  if (error) throw error;
  const parents = data.filter(c => !c.parent_comment_id).map(c => ({ ...c, replies: [] }));
  const replies = data.filter(c => c.parent_comment_id);
  replies.forEach(r => {
    const parent = parents.find(p => p.id === r.parent_comment_id);
    if (parent) parent.replies.push(r);
  });
  return parents;
}

export async function fetchCommentsForPosts(postIds = []) {
  if (!postIds.length) return {};
  const { data, error } = await supabase.from('comments').select('*').in('post_id', postIds).order('created_at', { ascending: true });
  if (error) throw error;
  const map = {};
  const parents = data.filter(c => !c.parent_comment_id).map(c => ({ ...c, replies: [] }));
  const replies = data.filter(c => c.parent_comment_id);
  parents.forEach(p => {
    map[p.post_id] = map[p.post_id] || [];
    map[p.post_id].push(p);
  });
  replies.forEach(r => {
    const parent = map[r.post_id]?.find(p => p.id === r.parent_comment_id);
    if (parent) parent.replies = parent.replies || [] , parent.replies.push(r);
  });
  return map;
}

export async function createPost(payload) {
  if (functionsUrl) {
    return await callEdgeFunction('create-post', payload);
  }
  const { data, error } = await supabase.from('posts').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function createComment(payload) {
  const { data, error } = await supabase.from('comments').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}
