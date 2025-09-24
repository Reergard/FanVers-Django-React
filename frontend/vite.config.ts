import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// если у тебя точка входа НЕ /src/index.tsx, просто поправь путь в index.html
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    proxy: {
      // Прокси на Django во время dev
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',           // куда собирать (оставляем по умолчанию)
    sourcemap: true
  }
})
