import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Descendants-Mindmap/', // Correct base path for GitHub Pages
  build: {
    outDir: 'docs',
  },
  plugins: [react()],
});
