/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          deep: '#083344',
          brand: '#0E7490',
          bright: '#06B6D4',
          soft: '#ECFEFF'
        },
        verdict: {
          pass: '#047857',
          review: '#9A5B08',
          fail: '#A61B1B'
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
