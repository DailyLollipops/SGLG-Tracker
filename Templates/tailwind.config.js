/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["dist/**/*.{html,js}"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px'
    },
    extend: {
      colors: {
        snow: '#F1F6F9',
        silverLakeBlue: '#5290B5',
        policeBlue: '#394867',
        yankeeSBlue: '#212A3E',
        cadetBlue: '#9BA4B5'
      },
    },
  },
  plugins: [require("tailgrids/plugin")],
}

