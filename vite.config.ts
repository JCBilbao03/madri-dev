import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Firebase Hosting serves /assets/** with immutable caching, so keep the
    // hashed-filename layout Vite produces by default.
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
  },
});
