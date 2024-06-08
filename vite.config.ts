import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    splitVendorChunkPlugin()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    cssCodeSplit: false,
    minify: true,
    lib: {
      entry: 'src/main.ts',
      name: 'BundleJS',
      fileName: () => `aidala-btc-calculator.js`,
      formats: ['es']
    }
  },
  define: {
    'process.env': process.env
  }
})