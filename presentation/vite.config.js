import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor';
          if (id.includes('/three/')) return 'three-core';
          if (id.includes('/@react-three/')) return 'three-react';
          if (id.includes('/gsap/')) return 'animation-vendor';
          if (id.includes('/lucide-react/')) return 'icons';
          return 'vendor';
        }
      }
    }
  }
});
