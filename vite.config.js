import { defineConfig } from 'vite';

export default defineConfig({
  // Keep relative assets so the build works from GitHub Pages project URLs.
  base: './',
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
