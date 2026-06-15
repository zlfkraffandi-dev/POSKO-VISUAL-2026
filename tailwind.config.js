/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        accent: '#A78BBA',
        danger: '#FF6B6B',
        success: '#4ECDC4',
        bg: '#FAF7FF',
        border: '#E5E7EB',
        dark: '#2D2A3E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
