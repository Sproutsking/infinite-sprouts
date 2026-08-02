import supabase from '../lib/supabaseClient.js';

export async function fetchWalletBalances(userId) {
  const { data: walletData, error: walletError } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  if (!walletError && walletData) {
    return {
      naira: walletData.naira_balance || 0,
      ist: walletData.ist_balance || 0,
    };
  }

  const { data: transactions, error: txError } = await supabase.from('transactions').select('*').eq('user_id', userId);
  if (txError) throw txError;
  return transactions.reduce(
    (balances, tx) => {
      if (tx.wallet === 'naira') balances.naira += tx.type === 'in' ? parseFloat(tx.amount || 0) : -parseFloat(tx.amount || 0);
      if (tx.wallet === 'ist') balances.ist += tx.type === 'in' ? parseFloat(tx.amount || 0) : -parseFloat(tx.amount || 0);
      return balances;
    },
    { naira: 0, ist: 0 }
  );
}

export async function fetchWalletTransactions(userId) {
  const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTransaction(payload) {
  const { data, error } = await supabase.from('transactions').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateWalletBalance(userId, updates) {
  const { data, error } = await supabase.from('wallets').upsert({ user_id: userId, ...updates }).select('*').single();
  if (error) throw error;
  return data;
}

export async function ensureWallet(userId) {
  const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  if (error && !error.details?.includes('Results contain 0 rows')) throw error;
  if (data) return data;
  const { data: newWallet, error: insertError } = await supabase.from('wallets').insert({ user_id: userId, naira_balance: 0, ist_balance: 0, created_at: new Date().toISOString() }).select('*').single();
  if (insertError) throw insertError;
  return newWallet;
}
