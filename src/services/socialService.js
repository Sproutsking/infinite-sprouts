import supabase from '../lib/supabaseClient.js';
import { CommunityModel } from '../models/index.js';

export async function fetchCommunities() {
  const { data, error } = await supabase.from('communities').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data || []).map(community => CommunityModel.fromPayload(community));
}

export async function toggleCommunityFollow(communityId, follow) {
  const { data, error } = await supabase.from('communities').update({ followed: follow }).eq('id', communityId).select('*').single();
  if (error) throw error;
  return CommunityModel.fromPayload(data);
}

export async function toggleCommunityNotif(communityId, notif) {
  const { data, error } = await supabase.from('communities').update({ notif }).eq('id', communityId).select('*').single();
  if (error) throw error;
  return CommunityModel.fromPayload(data);
}

export async function createCommunity(payload) {
  const model = CommunityModel.fromPayload(payload);
  const bodyPayload = CommunityModel.toPayload(model);
  const { data, error } = await supabase.from('communities').insert(bodyPayload).select('*').single();
  if (error) throw error;
  return CommunityModel.fromPayload(data);
}

export async function fetchFollowedUsers(userId) {
  const { data, error } = await supabase.from('follows').select('target_user_id').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(item => item.target_user_id);
}

export async function toggleUserFollow(userId, targetUserId, follow) {
  if (follow) {
    const { data, error } = await supabase.from('follows').insert({ user_id: userId, target_user_id: targetUserId, created_at: new Date().toISOString() }).select('*').single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.from('follows').delete().eq('user_id', userId).eq('target_user_id', targetUserId).select('*');
  if (error) throw error;
  return data;
}
