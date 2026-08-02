import supabase from '../lib/supabaseClient.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || (supabaseUrl?.replace('.supabase.co', '.functions.supabase.co') || '');

async function callEdgeFunction(path, payload) {
  if (!functionsUrl) throw new Error('Supabase functions URL is not configured.');
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('User session is required to call edge functions.');
  const res = await fetch(`${functionsUrl}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Edge function request failed');
  }
  return res.json();
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(notificationId) {
  const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId).select('*').single();
  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead(userId) {
  const { data, error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).select('*');
  if (error) throw error;
  return data || [];
}

export async function askAi(question, metadata = {}) {
  if (functionsUrl) {
    return await callEdgeFunction('labs-chat', { question, metadata });
  }
  throw new Error('Supabase AI function is not configured.');
}

export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchCommunities() {
  const { data, error } = await supabase.from('communities').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function toggleCommunityFollow(communityId, follow) {
  const { data, error } = await supabase.from('communities').update({ followed: follow }).eq('id', communityId).select().single();
  if (error) throw error;
  return data;
}

export async function toggleCommunityNotif(communityId, notif) {
  const { data, error } = await supabase.from('communities').update({ notif }).eq('id', communityId).select().single();
  if (error) throw error;
  return data;
}

export async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCommentsForPost(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
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
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const map = {};
  const parents = data.filter(c => !c.parent_comment_id).map(c => ({ ...c, replies: [] }));
  const replies = data.filter(c => c.parent_comment_id);
  parents.forEach(p => { map[p.post_id] = map[p.post_id] || []; map[p.post_id].push(p); });
  replies.forEach(r => {
    const parent = map[r.post_id]?.find(p => p.id === r.parent_comment_id);
    if (parent) parent.replies = parent.replies || [] , parent.replies.push(r);
  });
  return map;
}

export async function createPost(payload) {
  if (functionsUrl) {
    const response = await callEdgeFunction('create-post', payload);
    return response;
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

export async function fetchTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTransaction(payload) {
  const { data, error } = await supabase.from('transactions').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(payload) {
  const { data, error } = await supabase.from('messages').insert(payload).select('*').single();
  if (error) throw error;
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', payload.conversation_id);
  return data;
}

export async function fetchMarketItems() {
  const { data, error } = await supabase.from('market_items').select('*').order('created_at',{ascending:false});
  if (error) throw error;
  return data || [];
}

export async function fetchFarms() {
  const { data, error } = await supabase.from('farms').select('*').order('funded', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createMarketItem(payload) {
  const { data, error } = await supabase.from('market_items').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function buyItem(payload) {
  const { data, error } = await supabase.from('orders').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export default {
  getProfile,
  updateProfile,
  fetchProfiles,
  fetchCommunities,
  toggleCommunityFollow,
  toggleCommunityNotif,
  fetchPosts,
  fetchCommentsForPost,
  fetchCommentsForPosts,
  createPost,
  createComment,
  fetchTransactions,
  createTransaction,
  fetchConversations,
  fetchMessages,
  sendMessage,
  fetchMarketItems,
  fetchFarms,
  createMarketItem,
  buyItem,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  askAi,
};
