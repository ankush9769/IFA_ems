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
          blue: '#0ea5e9',
          purple: '#7c3aed',
          'light-purple': '#c4b5fd',
          'sky-light': '#e0f2fe',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
        'brand-gradient-light': 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)',
      },
    },
  },
  plugins: [],
}
