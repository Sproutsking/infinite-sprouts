import supabase from '../lib/supabaseClient.js';

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select('*').single();
  if (error) throw error;
  return data;
}

export async function uploadProfileAvatar(userId, file) {
  const fileName = `${userId}-${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { cacheControl: '3600', upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData, error: urlError } = supabase.storage
    .from('avatars')
    .getPublicUrl(uploadData.path);

  if (urlError) throw urlError;
  const avatar_url = urlData.publicUrl;

  const { data, error } = await supabase.from('profiles').update({ avatar_url }).eq('id', userId).select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
  if (error) throw error;
  return data || [];
}
