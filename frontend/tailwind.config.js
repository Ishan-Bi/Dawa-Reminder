/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dawa: {
          primary: '#167C53',
          soft: '#E9F5EF',
          dark: '#0D4E34',
          bg: '#F8FAF9',
          text: '#202824',
          muted: '#5C6863',
          foodBeforeBg: '#FFF4D6',
          foodBeforeTxt: '#B45309',
          foodAfterBg: '#E6F9F0',
          foodAfterTxt: '#0E6245',
          warningBg: '#FEEFE6',
          warningTxt: '#C2410C',
          errorBg: '#FDE8E7',
          errorTxt: '#B91C1C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
