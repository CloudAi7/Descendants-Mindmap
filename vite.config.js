import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Descendants/',
  build: {
    outDir: 'docs',
  },
  plugins: [react()],
});
