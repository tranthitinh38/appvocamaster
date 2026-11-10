import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './utils/AuthContext';

// Ensure we run only in the browser (no SSR)
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  }
}

