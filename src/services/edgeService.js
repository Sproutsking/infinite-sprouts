import supabase from '../lib/supabaseClient.js';

export const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '';

export async function callEdgeFunction(path, payload) {
  if (!functionsUrl) throw new Error('Supabase functions URL is not configured.');
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('User session is required to call edge functions.');

  const response = await fetch(`${functionsUrl}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Edge function request failed');
  }

  return response.json();
}
