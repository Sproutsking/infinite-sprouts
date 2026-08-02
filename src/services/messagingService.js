import supabase from '../lib/supabaseClient.js';

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
  const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(payload) {
  const { data, error } = await supabase.from('messages').insert(payload).select('*').single();
  if (error) throw error;
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', payload.conversation_id);
  return data;
}
