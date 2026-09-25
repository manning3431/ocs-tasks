import { defineConfig } from '@module-federation/vite';

export default defineConfig({
  name: 'tasks',
  filename: 'remoteEntry.js',
  exposes: {
    './TasksPage': './src/pages/TasksPage.tsx',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.3.1',
      eager: true,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.3.1',
      eager: true,
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: '^6.26.0',
      eager: true,
    },
  },
});