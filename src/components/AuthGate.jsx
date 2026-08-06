import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../../Assets/infinitesprouts_logo.png';

const tokens = {
  bg: '#000000',
  text: '#ffffff',
  textSecondary: '#b8b8b8',
  lime: '#00ff00',
  limeDark: '#7acc00',
  glassBg: 'rgba(0,0,0,0.8)',
  glassBorder: 'rgba(255,255,255,0.1)',
  danger: '#ff0000',
};

export default function AuthGate({ children }) {
  const { user, loading, signIn, status, error } = useAuth();
  const isLoading = loading || status === 'loading';

  if (loading) {
    return (
      <>
        <AuthGateStyles />
        <div className="isa-root">
          <div className="isa-card-wrap">
            <div className="isa-card">
              <div className="isa-card-inner">
                <div className="isa-mark">
                  <img src={logo} alt="Infinite Sprouts" className="isa-mark-img" />
                </div>
                <h1 className="isa-title">Infinite Sprouts</h1>
                <p className="isa-subtitle">Preparing your secure sign-in session…</p>
                <div className="isa-spinner" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <AuthGateStyles />
        <div className="isa-root">
          <div className="isa-dots" aria-hidden="true" />
          <div className="isa-grid" aria-hidden="true" />
          <div className="isa-card-wrap">
            <div className="isa-card">
              <Smoke />
              <div className="isa-card-inner">
                <div className="isa-mark">
                  <img src={logo} alt="Infinite Sprouts" className="isa-mark-img" />
                </div>
                <h1 className="isa-title">Infinite Sprouts</h1>
                <p className="isa-subtitle">Sign in to track your crops, stakes, and yield — on-chain.</p>
                <AnimatedBorderButton onClick={signIn} disabled={isLoading} style={{ opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'wait' : 'pointer' }}>
                  {isLoading ? <Spinner /> : <GoogleMark />}
                  <span>{isLoading ? 'Signing In…' : 'Continue With Google'}</span>
                </AnimatedBorderButton>
                <div aria-live="polite" className="isa-error-slot">
                  {status === 'error' && (
                    <p className="isa-error-text">
                      <ExclaimIcon /> {error}
                    </p>
                  )}
                </div>
                <p className="isa-fineprint">We only ever ask Google for your name, email, and avatar.</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

function Smoke() {
  return (
    <div className="isa-smoke" aria-hidden="true">
      <span className="isa-smoke-blob isa-smoke-1" />
      <span className="isa-smoke-blob isa-smoke-2" />
      <span className="isa-smoke-blob isa-smoke-3" />
    </div>
  );
}

function AnimatedBorderButton({ children, ...props }) {
  return (
    <span className="isa-btn-glow">
      <span className="isa-btn-wrap">
        <button type="button" className="isa-btn" {...props}>
          {children}
        </button>
      </span>
    </span>
  );
}

function Spinner() {
  return <span className="isa-spinner" />;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-5.05-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function ExclaimIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: 4, flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={tokens.danger} strokeWidth="2" />
      <line x1="12" y1="7" x2="12" y2="13" stroke={tokens.danger} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.1" fill={tokens.danger} />
    </svg>
  );
}

function AuthGateStyles() {
  return <style>{styles}</style>;
}

const styles = `
  .isa-root {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    font-family: 'Poppins', sans-serif;
    background: ${tokens.bg};
    overflow: hidden;
    box-sizing: border-box;
  }
  .isa-root *, .isa-root *::before, .isa-root *::after { box-sizing: border-box; }
  .isa-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.5) 2px, transparent 2px);
    background-size: 20px 20px;
    animation: isa-dotMove 20s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
  .isa-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(50,205,50,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(50,205,50,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: isa-gridMove 20s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
  @keyframes isa-dotMove { 0% { transform: translate(0, 0); } 100% { transform: translate(20px, 20px); } }
  @keyframes isa-gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
  .isa-card-wrap { position: relative; width: 100%; max-width: 400px; z-index: 1; }
  .isa-card {
    position: relative;
    background: ${tokens.glassBg};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${tokens.glassBorder};
    border-radius: 24px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,0,0.2);
    overflow: hidden;
  }
  .isa-smoke { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .isa-smoke-blob { position: absolute; border-radius: 50%; filter: blur(45px); mix-blend-mode: screen; opacity: 0.5; will-change: transform, opacity; }
  .isa-smoke-1 { width: 260px; height: 260px; left: -60px; top: -40px; background: radial-gradient(circle, rgba(0,255,0,0.5) 0%, transparent 70%); animation: isa-smoke-drift-1 13s ease-in-out infinite; }
  .isa-smoke-2 { width: 220px; height: 220px; right: -50px; bottom: -30px; background: radial-gradient(circle, rgba(200,255,0,0.4) 0%, transparent 70%); animation: isa-smoke-drift-2 16s ease-in-out infinite; }
  .isa-smoke-3 { width: 180px; height: 180px; left: 40%; top: 30%; background: radial-gradient(circle, rgba(122,204,0,0.35) 0%, transparent 70%); animation: isa-smoke-drift-3 19s ease-in-out infinite; }
  @keyframes isa-smoke-drift-1 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.45; } 25% { transform: translate(30px,20px) scale(1.15); opacity: 0.6; } 50% { transform: translate(10px,40px) scale(0.9); opacity: 0.35; } 75% { transform: translate(-20px,10px) scale(1.1); opacity: 0.55; } }
  @keyframes isa-smoke-drift-2 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.4; } 30% { transform: translate(-25px,-20px) scale(1.2); opacity: 0.55; } 60% { transform: translate(-10px,-40px) scale(0.85); opacity: 0.3; } 80% { transform: translate(15px,-10px) scale(1.05); opacity: 0.5; } }
  @keyframes isa-smoke-drift-3 { 0%,100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; } 40% { transform: translate(-35%, -60%) scale(1.25); opacity: 0.5; } 70% { transform: translate(-60%, -35%) scale(0.9); opacity: 0.25; } }
  .isa-card-inner { position: relative; z-index: 1; padding: 40px 32px 32px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .isa-mark { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid ${tokens.glassBorder}; box-shadow: 0 0 4px 1px lime; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; overflow: hidden; position: relative; z-index: 1; }
  .isa-mark-img { width: 78%; height: 78%; object-fit: contain; }
  .isa-title { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 24px; letter-spacing: 0.04em; text-transform: uppercase; background: linear-gradient(45deg, ${tokens.text} 30%, ${tokens.lime} 70%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(0,255,0,0.3); margin: 0; }
  .isa-subtitle { font-size: 13.5px; color: #e6e6e6; margin: 10px 0 28px; line-height: 1.6; max-width: 280px; }
  .isa-btn-glow { position: relative; display: inline-flex; border-radius: 999px; }
  .isa-btn-glow::before { content: ''; position: absolute; inset: -8px; border-radius: inherit; background: conic-gradient(from var(--isa-angle-b, 0deg), ${tokens.lime}, #c8ff00, #9eff00, rgba(0,0,0,0.2), ${tokens.lime}); filter: blur(14px); opacity: 0.5; animation: isa-spin-b 7s linear infinite; z-index: 0; pointer-events: none; }
  .isa-btn-wrap { position: relative; z-index: 1; display: inline-flex; border-radius: 999px; border: 2.5px solid transparent; background: linear-gradient(#000000, #000000) padding-box, conic-gradient(from var(--isa-angle-a, 0deg), ${tokens.lime}, #c8ff00, #9eff00, rgba(0,0,0,0.2), ${tokens.lime}) border-box; animation: isa-spin-a 6s linear infinite; }
  @property --isa-angle-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
  @property --isa-angle-b { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
  @keyframes isa-spin-a { to { --isa-angle-a: 360deg; } }
  @keyframes isa-spin-b { to { --isa-angle-b: -360deg; } }
  .isa-btn { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #000000; color: ${tokens.lime}; border: none; border-radius: 999px; padding: 13px 26px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap; transition: color 0.3s ease, background 0.3s ease; }
  .isa-btn:hover:not(:disabled) { background: ${tokens.lime}; color: #000000; }
  .isa-btn:focus-visible { outline: 2px solid ${tokens.lime}; outline-offset: 3px; }
  .isa-error-slot { min-height: 30px; margin-top: 14px; display: flex; align-items: center; }
  .isa-error-text { display: flex; align-items: center; font-size: 12.5px; color: ${tokens.danger}; margin: 0; }
  .isa-fineprint { font-size: 11.5px; color: rgba(255,255,255,0.68); margin-top: 6px; line-height: 1.5; }
  .isa-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(0,255,0,0.25); border-top-color: ${tokens.lime}; display: inline-block; animation: isa-spin 0.7s linear infinite; }
  @keyframes isa-spin { to { transform: rotate(360deg); } }
  @media (max-width: 640px) { .isa-root { padding: 20px 12px; } .isa-card-wrap { width: 90%; max-width: 90%; } .isa-card { min-height: 74vh; display: flex; flex-direction: column; } .isa-card-inner { flex: 1; justify-content: center; padding: 32px 24px; } }
  @media (prefers-reduced-motion: reduce) { .isa-dots, .isa-grid, .isa-smoke-blob, .isa-spinner, .isa-btn-wrap, .isa-btn-glow::before { animation: none !important; } }
`;
