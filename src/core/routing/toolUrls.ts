import { ToolDefinition } from '../../types';
import { toolRegistry } from '../tool-registry/ToolRegistry';

export const CANONICAL_ORIGIN = 'https://editmee.com';

// Flagship canonical slugs mapped explicitly for SEO excellence
const FLAGSHIP_SLUGS: Record<string, string> = {
  // PDF
  'edit-pdf': 'edit-pdf',
  'pdf-merger': 'merge-pdf',
  'pdf-splitter': 'split-pdf',
  'pdf-compressor': 'compress-pdf',
  'pdf-protect': 'protect-pdf',
  'pdf-unlock': 'unlock-pdf',
  'pdf-sign': 'sign-pdf',
  'pdf-redact': 'redact-pdf',
  'pdf-rotate': 'rotate-pdf',
  'pdf-to-word': 'pdf-to-word',
  'pdf-to-jpg': 'pdf-to-jpg',
  'images-to-pdf': 'images-to-pdf',
  'pdf-watermark': 'watermark-pdf',
  'pdf-page-numberer': 'number-pdf-pages',
  'pdf-compare': 'compare-pdf',
  'pdf-form-filler': 'fill-pdf-forms',
  'pdf-repair': 'repair-pdf',
  'pdf-crop-pages': 'crop-pdf',
  'pdf-deskew': 'deskew-pdf',
  'pdf-insert-blank-page': 'insert-blank-page-pdf',
  'pdf-page-reverser': 'reverse-pdf-pages',
  'pdf-booklet': 'pdf-booklet',
  'pdf-bookmarks': 'pdf-bookmarks',
  'pdf-ocr': 'ocr-pdf',
  'pdf-annotation-studio': 'annotate-pdf',
  'pdf-hyperlink-editor': 'edit-pdf-links',
  'pdf-flatten-forms-annotations': 'flatten-pdf',
  'pdf-layers-manager': 'manage-pdf-layers',
  'pdf-attachments-manager': 'pdf-attachments',
  'pdf-grayscale': 'convert-pdf-grayscale',
  'pdf-metadata': 'edit-pdf-metadata',

  // Images
  'image-studio': 'image-studio',
  'image-compressor': 'compress-image',
  'image-resizer': 'image-resizer',
  'image-cropper': 'crop-image',
  'image-rotator': 'rotate-image',
  'image-converter': 'convert-image',
  'bg-remover': 'remove-background',
  'image-upscaler': 'upscale-image',
  'image-enhancer': 'enhance-image',
  'image-watermark': 'watermark-image',
  'image-annotator': 'annotate-image',
  'color-extractor': 'extract-color-palette',
  'exif-viewer': 'view-exif-data',
  'specialized-filter': 'special-photo-effects',
  'design-creative-studio': 'design-creative-studio-pro',

  // Core Studios
  'resume-builder': 'resume-builder',
  'csv-studio': 'csv-studio',
  'dev-studio': 'dev-studio',
  'calculator-studio': 'calculator-studio',
  'ai-assistant': 'ai-assistant',
  'ai-writing': 'ai-writing-assistant',
  'ai-doc-intel': 'ai-document-intelligence',
};

// Internal caches
let initialized = false;
const toolIdToSlugMap = new Map<string, string>();
const slugToToolIdMap = new Map<string, string>();
const aliasToCanonicalSlugMap = new Map<string, string>();

/**
 * Generate a clean, descriptive slug for any tool
 */
export function generateCleanSlug(tool: ToolDefinition): string {
  if (FLAGSHIP_SLUGS[tool.id]) {
    return FLAGSHIP_SLUGS[tool.id];
  }

  // Clean raw tool IDs by removing redundant catalog prefixes and numeric suffixes
  let s = tool.id
    .toLowerCase()
    .replace(/^documents-/, '')
    .replace(/^ai-ai-/, 'ai-')
    .replace(/^business-/, '')
    .replace(/^calculators-/, '')
    .replace(/^data-/, '')
    .replace(/^developer-/, '')
    .replace(/^images-/, '')
    .replace(/^media-/, '')
    .replace(/^pdf-pdf-/, 'pdf-')
    .replace(/^resumes-/, '')
    .replace(/^security-/, '')
    .replace(/-\d+(-\d+)?$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!s || s.length < 3) {
    s = tool.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  return s;
}

/**
 * Initialize all tool slug mappings once tools are registered
 */
export function initToolUrlMappings(): void {
  if (initialized) return;

  const allTools = toolRegistry.getAll();
  if (allTools.length === 0) return;

  toolIdToSlugMap.clear();
  slugToToolIdMap.clear();
  aliasToCanonicalSlugMap.clear();

  // First pass: assign clean slugs and detect any collisions
  for (const tool of allTools) {
    let slug = generateCleanSlug(tool);

    if (slugToToolIdMap.has(slug) && slugToToolIdMap.get(slug) !== tool.id) {
      // Collision disambiguation: prepend category
      slug = `${tool.category}-${slug}`;
      if (slugToToolIdMap.has(slug) && slugToToolIdMap.get(slug) !== tool.id) {
        slug = tool.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
    }

    toolIdToSlugMap.set(tool.id, slug);
    slugToToolIdMap.set(slug, tool.id);

    // Also register tool.id as an alias to the canonical slug if it differs
    const rawIdSlug = tool.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (rawIdSlug !== slug) {
      aliasToCanonicalSlugMap.set(rawIdSlug, slug);
    }
  }

  // Register common aliases
  const standardAliases: [string, string][] = [
    // PDF
    ['pdf-to-word-text', 'pdf-to-word'],
    ['pdf-to-text', 'pdf-to-word'],
    ['pdf-merge', 'merge-pdf'],
    ['pdf-merger', 'merge-pdf'],
    ['pdf-split', 'split-pdf'],
    ['pdf-splitter', 'split-pdf'],
    ['pdf-compress', 'compress-pdf'],
    ['pdf-compressor', 'compress-pdf'],
    ['pdf-sign', 'sign-pdf'],
    ['pdf-redact', 'redact-pdf'],
    ['pdf-signature', 'sign-pdf'],
    ['pdf-protect', 'protect-pdf'],
    ['pdf-rotate', 'rotate-pdf'],
    ['pdf-rotate-pages', 'rotate-pdf'],
    ['pdf-crop', 'crop-pdf'],
    ['pdf-crop-pages', 'crop-pdf'],
    ['pdf-ocr', 'ocr-pdf'],
    ['pdf-repair', 'repair-pdf'],

    // Images
    ['compress-image', 'compress-image'],
    ['image-compress', 'compress-image'],
    ['resize-image', 'image-resizer'],
    ['crop-image', 'crop-image'],
    ['rotate-image', 'rotate-image'],
    ['remove-bg', 'remove-background'],
    ['bg-remover', 'remove-background'],
    ['background-remover', 'remove-background'],
    ['convert-image', 'convert-image'],
    ['upscale-image', 'upscale-image'],
    ['enhance-image', 'enhance-image'],

    // AI
    ['ai-assistant', 'ai-assistant'],
    ['work-assistant', 'ai-assistant'],
  ];

  standardAliases.forEach(([alias, targetSlug]) => {
    aliasToCanonicalSlugMap.set(alias.toLowerCase(), targetSlug);
  });

  initialized = true;
}

/**
 * Get canonical URL path for a tool ID (e.g. /tools/merge-pdf/)
 */
export function getToolCanonicalPath(toolId: string): string {
  if (!initialized) initToolUrlMappings();
  const slug = toolIdToSlugMap.get(toolId) || toolId.toLowerCase();
  return `/tools/${slug}/`;
}

/**
 * Get full absolute canonical URL for a tool ID
 */
export function getToolFullCanonicalUrl(toolId: string): string {
  return `${CANONICAL_ORIGIN}${getToolCanonicalPath(toolId)}`;
}

/**
 * Resolve a tool from a slug or ID
 */
export function resolveToolFromSlug(slugOrId: string): ToolDefinition | undefined {
  if (!slugOrId) return undefined;
  if (!initialized) initToolUrlMappings();

  const clean = slugOrId.trim().toLowerCase().replace(/\/$/, '');

  // 1. Direct canonical slug match
  const directToolId = slugToToolIdMap.get(clean);
  if (directToolId) {
    return toolRegistry.get(directToolId);
  }

  // 2. Direct tool ID match
  const directTool = toolRegistry.get(clean);
  if (directTool) {
    return directTool;
  }

  // 3. Alias match
  const canonicalSlug = aliasToCanonicalSlugMap.get(clean);
  if (canonicalSlug) {
    const tid = slugToToolIdMap.get(canonicalSlug);
    if (tid) return toolRegistry.get(tid);
  }

  // 4. Registry alias lookup
  const resolvedRegId = toolRegistry.resolveCanonicalId(clean);
  if (resolvedRegId && resolvedRegId !== clean) {
    return toolRegistry.get(resolvedRegId);
  }

  return undefined;
}

/**
 * Resolve tool and canonical path from any path
 */
export function resolveToolFromPath(path: string): {
  tool: ToolDefinition;
  isCanonical: boolean;
  canonicalPath: string;
} | null {
  const cleanPath = path.trim().toLowerCase();

  // Match: /tools/:slug, /tools/:slug/, /tool/:slug, /tool/:slug/, /suite/:slug, /suite/:slug/
  const match = cleanPath.match(/^\/(?:tools?|suite)\/([a-zA-Z0-9_-]+)\/?$/);
  if (!match || !match[1]) return null;

  const slug = match[1];
  const tool = resolveToolFromSlug(slug);
  if (!tool) return null;

  const canonicalPath = getToolCanonicalPath(tool.id);
  // Ensure trailing slash check
  const isCanonical = cleanPath === canonicalPath || cleanPath + '/' === canonicalPath;

  return {
    tool,
    isCanonical,
    canonicalPath,
  };
}

/**
 * Get all tool routes for sitemap and directory listings
 */
export function getAllToolRoutes(): {
  tool: ToolDefinition;
  slug: string;
  path: string;
  canonicalUrl: string;
}[] {
  if (!initialized) initToolUrlMappings();

  return toolRegistry.getAll().map((tool) => {
    const slug = toolIdToSlugMap.get(tool.id) || tool.id.toLowerCase();
    const path = `/tools/${slug}/`;
    return {
      tool,
      slug,
      path,
      canonicalUrl: `${CANONICAL_ORIGIN}${path}`,
    };
  });
}
