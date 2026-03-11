/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4C9C2E',
          dark: '#4C9C2E',
          light: '#5fb038',
        },
        secondary: {
          DEFAULT: '#C2D500',
          dark: '#a8b800',
          light: '#d4e633',
        },
      },
    },
  },
  plugins: [],
}
