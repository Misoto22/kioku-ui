import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {App} from './App.js';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
