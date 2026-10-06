import { toolRegistry } from './ToolRegistry';
import { coreCatalogTools, coreAliasMap } from '../../tools/catalog';

let coreRegistered = false;
let deferredPromise: Promise<void> | null = null;

export function registerCoreTools() {
  if (coreRegistered) return;
  coreRegistered = true;

  toolRegistry.registerMany(coreCatalogTools);

  if (coreAliasMap) {
    coreAliasMap.forEach((canonicalId, aliasId) => {
      toolRegistry.registerAlias(aliasId, canonicalId);
    });
  }

  // Explicit canonical aliases for protected PDF tools
  const pdfAliases: [string, string][] = [
    ['rotate-pdf', 'pdf-rotate'],
    ['pdf-rotate-pages', 'pdf-rotate'],
    ['pdf-merge', 'pdf-merger'],
    ['pdf-merge-tool', 'pdf-merger'],
    ['pdf-split', 'pdf-splitter'],
    ['pdf-compress', 'pdf-compressor'],
    ['pdf-metadata-editor', 'pdf-metadata'],
    ['pdf-to-grayscale', 'pdf-grayscale'],
    ['pdf-grayscale-converter', 'pdf-grayscale'],
    ['pdf-to-word-text', 'pdf-to-word'],
    ['pdf-to-text', 'pdf-to-word'],
    ['pdf-page-numbers', 'pdf-page-numberer'],
    ['pdf-signature', 'pdf-sign'],
    ['pdf-electronic-signature', 'pdf-sign'],
    ['pdf-visual-diff', 'pdf-compare'],
    ['pdf-forms', 'pdf-form-filler'],
    ['pdf-fix-corrupt', 'pdf-repair'],
    ['pdf-crop', 'pdf-crop-pages'],
    ['pdf-margin-cropper', 'pdf-crop-pages'],
    ['pdf-straighten-deskew', 'pdf-deskew'],
    ['pdf-blank-page-inserter', 'pdf-insert-blank-page'],
    ['pdf-reverse-pages', 'pdf-page-reverser'],
    ['pdf-book-fold', 'pdf-booklet'],
    ['pdf-bookmark-indexer', 'pdf-bookmarks'],
    ['pdf-searchable-text-ocr', 'pdf-ocr'],
    ['pdf-redaction', 'pdf-redact'],
    ['pdf-annotate', 'pdf-annotation-studio'],
    ['pdf-markup-studio', 'pdf-annotation-studio'],
    ['pdf-hyperlinks', 'pdf-hyperlink-editor'],
    ['pdf-flatten', 'pdf-flatten-forms-annotations'],
    ['pdf-layers', 'pdf-layers-manager'],
    ['pdf-attachments', 'pdf-attachments-manager'],
    ['pdf-embedded-files', 'pdf-attachments-manager'],
  ];

  pdfAliases.forEach(([alias, canonical]) => {
    toolRegistry.registerAlias(alias, canonical);
  });

  // Explicit canonical aliases for differentiated Image tools
  const imageAliases: [string, string][] = [
    ['crop-image', 'image-cropper'],
    ['image-crop', 'image-cropper'],
    ['photo-crop', 'image-cropper'],
    ['rotate-image', 'image-rotator'],
    ['image-rotate', 'image-rotator'],
    ['flip-image', 'image-rotator'],
    ['image-flip', 'image-rotator'],
    ['compress-image', 'image-compressor'],
    ['image-shrink', 'image-compressor'],
    ['tinypng', 'image-compressor'],
    ['resize-image', 'image-resizer'],
    ['image-scale', 'image-resizer'],
    ['image-dimensions', 'image-resizer'],
    ['remove-background', 'bg-remover'],
    ['bg-remove', 'bg-remover'],
    ['transparent-background', 'bg-remover'],
    ['convert-image', 'image-converter'],
    ['png-to-jpg', 'image-converter'],
    ['jpg-to-png', 'image-converter'],
    ['webp-converter', 'image-converter'],
    ['upscale-image', 'image-upscaler'],
    ['super-resolution', 'image-upscaler'],
    ['enhance-resolution', 'image-upscaler'],
    ['color-grade', 'image-enhancer'],
    ['photo-enhancer', 'image-enhancer'],
    ['watermark-image', 'image-watermark'],
    ['add-watermark', 'image-watermark'],
    ['annotate-image', 'image-annotator'],
    ['markup-image', 'image-annotator'],
    ['redact-image', 'image-annotator'],
    ['extract-palette', 'color-extractor'],
    ['color-palette', 'color-extractor'],
    ['hex-extractor', 'color-extractor'],
    ['exif-data', 'exif-viewer'],
    ['photo-metadata', 'exif-viewer'],
    ['strip-exif', 'exif-viewer'],
    ['pixelate-image', 'specialized-filter'],
    ['vignette-image', 'specialized-filter'],
    ['special-effects', 'specialized-filter'],
  ];

  imageAliases.forEach(([alias, canonical]) => {
    toolRegistry.registerAlias(alias, canonical);
  });
}

export function registerDeferredTools(): Promise<void> {
  if (deferredPromise) return deferredPromise;

  deferredPromise = import('../../tools/catalog/deferredCatalog')
    .then(({ deferredCatalogTools, deferredAliasMap }) => {
      toolRegistry.registerMany(deferredCatalogTools);
      if (deferredAliasMap) {
        deferredAliasMap.forEach((canonicalId, aliasId) => {
          toolRegistry.registerAlias(aliasId, canonicalId);
        });
      }
    })
    .catch((err) => {
      console.warn('[EditMee] Deferred catalog load error:', err);
    });

  return deferredPromise;
}

export async function registerAllTools(): Promise<void> {
  registerCoreTools();
  return registerDeferredTools();
}
