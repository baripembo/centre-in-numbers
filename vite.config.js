import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dsv from '@rollup/plugin-dsv';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  //base: "/centre-in-numbers/",
  plugins: [svelte(), dsv()],
  resolve: {
    alias: {
      "$components": path.resolve("./src/components"),
      "$routes": path.resolve("./src/routes")
    }
  }
})
