import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import VitePluginLeaderLine from 'vite-plugin-leader-line'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginLeaderLine()
  ],
  server: {
    host: '0.0.0.0',
  },
})
