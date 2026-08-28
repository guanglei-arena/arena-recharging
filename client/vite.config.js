import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['all'], // allow the preview host to reach the dev server
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
