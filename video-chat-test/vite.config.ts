import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

import fs from 'fs';
export default defineConfig({
  build: {
    outDir: '../public', // Relative to project root
  },
  plugins: [tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync('cert.key'),
      cert: fs.readFileSync('cert.crt'),
    },
    host: '0.0.0.0',
    cors: true,
  },
});
