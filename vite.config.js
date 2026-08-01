import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from https://<user>.github.io/phipsigolftourney/
// so assets must be requested with that base path in production.
export default defineConfig({
  plugins: [react()],
  base: '/phipsigolftourney/',
})
