/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        orange: '#FF5C1A',
        'orange-soft': '#FF7A40',
        violet: '#6B3FA0',
        'violet-light': '#9B6DD4',
        bg: '#EDEAE4',
        surface: '#FFFFFF',
        surface2: '#F0EDE8',
        text: '#1A1A1A',
        'text-muted': '#6E6B66',
        success: '#00C864',
        warning: '#FFB800',
        error: '#FF3B3B',
        border: 'rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
