
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // Changed: Import App as a named import
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// Removed ThemeProvider import

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        {/* Removed ThemeProvider */}
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);