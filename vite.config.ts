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
    build: {
      target: ['es2020', 'safari14', 'ios14', 'chrome87', 'firefox78', 'edge88'],
      cssTarget: ['safari14', 'ios14', 'chrome87', 'firefox78'],
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/pdfjs-dist')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/@pdfsmaller')) {
              return 'vendor-pdflib';
            }
            if (id.includes('node_modules/tesseract.js')) {
              return 'vendor-tesseract';
            }
            if (id.includes('node_modules/jszip')) {
              return 'vendor-jszip';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
              return 'vendor-react';
            }
            if (id.includes('src/tools/catalog/new_batches/')) {
              return 'catalog-batches-1';
            }
            if (id.includes('src/tools/catalog/expansion_batches/')) {
              return 'catalog-batches-2';
            }
            if (id.includes('src/tools/studios/')) {
              return 'studio-tools';
            }
            if (id.includes('src/tools/Business/')) {
              return 'tools-business';
            }
            if (id.includes('src/tools/Developer/')) {
              return 'tools-developer';
            }
            if (id.includes('src/tools/pdf/')) {
              return 'tools-pdf';
            }
            if (id.includes('src/tools/images/')) {
              return 'tools-images';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
