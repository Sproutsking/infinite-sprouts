import supabase from '../lib/supabaseClient.js';
import { isValidUsername, normalizeUsername } from '../utils/username.js';

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const fullName = updates.full_name?.trim();
  const normalizedUsername = updates.username === undefined ? undefined : normalizeUsername(updates.username);
  if (normalizedUsername !== undefined && !isValidUsername(normalizedUsername)) {
    throw new Error('Username must be 3–32 characters using only letters, numbers, and underscores.');
  }
  const initials = fullName
    ? fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
    : undefined;
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
      ...(normalizedUsername !== undefined ? { username: normalizedUsername } : {}),
      ...(initials ? { initials } : {}),
    }, { onConflict: 'id' })
    .select('*')
    .single();
  if (error?.code === '23505') throw new Error('That username is already taken. Choose another one.');
  if (error) throw error;
  return data;
}

export async function uploadProfileAvatar(userId, file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Profile images must be 5 MB or smaller.');
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const fileName = `${userId}-${Date.now()}.${extension}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { cacheControl: '3600', contentType: file.type, upsert: true });

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
  const { data, error } = await supabase.from('public_profiles').select('*').order('full_name', { ascending: true });
  if (error) throw error;
  return data || [];
}
