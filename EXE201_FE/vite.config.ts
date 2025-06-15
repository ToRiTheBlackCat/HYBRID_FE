import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://hybridelearn-acdwdxa80dmb2fdgm.southeastasia-01.azurewebsites.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      }
    }
  }
})
