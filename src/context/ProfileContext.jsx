import React, { createContext, useContext, useState, useCallback } from 'react';
import supabase from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';

const ProfileCtx = createContext(null);

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export function ProfileProvider({ children }) {
  const { user, profile } = useAuth();
  const [roleType, setRoleType] = useState(profile?.role_type || null);
  const [isVerified, setIsVerified] = useState(profile?.is_verified || false);
  const [kycStatus, setKycStatus] = useState(profile?.kyc_status || 'pending');
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const setUserRole = useCallback(async (role) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role_type: role })
        .eq('id', user.id)
        .select('*')
        .single();
      
      if (error) throw error;
      setRoleType(role);
      return data;
    } catch (err) {
      console.error('Error setting user role:', err);
      throw err;
    }
  }, [user?.id]);

  const updateKYC = useCallback(async (kycData) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          nin: kycData.nin,
          bank_account: kycData.bank_account,
          state_lga: kycData.state_lga,
        })
        .eq('id', user.id)
        .select('*')
        .single();
      
      if (error) throw error;
      setKycStatus('pending');
      return data;
    } catch (err) {
      console.error('Error updating KYC:', err);
      throw err;
    }
  }, [user?.id]);

  const setupFarmerProfile = useCallback(async (farmerData) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Set farmer role
      await setUserRole('farmer');
      
      // Update profile with farm info
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role_type: 'farmer',
          bio: farmerData.bio || 'Farmer on Infinite Sprouts',
          state: farmerData.state,
          phone: farmerData.phone,
        })
        .eq('id', user.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      setFarmerProfile(data);
      setRoleType('farmer');
      return data;
    } catch (err) {
      console.error('Error setting up farmer profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, setUserRole]);

  const value = {
    roleType,
    isVerified,
    kycStatus,
    farmerProfile,
    loading,
    setUserRole,
    updateKYC,
    setupFarmerProfile,
  };

  return (
    <ProfileCtx.Provider value={value}>
      {children}
    </ProfileCtx.Provider>
  );
}
