import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';
import { ensureWallet, fetchWalletBalances, fetchWalletTransactions, createTransaction, updateWalletBalance } from '../services/walletService.js';

const WalletCtx = React.createContext(null);

export function useWallet() {
  return useContext(WalletCtx);
}

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ naira: 0, ist: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWallet() {
      if (!user?.id) {
        setWallet({ naira: 0, ist: 0 });
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await ensureWallet(user.id);
        const balances = await fetchWalletBalances(user.id);
        const txns = await fetchWalletTransactions(user.id);
        setWallet(balances);
        setTransactions(txns);
      } catch (error) {
        console.error('Wallet load error', error);
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, [user]);

  async function refreshWallet() {
    if (!user?.id) return;
    setLoading(true);
    try {
      await ensureWallet(user.id);
      const balances = await fetchWalletBalances(user.id);
      const txns = await fetchWalletTransactions(user.id);
      setWallet(balances);
      setTransactions(txns);
    } catch (error) {
      console.error('Wallet refresh error', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(payload) {
    if (!user?.id) return null;
    try {
      const txn = await createTransaction({ user_id: user.id, created_at: new Date().toISOString(), ...payload });
      setTransactions(prev => [txn, ...prev]);
      return txn;
    } catch (error) {
      console.error('Transaction error', error);
      throw error;
    }
  }

  async function adjustBalance(updates) {
    if (!user?.id) return null;
    try {
      const walletData = await updateWalletBalance(user.id, updates);
      setWallet({ naira: walletData.naira_balance || 0, ist: walletData.ist_balance || 0 });
      return walletData;
    } catch (error) {
      console.error('Balance update error', error);
      throw error;
    }
  }

  return (
    <WalletCtx.Provider value={{ wallet, transactions, loading, refreshWallet, addTransaction, adjustBalance }}>
      {children}
    </WalletCtx.Provider>
  );
}
