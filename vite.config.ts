import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
// Build target controls the asset base path:
//  - default / `web`  → `/narus-pos/` (GitHub Pages subdirectory)
//  - `mobile`         → `/`           (Capacitor loads from local filesystem)
const buildTarget = process.env.BUILD_TARGET ?? 'web'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: buildTarget === 'mobile' ? '/' : '/narus-pos/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
