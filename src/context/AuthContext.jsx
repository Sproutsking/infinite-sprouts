import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient.js';

const AuthCtx = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getProviderAvatar(user) {
  return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.image || user?.user_metadata?.photo_url || null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const loadProfileForUser = useCallback(async (authUser) => {
    if (!authUser) return;

    const { data, error: loadError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (loadError && loadError.details?.includes('Results contain 0 rows')) {
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email || 'Sprouts User';
      const initials = getInitials(fullName);
      const avatarUrl = getProviderAvatar(authUser);
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
          initials,
          avatar_url: avatarUrl,
          role: 'Farmer and Investor · Nigeria',
          bio: 'Farmer and investor on Infinite Sprouts.',
          created_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (!insertError) {
        setProfile(newProfile);
      }
      return;
    }

    if (loadError) {
      console.error('Error loading profile:', loadError);
      return;
    }

    const avatarUrl = getProviderAvatar(authUser);
    if (!data.avatar_url && avatarUrl) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', authUser.id)
        .select('*')
        .single();
      if (!updateError) {
        setProfile(updatedProfile);
        return;
      }
      console.warn('Failed to update profile avatar from provider:', updateError);
    }

    setProfile(data);
  }, []);

  const clearAuthRedirectParams = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      const hash = url.hash.replace(/^#/, '');
      const searchParams = new URLSearchParams(url.search);
      const authKeys = ['access_token', 'refresh_token', 'expires_in', 'token_type', 'error', 'error_description', 'type'];
      let cleaned = false;

      authKeys.forEach((key) => {
        if (searchParams.has(key)) {
          searchParams.delete(key);
          cleaned = true;
        }
      });

      if (hash && /(access_token|refresh_token|expires_in|token_type|error|error_description|type)=/.test(hash)) {
        cleaned = true;
      }

      if (cleaned) {
        const newSearch = searchParams.toString();
        const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (err) {
      console.warn('Unable to clean auth redirect params', err);
    }
  }, []);

  const hasAuthRedirectParams = useCallback(() => {
    return window.location.hash.includes('access_token=')
      || window.location.hash.includes('error_description=')
      || window.location.search.includes('access_token=')
      || window.location.search.includes('error_description=')
      || window.location.search.includes('type=');
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      setStatus('loading');
      setError('');

      let sessionData = null;

      if (hasAuthRedirectParams()) {
        try {
          const { data: redirectData, error: redirectError } = await supabase.auth.getSessionFromUrl();
          if (redirectError) {
            console.warn('Supabase auth redirect session error:', redirectError);
          }
          if (redirectData?.session) {
            sessionData = redirectData.session;
          }
        } catch (err) {
          console.warn('Error handling Supabase OAuth redirect:', err);
        }
      }

      if (!sessionData) {
        const { data } = await supabase.auth.getSession();
        sessionData = data?.session || null;
      }

      if (!mounted) return;

      setSession(sessionData);
      setUser(sessionData?.user || null);
      if (sessionData?.user) {
        await loadProfileForUser(sessionData.user);
      } else {
        setProfile(null);
      }
      setStatus('idle');
      setError('');
      setLoading(false);

      if (hasAuthRedirectParams()) {
        clearAuthRedirectParams();
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, sessionData) => {
      setSession(sessionData || null);
      setUser(sessionData?.user || null);
      if (sessionData?.user) {
        await loadProfileForUser(sessionData.user);
      } else {
        setProfile(null);
      }
      setStatus('idle');
      setError('');
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, [clearAuthRedirectParams, hasAuthRedirectParams, loadProfileForUser]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setStatus('loading');
    setError('');

    const redirectTo = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin + window.location.pathname;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (signInError) {
      console.error('Google sign in error:', signInError);
      setStatus('error');
      setError(signInError.message || 'Google sign-in failed.');
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setStatus('loading');
    setError('');

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Sign out error:', signOutError);
      setStatus('error');
      setError(signOutError.message || 'Unable to sign out.');
      setLoading(false);
      return;
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    setStatus('idle');
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfileForUser(user);
    }
  }, [loadProfileForUser, user]);

  const value = {
    session,
    user,
    profile,
    loading,
    status,
    error,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
