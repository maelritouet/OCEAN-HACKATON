/// <reference types="vite/client" />

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '../thermomaris_ocean_hackathon_toulon';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
