import JSZip from 'jszip';
import { diffLines, Change } from 'diff';
import { SeoIssue, UploadedFileItem, FileDiffPatch } from './types';

/**
 * Safely extract files from an uploaded ZIP archive without executing any code.
 * Enforces strict path traversal defenses against malicious archives.
 */
export async function extractZipSafely(file: File): Promise<UploadedFileItem[]> {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(file);
  const items: UploadedFileItem[] = [];

  for (const relativePath of Object.keys(zipData.files)) {
    const entry = zipData.files[relativePath];
    if (entry.dir) continue;

    // Defense against Zip Slip / path traversal
    const normalized = relativePath.replace(/\\/g, '/');
    if (normalized.includes('../') || normalized.startsWith('/') || normalized.startsWith('../')) {
      console.warn(`[Security] Blocked untrusted zip path: ${relativePath}`);
      continue;
    }

    // Only inspect text web files
    const isTextFile = /\.(html|htm|php|xml|json|txt|css|js|jsx|ts|tsx|svg)$/i.test(normalized);
    if (!isTextFile) {
      // Store placeholder or continue
      continue;
    }

    try {
      const content = await entry.async('string');
      items.push({
        path: normalized,
        name: normalized.split('/').pop() || normalized,
        content,
        size: (entry as any)._data ? (entry as any)._data.uncompressedSize || content.length : content.length,
      });
    } catch {
      // Ignore unreadable binary entries safely
    }
  }

  return items;
}

/**
 * Generate human-readable diff lines
 */
export function computeFileDiff(original: string, modified: string): {
  changes: Change[];
  added: number;
  removed: number;
} {
  const changes = diffLines(original, modified);
  let added = 0;
  let removed = 0;

  for (const c of changes) {
    if (c.added) added += c.count || 1;
    if (c.removed) removed += c.count || 1;
  }

  return { changes, added, removed };
}

/**
 * Clean & repair malformed JSON-LD string
 */
function repairJsonLd(rawJson: string, pageTitle: string, pageUrl: string): string {
  // First attempt: strip trailing commas, common comments, and fix trailing punctuation
  let cleaned = rawJson
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n\r]*/g, '')
    .replace(/,\s*([}\]])/g, '$1') // Trailing commas
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If syntax is still completely broken, produce standard valid Schema.org structure
    const fallback = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: pageTitle || 'Website',
      url: pageUrl || 'https://example.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${pageUrl || 'https://example.com'}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
    return JSON.stringify(fallback, null, 2);
  }
}

/**
 * Apply safe, targeted SEO patches to uploaded project files.
 * NEVER modifies original files. Creates deep separate copies.
 */
export function applySafeCodePatches(
  originalFiles: UploadedFileItem[],
  selectedIssueIds: string[],
  issues: SeoIssue[],
  siteUrl: string,
  siteTitle?: string
): {
  correctedFiles: UploadedFileItem[];
  patches: FileDiffPatch[];
} {
  // Create deep clone of files
  const fileMap = new Map<string, string>();
  for (const f of originalFiles) {
    fileMap.set(f.path, f.content);
  }

  const patchesMap = new Map<string, { applied: string[]; original: string }>();

  // Helper to record file modification
  const markModified = (path: string, originalContent: string, issueId: string) => {
    if (!patchesMap.has(path)) {
      patchesMap.set(path, { applied: [issueId], original: originalContent });
    } else {
      const entry = patchesMap.get(path)!;
      if (!entry.applied.includes(issueId)) {
        entry.applied.push(issueId);
      }
    }
  };

  // Find primary HTML file (e.g. index.html or first .html file)
  const allHtmlPaths = Array.from(fileMap.keys()).filter((p) => /\.(html|htm|php)$/i.test(p));
  const primaryHtmlPath =
    allHtmlPaths.find((p) => p.toLowerCase() === 'index.html' || p.toLowerCase().endsWith('/index.html')) ||
    allHtmlPaths[0];

  const domainOrigin = (() => {
    try {
      return new URL(siteUrl).origin;
    } catch {
      return 'https://example.com';
    }
  })();

  const safePageTitle = siteTitle || 'Home — High Performance Web Application';

  // Process each selected issue
  for (const issueId of selectedIssueIds) {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue || !issue.canAutoFix) continue;

    // 1. Missing Meta Description
    if (issue.autoFixType === 'add_meta_desc' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      let content = orig;
      const tagToAdd = `<meta name="description" content="Discover professional solutions and tools designed to optimize your digital workflow with fast, secure results.">`;

      if (!/<meta\s+name=["']description["']/i.test(content)) {
        if (/<\/head>/i.test(content)) {
          content = content.replace(/<\/head>/i, `  ${tagToAdd}\n</head>`);
        } else if (/<head[^>]*>/i.test(content)) {
          content = content.replace(/(<head[^>]*>)/i, `$1\n  ${tagToAdd}`);
        }
      }

      if (content !== orig) {
        fileMap.set(primaryHtmlPath, content);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 2. Missing Viewport
    if (issue.autoFixType === 'add_viewport' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      let content = orig;
      const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

      if (/<meta\s+[^>]*name=["']viewport["'][^>]*>/i.test(content)) {
        // Replace suboptimal viewport
        content = content.replace(/<meta\s+[^>]*name=["']viewport["'][^>]*>/i, viewportTag);
      } else if (/<\/head>/i.test(content)) {
        content = content.replace(/<\/head>/i, `  ${viewportTag}\n</head>`);
      } else if (/<head[^>]*>/i.test(content)) {
        content = content.replace(/(<head[^>]*>)/i, `$1\n  ${viewportTag}`);
      }

      if (content !== orig) {
        fileMap.set(primaryHtmlPath, content);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 3. Missing Canonical Tag
    if (issue.autoFixType === 'add_canonical' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      let content = orig;
      const canonicalTag = `<link rel="canonical" href="${siteUrl || `${domainOrigin}/`}">`;

      if (!/<link\s+[^>]*rel=["']canonical["']/i.test(content)) {
        if (/<\/head>/i.test(content)) {
          content = content.replace(/<\/head>/i, `  ${canonicalTag}\n</head>`);
        } else if (/<head[^>]*>/i.test(content)) {
          content = content.replace(/(<head[^>]*>)/i, `$1\n  ${canonicalTag}`);
        }
      }

      if (content !== orig) {
        fileMap.set(primaryHtmlPath, content);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 4. Missing Open Graph Tags
    if (issue.autoFixType === 'add_og_tags' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      let content = orig;
      const ogSnippet = `<!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${siteUrl || `${domainOrigin}/`}">
  <meta property="og:title" content="${safePageTitle}">
  <meta property="og:description" content="Discover professional solutions and tools designed to optimize your digital workflow with fast, secure results.">`;

      if (!/<meta\s+property=["']og:title["']/i.test(content)) {
        if (/<\/head>/i.test(content)) {
          content = content.replace(/<\/head>/i, `  ${ogSnippet}\n</head>`);
        }
      }

      if (content !== orig) {
        fileMap.set(primaryHtmlPath, content);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 5. Missing Twitter Tags
    if (issue.autoFixType === 'add_twitter_tags' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      let content = orig;
      const twitterSnippet = `<!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safePageTitle}">
  <meta name="twitter:description" content="Discover professional solutions and tools designed to optimize your digital workflow with fast, secure results.">`;

      if (!/<meta\s+name=["']twitter:card["']/i.test(content)) {
        if (/<\/head>/i.test(content)) {
          content = content.replace(/<\/head>/i, `  ${twitterSnippet}\n</head>`);
        }
      }

      if (content !== orig) {
        fileMap.set(primaryHtmlPath, content);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 6. Missing Title
    if (issue.autoFixType === 'add_title' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      let content = orig;
      const titleTag = `<title>${safePageTitle}</title>`;

      if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(content)) {
        if (/<head[^>]*>/i.test(content)) {
          content = content.replace(/(<head[^>]*>)/i, `$1\n  ${titleTag}`);
        } else if (/<\/head>/i.test(content)) {
          content = content.replace(/<\/head>/i, `  ${titleTag}\n</head>`);
        }
      }

      if (content !== orig) {
        fileMap.set(primaryHtmlPath, content);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 7. Fix Image Alt Attributes (across all HTML files safely)
    if (issue.autoFixType === 'fix_img_alt') {
      for (const htmlPath of allHtmlPaths) {
        const orig = fileMap.get(htmlPath)!;
        // Target only <img> tags that DO NOT have an alt attribute
        const patched = orig.replace(/<img\b(?![^>]*\balt\s*=)([^>]*?)>/gi, (match, attrs) => {
          // Derive descriptive alt from src if possible, or fallback to clean alt
          const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
          let derivedAlt = 'Website illustration';
          if (srcMatch && srcMatch[1]) {
            const filename = srcMatch[1].split('/').pop()?.split('?')[0] || '';
            const cleanName = filename
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]+/g, ' ')
              .trim();
            if (cleanName && cleanName.length > 2 && !/^(img|image|pic|photo|icon)\d*$/i.test(cleanName)) {
              derivedAlt = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            }
          }
          return `<img${attrs} alt="${derivedAlt}">`;
        });

        if (patched !== orig) {
          fileMap.set(htmlPath, patched);
          markModified(htmlPath, orig, issue.id);
        }
      }
    }

    // 8. Fix Malformed JSON-LD
    if (issue.autoFixType === 'fix_malformed_jsonld' && primaryHtmlPath) {
      const orig = fileMap.get(primaryHtmlPath)!;
      const patched = orig.replace(
        /(<script[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
        (fullMatch, openTag, jsonContent, closeTag) => {
          try {
            JSON.parse(jsonContent.trim());
            return fullMatch; // Valid already, leave untouched!
          } catch {
            const repaired = repairJsonLd(jsonContent, safePageTitle, siteUrl);
            return `${openTag}\n${repaired}\n${closeTag}`;
          }
        }
      );

      if (patched !== orig) {
        fileMap.set(primaryHtmlPath, patched);
        markModified(primaryHtmlPath, orig, issue.id);
      }
    }

    // 9. Add robots.txt if missing
    if (issue.autoFixType === 'add_robots_txt') {
      const robotsPath = 'robots.txt';
      const existingRobots = fileMap.get(robotsPath);
      if (!existingRobots) {
        const robotsContent = `# robots.txt generated by EditMee SEO & Marketing Studio Pro
User-agent: *
Allow: /

Sitemap: ${domainOrigin}/sitemap.xml
`;
        fileMap.set(robotsPath, robotsContent);
        markModified(robotsPath, '', issue.id);
      }
    }

    // 10. Add sitemap.xml if missing
    if (issue.autoFixType === 'add_sitemap_xml') {
      const sitemapPath = 'sitemap.xml';
      const existingSitemap = fileMap.get(sitemapPath);
      if (!existingSitemap) {
        const today = new Date().toISOString().split('T')[0];
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domainOrigin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
        fileMap.set(sitemapPath, sitemapContent);
        markModified(sitemapPath, '', issue.id);
      }
    }
  }

  // Build the corrected file objects and diff patches
  const correctedFiles: UploadedFileItem[] = [];
  const patches: FileDiffPatch[] = [];

  for (const [path, content] of fileMap.entries()) {
    const isModified = patchesMap.has(path);
    correctedFiles.push({
      path,
      name: path.split('/').pop() || path,
      content,
      size: content.length,
      isModified,
    });

    if (isModified) {
      const meta = patchesMap.get(path)!;
      const { added, removed } = computeFileDiff(meta.original, content);

      // Validate modified file: ensure tags are balanced and not corrupted
      let isValidated = true;
      let validationError: string | undefined;

      if (/\.(html|htm|php)$/i.test(path)) {
        const openHeads = (content.match(/<head\b/gi) || []).length;
        const closeHeads = (content.match(/<\/head>/gi) || []).length;
        if (openHeads > 0 && openHeads !== closeHeads) {
          isValidated = false;
          validationError = 'HTML head tag mismatch detected';
        }
      }

      patches.push({
        filePath: path,
        appliedIssues: meta.applied,
        originalContent: meta.original,
        patchedContent: content,
        diffLinesCount: { added, removed },
        isValidated,
        validationError,
      });
    }
  }

  return { correctedFiles, patches };
}

/**
 * Package corrected files into a downloadable ZIP archive
 */
export async function createDownloadableZip(files: UploadedFileItem[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
