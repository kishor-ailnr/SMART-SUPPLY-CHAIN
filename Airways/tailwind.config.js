/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sky-deep': '#000814',
        'sky-stratosphere': '#001d3d',
        'sky-troposphere': '#003566',
        'sky-surface': '#0077b6',
        'accent': '#00b4d8',
        'accent-bright': '#90e0ef',
        'accent-dim': 'rgba(0, 180, 216, 0.15)',
        'accent-border': 'rgba(0, 180, 216, 0.4)',
        'safe': '#2dc653',
        'safe-dim': 'rgba(45, 198, 83, 0.12)',
        'caution': '#ffd60a',
        'caution-dim': 'rgba(255, 214, 10, 0.12)',
        'warning': '#ff6b35',
        'warning-dim': 'rgba(255, 107, 53, 0.12)',
        'danger': '#ef233c',
        'danger-dim': 'rgba(239, 35, 60, 0.12)',
        'emergency': '#d00000',
        'emergency-pulse': 'rgba(208, 0, 0, 0.4)',
        'dark-aircraft': '#9b5de5',
        'dark-aircraft-dim': 'rgba(155, 93, 229, 0.12)',
        'port-red': '#e63946',
        'starboard-green': '#2dc653',
        'strobe-white': '#f8f9fa',
        'cockpit-amber': '#ffb703',
        'bg-primary': '#080c14',
        'bg-secondary': '#0c1220',
        'bg-tertiary': '#101828',
        'bg-hover': '#152035',
        'text-primary': '#caf0f8',
        'text-secondary': '#90a4ae',
        'text-muted': '#37474f',
        'border-color': 'rgba(0, 180, 216, 0.1)',
        'border-accent': 'rgba(0, 180, 216, 0.3)',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
