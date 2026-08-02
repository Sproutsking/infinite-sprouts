import supabase from '../lib/supabaseClient.js';

export async function fetchMarketItems() {
  const { data, error } = await supabase.from('market_items').select('*').order('created_at', { ascending: false });
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
