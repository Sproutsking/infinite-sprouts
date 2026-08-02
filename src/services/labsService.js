import { callEdgeFunction, functionsUrl } from './edgeService.js';

export async function askAi(question, metadata = {}) {
  if (!functionsUrl) throw new Error('Supabase functions URL is not configured.');
  return await callEdgeFunction('labs-chat', { question, metadata });
}
