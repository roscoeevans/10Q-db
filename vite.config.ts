import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['firebase-admin']
  },
  build: {
    rollupOptions: {
      external: ['firebase-admin']
    }
  }
})
