/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080c0a',
          secondary: '#0c1410',
          tertiary: '#101a14',
          hover: '#162018',
        },
        track: {
          steel: '#FF8C00', // Dark Orange
          electric: '#FF4500', // Orange Red
          dfc: '#FFD700', // Gold/Bright Orange
          metro: '#FFA500', // Orange
          heritage: '#FF7F50', // Coral
          ng: '#FFA07A', // Light Salmon
        },
        signal: {
          green: '#00ff41',
          yellow: '#ffdd00',
          red: '#ff2200',
          doubleYellow: '#ffa500',
        },
        rail: {
          accent: '#FF8C00', // Bright highlighting orange
          accentDim: 'rgba(255, 140, 0, 0.15)',
          accentBorder: 'rgba(255, 140, 0, 0.4)',
          border: 'rgba(255, 140, 0, 0.1)',
        },
        status: {
          onTime: '#22c55e',
          onTimeDim: 'rgba(34, 197, 94, 0.12)',
          delayedMinor: '#FF8C00',
          delayedMinorDim: 'rgba(255, 140, 0, 0.12)',
          delayedMajor: '#f97316',
          delayedMajorDim: 'rgba(249, 115, 22, 0.12)',
          criticalDelay: '#ef4444',
          criticalDelayDim: 'rgba(239, 68, 68, 0.12)',
          emergency: '#dc2626',
          emergencyPulse: 'rgba(220, 38, 38, 0.4)',
        }
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        body: ['IBM Plex Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
