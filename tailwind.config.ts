import type { Config } from 'tailwindcss';
import pmoPreset from '@pmo/design-system/preset';

export default {
  presets: [pmoPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  corePlugins: {
    preflight: false,
  },
} satisfies Config;