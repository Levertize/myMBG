/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        elevated: 'var(--bg-elevated)',
        surface: 'var(--bg-surface)',
        'accent-indigo': 'var(--accent-indigo)',
        'accent-purple': 'var(--accent-purple)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-pink': 'var(--accent-pink)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
