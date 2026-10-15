import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/content/media-detector.ts', import.meta.url)),
      formats: ['iife'],
      name: 'WebTuneDetector',
      fileName: () => 'content/media-detector.js'
    }
  }
});
