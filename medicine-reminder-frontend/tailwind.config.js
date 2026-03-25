/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          300: '#67e8f9',
          500: '#06b6d4',
          700: '#0e7490',
          900: '#164e63'
        },
        accent: {
          500: '#f59e0b',
          700: '#b45309'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -25px rgba(14, 116, 144, 0.45)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 12% 22%, rgba(6, 182, 212, 0.22), transparent 35%), radial-gradient(circle at 88% 16%, rgba(34, 197, 94, 0.18), transparent 30%), radial-gradient(circle at 56% 86%, rgba(251, 146, 60, 0.16), transparent 38%)',
      },
    },
  },
  plugins: [],
};
