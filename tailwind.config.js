/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#FFB7C5",
          pinkSoft: "#FFF0F4",
          pinkDark: "#FF6B8B",
          lavender: "#E9D5FF",
          lavenderSoft: "#F7F0FF",
          mint: "#BBF7D0",
          mintSoft: "#ECFDF5",
          peach: "#FFEDD5",
          peachSoft: "#FFF7ED",
          yellow: "#FEF08A",
          cream: "#FFF9FA"
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Quicksand"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
