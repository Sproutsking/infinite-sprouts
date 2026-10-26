import supabase from '../lib/supabaseClient.js';
import { CommunityModel } from '../models/index.js';

export async function fetchCommunities() {
  const { data, error } = await supabase.from('communities').select('*').order('name', { ascending: true });
  if (error) throw error;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (data || []).map(community => CommunityModel.fromPayload(community));
  const { data: memberships, error: membershipError } = await supabase
    .from('community_memberships')
    .select('community_id, followed, notifications_enabled, role, status')
    .eq('user_id', user.id);
  if (membershipError) throw membershipError;
  const membershipByCommunity = Object.fromEntries((memberships || []).map(item => [item.community_id, item]));
  return (data || []).map(community => CommunityModel.fromPayload({
    ...community,
    followed: membershipByCommunity[community.id]?.followed && membershipByCommunity[community.id]?.status === 'active' || false,
    pending: membershipByCommunity[community.id]?.status === 'pending',
    notif: membershipByCommunity[community.id]?.notifications_enabled || false,
  }));
}

export async function toggleCommunityFollow(communityId, follow, notificationsEnabled = false) {
  const { data, error } = await supabase.rpc('set_community_membership', {
    target_community_id: communityId,
    should_follow: follow,
    enable_notifications: notificationsEnabled,
  });
  if (error) throw error;
  return data;
}

export async function toggleCommunityNotif(communityId, notif, followed = false) {
  const { data, error } = await supabase.rpc('set_community_membership', {
    target_community_id: communityId,
    should_follow: followed,
    enable_notifications: notif,
  });
  if (error) throw error;
  return data;
}

export async function createCommunity(payload) {
  const model = CommunityModel.fromPayload(payload);
  const { data, error } = await supabase.rpc('create_community', {
    community_name: model.name,
    community_description: model.desc,
    community_icon: model.ico,
  });
  if (error) throw error;
  return CommunityModel.fromPayload(data);
}

export async function updateCommunitySettings(communityId, settings) {
  const { data, error } = await supabase.rpc('update_community_settings', {
    target_community_id: communityId,
    new_name: settings.name,
    new_description: settings.desc,
    new_icon: settings.ico,
    new_category: settings.category,
    new_privacy: settings.privacy,
    new_join_approval: settings.joinApproval,
    new_posts_enabled: settings.postsEnabled,
    new_comments_enabled: settings.commentsEnabled,
    new_rules: settings.rules,
    new_cover_image_url: settings.coverImageUrl || null,
  });
  if (error) throw error;
  return CommunityModel.fromPayload(data);
}

export async function fetchPendingCommunityMembers(communityId) {
  const { data, error } = await supabase.from('community_memberships')
    .select('user_id, created_at')
    .eq('community_id', communityId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!data?.length) return [];
  const profiles = await supabase.from('public_profiles')
    .select('id, full_name, initials, avatar_url, role')
    .in('id', data.map(member => member.user_id));
  if (profiles.error) throw profiles.error;
  const profileMap = Object.fromEntries((profiles.data || []).map(profile => [profile.id, profile]));
  return data.map(member => ({ ...member, profile: profileMap[member.user_id] || null }));
}

export async function fetchCommunityMembers(communityId) {
  const { data, error } = await supabase.from('community_memberships')
    .select('user_id, role, created_at')
    .eq('community_id', communityId)
    .eq('status', 'active')
    .eq('followed', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!data?.length) return [];
  const profiles = await supabase.from('public_profiles')
    .select('id, full_name, initials, avatar_url, role')
    .in('id', data.map(member => member.user_id));
  if (profiles.error) throw profiles.error;
  const profileMap = Object.fromEntries((profiles.data || []).map(profile => [profile.id, profile]));
  return data.map(member => ({ ...member, profile: profileMap[member.user_id] || null }));
}

export async function reviewCommunityMember(communityId, userId, approve) {
  const { data, error } = await supabase.rpc('review_community_member', {
    target_community_id: communityId,
    target_user_id: userId,
    approve,
  });
  if (error) throw error;
  return data;
}

export async function removeCommunityMember(communityId, userId) {
  const { data, error } = await supabase.rpc('remove_community_member', {
    target_community_id: communityId,
    target_user_id: userId,
  });
  if (error) throw error;
  return data;
}

export async function deleteCommunity(communityId) {
  const { data, error } = await supabase.from('communities').delete().eq('id', communityId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Community not found or you are not its owner.');
  return data;
}

export async function fetchFollowedUsers(userId) {
  const { data, error } = await supabase.from('follows').select('target_user_id').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(item => item.target_user_id);
}

export async function toggleUserFollow(userId, targetUserId, follow) {
  if (follow) {
    const { data: existing, error: lookupError } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .limit(1)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return existing;

    const { data, error } = await supabase.from('follows').insert({ user_id: userId, target_user_id: targetUserId, created_at: new Date().toISOString() }).select('*').single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.from('follows').delete().eq('user_id', userId).eq('target_user_id', targetUserId).select('*');
  if (error) throw error;
  return data;
}
