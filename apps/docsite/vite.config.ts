import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  // The two workspace packages are deliberately not pre-bundled. Vite's
  // optimizer copies a dependency into `.vite/deps`, and when the theme pack
  // pulled its own copy of core alongside the app's, `ThemeProvider` and
  // `useTheme` came from different module instances — two React contexts, and
  // every consumer threw "useTheme must be used within a ThemeProvider" on a
  // page whose provider was plainly above it. Excluding them also means an
  // edit inside `packages/` reaches the page without clearing a cache.
  optimizeDeps: {
    exclude: ['@misoto22/kioku-ui', '@misoto22/kioku-ui-theme-kioku'],
  },
  plugins: [react()],
  // One React, whichever package resolved it.
  resolve: {dedupe: ['react', 'react-dom']},
  server: {port: 6100},
});
