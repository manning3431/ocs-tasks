import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import federationConfig from './module-federation.config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/tasks/',
  plugins: [
    react(),
    federation(federationConfig),
  ],
  resolve: {
    alias: {
       '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@pmo/design-system'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    watch: {
      ignored: ['!**/node_modules/@pmo/design-system/**'],
    },
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
});