/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f4',
          100: '#faefe6',
          200: '#f4decb',
          300: '#ecc6a7',
          400: '#df9c6d',
          500: '#c86f34',
          600: '#b45a27',
          700: '#944421',
          800: '#773820',
          900: '#622f1d',
          950: '#35160d',
        },
        tea: {
          50: '#f3f8f3',
          100: '#e3efe3',
          200: '#c8dfc8',
          500: '#4e8c56',
          600: '#3b7042',
          700: '#305937',
        }
      }
    },
  },
  plugins: [],
}
