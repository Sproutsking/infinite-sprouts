import React, { useState, useEffect, useContext } from 'react';
import supabase from '../lib/supabaseClient.js';

const AuthCtx = React.createContext(null);
export function useAuth() { return useContext(AuthCtx); }

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

  async function loadProfileForUser(authUser) {
    if (!authUser) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error && error.details?.includes('Results contain 0 rows')) {
      const fullName = authUser.user_metadata?.full_name || authUser.email || 'Sprouts User';
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
      if (!insertError) setProfile(newProfile);
      return;
    }

    if (error) {
      console.error('Error loading profile:', error);
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
  }

  useEffect(() => {
    let mounted = true;

    async function clearAuthRedirectParams() {
      try {
        const url = new URL(window.location.href);
        const hash = url.hash.replace(/#/, '');
        const searchParams = new URLSearchParams(url.search);
        const authKeys = ['access_token', 'refresh_token', 'expires_in', 'token_type', 'error', 'error_description', 'type'];
        let cleaned = false;

        authKeys.forEach(key => {
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
      } catch (error) {
        console.warn('Unable to clean auth redirect params', error);
      }
    }

    const hasAuthRedirectParams = () => {
      return window.location.hash.includes('access_token=') || window.location.hash.includes('error_description=') || window.location.search.includes('access_token=') || window.location.search.includes('error_description=') || window.location.search.includes('type=');
    };

    const init = async () => {
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
        } catch (error) {
          console.warn('Error handling Supabase OAuth redirect:', error);
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
      }
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
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    setLoading(true);
    const redirectTo = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.href;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      console.error('Google sign in error:', error);
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  }

  async function refreshProfile() {
    if (user) {
      await loadProfileForUser(user);
    }
  }

  return (
    <AuthCtx.Provider value={{ session, user, profile, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}
