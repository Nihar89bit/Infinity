/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FFF0F3',
          100: '#FFCCD5',
          200: '#FFB4A2',
          300: '#E5989B',
          400: '#B5838D',
          500: '#6D6875',
          600: '#8B263E',
          700: '#6A1B29',
          800: '#4A121A',
          900: '#2C090E',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FAF3DD',
          200: '#F4E8C1',
        },
        burgundy: {
          500: '#8B263E',
          600: '#6B1B2F',
          700: '#4C101F',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        handwriting: ['"Dancing Script"', 'cursive'],
        sans: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'romantic': '0 10px 30px -5px rgba(229, 152, 155, 0.25)',
        'romantic-lg': '0 20px 40px -10px rgba(139, 38, 62, 0.2)',
        'glass': '0 8px 32px 0 rgba(139, 38, 62, 0.08)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}
