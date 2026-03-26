/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest:  '#1C3A1C',
        sage:    '#A8C97A',
        cream:   '#F4F0E6',
        bark:    '#263F26',
        moss:    '#3d5c3d',
        mist:    '#8aab8a',
      },
      fontFamily: {
        sans: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
