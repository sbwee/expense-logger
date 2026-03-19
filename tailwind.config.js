/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          foreground: '#ecfdf5',
        },
      },
    },
  },
  plugins: [],
}

