
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create root with proper error handling
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

// Render with StrictMode to catch potential issues
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
