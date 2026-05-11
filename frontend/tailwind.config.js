/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#36CFC9',
        danger: '#F53F3F',
        warning: '#FF7D00',
        success: '#00B42A',
        dark: '#1D2129',
      },
    },
  },
  plugins: [],
}