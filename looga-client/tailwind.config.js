/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        orange: '#FF5C1A',
        'orange-soft': '#FF7A40',
        violet: '#6B3FA0',
        'violet-light': '#9B6DD4',
        'violet-deep': '#4A2878',
        bg: '#0D0B12',
        surface: '#161220',
        surface2: '#1E1830',
        card: '#211C35',
        text: '#F0ECF8',
        'text-muted': '#8A82A0',
        success: '#00C864',
        warning: '#FFB800',
        error: '#FF3B3B',
        border: 'rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
};
