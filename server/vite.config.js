import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { resolve } from 'path'

export default defineConfig({
  root: './admin_panel',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'admin_panel_dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "./admin_panel/index.html"),
      output: {
        dir: "admin_panel_dist",
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'admin_panel')
    }
  }
})