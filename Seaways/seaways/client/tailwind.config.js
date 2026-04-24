/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#0A1628', 
          800: '#0F223D', 
          700: '#142E52', 
        },
        accent: '#00D4FF', 
        amber: '#FFB800', 
        safe: '#06d6a0',
        warning: '#ffbe0b',
        danger: '#ff006e',
        critical: '#ff006e',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        exo: ['Exo 2', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
