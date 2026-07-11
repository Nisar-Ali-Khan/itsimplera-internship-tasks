/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        inkraised: '#111B2E',
        paper: '#FAF9F6',
        paperraised: '#FFFFFF',
        teal: {
          50: '#EFFCFA',
          100: '#CFF7EF',
          400: '#14B8A6',
          500: '#0F766E',
          600: '#0D5F58',
          700: '#0A4A45',
        },
        amber: {
          100: '#FEF3C7',
          400: '#F59E0B',
          500: '#D97706',
        },
        rose: {
          100: '#FFE4E9',
          400: '#FB7185',
          500: '#E11D48',
        },
        slateink: '#1E293B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)',
        raised: '0 4px 14px rgba(15, 23, 42, 0.10)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
