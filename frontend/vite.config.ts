import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    // Настройки dev-сервера актуальны ТОЛЬКО для npm run dev
    server: isDev
      ? {
          host: process.env.VITE_DEV_HOST || '127.0.0.1',
          port: Number(process.env.VITE_DEV_PORT || 5173),
          strictPort: true,
          hmr: {
            protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
            host: process.env.VITE_HMR_HOST || '127.0.0.1',
            port: Number(process.env.VITE_HMR_PORT || 5173),
          },
        }
      : undefined,
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})

