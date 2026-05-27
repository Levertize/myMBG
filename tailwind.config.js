/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0f1117',
        elevated: '#1a1e2e',
        surface: '#222839',
        'accent-indigo': '#818cf8',
        'accent-purple': '#a78bfa',
        'accent-cyan': '#67e8f9',
        'accent-pink': '#f0abfc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
