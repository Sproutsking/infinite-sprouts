import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('App runtime error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f5f5f5', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: 720, width: '100%', borderRadius: 20, border: '1px solid #d0d0d0', background: '#fff', padding: 28, boxShadow: '0 14px 40px rgba(0,0,0,.08)' }}>
            <h1 style={{ marginTop: 0, marginBottom: 12, fontSize: 24 }}>Something went wrong</h1>
            <p style={{ marginBottom: 16, color: '#4b4b4b' }}>The app encountered an unexpected error and cannot continue. Open the browser console for details.</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f7f7f7', padding: 14, borderRadius: 12, color: '#111' }}>
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
