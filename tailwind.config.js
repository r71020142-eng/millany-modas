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
          black: '#000000',
          dark: '#0e0e0e',
          card: '#161616',
          border: '#2a2a2a',
          rose: '#d2888a',
          'rose-light': '#f0b4b5',
          'rose-dark': '#be6f72',
          gold: '#e59a9b',
          light: '#ffffff',
          muted: '#8e8e93',
          pix: '#00bdae',
          whatsapp: '#25D366'
        }
      },
      fontFamily: {
        prata: ['"Prata"', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
