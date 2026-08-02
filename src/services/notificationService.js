import supabase from '../lib/supabaseClient.js';

export async function fetchNotifications(userId) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
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
