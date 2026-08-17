import {kiokuUiVitePlugin} from '@misoto22/kioku-ui-build/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [...kiokuUiVitePlugin({rootDir: import.meta.dirname}), react()],
});
