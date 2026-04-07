/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        maritime: {
          navy: '#0B1F3A',
          deepBlue: '#0E3A5D',
          ocean: '#1CA7C7',
          lightBlue: '#4FC3E0',
          cream: '#F4F7FA',
          gray: '#E8EDF2',
        },
        primary: {
          50: '#F4F7FA',
          100: '#E8EDF2',
          200: '#D1DBE5',
          300: '#A3B7C9',
          400: '#7593AD',
          500: '#0E3A5D',
          600: '#0B2F4A',
          700: '#092437',
          800: '#061924',
          900: '#030D12',
        },
        accent: {
          50: '#E6F7FB',
          100: '#CCEFF7',
          200: '#99DFEF',
          300: '#66CFE7',
          400: '#33BFDF',
          500: '#1CA7C7',
          600: '#16869F',
          700: '#116477',
          800: '#0B434F',
          900: '#062127',
        },
        ocean: {
          light: '#E6F7FB',
          DEFAULT: '#1CA7C7',
          dark: '#0B1F3A',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      lineHeight: {
        'relaxed-plus': '1.75',
        'loose-plus': '2',
      },
    },
  },
  plugins: [],
}
