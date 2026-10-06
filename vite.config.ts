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
      target: ['es2018', 'safari13', 'ios13', 'chrome75', 'firefox68', 'edge79'],
      cssTarget: ['safari13', 'ios13', 'chrome75', 'firefox68'],
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendors
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
            if (id.includes('node_modules/motion')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/diff')) {
              return 'vendor-diff';
            }

            // Catalog batches & files
            if (id.includes('src/tools/catalog/new_batches/')) {
              return 'catalog-batches-1';
            }
            if (id.includes('src/tools/catalog/expansion_batches/')) {
              return 'catalog-batches-2';
            }
            if (
              id.includes('src/tools/catalog/aiCatalog') ||
              id.includes('src/tools/catalog/businessCatalog') ||
              id.includes('src/tools/catalog/calculatorsCatalog') ||
              id.includes('src/tools/catalog/dataCatalog')
            ) {
              return 'catalog-core-1';
            }
            if (
              id.includes('src/tools/catalog/developerCatalog') ||
              id.includes('src/tools/catalog/documentsCatalog') ||
              id.includes('src/tools/catalog/imagesCatalog')
            ) {
              return 'catalog-core-2';
            }
            if (
              id.includes('src/tools/catalog/mediaCatalog') ||
              id.includes('src/tools/catalog/pdfCatalog') ||
              id.includes('src/tools/catalog/resumesCatalog') ||
              id.includes('src/tools/catalog/securityCatalog')
            ) {
              return 'catalog-core-3';
            }

            // Archetypes
            if (id.includes('src/components/tool/archetypes/pdf') || id.includes('src/components/tool/archetypes/PdfArchetypeWorkspace')) {
              return 'archetype-pdf';
            }
            if (id.includes('src/components/tool/archetypes/')) {
              return 'archetype-workspaces';
            }

            // SEO & descriptions
            if (id.includes('src/data/toolDescriptions')) {
              return 'app-tool-descriptions';
            }

            // Studio tools
            if (id.includes('src/tools/studios/')) {
              return 'studio-tools';
            }

            // Tool clusters by domain
            if (id.includes('src/tools/Business/') || id.includes('src/tools/business/') || id.includes('src/tools/Marketing/')) {
              return 'tools-business';
            }
            if (id.includes('src/tools/Developer/') || id.includes('src/tools/developer/') || id.includes('src/tools/Cybersecurity/')) {
              return 'tools-developer';
            }
            if (id.includes('src/tools/pdf/') || id.includes('src/tools/edit-pdf/')) {
              return 'tools-pdf';
            }
            if (id.includes('src/tools/images/') || id.includes('src/tools/Images/')) {
              return 'tools-images';
            }
            if (id.includes('src/tools/Calculators/') || id.includes('src/tools/calculators/')) {
              return 'tools-calculators';
            }
            if (id.includes('src/tools/Data/') || id.includes('src/tools/data/')) {
              return 'tools-data';
            }
            if (id.includes('src/tools/AI/') || id.includes('src/tools/ai/')) {
              return 'tools-ai';
            }
            if (id.includes('src/tools/Documents/') || id.includes('src/tools/Resumes/') || id.includes('src/tools/resumes/') || id.includes('src/tools/Text/')) {
              return 'tools-documents';
            }
            if (
              id.includes('src/tools/Automation/') ||
              id.includes('src/tools/Education/') ||
              id.includes('src/tools/Engineering/') ||
              id.includes('src/tools/Files/') ||
              id.includes('src/tools/Media/') ||
              id.includes('src/tools/media/') ||
              id.includes('src/tools/Productivity/') ||
              id.includes('src/tools/Utilities/') ||
              id.includes('src/tools/Design/')
            ) {
              return 'tools-media-utilities';
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
