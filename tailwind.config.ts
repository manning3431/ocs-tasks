import type { Config } from 'tailwindcss';
import pmoPreset from '@pmo/tailwind-preset';

export default {
  presets: [pmoPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  corePlugins: {
    preflight: false, // Shell already includes preflight; avoid duplicate resets
  },
} satisfies Config;