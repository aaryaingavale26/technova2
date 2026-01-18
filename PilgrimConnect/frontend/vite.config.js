import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(),react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/pilgrims': 'http://localhost:8081',
      '/darshan': 'http://localhost:8081',
      '/auth': 'http://localhost:8081', // <--- ADD THIS
    },
  },
})