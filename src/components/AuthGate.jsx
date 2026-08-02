import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import I from '../icons/icons.jsx';
import CSS from '../styles/global.css.js';

export default function AuthGate({ children }) {
  const { user, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!document.getElementById('sprouts-v4')) {
      const el = document.createElement('style');
      el.id = 'sprouts-v4';
      el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-grid auth-grid-loading">
          <div className="auth-panel auth-panel-loading">
            <div className="auth-hero-logo">🌱</div>
            <div className="auth-heading">Infinite Sprouts</div>
            <div className="auth-copy">Preparing your secure farm finance and community hub.</div>
            <div className="auth-status">Connecting to Supabase…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="auth-grid">
          <div className="auth-panel">
            <div className="auth-pill">Beta access</div>
            <div className="auth-hero">
              <div className="auth-logo-wrap">
                <div className="auth-hero-logo">🌱</div>
                <div className="auth-hero-copy">
                  <div className="auth-heading">Infinite Sprouts</div>
                  <div className="auth-subheading">Next-generation AgriFi, social commerce, and wallet intelligence.</div>
                </div>
              </div>
            </div>

            <div className="auth-copy">One tap login with Google unlocks your farm marketplace, IST wallet, community feed, and live messaging.</div>
            <button className="auth-btn" onClick={signInWithGoogle}>
              <span className="auth-btn-icon"><I.Google/></span>
              <span>Continue with Google</span>
            </button>
            <div className="auth-note">Supabase OAuth · secured with Google · no password required.</div>

            <div className="auth-feature-grid">
              <div className="auth-feature-item"><span>🚜</span><span>Live farm market trades</span></div>
              <div className="auth-feature-item"><span>💰</span><span>Instant IST + Naira wallet</span></div>
              <div className="auth-feature-item"><span>🌐</span><span>Community feed & messaging</span></div>
            </div>
          </div>

          <div className="auth-visual">
            <div className="auth-visual-splash" />
            <div className="auth-visual-card">
              <div className="auth-visual-tag">Your farm finance cockpit</div>
              <div className="auth-visual-metric">12,480</div>
              <div className="auth-visual-label">Active Sprouts users</div>
              <div className="auth-visual-list">
                <div>● 5,230 IST liquidity</div>
                <div>● 1,140 market listings</div>
                <div>● 87 farms funding now</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
