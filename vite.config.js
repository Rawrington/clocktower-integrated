import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0',
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          groups: [
            {
              name: 'vendor',
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
})
