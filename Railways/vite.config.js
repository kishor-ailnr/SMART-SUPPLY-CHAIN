import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5003,
    proxy: {
      '/api': {
        target: 'http://localhost:6003',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:6003',
        ws: true,
      }
    }
  }
})
