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
        'secondary-bg': '#2d2d2d',
        'secondary-text': '#a0a0a0',
        'border': '#333333',
      },
      borderOpacity: {
        '50': '0.5',
      },
      opacity: {
        '50': '0.5',
      },
    },
  },
  plugins: [],
} 