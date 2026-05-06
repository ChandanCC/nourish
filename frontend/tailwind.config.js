/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"DM Mono"', 'Fira Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: { yellow: '#ffc864', 'yellow-light': '#ffd98a' },
        surface: { base: '#0a0a0f', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)' },
        status: { green: '#34d399', yellow: '#fbbf24', red: '#f87171', purple: '#a78bfa', teal: '#4ecdc4', orange: '#ffa552', pink: '#ff6b9d' },
      },
    },
  },
  plugins: [],
};
