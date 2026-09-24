import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#101C33', soft: '#1B2A45', deep: '#0A1223' },
        slate: { DEFAULT: '#3A4A63', light: '#6B7C96' },
        mist: { DEFAULT: '#EEF2F7', deep: '#DDE5EF' },
        signal: { DEFAULT: '#1F6F5C', light: '#E4F1ED', dark: '#175346' },
        amber: { DEFAULT: '#E0A526', light: '#FCF2DC', dark: '#A8770F' },
        danger: { DEFAULT: '#B3261E', light: '#FBE9E7' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: { card: '0 1px 2px rgba(16,28,51,.06), 0 12px 28px -18px rgba(16,28,51,.35)' },
    },
  },
  plugins: [],
};
export default config;
