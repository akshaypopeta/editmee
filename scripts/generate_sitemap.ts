import fs from 'fs';
import path from 'path';

// Polyfill globals for headless node execution
if (typeof global !== 'undefined') {
  if (!global.document) {
    global.document = {
      createElement: () => ({ getContext: () => ({}) }),
      getElementsByTagName: () => [],
      querySelector: () => null,
      getElementById: () => null,
    } as any;
  }
  if (!global.window) {
    global.window = global as any;
  }
  if (!global.DOMMatrix) {
    class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor() {}
      scale() { return this; }
      translate() { return this; }
      transformPoint(p: any) { return p; }
    }
    global.DOMMatrix = DOMMatrix as any;
  }
  if (!global.Path2D) {
    global.Path2D = class {} as any;
  }
  if (!global.ImageData) {
    global.ImageData = class {} as any;
  }
}

async function run() {
  const { registerAllTools } = await import('../src/core/tool-registry/registerAllTools');
  const { initToolUrlMappings, getAllToolRoutes, CANONICAL_ORIGIN } = await import('../src/core/routing/toolUrls');

  await registerAllTools();
  initToolUrlMappings();

  const toolRoutes = getAllToolRoutes();
  const currentDate = new Date().toISOString().split('T')[0];

  const categories = [
    'pdf',
    'images',
    'documents',
    'resumes',
    'data',
    'developer',
    'calculators',
    'business',
    'media',
    'security',
    'ai',
  ];

  const legalPages = [
    'privacy-policy',
    'terms-and-conditions',
    'security-architecture',
    'about-us',
    'contact-us',
    'disclaimer',
  ];

  const flagshipToolSlugs = new Set([
    'edit-pdf',
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'sign-pdf',
    'redact-pdf',
    'protect-pdf',
    'rotate-pdf',
    'pdf-to-word',
    'pdf-to-jpg',
    'images-to-pdf',
    'watermark-pdf',
    'number-pdf-pages',
    'image-studio',
    'compress-image',
    'image-resizer',
    'remove-background',
    'convert-image',
    'crop-image',
    'resume-builder',
    'csv-studio',
    'dev-studio',
    'calculator-studio',
    'ai-assistant',
  ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${CANONICAL_ORIGIN}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Categories
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${CANONICAL_ORIGIN}/category/${cat}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3. Workflows
  xml += `  <url>\n`;
  xml += `    <loc>${CANONICAL_ORIGIN}/workflows/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;

  // 4. Legal & Trust pages
  for (const legal of legalPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${CANONICAL_ORIGIN}/${legal}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;
  }

  // 5. All 516 canonical tool URLs
  for (const route of toolRoutes) {
    const isFlagship = flagshipToolSlugs.has(route.slug);
    xml += `  <url>\n`;
    xml += `    <loc>${route.canonicalUrl}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${isFlagship ? 'weekly' : 'monthly'}</changefreq>\n`;
    xml += `    <priority>${isFlagship ? '0.9' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const publicDir = path.resolve(process.cwd(), 'public');
  const distDir = path.resolve(process.cwd(), 'dist');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Write sitemap.xml
  const sitemapPublicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPublicPath, xml, 'utf8');
  console.log(`Generated sitemap.xml at ${sitemapPublicPath} with ${toolRoutes.length + categories.length + legalPages.length + 2} URLs.`);

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
  }

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`;
  const robotsPublicPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(robotsPublicPath, robotsTxt, 'utf8');
  console.log(`Generated robots.txt at ${robotsPublicPath}.`);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
  }

  // Generate Cloudflare Pages _redirects file
  // Supports SPA routing and 301 legacy redirects
  const redirects = `# Cloudflare Pages SPA Fallback and Redirect Rules
/api/*  /api/:splat  200

# Legacy route redirects to canonical clean URLs
/tool/*  /tools/:splat/  301

# SPA routing fallback for all pages
/*      /index.html     200
`;
  const redirectsPublicPath = path.join(publicDir, '_redirects');
  fs.writeFileSync(redirectsPublicPath, redirects, 'utf8');
  console.log(`Generated _redirects at ${redirectsPublicPath}.`);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, '_redirects'), redirects, 'utf8');
  }

  // Generate Cloudflare Pages _headers file
  const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
/
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
/index.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600
/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
`;
  const headersPublicPath = path.join(publicDir, '_headers');
  fs.writeFileSync(headersPublicPath, headers, 'utf8');
  console.log(`Generated _headers at ${headersPublicPath}.`);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, '_headers'), headers, 'utf8');
  }
}

run().catch((err) => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
