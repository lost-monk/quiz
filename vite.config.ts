import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/quiz/', // This ensures BASE_URL is "/quiz/"
})
