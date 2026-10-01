import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['terminal.local', 'localhost'],
    // The API writes server/db.json every few seconds (live campaigns / DLRs).
    // If Vite watches it, it full-page-reloads the app = "panel blinking".
    // Never watch the backend folder.
    watch: {
      ignored: ['**/server/**', '**/node_modules/**', '**/dist/**'],
    },
    // The preview proxy drops WebSockets, which makes Vite's HMR client
    // full-page-reload in a loop as well. Refresh manually for changes.
    hmr: false,
    // Browser calls same-origin /api/*; Vite proxies to the Express API.
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
})
