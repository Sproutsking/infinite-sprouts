import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { WalletProvider, NotificationProvider, LabsProvider } from './context/serviceIndex.jsx';
import AuthGate from './components/AuthGate.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AuthProvider>
      <ProfileProvider>
        <WalletProvider>
          <NotificationProvider>
            <LabsProvider>
              <AuthGate>
                <App />
              </AuthGate>
            </LabsProvider>
          </NotificationProvider>
        </WalletProvider>
      </ProfileProvider>
    </AuthProvider>
  </ErrorBoundary>
);
