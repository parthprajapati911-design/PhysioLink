import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // In development the API runs on port 4000; forward /api calls to it
      // so the browser sees a single origin (cookies just work).
      proxy: {
        '/api': 'http://localhost:4000',
      },
    },
  };
});
