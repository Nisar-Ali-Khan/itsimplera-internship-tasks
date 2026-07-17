/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F3',
        paperraised: '#FFFFFF',
        ink: '#1C1B19',
        forest: {
          50: '#EDF3EF',
          100: '#D5E4DA',
          400: '#2F6B4F',
          500: '#1B4332',
          600: '#153629',
          700: '#0F281E',
        },
        gold: {
          100: '#F7E9C7',
          400: '#D9A441',
          500: '#C08A2E',
        },
        coral: {
          100: '#FBE0DA',
          400: '#E8604C',
          500: '#D14A36',
        },
        inkmuted: '#6B6862',
      },
      fontFamily: {
        display: ['"Lora"', 'Georgia', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 27, 25, 0.06), 0 1px 3px rgba(28, 27, 25, 0.08)',
        raised: '0 8px 24px rgba(28, 27, 25, 0.10)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
