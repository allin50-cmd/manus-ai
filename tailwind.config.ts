import type { Config } from 'tailwindcss';

export default {
  content: ['./client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f1e',
        surface: '#111827',
        border: '#1e2d45',
        accent: '#3b82f6',
      },
    },
  },
  plugins: [],
} satisfies Config;
