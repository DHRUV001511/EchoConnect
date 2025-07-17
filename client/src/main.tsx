import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './user-context';

// Import CSS files in the correct order
import './index.css';  // Global styles first
import './App.css';   // App-specific styles second

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);