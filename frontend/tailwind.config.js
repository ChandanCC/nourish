/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        /* Background family */
        'bg-0': 'var(--bg-0)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        'bg-3': 'var(--bg-3)',
        /* Ink family */
        'ink-0': 'var(--ink-0)',
        'ink-1': 'var(--ink-1)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',
        /* Brand accent */
        gold: 'var(--gold)',
        'gold-1': 'var(--gold-1)',
        'gold-2': 'var(--gold-2)',
        'gold-3': 'var(--gold-3)',
        /* Status signals */
        'status-up': 'var(--status-up)',
        'status-mid': 'var(--status-mid)',
        'status-down': 'var(--status-down)',
      },
    },
  },
  plugins: [],
};
